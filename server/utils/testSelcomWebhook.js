// Selcom webhook handler — simulated end-to-end validation.
//
// Selcom has NO sandbox (confirmed by their team): the first real transaction
// is live. So, like testStakabaWebhook.js (whose structure this mirrors), this
// script proves every branch of our own handler locally before any live
// money moves. With SELCOM_MODE=mock it creates real checkout sessions +
// orders, calls POST /api/payments/initiate (mobile money USSD flow and the
// card hosted-checkout flow), then simulates Selcom's webhook delivery
// against /api/webhooks/selcom/:secret using the exact payload shape from the
// developer docs:
//   { result, resultcode, order_id, transid, reference, channel, amount,
//     phone, payment_status }
//
// Scenarios covered: success fulfilment + single stock deduction, duplicate
// transid replay, bad secret (404), disallowed source IP (403), unknown
// order_id, amount mismatch, failure result, and card initiate returning an
// https checkoutUrl then being fulfilled identically.
//
// It does NOT prove Selcom's own delivery works (that needs the first live
// transaction — see docs/SELCOM_GOLIVE.md), only that our handler behaves
// correctly for every payload it can receive.

import crypto from 'crypto';
import db from '../config/database.js';
import '../index.js';

const BASE_URL = 'http://localhost:5000/api';
const WEBHOOK_SECRET = process.env.SELCOM_WEBHOOK_SECRET;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let passed = true;

function check(condition, label, detail) {
  if (condition) {
    console.log(`  [PASS] ${label}`);
  } else {
    console.log(`  [FAIL] ${label}${detail ? ` — ${detail}` : ''}`);
    passed = false;
  }
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

function idempotencyKey() {
  return crypto.randomBytes(16).toString('hex');
}

function transId() {
  return `SIMTID${crypto.randomBytes(6).toString('hex')}`;
}

async function createOrderAndInitiate({ productId, quantity = 1, paymentMethod = 'mpesa' }) {
  const sessionRes = await api('/checkout/session', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey() },
    body: JSON.stringify({
      customerName: 'Selcom Test Customer',
      customerPhone: '+255712345678',
      customerEmail: 'selcom-test@example.com',
      deliveryRegion: 'dar',
      paymentMethod,
      items: [{ productId, quantity }]
    })
  });

  if (sessionRes.status !== 201) {
    throw new Error(`Checkout session creation failed: ${sessionRes.status} ${JSON.stringify(sessionRes.data)}`);
  }

  const { checkoutSessionId, orderDraftReference } = sessionRes.data.data;

  // Amount is intentionally omitted — the server uses the session total.
  const initiateRes = await api('/payments/initiate', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey() },
    body: JSON.stringify({ checkoutSessionId, paymentMethod, customerPhone: '+255712345678' })
  });

  if (initiateRes.status !== 202) {
    throw new Error(`Payment initiation failed: ${initiateRes.status} ${JSON.stringify(initiateRes.data)}`);
  }

  const { paymentReference, checkoutUrl } = initiateRes.data.data;
  const payment = db.prepare('SELECT * FROM payments WHERE payment_reference = ?').get(paymentReference);

  return {
    orderId: orderDraftReference,
    paymentReference,
    selcomOrderId: payment.selcom_reference, // what Selcom echoes back as webhook order_id
    amount: payment.amount,
    checkoutUrl // null for mobile money; a hosted-checkout URL for card
  };
}

function getProductStock(productId) {
  return db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(productId).stock_quantity;
}

function getPayment(paymentReference) {
  return db.prepare('SELECT * FROM payments WHERE payment_reference = ?').get(paymentReference);
}

function getOrder(orderId) {
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
}

// Build a webhook payload exactly as Selcom's docs describe it. `amount` is a
// string in their sample payload, so send it as a string to prove the handler
// compares numerically.
function selcomPayload({ selcomOrderId, amount, transid, result = 'SUCCESS', resultcode = '000', payment_status = 'COMPLETED' }) {
  return {
    result,
    resultcode,
    order_id: selcomOrderId,
    transid: transid || transId(),
    reference: `SIMREF${crypto.randomBytes(4).toString('hex')}`,
    channel: 'MPESA-TZ',
    amount: String(amount),
    phone: '255712345678',
    payment_status
  };
}

