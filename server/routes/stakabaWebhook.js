// Stakaba webhook receiver.
//
// Stakaba webhooks carry NO cryptographic signature (verified by capturing a
// real delivery on 2026-07-22), and the backend cannot re-verify via the
// transactions API. So authenticity rests on three checks, all in our control:
//
//   1. Secret path — the endpoint is /api/webhooks/stakaba/:secret, where
//      :secret must equal STAKABA_WEBHOOK_SECRET (constant-time compare). An
//      attacker who doesn't know the full URL can't even reach the handler; a
//      wrong/missing secret gets a 404 so the endpoint isn't discoverable.
//   2. Reference match — we only act on an `internalReference` that matches a
//      payment this backend created. Unknown references are acknowledged and
//      ignored.
//   3. Amount match — the webhook's `grossAmount` must equal the amount we
//      recorded for that payment.
//
// Plus idempotency (dedup by internalReference) so retries/replays can't
// double-fulfil. We always return 200 on anything we've handled or chosen to
// ignore, so Stakaba's retry loop stops; only a genuine server fault 500s.
//
// Real payment payload (per docs):
//   { event: "transaction.success"|"transaction.failed", internalReference,
//     status, grossAmount, stakabaFee, netAmount, currency, providerReference,
//     metadata: { orderId, ... }, createdAt }

import express from 'express';
import crypto from 'crypto';
import db from '../config/database.js';
import { logAuditEvent } from '../audit/logger.js';

const router = express.Router();

function secretMatches(provided, expected) {
  if (!expected) return false;
  const a = Buffer.from(String(provided || ''));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Redact anything phone-like before persisting the raw payload.
function redact(payload) {
  const clone = JSON.parse(JSON.stringify(payload || {}));
  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      if (/phone|msisdn|mobile/i.test(k) && typeof obj[k] !== 'object') obj[k] = '***';
      else if (typeof obj[k] === 'object') walk(obj[k]);
    }
  };
  walk(clone);
  return clone;
}

const ack = (res, message) => res.status(200).json({ success: true, message });

router.post('/:secret', (req, res, next) => {
  try {
    if (!secretMatches(req.params.secret, process.env.STAKABA_WEBHOOK_SECRET)) {
      // Don't reveal that this path is a webhook endpoint.
      logAuditEvent('STAKABA_WEBHOOK_BAD_SECRET', null, null, { path: '/api/webhooks/stakaba/***' }, req);
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found.' } });
    }

    const body = req.body || {};
    const { event, internalReference, status, grossAmount } = body;

    if (!internalReference) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'internalReference is required.' } });
    }

    // 2. Reference match — must be a payment we created.
    const payment = db.prepare(`
      SELECT * FROM payments WHERE stakaba_reference = ? AND provider = 'stakaba'
    `).get(internalReference);
    if (!payment) {
      logAuditEvent('STAKABA_WEBHOOK_UNKNOWN_REF', null, internalReference, { event, status }, req);
      return ack(res, 'Acknowledged; no matching payment.');
    }

    // Idempotency — dedup on the provider reference (stored in the existing
    // UNIQUE column selcom_transaction_id).
    const alreadyProcessed = db.prepare('SELECT 1 FROM payment_events WHERE selcom_transaction_id = ?').get(internalReference);
    if (alreadyProcessed) {
      logAuditEvent('STAKABA_WEBHOOK_DUPLICATE', null, internalReference, { paymentReference: payment.payment_reference }, req);
      return ack(res, 'Duplicate webhook ignored.');
    }

    // 3. Amount match — refuse to fulfil if the paid amount disagrees.
    if (grossAmount !== undefined && Number(grossAmount) !== Number(payment.amount)) {
      logAuditEvent('STAKABA_WEBHOOK_AMOUNT_MISMATCH', null, internalReference, {
        paymentReference: payment.payment_reference, expected: payment.amount, received: grossAmount
      }, req);
      return ack(res, 'Acknowledged; amount mismatch, not fulfilled.');
    }

    // Terminal state already reached — nothing to do.
    if (payment.status === 'Paid') {
      return ack(res, 'Order already marked as paid.');
    }

    const isSuccess = event === 'transaction.success' || String(status || '').toUpperCase() === 'SUCCESS';
    const redacted = JSON.stringify(redact(body));

    if (isSuccess) {
      // Deduct stock here — this is the first (and, thanks to the idempotency
      // guard above, only) time this payment is confirmed, so the order's
      // items leave inventory exactly once. stock_status flips to
      // 'out_of_stock' only when a product hits zero; otherwise it's left as
      // the admin set it.
      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(payment.order_id);
      const decrementStock = db.prepare(`
        UPDATE products
        SET stock_quantity = MAX(0, stock_quantity - ?),
            stock_status = CASE WHEN stock_quantity - ? <= 0 THEN 'out_of_stock' ELSE stock_status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      db.transaction(() => {
        db.prepare(`
          UPDATE payments
          SET status = 'Paid', provider_status = ?, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(status || 'SUCCESS', payment.id);

        db.prepare(`
          UPDATE orders
          SET payment_status = 'Paid', order_status = 'FulfilmentPending', fulfilment_status = 'FulfilmentPending', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(payment.order_id);

        for (const item of items) {
          decrementStock.run(item.quantity, item.quantity, item.product_id);
        }

        db.prepare(`
          INSERT INTO payment_events (selcom_transaction_id, payment_reference, raw_payload, provider, event_type, signature_valid, raw_payload_redacted)
          VALUES (?, ?, ?, 'stakaba', 'WEBHOOK_SUCCESS', NULL, ?)
        `).run(internalReference, payment.payment_reference, redacted, redacted);
      })();

      logAuditEvent('STAKABA_PAYMENT_SUCCESS', null, payment.payment_reference, { orderId: payment.order_id, internalReference, stockItemsDeducted: items.length }, req);
      return ack(res, 'Payment recorded and order queued for fulfilment.');
    }

    // Any non-success terminal event -> mark failed.
    db.transaction(() => {
      db.prepare(`
        UPDATE payments
        SET status = 'Failed', provider_status = ?, failed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status || 'FAILED', payment.id);

      db.prepare(`
        UPDATE orders
        SET payment_status = 'PaymentFailed', order_status = 'PaymentFailed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(payment.order_id);

      db.prepare(`
        INSERT INTO payment_events (selcom_transaction_id, payment_reference, raw_payload, provider, event_type, signature_valid, raw_payload_redacted)
        VALUES (?, ?, ?, 'stakaba', 'WEBHOOK_FAILED', NULL, ?)
      `).run(internalReference, payment.payment_reference, redacted, redacted);
    })();

    logAuditEvent('STAKABA_PAYMENT_FAILED', null, payment.payment_reference, { orderId: payment.order_id, internalReference, status }, req);
    return ack(res, 'Payment failure recorded.');
  } catch (error) {
    next(error);
  }
});

export default router;
