import express from 'express';
import crypto from 'crypto';
import db from '../config/database.js';
import { validateBody } from '../middleware/validation.js';
import { checkIdempotency } from '../middleware/idempotency.js';
import { logAuditEvent } from '../audit/logger.js';
import { generateSelcomHeaders, redactPayload } from '../utils/selcomSignature.js';

const router = express.Router();

function generatePaymentRef() {
  return `pay_ref_${crypto.randomBytes(6).toString('hex')}`;
}

/**
 * POST /api/payments/initiate
 * Initiates Selcom mobile money payment via create-order-minimal + wallet-payment.
 * Protected by idempotency.
 */
router.post('/initiate', checkIdempotency, validateBody('payment'), async (req, res, next) => {
  try {
    const { checkoutSessionId, paymentMethod, customerPhone } = req.body;

    // 1. Verify checkout session exists and fetch order draft
    const session = db.prepare(`
      SELECT order_draft_reference, total, customer_name, customer_email
      FROM checkout_sessions
      WHERE id = ?
    `).get(checkoutSessionId);

    if (!session) {
      logAuditEvent('PAYMENT_INITIATE_SESSION_MISSING', null, checkoutSessionId, { route: req.originalUrl }, req);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The specified checkout session could not be found.'
        }
      });
    }

    // Strict: Do not trust frontend amount. Use session.total as the strict source of truth.
    const amount = session.total;

    // Reject if client-submitted amount is present but does not match session total
    if (req.body.amount !== undefined && req.body.amount !== session.total) {
      logAuditEvent('PAYMENT_INITIATE_AMOUNT_MISMATCH', null, checkoutSessionId, { sessionTotal: session.total, receivedAmount: req.body.amount }, req);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment amount does not match checkout session total.'
        }
      });
    }

    // 3. Check if an active AwaitingPayment payment record already exists for the same order
    // and is not expired yet. If it does, return the existing payment reference instead of a duplicate USSD push.
    const nowIso = new Date().toISOString();
    const existingActive = db.prepare(`
      SELECT payment_reference, status, customer_message, expires_at
      FROM payments
      WHERE order_id = ? AND status = 'AwaitingPayment' AND expires_at > ?
    `).get(session.order_draft_reference, nowIso);

    if (existingActive) {
      logAuditEvent('PAYMENT_INITIATE_ACTIVE_REUSED', null, existingActive.payment_reference, { orderId: session.order_draft_reference }, req);
      return res.status(202).json({
        success: true,
        data: {
          paymentReference: existingActive.payment_reference,
          paymentStatus: 'AwaitingPayment',
          customerMessage: 'An active USSD payment prompt is already pending on your phone.'
        }
      });
    }

    const paymentReference = generatePaymentRef();
    const expiresAt = new Date(Date.now() + 120000).toISOString(); // 2 minute expiry window

    // Selcom payloads and signed fields setup
    const orderId = `ord_selcom_${crypto.randomBytes(6).toString('hex')}`;
    const transId = `tx_selcom_${crypto.randomBytes(6).toString('hex')}`;
    const timestamp = new Date().toISOString();

    const orderPayload = {
      vendor: process.env.SELCOM_VENDOR_ID || 'dev_vendor_id',
      order_id: orderId,
      buyer_email: session.customer_email || 'buyer@example.com',
      buyer_name: session.customer_name || 'Buyer Name',
      buyer_phone: customerPhone,
      amount: amount,
      currency: 'TZS',
      webhook: process.env.SELCOM_WEBHOOK_URL || 'http://localhost:5000/api/webhooks/selcom',
      buyer_remarks: 'Natures Alchemy Order',
      merchant_remarks: 'Store checkout',
      no_of_items: 1
    };

    const walletPayload = {
      transid: transId,
      order_id: orderId,
      msisdn: customerPhone
    };

    // Calculate signatures
    const createOrderFields = process.env.SELCOM_SIGNED_FIELDS_CREATE_ORDER_MINIMAL;
    const walletFields = process.env.SELCOM_SIGNED_FIELDS_WALLET_PAYMENT;

    const createOrderHeaders = generateSelcomHeaders(orderPayload, createOrderFields, timestamp);
    const walletHeaders = generateSelcomHeaders(walletPayload, walletFields, timestamp);

    let selcomSuccess = false;
    let gatewayError = null;

    if (process.env.SELCOM_MODE === 'mock') {
      // Mock mode logging signing strings to console
      console.log(`[MOCK SELCOM] signing-string-create-order-minimal: ${createOrderHeaders.signingString}`);
      console.log(`[MOCK SELCOM] signing-string-wallet-payment: ${walletHeaders.signingString}`);
      selcomSuccess = true;
    } else {
      // Real sandbox/production API calls
      try {
        const createOrderRes = await fetch(`${process.env.SELCOM_BASE_URL}/checkout/create-order-minimal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...createOrderHeaders.headers
          },
          body: JSON.stringify(orderPayload)
        });

        const orderData = await createOrderRes.json();
        if (createOrderRes.status === 200 && orderData.result === 'SUCCESS') {
          const walletRes = await fetch(`${process.env.SELCOM_BASE_URL}/checkout/wallet-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...walletHeaders.headers
            },
            body: JSON.stringify(walletPayload)
          });

          const walletData = await walletRes.json();
          if (walletRes.status === 200 && walletData.result === 'SUCCESS') {
            selcomSuccess = true;
          } else {
            gatewayError = walletData.message || 'USSD wallet payment prompt initiation failed.';
          }
        } else {
          gatewayError = orderData.message || 'Minimal order creation failed.';
        }
      } catch (err) {
        gatewayError = `Selcom Gateway timeout or connection failure: ${err.message}`;
      }
    }

    if (!selcomSuccess) {
      logAuditEvent('PAYMENT_INITIATE_GATEWAY_FAILURE', null, paymentReference, { gatewayError }, req);
      return res.status(502).json({
        success: false,
        error: {
          code: 'BAD_GATEWAY',
          message: `Payment gateway error: ${gatewayError}`
        }
      });
    }

    // Transactional state updates on success
    const executePaymentTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO payments (
          payment_reference, order_id, amount, status, selcom_reference, 
          selcom_transid, provider_status, provider_result_code, provider_message, 
          initiated_at, expires_at, customer_message
        ) VALUES (?, ?, ?, 'AwaitingPayment', ?, ?, 'AwaitingPayment', '000', 'USSD push initiated', ?, ?, ?)
      `).run(
        paymentReference,
        session.order_draft_reference,
        amount,
        orderId,
        transId,
        new Date().toISOString(),
        expiresAt,
        'Please check your mobile handset for the wallet prompt and enter your PIN.'
      );

      db.prepare(`
        UPDATE orders
        SET order_status = 'AwaitingPayment',
            payment_status = 'AwaitingPayment',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(session.order_draft_reference);
    });

    executePaymentTx();

    logAuditEvent(
      'PAYMENT_INITIATED',
      null,
      paymentReference,
      { orderId: session.order_draft_reference, amount, order_id: orderId, transid: transId },
      req
    );

    res.status(202).json({
      success: true,
      data: {
        paymentReference,
        paymentStatus: 'AwaitingPayment',
        customerMessage: 'Please authorize the payment prompt on your phone.'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments/status/:reference
 * Queries payment record status. Reads local database first.
 * Makes rate-limited status queries to Selcom if still AwaitingPayment.
 */
router.get('/status/:reference', async (req, res, next) => {
  try {
    const { reference } = req.params;

    const payment = db.prepare(`
      SELECT *
      FROM payments
      WHERE payment_reference = ?
    `).get(reference);

    if (!payment) {
      logAuditEvent('PAYMENT_STATUS_NOT_FOUND', null, reference, { route: req.originalUrl }, req);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The specified payment reference could not be found.'
        }
      });
    }

    // Local-first check
    let currentStatus = payment.status;
    let customerMessage = payment.customer_message;

    // Rate-limited Selcom order status check: requires both:
    // - enough time has passed since payment initiation (initiated_at)
    // - enough time has passed since the last provider status query (last_status_query_at)
    const minInterval = parseInt(process.env.SELCOM_STATUS_QUERY_MIN_INTERVAL_MS || '30000', 10);
    const initiatedAt = payment.initiated_at ? new Date(payment.initiated_at).getTime() : 0;
    const lastProviderQueryAt = payment.last_status_query_at
      ? new Date(payment.last_status_query_at).getTime()
      : null;

    const now = Date.now();
    const oldEnoughSinceInitiation = initiatedAt && (now - initiatedAt >= minInterval);
    const oldEnoughSinceLastProviderQuery = !lastProviderQueryAt || (now - lastProviderQueryAt >= minInterval);

    const shouldQueryProvider = currentStatus === 'AwaitingPayment' && oldEnoughSinceInitiation && oldEnoughSinceLastProviderQuery;

    if (shouldQueryProvider) {
      // Update last_status_query_at timestamp immediately in the DB to throttle subsequent polls
      db.prepare(`
        UPDATE payments
        SET last_status_query_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(new Date(now).toISOString(), payment.id);

      logAuditEvent('PAYMENT_STATUS_QUERY_TRIGGERED', null, reference, { selcom_reference: payment.selcom_reference }, req);

      // Perform order status query payload and headers
      const timestamp = new Date().toISOString();
      const statusPayload = {
        order_id: payment.selcom_reference
      };
      
      const statusFields = process.env.SELCOM_SIGNED_FIELDS_ORDER_STATUS;
      const statusHeaders = generateSelcomHeaders(statusPayload, statusFields, timestamp);

      let querySuccess = false;
      let orderData = null;

      if (process.env.SELCOM_MODE === 'mock') {
        console.log(`[MOCK SELCOM] signing-string-order-status: ${statusHeaders.signingString}`);
        // Allow a special query trigger for test suites to simulate paid order status updates
        if (req.query.mock_success === 'true') {
          querySuccess = true;
          orderData = {
            result: 'SUCCESS',
            resultcode: '000',
            payment_status: 'PAID',
            transid: payment.selcom_transid || 'mock_transid_123',
            message: 'Order paid successfully'
          };
        }
      } else {
        try {
          const queryRes = await fetch(`${process.env.SELCOM_BASE_URL}/checkout/order-status?order_id=${payment.selcom_reference}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...statusHeaders.headers
            }
          });

          if (queryRes.status === 200) {
            orderData = await queryRes.json();
            if (orderData.result === 'SUCCESS') {
              querySuccess = true;
            }
          }
        } catch (err) {
          console.error('Status query fetch failed:', err.message);
        }
      }

      // If gateway query confirms payment is complete, update local DB transactionally
      if (querySuccess && orderData && orderData.payment_status === 'PAID') {
        const updatePaidTx = db.transaction(() => {
          db.prepare(`
            UPDATE payments
            SET status = 'Paid',
                provider_status = ?,
                provider_result_code = ?,
                provider_message = ?,
                paid_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(orderData.payment_status, orderData.resultcode, orderData.message, payment.id);

          db.prepare(`
            UPDATE orders
            SET payment_status = 'Paid',
                order_status = 'FulfilmentPending',
                fulfilment_status = 'FulfilmentPending',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(payment.order_id);

          const redactedData = redactPayload(orderData);
          db.prepare(`
            INSERT INTO payment_events (selcom_transaction_id, payment_reference, raw_payload, event_type, signature_valid, raw_payload_redacted)
            VALUES (?, ?, ?, ?, 1, ?)
          `).run(orderData.transid, reference, JSON.stringify(redactedData), 'STATUS_QUERY_PAID', JSON.stringify(redactedData));
        });

        updatePaidTx();
        currentStatus = 'Paid';
        customerMessage = 'Payment confirmed successfully via gateway status query.';
        logAuditEvent('PAYMENT_SUCCESS_STATUS_QUERY', null, reference, { orderId: payment.order_id, transid: orderData.transid }, req);
      }
    }

    // Map customer message precisely as required:
    let responseMessage = customerMessage;
    
    if (currentStatus === 'Paid') {
      responseMessage = 'Payment confirmed successfully.';
    } else if (currentStatus === 'Failed') {
      responseMessage = 'Payment failed or was cancelled.';
    } else if (currentStatus === 'AwaitingPayment') {
      const isExpired = payment.expires_at && new Date() > new Date(payment.expires_at);
      if (isExpired) {
        responseMessage = 'Payment prompt expired. You may retry.';
      } else {
        responseMessage = 'Please check your mobile handset for the wallet prompt and enter your PIN.';
      }
    }

    res.json({
      success: true,
      data: {
        paymentReference: payment.payment_reference,
        paymentStatus: currentStatus,
        customerMessage: responseMessage,
        expiresAt: payment.expires_at
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
