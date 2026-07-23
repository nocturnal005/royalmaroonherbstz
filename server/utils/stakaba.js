// Stakaba payment gateway client (https://docs.stakaba.com).
//
// Verified against the live sandbox on 2026-07-22:
//   - Payment creation (`POST /api/v1/payments/collection`, `/payments/card`)
//     authenticates with the `x-api-key` header. This is all a backend needs.
//   - The transaction-status endpoint (`GET /transactions/{id}`) and merchant
//     endpoints require a portal bearer token the backend cannot obtain, so we
//     never call them — payment state is driven entirely by webhooks.
//   - Webhooks carry NO signature (confirmed by capturing a real delivery), so
//     authenticity is established elsewhere: a secret in the webhook URL path,
//     matching Stakaba's `internalReference` to a payment we created, and
//     matching the amount. See routes/stakabaWebhook.js.
//
// All amounts are integer TZS. Mobile numbers must be MSISDN `255XXXXXXXXX`.

import { normalizePhone } from './phone.js';

const baseUrl = () => (process.env.STAKABA_BASE_URL || 'https://api.stakaba.com').replace(/\/+$/, '');
const apiKey = () => process.env.STAKABA_API_KEY || '';
const timeoutMs = () => parseInt(process.env.STAKABA_REQUEST_TIMEOUT_MS || '15000', 10);

// Our internal checkout `payment_method` -> Stakaba `network` enum. Values are
// case-sensitive on Stakaba's side. ("tigo" is Mixx by Yas / Tigo.)
export const NETWORK_MAP = {
  mpesa: 'Mpesa',
  tigo: 'TigoPesa',
  airtel: 'AirtelMoney'
};

export class StakabaError extends Error {
  constructor(code, message, httpStatus = null, body = null) {
    super(message);
    this.name = 'StakabaError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.body = body;
  }
}

// Stakaba wants MSISDN without the leading "+": 255XXXXXXXXX.
export function toMsisdn(phone) {
  return normalizePhone(phone).replace(/^\+/, '');
}

async function stakabaFetch(path, { method = 'POST', body } = {}) {
  const key = apiKey();
  if (!key) {
    throw new StakabaError('CONFIG', 'STAKABA_API_KEY is not configured on the server.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());

  let res;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      method,
      headers: {
        'x-api-key': key,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
  } catch (err) {
    const reason = err.name === 'AbortError' ? 'timed out' : `failed: ${err.message}`;
    throw new StakabaError('NETWORK', `Stakaba request ${reason}.`);
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    // Stakaba errors: { error, message, details }
    throw new StakabaError(data.error || `HTTP_${res.status}`, data.message || `Stakaba returned ${res.status}.`, res.status, data);
  }
  return data;
}

/**
 * Mobile money USSD-push collection.
 * @returns {{ internalReference: string, status: string|null, raw: object }}
 */
export async function createCollection({ grossAmount, phone, network, metadata }) {
  const stakabaNetwork = NETWORK_MAP[network];
  if (!stakabaNetwork) {
    throw new StakabaError('VALIDATION', `Unsupported mobile money network: "${network}".`);
  }
  const data = await stakabaFetch('/api/v1/payments/collection', {
    body: {
      grossAmount: Math.round(grossAmount),
      currency: 'TZS',
      mobileNumber: toMsisdn(phone),
      network: stakabaNetwork,
      metadata: metadata || {}
    }
  });
  return { internalReference: data.internalReference, status: data.status || null, raw: data };
}

/**
 * Hosted card checkout. The customer is redirected to `checkoutUrl`.
 * @returns {{ checkoutUrl: string, internalReference: string, raw: object }}
 */
export async function createCardPayment({ grossAmount, customerEmail, customerName, customerPhone, metadata }) {
  const data = await stakabaFetch('/api/v1/payments/card', {
    body: {
      grossAmount: Math.round(grossAmount),
      currency: 'TZS',
      customerEmail,
      customerName,
      customerPhone: toMsisdn(customerPhone),
      metadata: metadata || {}
    }
  });
  return { checkoutUrl: data.checkoutUrl, internalReference: data.internalReference, raw: data };
}
