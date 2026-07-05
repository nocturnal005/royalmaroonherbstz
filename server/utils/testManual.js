import db from '../config/database.js';
// Import the server to start it
import '../index.js';

const BASE_URL = 'http://localhost:5000/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('\n========================================');
  console.log('STARTING STAGE 8 MANUAL API VALIDATION');
  console.log('========================================\n');

  // Wait 1.5s for server startup
  await sleep(1500);

  let passed = true;

  // Helper to run a test case and format output
  async function testCase(name, path, options = {}) {
    console.log(`[TEST] ${name} - ${options.method || 'GET'} ${path}`);
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      const data = await res.json();
      console.log(`  Status: ${res.status}`);
      console.log(`  Response: ${JSON.stringify(data, null, 2)}`);
      return { status: res.status, data };
    } catch (err) {
      console.log(`  Failed with error: ${err.message}`);
      passed = false;
      return null;
    }
  }

  // 1. GET /products
  console.log('\n--- 1. Testing Products Catalog ---');
  await testCase('Get all products', '/products');
  await testCase('Get single product (Calmness Tincture)', '/products/calmness-tincture');
  await testCase('Get non-existent product', '/products/non-existent');

  // 2. POST /cart/validate
  console.log('\n--- 2. Testing Cart Validation ---');
  await testCase('Validate valid cart (Dar)', '/cart/validate', {
    method: 'POST',
    body: JSON.stringify({
      items: [
        { productId: 'calmness-tincture', quantity: 2 },
        { productId: 'botanical-balm', quantity: 1 }
      ],
      deliveryRegion: 'dar'
    })
  });

  await testCase('Validate cart with warnings (Adjust stock quantity)', '/cart/validate', {
    method: 'POST',
    body: JSON.stringify({
      items: [
        { productId: 'calmness-tincture', quantity: 100 } // only 30 available
      ],
      deliveryRegion: 'dar'
    })
  });

  await testCase('Validate cart invalid region', '/cart/validate', {
    method: 'POST',
    body: JSON.stringify({
      items: [
        { productId: 'calmness-tincture', quantity: 2 }
      ],
      deliveryRegion: 'invalid-region'
    })
  });

  // 3. POST /shipping/estimate
  console.log('\n--- 3. Testing Shipping Estimate ---');
  await testCase('Estimate for Dodoma', '/shipping/estimate', {
    method: 'POST',
    body: JSON.stringify({ deliveryRegion: 'dodoma' })
  });

  // 4. POST /checkout/session & Idempotency
  console.log('\n--- 4. Testing Checkout Session & Idempotency ---');
  const checkoutPayload = {
    customerName: 'Juma Hamisi',
    customerPhone: '0712345678', // will normalize to +255712345678
    customerEmail: 'juma@example.tz',
    deliveryRegion: 'dar',
    deliveryNotes: 'Near Post Office',
    paymentMethod: 'mpesa',
    items: [
      { productId: 'calmness-tincture', quantity: 1 },
      { productId: 'winter-harvest-infusion', quantity: 2 }
    ]
  };

  const checkoutPayloadDiff = {
    ...checkoutPayload,
    customerName: 'Aisha Juma'
  };

  const idempotencyKey = `idem_key_${Date.now()}`;

  // First request: Should succeed and create order draft
  const sessionRes1 = await testCase('Checkout Session - Initial Attempt', '/checkout/session', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(checkoutPayload)
  });

  // Second request (same key, same payload): Should return cached response
  await testCase('Checkout Session - Same Key, Same Payload (Cached)', '/checkout/session', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(checkoutPayload)
  });

  // Third request (same key, different payload): Should return 409 Conflict
  await testCase('Checkout Session - Same Key, Different Payload (Conflict)', '/checkout/session', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(checkoutPayloadDiff)
  });

  // Extract Session ID for next steps
  const checkoutSessionId = sessionRes1?.data?.data?.checkoutSessionId;
  const orderId = sessionRes1?.data?.data?.orderDraftReference;
  const amount = sessionRes1?.data?.data?.validatedTotals?.estimatedTotal;

  if (checkoutSessionId) {
    // 5. POST /payments/initiate & Idempotency
    console.log('\n--- 5. Testing Payment Placeholder & Idempotency ---');
    const paymentPayload = {
      checkoutSessionId,
      paymentMethod: 'mpesa',
      amount,
      customerPhone: '0712345678'
    };
    
    const paymentPayloadDiff = {
      ...paymentPayload,
      amount: amount + 1000
    };

    const paymentIdKey = `pay_idem_${Date.now()}`;

    // First request: Should succeed (accept)
    const payRes1 = await testCase('Payment Initiate - Initial Attempt', '/payments/initiate', {
      method: 'POST',
      headers: { 'Idempotency-Key': paymentIdKey },
      body: JSON.stringify(paymentPayload)
    });

    // Second request (same key, same payload): Should return cached response
    await testCase('Payment Initiate - Same Key, Same Payload (Cached)', '/payments/initiate', {
      method: 'POST',
      headers: { 'Idempotency-Key': paymentIdKey },
      body: JSON.stringify(paymentPayload)
    });

    // Third request (same key, different payload): Should return 409 Conflict
    await testCase('Payment Initiate - Same Key, Different Payload (Conflict)', '/payments/initiate', {
      method: 'POST',
      headers: { 'Idempotency-Key': paymentIdKey },
      body: JSON.stringify(paymentPayloadDiff)
    });

    const paymentReference = payRes1?.data?.data?.paymentReference;

    if (paymentReference) {
      // 6. GET /payments/status/:ref
      console.log('\n--- 6. Testing Payment Status ---');
      await testCase('Get payment status', `/payments/status/${paymentReference}`);
    }

    if (orderId) {
      // 7. GET /orders/:id
      console.log('\n--- 7. Testing Order Status ---');
      await testCase('Get order details (tracking)', `/orders/${orderId}`);
    }
  }

  // 8. Error / Validation failures
  console.log('\n--- 8. Testing Edge Cases and Sanitized Errors ---');
  await testCase('CORS block check (using origin header)', '/products', {
    headers: { 'Origin': 'http://malicious-site.com' }
  });

  await testCase('Invalid phone format check', '/checkout/session', {
    method: 'POST',
    headers: { 'Idempotency-Key': `err_idem_${Date.now()}` },
    body: JSON.stringify({
      ...checkoutPayload,
      customerPhone: 'invalid-phone-number'
    })
  });

  await testCase('Unknown-field rejection check', '/checkout/session', {
    method: 'POST',
    headers: { 'Idempotency-Key': `err_idem2_${Date.now()}` },
    body: JSON.stringify({
      ...checkoutPayload,
      frontendTotal: 1
    })
  });

  // 9. Inspect audit logs
  console.log('\n--- 9. Querying Recent Audit Logs from DB ---');
  try {
    const logs = db.prepare('SELECT timestamp, action, resource_id, details FROM audit_logs ORDER BY id DESC LIMIT 10').all();
    console.log(JSON.stringify(logs, null, 2));
  } catch (err) {
    console.log(`Failed to fetch audit logs: ${err.message}`);
  }

  console.log('\n========================================');
  console.log('MANUAL API VALIDATION COMPLETED');
  console.log('========================================\n');

  process.exit(0);
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
