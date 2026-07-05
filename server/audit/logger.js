import db from '../config/database.js';

const SENSITIVE_KEYS = [
  'password',
  'password_hash',
  'token',
  'jwt',
  'cardNumber',
  'cardExpiry',
  'cardCvv',
  'cvv',
  'pin',
  'auth',
  'secret'
];

/**
 * Deeply traverses an object or array to redact sensitive keys.
 */
function redactObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item));
  }

  const redacted = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      redacted[key] = redactObject(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

/**
 * Write a transaction log event to the audit_logs table.
 */
export function logAuditEvent(action, operatorId = null, resourceId = null, details = {}, req = null) {
  try {
    const ipAddress = req ? (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
    const cleanDetails = redactObject(details);

    const stmt = db.prepare(`
      INSERT INTO audit_logs (timestamp, operator_id, action, resource_id, details, ip_address)
      VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      operatorId,
      action,
      resourceId,
      JSON.stringify(cleanDetails),
      ipAddress
    );
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
