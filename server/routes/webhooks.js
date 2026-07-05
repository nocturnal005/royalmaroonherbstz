import express from 'express';
import db from '../config/database.js';
import { verifySelcomWebhook, redactPayload } from '../utils/selcomSignature.js';
import { logAuditEvent } from '../audit/logger.js';

const router = express.Router();

/**
 * POST /api/webhooks/selcom
 * Receives payment callbacks from Selcom Payment Gateway.
 */
router.post('/selcom', (req, res, next) => {
  try {
    const body = req.body;
    const headers = req.headers;

    // 1. Signature Verification
    const isSignatureValid = verifySelcomWebhook(body, headers);
    if (!isSignatureValid) {
      logAuditEvent('PAYMENT_SIGNATURE_MISMATCH', null, body.reference || null, { 
        route: req.originalUrl,
        receivedDigest: headers['digest'] || headers['Digest'] || null
      }, req);

      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Webhook signature verification failed.'
        }
      });
    }

    // 2. Timestamp Replay Protection (±5 minutes)
    const timestampHeader = headers['timestamp'] || headers['Timestamp'];
    const requestTime = new Date(timestampHeader).getTime();
    const serverTime = Date.now();
    const timeDifference = Math.abs(serverTime - requestTime);

    if (isNaN(requestTime) || timeDifference > 300000) { // 300000 ms = 5 minutes
      logAuditEvent('PAYMENT_WEBHOOK_STALE_TIMESTAMP', null, body.reference || null, {
        timestampHeader,
        serverTime: new Date(serverTime).toISOString(),
        timeDifferenceMs: timeDifference
      }, req);

      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Stale webhook timestamp rejected.'
        }
      });
    }

    const { transid, order_id, reference, result, resultcode, payment_status } = body;

    // 3. Webhook Idempotency Check (Duplicate transid check)
    const existingEvent = db.prepare('SELECT 1 FROM payment_events WHERE selcom_transaction_id = ?').get(transid);
    if (existingEvent) {
      logAuditEvent('PAYMENT_WEBHOOK_DUPLICATE_IGNORED', null, reference, { transid }, req);
      return res.status(200).json({
        success: true,
        message: 'Webhook processed (duplicate skipped).'
      });
    }

    // 4. Retrieve associated payment & order
    const payment = db.prepare('SELECT * FROM payments WHERE payment_reference = ?').get(reference);
    if (!payment) {
      logAuditEvent('PAYMENT_WEBHOOK_REFERENCE_NOT_FOUND', null, reference, { transid }, req);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Associated payment reference not found.'
        }
      });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(payment.order_id);
    if (!order) {
      logAuditEvent('PAYMENT_WEBHOOK_ORDER_NOT_FOUND', null, payment.order_id, { reference, transid }, req);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Associated order not found.'
        }
      });
    }

    // 5. If already paid, acknowledge successfully but skip state changes
    if (order.payment_status === 'Paid') {
      logAuditEvent('PAYMENT_WEBHOOK_ALREADY_PAID', null, reference, { transid }, req);
      return res.status(200).json({
        success: true,
        message: 'Order already marked as Paid.'
      });
    }

    // 6. Process transitions if payment succeeded
    const isSuccess = result === 'SUCCESS' && resultcode === '000';

    // Redact sensitive details for event logs using the reusable helper
    const redactedPayload = redactPayload(body);

    if (isSuccess) {
      const updateTx = db.transaction(() => {
        // Update payment table
        db.prepare(`
          UPDATE payments
          SET status = 'Paid',
              selcom_transid = ?,
              provider_status = ?,
              provider_result_code = ?,
              provider_message = ?,
              paid_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(transid, payment_status, resultcode, result, payment.id);

        // Update orders table
        db.prepare(`
          UPDATE orders
          SET payment_status = 'Paid',
              order_status = 'FulfilmentPending',
              fulfilment_status = 'FulfilmentPending',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(payment.order_id);

        // Insert payment event record
        db.prepare(`
          INSERT INTO payment_events (selcom_transaction_id, payment_reference, raw_payload, event_type, signature_valid, raw_payload_redacted)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(transid, reference, JSON.stringify(redactedPayload), 'WEBHOOK_SUCCESS', 1, JSON.stringify(redactedPayload));
      });

      updateTx();

      logAuditEvent('PAYMENT_SUCCESS_WEBHOOK', null, reference, { orderId: payment.order_id, transid }, req);

      return res.json({
        success: true,
        message: 'Payment completed and order updated successfully.'
      });
    } else {
      // Handle fail response (cautiously, since webhooks are generally success-only but we handle defensively)
      const updateFailTx = db.transaction(() => {
        db.prepare(`
          UPDATE payments
          SET status = 'Failed',
              selcom_transid = ?,
              provider_status = ?,
              provider_result_code = ?,
              provider_message = ?,
              failed_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(transid, payment_status, resultcode, result, payment.id);

        db.prepare(`
          UPDATE orders
          SET payment_status = 'PaymentFailed',
              order_status = 'PaymentFailed',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(payment.order_id);

        db.prepare(`
          INSERT INTO payment_events (selcom_transaction_id, payment_reference, raw_payload, event_type, signature_valid, raw_payload_redacted)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(transid, reference, JSON.stringify(redactedPayload), 'WEBHOOK_FAILED', 1, JSON.stringify(redactedPayload));
      });

      updateFailTx();

      logAuditEvent('PAYMENT_FAILURE_WEBHOOK', null, reference, { orderId: payment.order_id, transid, reason: result }, req);

      return res.json({
        success: true,
        message: 'Payment failure registered.'
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
