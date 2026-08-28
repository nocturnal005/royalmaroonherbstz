// Selcom webhook receiver.
//
// Selcom webhooks are NOT signed. This was confirmed directly by Selcom's
// integration team (2026-07) and overrides the older assumption (and the
// Authorization/Digest headers shown in the doc's webhook curl sample) that
// inbound callbacks carry the same HMAC scheme as outbound requests. The
// previous verifySelcomWebhook/Digest/Signed-Fields/timestamp checks would
// have 401'd every real webhook, so authenticity now rests on layered checks
// we control (mirroring the proven Stakaba webhook in stakabaWebhook.js):
//
//   1. Secret path — the endpoint is /api/webhooks/selcom/:secret, where
//      :secret must equal SELCOM_WEBHOOK_SECRET (constant-time compare). The
//      webhook URL is supplied per-order in the create-order payload's
//      `webhook` field, so no dashboard config is needed. A wrong/missing
//      secret gets a 404 so the endpoint isn't discoverable.
//   2. Source-IP allowlist — SELCOM_WEBHOOK_ALLOWED_IPS (comma-separated IPs
//      or CIDRs, obtained from Selcom support). When set, non-matching source
//      IPs are rejected with 403 and audit-logged. When unset we accept but
//      warn loudly (startup + per request) because we can't verify origin.
//      Loopback is always allowed in PAYMENTS_MODE=mock so the local simulation
//      harness works (disable via SELCOM_WEBHOOK_MOCK_ALLOW_LOOPBACK=false —
//      used by the harness to prove the 403 path).
//      The app does NOT set Express `trust proxy`, so we deliberately read
//      req.socket.remoteAddress and ignore X-Forwarded-For unless trust proxy
//      is configured — otherwise a spoofed header could bypass the allowlist.
//   3. Reference match — the webhook's `order_id` is the order id we sent to
//      Selcom at create-order time (stored in payments.selcom_reference).
//      Unknown ids are logged and acknowledged without any state change.
//   4. Amount match — the webhook's `amount` must equal the integer TZS
//      amount we recorded for that payment; mismatches are logged and refused
//      without any state change.
//
// Plus idempotency (dedup by Selcom `transid` via the UNIQUE column
// payment_events.selcom_transaction_id) so retries/replays can't double-fulfil
// or double-decrement stock. There is no timestamp replay check any more —
// nothing is signed, so a timestamp header would prove nothing.
//
// Webhook payload (per https://developers.selcommobile.com "Webhook Callback"):
//   { result: "SUCCESS"|"FAIL", resultcode: "000", order_id, transid,
//     reference, channel, amount, phone, payment_status:
//     "COMPLETED"|"CANCELLED"|"PENDING"|"USERCANCELED" }
// Note: Selcom states webhooks fire only on successful transactions; the
// failure path below is defensive.

import express from 'express';
import crypto from 'crypto';
import db from '../config/database.js';
import { redactPayload } from '../utils/selcomSignature.js';
import { logAuditEvent } from '../audit/logger.js';

const router = express.Router();

function secretMatches(provided, expected) {
  if (!expected) return false;
  const a = Buffer.from(String(provided || ''));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// --- Source-IP allowlist helpers -------------------------------------------

// Strip the IPv4-mapped IPv6 prefix Node reports for IPv4 connections.
function normalizeIp(ip) {
  const value = String(ip || '');
  return value.startsWith('::ffff:') ? value.slice(7) : value;
}

function isLoopback(ip) {
  return ip === '::1' || ip === 'localhost' || /^127\./.test(ip);
}

function ipv4ToLong(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    value = value * 256 + n;
  }
  return value;
}

