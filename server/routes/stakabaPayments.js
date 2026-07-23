// Stakaba payment initiation + local status.
//
// Flow: the frontend first creates a checkout session (routes/checkout.js),
// then calls POST /api/payments/stakaba/initiate with the session id. We take
// the amount from the session (never the client), call Stakaba with the
// server-side API key, and record a payment row keyed by our own
// `payment_reference` and Stakaba's `internalReference`.
//
// Fulfilment is NOT decided here — even though the sandbox collection call
// returns status "SUCCESS" immediately, in production the create call only
// starts the USSD prompt. The order is flipped to Paid only by the webhook
// (routes/stakabaWebhook.js). So we always persist AwaitingPayment here.
//
// The frontend polls GET /status/:reference, which reads our own DB (updated
// by the webhook) — we cannot query Stakaba's transactions API from the
// backend, by design.

import express from 'express';
import crypto from 'crypto';
import db from '../config/database.js';
import { checkIdempotency } from '../middleware/idempotency.js';
import { logAuditEvent } from '../audit/logger.js';
import { createCollection, createCardPayment, NETWORK_MAP, StakabaError } from '../utils/stakaba.js';

const router = express.Router();

const generatePaymentRef = () => `pay_ref_${crypto.randomBytes(6).toString('hex')}`;

// How long the customer has to approve the USSD prompt before the frontend
// stops polling and shows a timeout. Live payments resolve via webhook well
// within this; in sandbox (no payment webhooks) this drives the timeout UX.
const PAYMENT_WINDOW_MS = 3 * 60 * 1000;

const badRequest = (res, message) =>
  res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message } });

