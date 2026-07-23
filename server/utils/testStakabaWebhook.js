// Closes the "known limitation" gap noted after the 2026-07-22 Stakaba
// integration work: Stakaba's sandbox only delivers webhooks via the
// dashboard's manual "Send test webhook" button, so the real payment ->
// webhook -> fulfilment loop was never exercised end-to-end.
//
// This script creates a real checkout session + order, calls the real
// Stakaba sandbox API via POST /api/payments/stakaba/initiate (proving that
// leg still works), then simulates the webhook delivery ourselves (since
// sandbox won't) against our own /api/webhooks/stakaba/:secret endpoint —
// the same request shape Stakaba's dashboard button and live webhooks send.
// This validates every branch of server/routes/stakabaWebhook.js: success
// fulfilment + stock deduction, idempotency dedup, bad secret, unknown
// reference, and amount mismatch.
//
// It does NOT prove Stakaba's own webhook delivery works (that needs the
// dashboard button or a live transaction) — only that our handler behaves
// correctly for every payload shape Stakaba can send it.

import crypto from 'crypto';
import db from '../config/database.js';
import '../index.js';

const BASE_URL = 'http://localhost:5000/api';
const WEBHOOK_SECRET = process.env.STAKABA_WEBHOOK_SECRET;

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

async function createOrderAndInitiate({ productId, quantity = 1, paymentMethod = 'mpesa' }) {
  const sessionRes = await api('/checkout/session', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey() },
    body: JSON.stringify({
      customerName: 'Stakaba Test Customer',
      customerPhone: '+255712345678',
      customerEmail: 'stakaba-test@example.com',
      deliveryRegion: 'dar',
      paymentMethod,
      items: [{ productId, quantity }]
    })
  });

  if (sessionRes.status !== 201) {
    throw new Error(`Checkout session creation failed: ${sessionRes.status} ${JSON.stringify(sessionRes.data)}`);
  }

  const { checkoutSessionId, orderDraftReference } = sessionRes.data.data;

  const initiateRes = await api('/payments/stakaba/initiate', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey() },
    body: JSON.stringify({ checkoutSessionId, paymentMethod, customerPhone: '+255712345678' })
  });

  if (initiateRes.status !== 202) {
    throw new Error(`Payment initiation failed: ${initiateRes.status} ${JSON.stringify(initiateRes.data)}`);
  }

  const { paymentReference } = initiateRes.data.data;
  const payment = db.prepare('SELECT * FROM payments WHERE payment_reference = ?').get(paymentReference);

  return {
    orderId: orderDraftReference,
    paymentReference,
    internalReference: payment.stakaba_reference,
    amount: payment.amount
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

async function sendWebhook(secret, payload) {
  return api(`/webhooks/stakaba/${secret}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('STAKABA WEBHOOK HANDLER — SIMULATED END-TO-END VALIDATION');
  console.log('========================================\n');

  await sleep(1500);

  if (!WEBHOOK_SECRET) {
    console.log('STAKABA_WEBHOOK_SECRET is not set in the environment. Aborting.');
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

  // --- Scenario A: successful payment -> fulfilment + stock deduction ---
  console.log('--- Scenario A: successful payment ---');
  const a = await createOrderAndInitiate({ productId: product.id });
  const stockBeforeA = getProductStock(product.id);

  const aRes = await sendWebhook(WEBHOOK_SECRET, {
    event: 'transaction.success',
    internalReference: a.internalReference,
    status: 'SUCCESS',
    grossAmount: a.amount,
    metadata: { orderId: a.orderId }
  });
  check(aRes.status === 200, 'webhook accepted (200)', JSON.stringify(aRes.data));

  const paymentA = getPayment(a.paymentReference);
  const orderA = getOrder(a.orderId);
  check(paymentA.status === 'Paid', 'payment marked Paid', paymentA.status);
  check(orderA.payment_status === 'Paid', 'order payment_status = Paid', orderA.payment_status);
  check(orderA.fulfilment_status === 'FulfilmentPending', 'order fulfilment_status = FulfilmentPending', orderA.fulfilment_status);
  check(getProductStock(product.id) === stockBeforeA - 1, 'stock decremented by 1', `before=${stockBeforeA}, after=${getProductStock(product.id)}`);

  // Replay the same webhook — must be a no-op (idempotency).
  const aReplay = await sendWebhook(WEBHOOK_SECRET, {
    event: 'transaction.success',
    internalReference: a.internalReference,
    status: 'SUCCESS',
    grossAmount: a.amount,
    metadata: { orderId: a.orderId }
  });
  check(aReplay.status === 200 && /[Dd]uplicate/.test(aReplay.data.message || ''), 'duplicate webhook ignored', JSON.stringify(aReplay.data));
  check(getProductStock(product.id) === stockBeforeA - 1, 'stock NOT double-decremented on replay', `stock=${getProductStock(product.id)}`);

  // --- Scenario B: bad secret is rejected and not discoverable ---
  console.log('\n--- Scenario B: bad secret ---');
  const bRes = await sendWebhook('wrong-secret-value', {
    event: 'transaction.success',
    internalReference: a.internalReference,
    status: 'SUCCESS',
    grossAmount: a.amount
  });
  check(bRes.status === 404, 'wrong secret rejected with 404', `status=${bRes.status}`);

  // --- Scenario C: unknown reference is acknowledged but ignored ---
  console.log('\n--- Scenario C: unknown internalReference ---');
  const cRes = await sendWebhook(WEBHOOK_SECRET, {
    event: 'transaction.success',
    internalReference: `unknown_ref_${crypto.randomBytes(4).toString('hex')}`,
    status: 'SUCCESS',
    grossAmount: 1000
  });
  check(cRes.status === 200 && /no matching payment/i.test(cRes.data.message || ''), 'unknown reference acknowledged, not acted on', JSON.stringify(cRes.data));

  // --- Scenario D: amount mismatch is refused ---
  console.log('\n--- Scenario D: amount mismatch ---');
  const d = await createOrderAndInitiate({ productId: product.id });
  const stockBeforeD = getProductStock(product.id);

  const dRes = await sendWebhook(WEBHOOK_SECRET, {
    event: 'transaction.success',
    internalReference: d.internalReference,
    status: 'SUCCESS',
    grossAmount: Number(d.amount) + 500,
    metadata: { orderId: d.orderId }
  });
  check(dRes.status === 200 && /amount mismatch/i.test(dRes.data.message || ''), 'amount mismatch acknowledged, not fulfilled', JSON.stringify(dRes.data));
  const paymentD = getPayment(d.paymentReference);
  check(paymentD.status === 'AwaitingPayment', 'payment left AwaitingPayment on amount mismatch', paymentD.status);
  check(getProductStock(product.id) === stockBeforeD, 'stock untouched on amount mismatch', `stock=${getProductStock(product.id)}`);

  // --- Scenario E: failure event marks the order failed, no stock movement ---
  console.log('\n--- Scenario E: payment failure event ---');
  const e = await createOrderAndInitiate({ productId: product.id });
  const stockBeforeE = getProductStock(product.id);

  const eRes = await sendWebhook(WEBHOOK_SECRET, {
    event: 'transaction.failed',
    internalReference: e.internalReference,
    status: 'FAILED',
    grossAmount: e.amount,
    metadata: { orderId: e.orderId }
  });
  check(eRes.status === 200, 'failure webhook accepted (200)', JSON.stringify(eRes.data));
  const paymentE = getPayment(e.paymentReference);
  const orderE = getOrder(e.orderId);
  check(paymentE.status === 'Failed', 'payment marked Failed', paymentE.status);
  check(orderE.payment_status === 'PaymentFailed', 'order payment_status = PaymentFailed', orderE.payment_status);
  check(getProductStock(product.id) === stockBeforeE, 'stock untouched on failed payment', `stock=${getProductStock(product.id)}`);

  // --- Scenario F: each reachable mobile money network end-to-end ---
  // The network-specific leg is the initiate call, which sends Stakaba's
  // `network` enum (Mpesa/TigoPesa/AirtelMoney). Verify the sandbox accepts
  // each and returns a real internalReference, then confirm the success
  // webhook fulfils the order the same way for every network.
  console.log('\n--- Scenario F: reachable mobile money networks (mpesa, tigo, airtel) ---');
  for (const network of ['mpesa', 'tigo', 'airtel']) {
    try {
      const f = await createOrderAndInitiate({ productId: product.id, paymentMethod: network });
      check(Boolean(f.internalReference), `[${network}] sandbox initiate returned an internalReference`);

      const stockBeforeF = getProductStock(product.id);
      const fRes = await sendWebhook(WEBHOOK_SECRET, {
        event: 'transaction.success',
        internalReference: f.internalReference,
        status: 'SUCCESS',
        grossAmount: f.amount,
        metadata: { orderId: f.orderId }
      });
      const paymentF = getPayment(f.paymentReference);
      check(fRes.status === 200 && paymentF.status === 'Paid', `[${network}] payment fulfilled to Paid`, `status=${paymentF.status}`);
      check(getProductStock(product.id) === stockBeforeF - 1, `[${network}] stock decremented by 1`, `before=${stockBeforeF}, after=${getProductStock(product.id)}`);
    } catch (err) {
      check(false, `[${network}] end-to-end flow`, err.message);
    }
  }

  // --- Scenario G: HaloPesa is NOT a supported payment method ---
  // HaloPesa is intentionally unsupported: the checkout schema enum, the DB
  // CHECK constraint, the frontend, and NETWORK_MAP all omit it. Assert that
  // a checkout session with halo is rejected, so support can't be half-added
  // (e.g. to the util only) without this failing.
  console.log('\n--- Scenario G: halo is rejected as an unsupported method ---');
  const gRes = await api('/checkout/session', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey() },
    body: JSON.stringify({
      customerName: 'Stakaba Test Customer',
      customerPhone: '+255712345678',
      customerEmail: 'stakaba-test@example.com',
      deliveryRegion: 'dar',
      paymentMethod: 'halo',
      items: [{ productId: product.id, quantity: 1 }]
    })
  });
  check(gRes.status === 400, 'halo checkout session rejected (400) — HaloPesa unreachable by design', `status=${gRes.status}`);

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