async function sendWebhook(secret, payload) {
  return api(`/webhooks/selcom/${secret}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('SELCOM WEBHOOK HANDLER — SIMULATED END-TO-END VALIDATION');
  console.log('========================================\n');

  await sleep(1500);

  if (!WEBHOOK_SECRET) {
    console.log('SELCOM_WEBHOOK_SECRET is not set in the environment. Aborting.');
    process.exit(1);
  }
  if (process.env.SELCOM_MODE !== 'mock') {
    console.log('SELCOM_MODE must be "mock" to run this harness (Selcom has no sandbox). Aborting.');
    process.exit(1);
  }

  const product = db.prepare(`
    SELECT id, stock_quantity FROM products
    WHERE is_published = 1 AND stock_status != 'out_of_stock' AND stock_quantity >= 4
    LIMIT 1
  `).get();

  if (!product) {
    console.log('No published, in-stock product with quantity >= 4 found for test fixtures. Aborting.');
    process.exit(1);
  }

  const initialStock = product.stock_quantity;
  console.log(`Using product '${product.id}' (starting stock: ${initialStock}) for all scenarios.\n`);

  // --- Scenario A: successful mobile money payment + duplicate replay ---
  console.log('--- Scenario A: successful payment (mobile money) ---');
  const a = await createOrderAndInitiate({ productId: product.id });
  const stockBeforeA = getProductStock(product.id);
  const aTransid = transId();

  const aRes = await sendWebhook(WEBHOOK_SECRET, selcomPayload({
    selcomOrderId: a.selcomOrderId, amount: a.amount, transid: aTransid
  }));
  check(aRes.status === 200, 'webhook accepted (200)', JSON.stringify(aRes.data));

  const paymentA = getPayment(a.paymentReference);
  const orderA = getOrder(a.orderId);
  check(paymentA.status === 'Paid', 'payment marked Paid', paymentA.status);
  check(paymentA.selcom_transid === aTransid, 'selcom transid persisted on payment', paymentA.selcom_transid);
  check(orderA.payment_status === 'Paid', 'order payment_status = Paid', orderA.payment_status);
  check(orderA.fulfilment_status === 'FulfilmentPending', 'order fulfilment_status = FulfilmentPending', orderA.fulfilment_status);
  check(getProductStock(product.id) === stockBeforeA - 1, 'stock decremented by 1', `before=${stockBeforeA}, after=${getProductStock(product.id)}`);

  // Replay the same transid — must be a no-op (idempotency).
  const aReplay = await sendWebhook(WEBHOOK_SECRET, selcomPayload({
    selcomOrderId: a.selcomOrderId, amount: a.amount, transid: aTransid
  }));
  check(aReplay.status === 200 && /[Dd]uplicate/.test(aReplay.data.message || ''), 'duplicate transid ignored', JSON.stringify(aReplay.data));
  check(getProductStock(product.id) === stockBeforeA - 1, 'stock NOT double-decremented on replay', `stock=${getProductStock(product.id)}`);

  // --- Scenario B: bad secret is rejected and not discoverable ---
  console.log('\n--- Scenario B: bad webhook secret ---');
  const bStockBefore = getProductStock(product.id);
  const bRes = await sendWebhook('wrong-secret-value', selcomPayload({
    selcomOrderId: a.selcomOrderId, amount: a.amount
  }));
  check(bRes.status === 404, 'wrong secret rejected with 404', `status=${bRes.status}`);
  check(getProductStock(product.id) === bStockBefore, 'no state change on bad secret', `stock=${getProductStock(product.id)}`);

  // --- Scenario C: disallowed source IP is rejected with 403 ---
  // Set an allowlist that excludes loopback and disable the mock loopback
  // bypass (the handler reads env per request, and the server runs in this
  // process, so mutating process.env takes effect immediately).
  console.log('\n--- Scenario C: disallowed source IP ---');
  const c = await createOrderAndInitiate({ productId: product.id });
  const cStockBefore = getProductStock(product.id);
  process.env.SELCOM_WEBHOOK_ALLOWED_IPS = '203.0.113.10, 198.51.100.0/24';
  process.env.SELCOM_WEBHOOK_MOCK_ALLOW_LOOPBACK = 'false';
  try {
    const cRes = await sendWebhook(WEBHOOK_SECRET, selcomPayload({
      selcomOrderId: c.selcomOrderId, amount: c.amount
    }));
    check(cRes.status === 403, 'loopback rejected with 403 when allowlist excludes it', `status=${cRes.status}`);
  } finally {
    process.env.SELCOM_WEBHOOK_ALLOWED_IPS = '';
    delete process.env.SELCOM_WEBHOOK_MOCK_ALLOW_LOOPBACK;
  }
  const paymentC = getPayment(c.paymentReference);
  check(paymentC.status === 'AwaitingPayment', 'payment untouched after IP rejection', paymentC.status);
  check(getProductStock(product.id) === cStockBefore, 'no stock change on IP rejection', `stock=${getProductStock(product.id)}`);

  // With the mock loopback bypass restored, an allowlist that excludes
  // loopback must still let the local harness through.
  process.env.SELCOM_WEBHOOK_ALLOWED_IPS = '203.0.113.10';
  try {
    const cRes2 = await sendWebhook(WEBHOOK_SECRET, selcomPayload({
      selcomOrderId: c.selcomOrderId, amount: c.amount
    }));
    check(cRes2.status === 200, 'mock-mode loopback bypass admits local webhook despite allowlist', `status=${cRes2.status}`);
    check(getPayment(c.paymentReference).status === 'Paid', 'payment fulfilled once bypass applies', getPayment(c.paymentReference).status);
  } finally {
    process.env.SELCOM_WEBHOOK_ALLOWED_IPS = '';
  }

  // --- Scenario D: unknown order_id is acknowledged but ignored ---
  console.log('\n--- Scenario D: unknown order_id ---');
  const dRes = await sendWebhook(WEBHOOK_SECRET, selcomPayload({
    selcomOrderId: `ord_selcom_unknown_${crypto.randomBytes(4).toString('hex')}`, amount: 1000
  }));
  check(dRes.status === 200 && /no matching payment/i.test(dRes.data.message || ''), 'unknown order_id acknowledged, not acted on', JSON.stringify(dRes.data));

  // --- Scenario E: amount mismatch is refused ---
  console.log('\n--- Scenario E: amount mismatch ---');
  const e = await createOrderAndInitiate({ productId: product.id });
  const stockBeforeE = getProductStock(product.id);

  const eRes = await sendWebhook(WEBHOOK_SECRET, selcomPayload({
    selcomOrderId: e.selcomOrderId, amount: Number(e.amount) + 500
  }));
  check(eRes.status === 200 && /amount mismatch/i.test(eRes.data.message || ''), 'amount mismatch acknowledged, not fulfilled', JSON.stringify(eRes.data));
  const paymentE = getPayment(e.paymentReference);
  check(paymentE.status === 'AwaitingPayment', 'payment left AwaitingPayment on amount mismatch', paymentE.status);
  check(getProductStock(product.id) === stockBeforeE, 'stock untouched on amount mismatch', `stock=${getProductStock(product.id)}`);

  // --- Scenario F: failure result marks the order failed, no stock movement ---
  // (Selcom says webhooks fire only on success; this proves the defensive path.)
  console.log('\n--- Scenario F: payment failure result ---');
  const f = await createOrderAndInitiate({ productId: product.id });
  const stockBeforeF = getProductStock(product.id);

  const fRes = await sendWebhook(WEBHOOK_SECRET, selcomPayload({
    selcomOrderId: f.selcomOrderId, amount: f.amount,
    result: 'FAIL', resultcode: '999', payment_status: 'USERCANCELED'
  }));
  check(fRes.status === 200, 'failure webhook accepted (200)', JSON.stringify(fRes.data));
  const paymentF = getPayment(f.paymentReference);
  const orderF = getOrder(f.orderId);
  check(paymentF.status === 'Failed', 'payment marked Failed', paymentF.status);
  check(orderF.payment_status === 'PaymentFailed', 'order payment_status = PaymentFailed', orderF.payment_status);
  check(getProductStock(product.id) === stockBeforeF, 'stock untouched on failed payment', `stock=${getProductStock(product.id)}`);

  // --- Scenario G: card payment (hosted checkout) end-to-end ---
  // Card uses the full create-order hosted checkout: initiate must return an
  // https checkoutUrl (deterministic fake in mock mode) with the payment
  // recorded as AwaitingPayment, and the success webhook must fulfil it
  // identically to mobile money.
  console.log('\n--- Scenario G: card payment (hosted checkout) ---');
  try {
    const g = await createOrderAndInitiate({ productId: product.id, paymentMethod: 'card' });
    check(Boolean(g.selcomOrderId), '[card] initiate persisted the Selcom order id');
    check(typeof g.checkoutUrl === 'string' && /^https:\/\//.test(g.checkoutUrl), '[card] initiate returned an https hosted-checkout URL', String(g.checkoutUrl));
    const paymentGBefore = getPayment(g.paymentReference);
    check(paymentGBefore.status === 'AwaitingPayment', '[card] payment recorded as AwaitingPayment', paymentGBefore.status);
    check(paymentGBefore.checkout_url === g.checkoutUrl, '[card] checkout URL persisted for reuse', paymentGBefore.checkout_url);

    const stockBeforeG = getProductStock(product.id);
    const gRes = await sendWebhook(WEBHOOK_SECRET, selcomPayload({
      selcomOrderId: g.selcomOrderId, amount: g.amount
    }));
    const paymentG = getPayment(g.paymentReference);
    const orderG = getOrder(g.orderId);
    check(gRes.status === 200 && paymentG.status === 'Paid', '[card] payment fulfilled to Paid', `status=${paymentG.status}`);
    check(orderG.fulfilment_status === 'FulfilmentPending', '[card] order queued for fulfilment', orderG.fulfilment_status);
    check(getProductStock(product.id) === stockBeforeG - 1, '[card] stock decremented by 1', `before=${stockBeforeG}, after=${getProductStock(product.id)}`);
  } catch (err) {
    check(false, '[card] end-to-end flow', err.message);
  }

  // Self-cleaning: restore the test product's stock to its pre-run value so
  // the script is repeatable without manual DB fixups.
  db.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?').run(initialStock, product.id);
  console.log(`\nRestored product '${product.id}' stock to ${initialStock}.`);

  console.log('\n========================================');
  console.log(passed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED — see [FAIL] lines above');
  console.log('========================================\n');
  process.exit(passed ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