router.post('/initiate', checkIdempotency, async (req, res, next) => {
  try {
    // Idempotency-Key is mandatory for payment initiation. The shared
    // middleware only auto-enforces this for the legacy `/payments/initiate`
    // path, so enforce it explicitly for this route too.
    if (!req.headers['idempotency-key']) {
      return badRequest(res, 'Idempotency-Key header is required for this operation.');
    }

    const { checkoutSessionId, paymentMethod, customerPhone } = req.body || {};
    if (!checkoutSessionId || !paymentMethod) {
      return badRequest(res, 'checkoutSessionId and paymentMethod are required.');
    }

    const isCard = paymentMethod === 'card';
    if (!isCard && !NETWORK_MAP[paymentMethod]) {
      return badRequest(res, `Unsupported paymentMethod "${paymentMethod}". Expected one of: ${Object.keys(NETWORK_MAP).join(', ')}, card.`);
    }

    const session = db.prepare(`
      SELECT order_draft_reference, total, customer_name, customer_email, customer_phone
      FROM checkout_sessions
      WHERE id = ?
    `).get(checkoutSessionId);

    if (!session) {
      logAuditEvent('STAKABA_INITIATE_SESSION_MISSING', null, checkoutSessionId, { route: req.originalUrl }, req);
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'The specified checkout session could not be found.' }
      });
    }

    // Amount is the server-side source of truth. Reject a client amount that
    // disagrees rather than silently trusting the session.
    const amount = session.total;
    if (req.body.amount !== undefined && Number(req.body.amount) !== Number(amount)) {
      logAuditEvent('STAKABA_INITIATE_AMOUNT_MISMATCH', null, checkoutSessionId, { sessionTotal: amount, receivedAmount: req.body.amount }, req);
      return badRequest(res, 'Payment amount does not match the checkout session total.');
    }

    const orderId = session.order_draft_reference;
    const phone = customerPhone || session.customer_phone;

    // Reuse an existing in-flight payment for this order so a retry doesn't
    // fire a second USSD prompt / second Stakaba order.
    const existingActive = db.prepare(`
      SELECT payment_reference FROM payments
      WHERE order_id = ? AND provider = 'stakaba' AND status = 'AwaitingPayment'
    `).get(orderId);
    if (existingActive) {
      // Refresh the window so a retry after a client-side timeout restarts the
      // countdown instead of returning an already-expired prompt.
      const refreshedExpiry = new Date(Date.now() + PAYMENT_WINDOW_MS).toISOString();
      db.prepare('UPDATE payments SET expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_reference = ?')
        .run(refreshedExpiry, existingActive.payment_reference);
      logAuditEvent('STAKABA_INITIATE_ACTIVE_REUSED', null, existingActive.payment_reference, { orderId }, req);
      return res.status(202).json({
        success: true,
        data: {
          paymentReference: existingActive.payment_reference,
          paymentStatus: 'AwaitingPayment',
          customerMessage: 'A payment is already pending for this order.',
          expiresAt: refreshedExpiry
        }
      });
    }

    const paymentReference = generatePaymentRef();
    // metadata is echoed back to us in the webhook — carry our references so a
    // webhook can be tied to this order without a lookup table round-trip.
    const metadata = { orderId, paymentReference };

    let internalReference;
    let providerStatus;
    let checkoutUrl = null;
    let customerMessage;

    try {
      if (isCard) {
        const r = await createCardPayment({
          grossAmount: amount,
          customerEmail: session.customer_email,
          customerName: session.customer_name,
          customerPhone: phone,
          metadata
        });
        internalReference = r.internalReference;
        providerStatus = 'AwaitingPayment';
        checkoutUrl = r.checkoutUrl;
        customerMessage = 'Redirecting you to the secure card checkout page.';
      } else {
        const r = await createCollection({ grossAmount: amount, phone, network: paymentMethod, metadata });
        internalReference = r.internalReference;
        providerStatus = r.status || 'AwaitingPayment';
        customerMessage = 'Please authorize the payment prompt on your phone.';
      }
    } catch (err) {
      if (err instanceof StakabaError) {
        logAuditEvent('STAKABA_INITIATE_GATEWAY_FAILURE', null, paymentReference, { orderId, code: err.code, httpStatus: err.httpStatus }, req);
        return res.status(502).json({
          success: false,
          error: { code: 'BAD_GATEWAY', message: `Payment gateway error: ${err.message}` }
        });
      }
      throw err;
    }

    if (!internalReference) {
      logAuditEvent('STAKABA_INITIATE_NO_REFERENCE', null, paymentReference, { orderId }, req);
      return res.status(502).json({
        success: false,
        error: { code: 'BAD_GATEWAY', message: 'Payment gateway did not return a reference.' }
      });
    }

    const expiresAt = new Date(Date.now() + PAYMENT_WINDOW_MS).toISOString();

    const persist = db.transaction(() => {
      db.prepare(`
        INSERT INTO payments (
          payment_reference, order_id, amount, status, provider, stakaba_reference,
          provider_status, customer_message, initiated_at, expires_at
        ) VALUES (?, ?, ?, 'AwaitingPayment', 'stakaba', ?, ?, ?, CURRENT_TIMESTAMP, ?)
      `).run(paymentReference, orderId, amount, internalReference, providerStatus, customerMessage, expiresAt);

      db.prepare(`
        UPDATE orders
        SET order_status = 'AwaitingPayment', payment_status = 'AwaitingPayment', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(orderId);
    });
    persist();

    logAuditEvent('STAKABA_PAYMENT_INITIATED', null, paymentReference, { orderId, amount, internalReference, method: paymentMethod }, req);

    return res.status(202).json({
      success: true,
      data: {
        paymentReference,
        paymentStatus: 'AwaitingPayment',
        customerMessage,
        expiresAt,
        checkoutUrl // null for mobile money; a hosted-checkout URL for card
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments/stakaba/status/:reference
 * Reads local payment state. The webhook is what advances it to Paid/Failed;
 * we cannot query Stakaba's transactions API from the backend.
 */
router.get('/status/:reference', (req, res, next) => {
  try {
    const payment = db.prepare(`
      SELECT payment_reference, status, customer_message, expires_at
      FROM payments
      WHERE payment_reference = ? AND provider = 'stakaba'
    `).get(req.params.reference);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'The specified payment reference could not be found.' }
      });
    }

    let customerMessage = payment.customer_message;
    if (payment.status === 'Paid') customerMessage = 'Payment confirmed successfully.';
    else if (payment.status === 'Failed') customerMessage = 'Payment failed or was cancelled.';

    return res.json({
      success: true,
      data: {
        paymentReference: payment.payment_reference,
        paymentStatus: payment.status,
        customerMessage,
        expiresAt: payment.expires_at
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
