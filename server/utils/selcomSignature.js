import crypto from 'crypto';

/**
 * Generates the signature and auth headers for Selcom Payment Gateway
 * @param {Object} payload The request body payload (or query object for status checks)
 * @param {string} signedFieldsList Comma-separated list of fields to sign
 * @param {string} timestamp ISO 8601 timestamp
 * @returns {Object} { headers: Object, signingString: string }
 */
export function generateSelcomHeaders(payload, signedFieldsList, timestamp = new Date().toISOString()) {
  const apiKey = process.env.SELCOM_API_KEY || '';
  const apiSecret = process.env.SELCOM_API_SECRET || '';

  if (!apiKey || !apiSecret) {
    throw new Error('Selcom API credentials (SELCOM_API_KEY, SELCOM_API_SECRET) must be set in environment.');
  }

  // Prepend timestamp to signing base string
  let signingString = `timestamp=${timestamp}`;

  if (signedFieldsList) {
    const fields = signedFieldsList.split(',');
    for (const field of fields) {
      const val = payload[field];
      if (val === undefined || val === null) {
        throw new Error(`Missing required signed field: "${field}"`);
      }
      signingString += `&${field}=${val}`;
    }
  }

  // Calculate HMAC-SHA256 signature
  const hmac = crypto.createHmac('sha256', apiSecret);
  hmac.update(signingString);
  const digest = hmac.digest('base64');

  const headers = {
    'Authorization': `SELCOM ${Buffer.from(apiKey).toString('base64')}`,
    'Digest-Method': 'HS256',
    'Digest': digest,
    'Timestamp': timestamp,
    'Signed-Fields': signedFieldsList
  };

  return { headers, signingString };
}

/**
 * Verifies the signature of an incoming webhook payload using constant-time comparison.
 * @param {Object} body Raw parsed JSON body of the webhook
 * @param {Object} headers HTTP headers of the request (case-insensitive keys)
 * @returns {boolean} True if verification passes
 */
export function verifySelcomWebhook(body, headers) {
  const apiKey = process.env.SELCOM_API_KEY || '';
  const apiSecret = process.env.SELCOM_API_SECRET || '';
  if (!apiKey || !apiSecret) {
    throw new Error('Selcom credentials (SELCOM_API_KEY, SELCOM_API_SECRET) must be set in environment.');
  }

  const authHeader = headers['authorization'] || headers['Authorization'];
  const digestMethodHeader = headers['digest-method'] || headers['Digest-Method'];
  const receivedDigest = headers['digest'] || headers['Digest'];
  const timestamp = headers['timestamp'] || headers['Timestamp'];
  const signedFieldsList = headers['signed-fields'] || headers['Signed-Fields'];

  if (!receivedDigest || !timestamp || !signedFieldsList || !authHeader || !digestMethodHeader) {
    return false;
  }

  // 1. Verify Authorization equals SELCOM <Base64(API_KEY)>
  const expectedAuth = `SELCOM ${Buffer.from(apiKey).toString('base64')}`;
  if (authHeader !== expectedAuth) {
    return false;
  }

  // 2. Verify Digest-Method equals HS256
  if (digestMethodHeader !== 'HS256') {
    return false;
  }

  // 3. Verify Signed-Fields exactly matches expected webhook fields list
  const expectedSignedFields = process.env.SELCOM_SIGNED_FIELDS_WEBHOOK || '';
  if (signedFieldsList !== expectedSignedFields) {
    return false;
  }

  // 4. Re-build signing base string
  let signingString = `timestamp=${timestamp}`;
  const fields = signedFieldsList.split(',');
  for (const field of fields) {
    const val = body[field];
    if (val === undefined || val === null) {
      throw new Error(`Webhook payload missing signed field: "${field}"`);
    }
    signingString += `&${field}=${val}`;
  }

  // Calculate local HMAC-SHA256 signature
  const hmac = crypto.createHmac('sha256', apiSecret);
  hmac.update(signingString);
  const calculatedDigest = hmac.digest('base64');

  // Perform constant-time buffer comparison to mitigate timing attacks
  const calculatedBuffer = Buffer.from(calculatedDigest);
  const receivedBuffer = Buffer.from(receivedDigest);

  if (calculatedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(calculatedBuffer, receivedBuffer);
}

/**
 * Redacts sensitive fields from a gateway payload recursively before storage.
 * @param {Object} payload The payload object
 * @returns {Object} A new redacted payload object
 */
export function redactPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const redacted = JSON.parse(JSON.stringify(payload));
  const sensitiveKeys = [
    'msisdn', 'phone', 'buyer_phone', 'customer_phone', 
    'pin', 'password', 'token', 'jwt', 'secret', 'key', 
    'authorization', 'api_key', 'api_secret', 'digest', 
    'signature', 'cvv', 'card_number', 'pan'
  ];

  const redactValue = (obj) => {
    for (const k in obj) {
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        redactValue(obj[k]);
      } else {
        const lowerK = k.toLowerCase();
        const matchesSensitive = sensitiveKeys.some(sensitiveKey => 
          lowerK.includes(sensitiveKey)
        );
        if (matchesSensitive) {
          obj[k] = '***';
        }
      }
    }
  };

  redactValue(redacted);
  return redacted;
}