// entry is a single IP ("196.192.79.2", "::1") or an IPv4 CIDR ("196.192.79.0/24").
function ipMatchesEntry(ip, entry) {
  if (!entry) return false;
  if (entry.includes('/')) {
    const [network, prefixStr] = entry.split('/');
    const prefix = Number(prefixStr);
    const ipLong = ipv4ToLong(ip);
    const netLong = ipv4ToLong(normalizeIp(network));
    if (ipLong === null || netLong === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    return (ipLong & mask) >>> 0 === (netLong & mask) >>> 0;
  }
  return ip === normalizeIp(entry);
}

// The app does not configure Express `trust proxy`, so X-Forwarded-For is
// attacker-controllable and must be ignored. Only if a deployment later sets
// `trust proxy` (behind a known reverse proxy) do we use Express's derived
// req.ip, which respects that setting.
function getClientIp(req) {
  const trustProxy = req.app && req.app.get('trust proxy');
  const raw = trustProxy ? req.ip : (req.socket && req.socket.remoteAddress);
  return normalizeIp(raw);
}

function parseAllowedIps() {
  return (process.env.SELCOM_WEBHOOK_ALLOWED_IPS || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

// Prominent startup warning when the allowlist is unset. Deferred with
// setImmediate because route modules are imported (and evaluated) before
// index.js runs dotenv.config().
setImmediate(() => {
  if (!process.env.SELCOM_WEBHOOK_ALLOWED_IPS) {
    console.warn(
      '[Selcom webhook] WARNING: SELCOM_WEBHOOK_ALLOWED_IPS is not set. ' +
      'Selcom webhooks are unsigned, so source-IP allowlisting is a primary authenticity control. ' +
      'Obtain Selcom\'s webhook source IPs from support and set SELCOM_WEBHOOK_ALLOWED_IPS before go-live.'
    );
  }
});

const ack = (res, message) => res.status(200).json({ success: true, message });

/**
 * POST /api/webhooks/selcom/:secret
 * Receives payment callbacks from the Selcom Payment Gateway.
 */
router.post('/selcom/:secret', (req, res, next) => {
  try {
    // 1. Secret URL path — wrong/missing secret is indistinguishable from a
    // nonexistent route.
    if (!secretMatches(req.params.secret, process.env.SELCOM_WEBHOOK_SECRET)) {
      logAuditEvent('SELCOM_WEBHOOK_BAD_SECRET', null, null, { path: '/api/webhooks/selcom/***' }, req);
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found.' } });
    }

    // 2. Source-IP allowlist.
    const clientIp = getClientIp(req);
    const allowedIps = parseAllowedIps();
    const mockLoopbackAllowed =
      process.env.PAYMENTS_MODE === 'mock' &&
      process.env.SELCOM_WEBHOOK_MOCK_ALLOW_LOOPBACK !== 'false' &&
      isLoopback(clientIp);

    if (allowedIps.length > 0) {
      const allowed = mockLoopbackAllowed || allowedIps.some((entry) => ipMatchesEntry(clientIp, entry));
      if (!allowed) {
        logAuditEvent('SELCOM_WEBHOOK_IP_REJECTED', null, null, { clientIp, allowlistSize: allowedIps.length }, req);
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Source IP not allowed.' } });
      }
    } else {
      console.warn(`[Selcom webhook] SELCOM_WEBHOOK_ALLOWED_IPS is unset — accepting webhook from unverified source IP ${clientIp}.`);
      logAuditEvent('SELCOM_WEBHOOK_IP_UNVERIFIED', null, null, { clientIp }, req);
    }

    const body = req.body || {};
    const { transid, order_id, reference, result, resultcode, payment_status, amount } = body;

    if (!transid || !order_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'transid and order_id are required.' }
      });
    }

    // Idempotency — dedup on Selcom's transid (UNIQUE column).
    const existingEvent = db.prepare('SELECT 1 FROM payment_events WHERE selcom_transaction_id = ?').get(transid);
    if (existingEvent) {
      logAuditEvent('SELCOM_WEBHOOK_DUPLICATE_IGNORED', null, order_id, { transid }, req);
      return ack(res, 'Duplicate webhook ignored.');
    }

    // 3. Reference match — order_id must be one we sent to Selcom.
    const payment = db.prepare('SELECT * FROM payments WHERE selcom_reference = ?').get(order_id);
    if (!payment) {
      logAuditEvent('SELCOM_WEBHOOK_UNKNOWN_REF', null, order_id, { transid, reference }, req);
      return ack(res, 'Acknowledged; no matching payment.');
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(payment.order_id);
    if (!order) {
      logAuditEvent('SELCOM_WEBHOOK_ORDER_NOT_FOUND', null, payment.order_id, { order_id, transid }, req);
      return ack(res, 'Acknowledged; no matching order.');
    }

    // 4. Amount match — refuse to fulfil if the paid amount disagrees.
    if (amount !== undefined && Number(amount) !== Number(payment.amount)) {
      logAuditEvent('SELCOM_WEBHOOK_AMOUNT_MISMATCH', null, order_id, {
        paymentReference: payment.payment_reference, expected: payment.amount, received: amount
      }, req);
      return ack(res, 'Acknowledged; amount mismatch, not fulfilled.');
    }

    // Terminal state already reached — nothing to do.
    if (order.payment_status === 'Paid') {
      logAuditEvent('SELCOM_WEBHOOK_ALREADY_PAID', null, order_id, { transid }, req);
      return ack(res, 'Order already marked as Paid.');
    }

    const isSuccess = result === 'SUCCESS' && String(resultcode) === '000';
    const redacted = JSON.stringify(redactPayload(body));

    if (isSuccess) {
      // Deduct stock here — this is the first (and, thanks to the idempotency
      // guard above, only) time this payment is confirmed, so the order's
      // items leave inventory exactly once. stock_status flips to
      // 'out_of_stock' only when a product hits zero; otherwise it's left as
      // the admin set it. (Same behaviour as stakabaWebhook.js.)
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
          SET status = 'Paid',
              selcom_transid = ?,
              provider_status = ?,
              provider_result_code = ?,
              provider_message = ?,
              paid_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(transid, payment_status || 'COMPLETED', String(resultcode), result, payment.id);

        db.prepare(`
          UPDATE orders
          SET payment_status = 'Paid',
              order_status = 'FulfilmentPending',
              fulfilment_status = 'FulfilmentPending',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(payment.order_id);

        for (const item of items) {
          decrementStock.run(item.quantity, item.quantity, item.product_id);
        }

        db.prepare(`
          INSERT INTO payment_events (selcom_transaction_id, payment_reference, raw_payload, provider, event_type, signature_valid, raw_payload_redacted)
          VALUES (?, ?, ?, 'selcom', 'WEBHOOK_SUCCESS', NULL, ?)
        `).run(transid, payment.payment_reference, redacted, redacted);
      })();

      logAuditEvent('PAYMENT_SUCCESS_WEBHOOK', null, payment.payment_reference, {
        orderId: payment.order_id, transid, stockItemsDeducted: items.length
      }, req);
      return ack(res, 'Payment completed and order updated successfully.');
    }

    // Any non-success result -> mark failed (defensive; Selcom says webhooks
    // fire only on success).
    db.transaction(() => {
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
      `).run(transid, payment_status || 'FAILED', resultcode === undefined ? null : String(resultcode), result || null, payment.id);

      db.prepare(`
        UPDATE orders
        SET payment_status = 'PaymentFailed',
            order_status = 'PaymentFailed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(payment.order_id);

      db.prepare(`
        INSERT INTO payment_events (selcom_transaction_id, payment_reference, raw_payload, provider, event_type, signature_valid, raw_payload_redacted)
        VALUES (?, ?, ?, 'selcom', 'WEBHOOK_FAILED', NULL, ?)
      `).run(transid, payment.payment_reference, redacted, redacted);
    })();

    logAuditEvent('PAYMENT_FAILURE_WEBHOOK', null, payment.payment_reference, {
      orderId: payment.order_id, transid, reason: result
    }, req);
    return ack(res, 'Payment failure registered.');
  } catch (error) {
    next(error);
  }
});

export default router;
