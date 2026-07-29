// Selcom hosted-checkout helper (card payments, Track C).
//
// Card payments cannot use /v1/checkout/create-order-minimal ("This api cannot
// be used for card payments" — https://developers.selcommobile.com), so they
// go through the full POST /v1/checkout/create-order, which returns a hosted
// payment gateway URL supporting cards, wallets, and QR. The customer is
// redirected there; the payment outcome comes back via the secret-path
// webhook (routes/webhooks.js).
//
// Doc facts baked in here (verified against the developer page, 2026-07-24):
//   - `payment_methods` is mandatory: comma-separated list of
//     ALL, MASTERPASS, CARD, MOBILEMONEYPULL. We send ALL.
//   - `redirect_url`, `cancel_url`, `webhook` must be base64 encoded
//     ("All urls in the request and response are base64 encoded").
//   - "Card payments with no billing info will get rejected" — billing.*
//     fields (firstname, lastname, address_1, city, state_or_region,
//     postcode_or_pobox, country, phone) are mandatory on this endpoint.
//   - Response: { reference, resultcode, result, message,
//       data: [{ gateway_buyer_uuid, payment_token, qr, payment_gateway_url }] }
//     payment_gateway_url is base64-encoded (one doc example shows it plain,
//     but the prose says all response URLs are base64 — we decode only when
//     the value doesn't already look like a URL).
//
// There is NO Selcom sandbox — the first non-mock call is live. SELCOM_MODE=mock
// keeps this path fully testable locally with a deterministic fake URL.

import { generateSelcomHeaders } from './selcomSignature.js';

const b64 = (value) => Buffer.from(String(value), 'utf8').toString('base64');

/**
 * The webhook URL sent to Selcom per-order. Includes the secret path segment
 * that routes/webhooks.js authenticates (no dashboard config needed).
 */
export function buildSecretWebhookUrl() {
  const base = (process.env.SELCOM_WEBHOOK_URL || 'http://localhost:5000/api/webhooks/selcom').replace(/\/+$/, '');
  const secret = process.env.SELCOM_WEBHOOK_SECRET || '';
  return secret ? `${base}/${secret}` : base;
}

/**
 * Decode payment_gateway_url if Selcom returned it base64-encoded.
 */
export function decodeGatewayUrl(value) {
  if (!value || typeof value !== 'string') return null;
  if (/^https?:/i.test(value)) return value;
  try {
    const decoded = Buffer.from(value, 'base64').toString('utf8');
    if (/^https?:/i.test(decoded)) return decoded;
  } catch {
    // fall through
  }
  return value;
}

// Selcom wants distinct first/last billing names.
function splitName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/);
  const firstname = parts[0] || 'Customer';
  const lastname = parts.slice(1).join(' ') || firstname;
  return { firstname, lastname };
}

/**
 * Create a full Selcom checkout order and return the hosted gateway URL.
 *
 * @param {Object} args
 * @param {string} args.orderId       Order id sent to Selcom (persisted as payments.selcom_reference; webhooks echo it back as order_id)
 * @param {number} args.amount        Integer TZS amount (server-authoritative)
 * @param {string} args.buyerName
 * @param {string} args.buyerEmail
 * @param {string} args.buyerPhone    MSISDN
 * @param {string} args.regionName    Delivery region name (used for billing city/region)
 * @param {number} args.noOfItems
 * @returns {Promise<{checkoutUrl: string, gatewayReference: string|null, raw: object|null}>}
 * @throws {Error} with .gatewayMessage on Selcom-side failure
 */
export async function createHostedCheckoutOrder({ orderId, amount, buyerName, buyerEmail, buyerPhone, regionName, noOfItems }) {
  const { firstname, lastname } = splitName(buyerName);
  const city = regionName || 'Dar es Salaam';
  const msisdn = String(buyerPhone || '').replace(/^\+/, '');

  const payload = {
    vendor: process.env.SELCOM_VENDOR_ID || 'dev_vendor_id',
    order_id: orderId,
    buyer_email: buyerEmail || 'buyer@example.com',
    buyer_name: buyerName || 'Buyer Name',
    buyer_phone: msisdn,
    amount: amount,
    currency: 'TZS',
    payment_methods: 'ALL',
    redirect_url: b64(process.env.SELCOM_REDIRECT_URL || 'http://localhost:5173/checkout/success'),
    cancel_url: b64(process.env.SELCOM_CANCEL_URL || 'http://localhost:5173/checkout/cancel'),
    webhook: b64(buildSecretWebhookUrl()),
    'billing.firstname': firstname,
    'billing.lastname': lastname,
    'billing.address_1': city,
    'billing.city': city,
    'billing.state_or_region': city,
    'billing.postcode_or_pobox': '00000',
    'billing.country': 'TZ',
    'billing.phone': msisdn,
    buyer_remarks: 'Natures Alchemy Order',
    merchant_remarks: 'Store checkout',
    no_of_items: noOfItems || 1
  };

  const signedFields = process.env.SELCOM_SIGNED_FIELDS_CREATE_ORDER;
  const timestamp = new Date().toISOString();
  const { headers, signingString } = generateSelcomHeaders(payload, signedFields, timestamp);

  if (process.env.SELCOM_MODE === 'mock') {
    console.log(`[MOCK SELCOM] signing-string-create-order: ${signingString}`);
    // Deterministic fake hosted-checkout URL so the flow is locally testable.
    return {
      checkoutUrl: `https://checkout.selcom.mock/pg/${orderId}`,
      gatewayReference: `mockref_${orderId}`,
      raw: null
    };
  }

  let response;
  let data;
  try {
    response = await fetch(`${process.env.SELCOM_BASE_URL}/checkout/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload)
    });
    data = await response.json();
  } catch (err) {
    const error = new Error(`Selcom Gateway timeout or connection failure: ${err.message}`);
    error.gatewayMessage = err.message;
    throw error;
  }

  if (response.status !== 200 || data.result !== 'SUCCESS') {
    const error = new Error(data.message || 'Selcom create-order failed.');
    error.gatewayMessage = data.message || null;
    throw error;
  }

  const entry = Array.isArray(data.data) ? data.data[0] : null;
  const checkoutUrl = decodeGatewayUrl(entry && entry.payment_gateway_url);
  if (!checkoutUrl) {
    const error = new Error('Selcom create-order response did not contain a payment gateway URL.');
    error.gatewayMessage = 'missing payment_gateway_url';
    throw error;
  }

  return { checkoutUrl, gatewayReference: data.reference || null, raw: data };
}
