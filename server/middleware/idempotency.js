import crypto from 'crypto';
import db from '../config/database.js';
import { logAuditEvent } from '../audit/logger.js';

function getSha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Express middleware for checking and caching requests using an Idempotency-Key header.
 */
export function checkIdempotency(req, res, next) {
  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    // Endpoints requiring idempotency will fail if key is missing, or skip if not strictly mandatory.
    // For checkout session and payment initiate, it IS mandatory.
    if (req.method === 'POST' && (req.originalUrl.includes('checkout/session') || req.originalUrl.includes('payments/initiate'))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Idempotency-Key header is required for this operation.'
        }
      });
    }
    return next();
  }

  try {
    const keyHash = getSha256(idempotencyKey);
    const bodyHash = getSha256(JSON.stringify(req.body || {}));

    // Clean up expired keys first
    db.prepare("DELETE FROM idempotency_keys WHERE expires_at < CURRENT_TIMESTAMP").run();

    const record = db.prepare(`
      SELECT status, request_hash, response_status, response_body
      FROM idempotency_keys
      WHERE key_hash = ?
    `).get(keyHash);

    if (record) {
      if (record.status === 'processing') {
        logAuditEvent('IDEMPOTENCY_DUPLICATE_PROCESSING', null, idempotencyKey, { route: req.originalUrl }, req);
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Request is currently being processed. Please retry shortly.'
          }
        });
      }

      if (record.status === 'completed') {
        if (record.request_hash === bodyHash) {
          logAuditEvent('IDEMPOTENCY_CACHE_HIT', null, idempotencyKey, { route: req.originalUrl }, req);
          const cachedResponse = JSON.parse(record.response_body);
          return res.status(record.response_status).json(cachedResponse);
        } else {
          logAuditEvent('IDEMPOTENCY_PAYLOAD_MISMATCH', null, idempotencyKey, { route: req.originalUrl }, req);
          return res.status(409).json({
            success: false,
            error: {
              code: 'CONFLICT',
              message: 'Idempotency key parameter used for a different payload.'
            }
          });
        }
      }

      // If status is 'failed', we re-route to allow a new attempt.
      db.prepare("DELETE FROM idempotency_keys WHERE key_hash = ?").run(keyHash);
    }

    // Insert key with status 'processing' and 24h expiry
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
      INSERT INTO idempotency_keys (key_hash, route, request_hash, status, expires_at)
      VALUES (?, ?, ?, 'processing', ?)
    `).run(keyHash, req.originalUrl, bodyHash, expiresAt);

    // Override res.json to capture response payload
    const originalJson = res.json;
    res.json = function (body) {
      res.json = originalJson; // restore original

      // Only cache successful or client-side errors that shouldn't be reprocessed.
      // 5xx errors should usually set status to failed to allow retries.
      const status = res.statusCode;
      const idempotencyStatus = status >= 500 ? 'failed' : 'completed';

      try {
        db.prepare(`
          UPDATE idempotency_keys
          SET status = ?, response_status = ?, response_body = ?
          WHERE key_hash = ?
        `).run(idempotencyStatus, status, JSON.stringify(body), keyHash);
      } catch (dbErr) {
        console.error('Failed to update idempotency cache:', dbErr);
      }

      return originalJson.call(this, body);
    };

    // Override res.send to handle generic responses
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend; // restore original

      // If res.json is called, it calls res.send, so ensure we don't cache twice.
      // This is a safety fallback.
      return originalSend.call(this, body);
    };

    // Ensure we mark it as failed on uncaught request exceptions
    res.on('finish', () => {
      // If response has finished but status remains processing, it must have failed without res.json/res.send
      const current = db.prepare(`SELECT status FROM idempotency_keys WHERE key_hash = ?`).get(keyHash);
      if (current && current.status === 'processing') {
        db.prepare(`UPDATE idempotency_keys SET status = 'failed' WHERE key_hash = ?`).run(keyHash);
      }
    });

    next();
  } catch (error) {
    next(error);
  }
}
