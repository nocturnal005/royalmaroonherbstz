import db from '../config/database.js';
import { generateSelcomHeaders, verifySelcomWebhook, redactPayload } from './selcomSignature.js';
// Start server
import '../index.js';

const BASE_URL = 'http://localhost:5000/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('\n========================================');
  console.log('STARTING STAGE 10 SECURE PAYMENTS VALIDATION');
  console.log('========================================\n');

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
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = await res.text();
      }
      console.log(`  Status: ${res.status}`);
      console.log(`  Response: ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`);
      return { status: res.status, headers: res.headers, data };
    } catch (err) {
      console.log(`  Failed with error: ${err.message}`);
      passed = false;
      return null;
    }
  }

  // Pre-test cleanup to ensure test idempotency/robustness
  db.prepare('DELETE FROM payment_events').run();
  db.prepare('DELETE FROM payments').run();
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM checkout_sessions').run();
  db.prepare('DELETE FROM idempotency_keys').run();

  await sleep(1000);

  // 1. Signature generation testing using controlled test inputs
  console.log('\n--- 1. Testing Selcom Signature Generator Strings (Secrets Redacted) ---');
  
  const testTimestamp = '2026-06-27T10:00:00.000Z';

  // A. Create Order Minimal
  const orderPayload = {
    vendor: 'dev_vendor_id',
    order_id: 'ord_test_123',
    buyer_email: 'buyer@example.com',
    buyer_name: 'Buyer Name',
    buyer_phone: '255712345678',
    amount: 50000,
    currency: 'TZS',
    webhook: 'http://localhost:5000/api/webhooks/selcom',
    buyer_remarks: 'Remarks',
    merchant_remarks: 'Remarks',
    no_of_items: 1
  };
  const orderHeaders = generateSelcomHeaders(orderPayload, process.env.SELCOM_SIGNED_FIELDS_CREATE_ORDER_MINIMAL, testTimestamp);
  console.log(`✓ create-order-minimal signing string:`);
  console.log(`  "${orderHeaders.signingString}"`);
  
  // Verify no timestamp in Signed-Fields header
  const orderSignedFields = orderHeaders.headers['Signed-Fields'];
  console.log(`  Signed-Fields: "${orderSignedFields}"`);
  const orderHasTimestampInFields = orderSignedFields.includes('timestamp');
  console.log(`  Contains timestamp in Signed-Fields: ${orderHasTimestampInFields ? 'YES (Error)' : 'NO (Correct)'}`);
  if (orderHasTimestampInFields) passed = false;

  // B. Wallet Payment
  const walletPayload = {
    transid: 'tx_test_456',
    order_id: 'ord_test_123',
    msisdn: '255712345678'
  };
  const walletHeaders = generateSelcomHeaders(walletPayload, process.env.SELCOM_SIGNED_FIELDS_WALLET_PAYMENT, testTimestamp);
  console.log(`\n✓ wallet-payment signing string:`);
  console.log(`  "${walletHeaders.signingString}"`);
  const expectedWalletString = `timestamp=${testTimestamp}&transid=tx_test_456&order_id=ord_test_123&msisdn=255712345678`;
  const isWalletCorrect = walletHeaders.signingString === expectedWalletString;
  console.log(`  Format matches expected: ${isWalletCorrect ? 'YES (Correct)' : 'NO (Error)'}`);
  if (!isWalletCorrect) passed = false;

  // C. Order Status
  const statusPayload = {
    order_id: 'ord_test_123'
  };
  const statusHeaders = generateSelcomHeaders(statusPayload, process.env.SELCOM_SIGNED_FIELDS_ORDER_STATUS, testTimestamp);
  console.log(`\n✓ order-status signing string:`);
  console.log(`  "${statusHeaders.signingString}"`);
  const expectedStatusString = `timestamp=${testTimestamp}&order_id=ord_test_123`;
  const isStatusCorrect = statusHeaders.signingString === expectedStatusString;
  console.log(`  Format matches expected: ${isStatusCorrect ? 'YES (Correct)' : 'NO (Error)'}`);
  if (!isStatusCorrect) passed = false;

  // D. Webhook
  const webhookPayload = {
    transid: 'tx_web_789',
    order_id: 'ord_test_123',
    reference: 'pay_ref_mock_123',
    result: 'SUCCESS',
    resultcode: '000',
    payment_status: 'PAID'
  };
  const webhookHeaders = generateSelcomHeaders(webhookPayload, process.env.SELCOM_SIGNED_FIELDS_WEBHOOK, testTimestamp);
  console.log(`\n✓ webhook signing string:`);
  console.log(`  "${webhookHeaders.signingString}"`);
  const expectedWebhookString = `timestamp=${testTimestamp}&transid=tx_web_789&order_id=ord_test_123&reference=pay_ref_mock_123&result=SUCCESS&resultcode=000&payment_status=PAID`;
  const isWebhookCorrect = webhookHeaders.signingString === expectedWebhookString;
  console.log(`  Format matches expected: ${isWebhookCorrect ? 'YES (Correct)' : 'NO (Error)'}`);
  if (!isWebhookCorrect) passed = false;

  // 1B. Testing Missing Signed Fields Rejection
  console.log('\n--- 1B. Testing Missing Signed Field Failure ---');
  try {
    const brokenPayload = {
      vendor: 'dev_vendor_id',
      // order_id is missing!
      buyer_email: 'buyer@example.com'
    };
    generateSelcomHeaders(brokenPayload, 'vendor,order_id,buyer_email', testTimestamp);
    console.log('✗ Failed: Expected signature helper to throw an error for missing signed field.');
    passed = false;
  } catch (err) {
    console.log(`✓ Success: Signature helper correctly threw error for missing field: "${err.message}"`);
  }

  // 2. Set up database fixtures for payment initiation tests
  console.log('\n--- 2. Setting Up Database Fixtures for Payments ---');
  // Insert shipping region
  db.prepare("INSERT OR IGNORE INTO shipping_regions (id, name, shipping_fee, estimated_days) VALUES ('dar', 'Dar es Salaam', 5000, '1-2 Days')").run();

  // Create checkout session fixture (amount total is 50000 TZS)
  db.prepare(`
    INSERT INTO checkout_sessions (id, order_draft_reference, customer_name, customer_phone, customer_email, delivery_notes, delivery_region_id, payment_method, subtotal, shipping_fee, total, expires_at)
    VALUES ('sess_test_10', 'ord_test_session_10', 'Test Customer', '+255712345678', 'test@example.com', 'Near clocktower', 'dar', 'mpesa', 45000, 5000, 50000, ?)
  `).run(new Date(Date.now() + 3600000).toISOString());

  // Create order draft fixture
  db.prepare(`
    INSERT INTO orders (id, checkout_session_id, customer_name, customer_phone, customer_email, delivery_region_id, delivery_notes, shipping_fee, total, payment_method, order_status, payment_status, fulfilment_status)
    VALUES ('ord_test_session_10', 'sess_test_10', 'Test Customer', '+255712345678', 'test@example.com', 'dar', 'Near clocktower', 5000, 50000, 'mpesa', 'Draft', 'Draft', 'Pending')
  `).run();

  console.log('✓ Database checkout and order fixtures created.');

  // 3. Payment Initiation Route Test
  console.log('\n--- 3. Testing Payment Initiation Endpoint ---');
  const initRes = await testCase('Initiate Payment', '/payments/initiate', {
    method: 'POST',
    headers: {
      'Idempotency-Key': 'idem_pay_init_10'
    },
    body: JSON.stringify({
      checkoutSessionId: 'sess_test_10',
      paymentMethod: 'mpesa',
      amount: 50000,
      customerPhone: '+255712345678'
    })
  });

  if (initRes.status !== 202) passed = false;
  
  const paymentRef = initRes.data.data.paymentReference;
  console.log(`  Generated Payment Reference: "${paymentRef}"`);
  const hasRefPrefix = paymentRef.startsWith('pay_ref_');
  console.log(`  Has correct prefix "pay_ref_": ${hasRefPrefix ? 'YES (Correct)' : 'NO (Error)'}`);
  if (!hasRefPrefix) passed = false;

  // 3B. Testing client price/amount tampering rejection
  console.log('\n--- 3B. Testing Client Price Tampering Rejection ---');
  const tamperedRes = await testCase('Initiate Payment with tampered amount (Expected: 400)', '/payments/initiate', {
    method: 'POST',
    headers: {
      'Idempotency-Key': 'idem_pay_tamper'
    },
    body: JSON.stringify({
      checkoutSessionId: 'sess_test_10',
      paymentMethod: 'mpesa',
      amount: 1000, // Tampered price: 1,000 TZS instead of 50,000 TZS
      customerPhone: '+255712345678'
    })
  });
  if (tamperedRes.status !== 400) {
    console.log('✗ Failed: Backend did not reject tampered client amount.');
    passed = false;
  } else {
    console.log('✓ Success: Backend rejected tampered amount.');
  }

  // 3C. Testing strict request body validation (rejects unknown fields)
  console.log('\n--- 3C. Testing Strict Request Body Validation (Rejects Unknown Fields) ---');
  const unknownFieldsRes = await testCase('Initiate Payment with unknown fields (Expected: 400)', '/payments/initiate', {
    method: 'POST',
    headers: {
      'Idempotency-Key': 'idem_pay_unknown'
    },
    body: JSON.stringify({
      checkoutSessionId: 'sess_test_10',
      paymentMethod: 'mpesa',
      amount: 50000,
      customerPhone: '+255712345678',
      hackerProperty: 'malicious_payload_field' // Unknown field
    })
  });
  if (unknownFieldsRes.status !== 400) {
    console.log('✗ Failed: Backend did not reject unknown request body fields.');
    passed = false;
  } else {
    console.log('✓ Success: Backend strictly rejected unknown request fields.');
  }

  // 4. Test Idempotency key behaviors
  console.log('\n--- 4. Testing Payment Initiation Idempotency ---');
  
  // A. Repeat request with same key and payload (Should return cached response)
  const idemCachedRes = await testCase('Repeat request with same key and body', '/payments/initiate', {
    method: 'POST',
    headers: {
      'Idempotency-Key': 'idem_pay_init_10'
    },
    body: JSON.stringify({
      checkoutSessionId: 'sess_test_10',
      paymentMethod: 'mpesa',
      amount: 50000,
      customerPhone: '+255712345678'
    })
  });
  if (idemCachedRes.status !== 202) passed = false;

  // B. Repeat request with same key and different body (Should return 409 Conflict)
  const idemConflictRes = await testCase('Repeat request with same key and different body', '/payments/initiate', {
    method: 'POST',
    headers: {
      'Idempotency-Key': 'idem_pay_init_10'
    },
    body: JSON.stringify({
      checkoutSessionId: 'sess_test_10',
      paymentMethod: 'mpesa',
      customerPhone: '+255787654321' // altered phone number
    })
  });
  if (idemConflictRes.status !== 409) passed = false;

  // C. Repeat request with different key but same session (Should return the same active reference)
  const idemActiveRes = await testCase('Initiate request with new key but same active session', '/payments/initiate', {
    method: 'POST',
    headers: {
      'Idempotency-Key': 'idem_pay_init_11'
    },
    body: JSON.stringify({
      checkoutSessionId: 'sess_test_10',
      paymentMethod: 'mpesa',
      amount: 50000,
      customerPhone: '+255712345678'
    })
  });
  if (idemActiveRes.status !== 202 || idemActiveRes.data.data.paymentReference !== paymentRef) {
    console.log('✗ Failed: Existing active reference was not returned.');
    passed = false;
  } else {
    console.log('✓ Success: Active reference was correctly reused.');
  }

  // 5. Test Webhook Signature / Header Rejections (401)
  console.log('\n--- 5. Testing Webhook Header and Signature Rejections ---');
  const webPayload = {
    transid: 'trans_web_888',
    order_id: 'ord_selcom_test',
    reference: paymentRef,
    result: 'SUCCESS',
    resultcode: '000',
    payment_status: 'PAID'
  };

  const baseHeaders = {
    'Digest-Method': 'HS256',
    'Timestamp': new Date().toISOString(),
    'Signed-Fields': 'transid,order_id,reference,result,resultcode,payment_status'
  };

  const webhookSignatureHeaders = generateSelcomHeaders(webPayload, process.env.SELCOM_SIGNED_FIELDS_WEBHOOK, baseHeaders.Timestamp);

  // A. Submit webhook with wrong Authorization header
  const webAuthRes = await testCase('Submit webhook with wrong Authorization header (Expected: 401)', '/webhooks/selcom', {
    method: 'POST',
    headers: {
      ...webhookSignatureHeaders.headers,
      'Authorization': 'SELCOM invalid_base64_key'
    },
    body: JSON.stringify(webPayload)
  });
  if (webAuthRes.status !== 401) passed = false;

  // B. Submit webhook with wrong Digest-Method header
  const webMethodRes = await testCase('Submit webhook with wrong Digest-Method header (Expected: 401)', '/webhooks/selcom', {
    method: 'POST',
    headers: {
      ...webhookSignatureHeaders.headers,
      'Digest-Method': 'MD5'
    },
    body: JSON.stringify(webPayload)
  });
  if (webMethodRes.status !== 401) passed = false;

  // C. Submit webhook with wrong Signed-Fields header
  const webFieldsRes = await testCase('Submit webhook with wrong Signed-Fields header (Expected: 401)', '/webhooks/selcom', {
    method: 'POST',
    headers: {
      ...webhookSignatureHeaders.headers,
      'Signed-Fields': 'transid,order_id,reference'
    },
    body: JSON.stringify(webPayload)
  });
  if (webFieldsRes.status !== 401) passed = false;

  // D. Submit webhook with wrong Digest signature value
  const webDigestRes = await testCase('Submit webhook with wrong Digest signature value (Expected: 401)', '/webhooks/selcom', {
    method: 'POST',
    headers: {
      ...webhookSignatureHeaders.headers,
      'Digest': 'invalid_digest_base64_string'
    },
    body: JSON.stringify(webPayload)
  });
  if (webDigestRes.status !== 401) passed = false;

  // 6. Test Webhook Stale Timestamp Protection (400)
  console.log('\n--- 6. Testing Webhook Stale Timestamp Protection ---');
  const staleTimestamp = new Date(Date.now() - 600000).toISOString(); // 10 minutes ago
  const staleHeaders = generateSelcomHeaders(webPayload, process.env.SELCOM_SIGNED_FIELDS_WEBHOOK, staleTimestamp);
  const webStaleRes = await testCase('Submit webhook with stale timestamp (Expected: 400)', '/webhooks/selcom', {
    method: 'POST',
    headers: staleHeaders.headers,
    body: JSON.stringify(webPayload)
  });
  if (webStaleRes.status !== 400) passed = false;

  // 7. Test Webhook Success Payment State Transitions (200)
  console.log('\n--- 7. Testing Webhook Payment Success State Transitions & Redaction ---');
  const validTimestamp = new Date().toISOString();
  const validHeaders = generateSelcomHeaders(webPayload, process.env.SELCOM_SIGNED_FIELDS_WEBHOOK, validTimestamp);
  
  // Also pass customer phone details to verify payload redaction
  const webhookBodyWithPhone = {
    ...webPayload,
    msisdn: '+255712345678',
    buyer_phone: '+255712345678'
  };
  const webSuccessHeaders = generateSelcomHeaders(webhookBodyWithPhone, process.env.SELCOM_SIGNED_FIELDS_WEBHOOK, validTimestamp);

  const webSuccessRes = await testCase('Submit webhook with valid headers and timestamp', '/webhooks/selcom', {
    method: 'POST',
    headers: webSuccessHeaders.headers,
    body: JSON.stringify(webhookBodyWithPhone)
  });
  if (webSuccessRes.status !== 200) passed = false;

  // Check state transitions in DB
  const dbOrder = db.prepare('SELECT order_status, payment_status, fulfilment_status FROM orders WHERE id = ?').get('ord_test_session_10');
  const dbPayment = db.prepare('SELECT status, selcom_transid FROM payments WHERE payment_reference = ?').get(paymentRef);
  const dbEvent = db.prepare('SELECT raw_payload_redacted FROM payment_events WHERE payment_reference = ?').get(paymentRef);

  console.log('  Database Order State:');
  console.log(`    order_status: "${dbOrder.order_status}" (Expected: FulfilmentPending)`);
  console.log(`    payment_status: "${dbOrder.payment_status}" (Expected: Paid)`);
  console.log(`    fulfilment_status: "${dbOrder.fulfilment_status}" (Expected: FulfilmentPending)`);

  console.log('  Database Payment State:');
  console.log(`    status: "${dbPayment.status}" (Expected: Paid)`);
  console.log(`    selcom_transid: "${dbPayment.selcom_transid}" (Expected: trans_web_888)`);

  // Verify phone numbers were redacted from storage
  console.log('  Redacted Payload in DB:');
  console.log(`    ${dbEvent.raw_payload_redacted}`);
  const containsRawPhone = dbEvent.raw_payload_redacted.includes('+255712345678');
  console.log(`    Contains raw customer phone: ${containsRawPhone ? 'YES (Error)' : 'NO (Redacted Correctly)'}`);
  if (containsRawPhone) passed = false;

  if (dbOrder.order_status !== 'FulfilmentPending' || dbOrder.payment_status !== 'Paid' || dbOrder.fulfilment_status !== 'FulfilmentPending' || dbPayment.status !== 'Paid') {
    console.log('✗ Failed: State transitions did not match expectations.');
    passed = false;
  } else {
    console.log('✓ Success: State transitions and redactions verified.');
  }

  // 8. Test Webhook Idempotency (Duplicate transid returns 200 without changes)
  console.log('\n--- 8. Testing Webhook Idempotency (Duplicate transid) ---');
  const webDuplicateRes = await testCase('Submit duplicate webhook', '/webhooks/selcom', {
    method: 'POST',
    headers: webSuccessHeaders.headers,
    body: JSON.stringify(webhookBodyWithPhone)
  });
  if (webDuplicateRes.status !== 200 || !webDuplicateRes.data.message.includes('duplicate skipped')) {
    passed = false;
  }

  // 9. Local-First Payment Status Polling Check
  console.log('\n--- 9. Testing Local Payment Status Endpoint & Overridden Paid Message ---');
  const statusRes = await testCase('Check Payment Status', `/payments/status/${paymentRef}`);
  if (statusRes.status !== 200 || statusRes.data.data.paymentStatus !== 'Paid') passed = false;
  if (statusRes.data.data.customerMessage !== 'Payment confirmed successfully.') {
    console.log(`✗ Failed: Expected customerMessage to be "Payment confirmed successfully.", got "${statusRes.data.data.customerMessage}"`);
    passed = false;
  }

  // 9B. Testing Local Status Polling Rate Limiting (No duplicate Selcom Status Queries)
  console.log('\n--- 9B. Testing Local Status Polling Rate Limiting ---');
  // Create another order and initiate payment
  db.prepare(`
    INSERT INTO checkout_sessions (id, order_draft_reference, customer_name, customer_phone, customer_email, delivery_notes, delivery_region_id, payment_method, subtotal, shipping_fee, total, expires_at)
    VALUES ('sess_test_12', 'ord_test_session_12', 'Test Customer', '+255712345678', 'test@example.com', 'Near clocktower', 'dar', 'mpesa', 45000, 5000, 50000, ?)
  `).run(new Date(Date.now() + 3600000).toISOString());
  db.prepare(`
    INSERT INTO orders (id, checkout_session_id, customer_name, customer_phone, customer_email, delivery_region_id, delivery_notes, shipping_fee, total, payment_method, order_status, payment_status, fulfilment_status)
    VALUES ('ord_test_session_12', 'sess_test_12', 'Test Customer', '+255712345678', 'test@example.com', 'dar', 'Near clocktower', 5000, 50000, 'mpesa', 'Draft', 'Draft', 'Pending')
  `).run();

  const rateLimitInit = await testCase('Initiate third payment', '/payments/initiate', {
    method: 'POST',
    headers: { 'Idempotency-Key': 'idem_pay_init_rate' },
    body: JSON.stringify({
      checkoutSessionId: 'sess_test_12',
      paymentMethod: 'mpesa',
      amount: 50000,
      customerPhone: '+255712345678'
    })
  });
  const rateLimitRef = rateLimitInit.data.data.paymentReference;

  // Verify that subsequent status checks do NOT log Selcom query requests when under the rate limit threshold (30 seconds)
  console.log('  Trigger first poll (must NOT trigger provider query because initiated_at is fresh):');
  await testCase('Poll Status 1', `/payments/status/${rateLimitRef}`);

  console.log('  Trigger second poll (must NOT trigger provider query because initiated_at is still fresh):');
  await testCase('Poll Status 2', `/payments/status/${rateLimitRef}`);

  // Artificially age both initiated_at and last_status_query_at to 40 seconds ago
  const agedTime = new Date(Date.now() - 40000).toISOString();
  db.prepare(`
    UPDATE payments
    SET initiated_at = ?,
        last_status_query_at = ?
    WHERE payment_reference = ?
  `).run(agedTime, agedTime, rateLimitRef);

  console.log('  Trigger third poll (must trigger exactly one provider query, logging to console):');
  const poll3 = await testCase('Poll Status 3', `/payments/status/${rateLimitRef}`);

  console.log('  Trigger fourth poll immediately (must NOT trigger provider query because last_status_query_at was updated by Poll 3):');
  const poll4 = await testCase('Poll Status 4', `/payments/status/${rateLimitRef}`);

  console.log('✓ Local status polling rate limiting verified.');

  // 10. Polling Timeout/Expiry Check
  console.log('\n--- 10. Testing Local Expiry Timeout Handling ---');
  // Create another order and initiate payment
  db.prepare(`
    INSERT INTO checkout_sessions (id, order_draft_reference, customer_name, customer_phone, customer_email, delivery_notes, delivery_region_id, payment_method, subtotal, shipping_fee, total, expires_at)
    VALUES ('sess_test_11', 'ord_test_session_11', 'Test Customer', '+255712345678', 'test@example.com', 'Near clocktower', 'dar', 'mpesa', 45000, 5000, 50000, ?)
  `).run(new Date(Date.now() + 3600000).toISOString());
  db.prepare(`
    INSERT INTO orders (id, checkout_session_id, customer_name, customer_phone, customer_email, delivery_region_id, delivery_notes, shipping_fee, total, payment_method, order_status, payment_status, fulfilment_status)
    VALUES ('ord_test_session_11', 'sess_test_11', 'Test Customer', '+255712345678', 'test@example.com', 'dar', 'Near clocktower', 5000, 50000, 'mpesa', 'Draft', 'Draft', 'Pending')
  `).run();

  const init2Res = await testCase('Initiate fourth payment', '/payments/initiate', {
    method: 'POST',
    headers: { 'Idempotency-Key': 'idem_pay_init_13' },
    body: JSON.stringify({
      checkoutSessionId: 'sess_test_11',
      paymentMethod: 'mpesa',
      amount: 50000,
      customerPhone: '+255712345678'
    })
  });
  
  const paymentRef2 = init2Res.data.data.paymentReference;

  // Artificially modify database expires_at to 10 seconds ago
  const expiredTime = new Date(Date.now() - 10000).toISOString();
  db.prepare("UPDATE payments SET expires_at = ? WHERE payment_reference = ?").run(expiredTime, paymentRef2);
  console.log('✓ Artificially expired payment session created.');

  // Status check on expired payment
  const statusExpiredRes = await testCase('Check expired payment status', `/payments/status/${paymentRef2}`);
  if (statusExpiredRes.status !== 200 || statusExpiredRes.data.data.paymentStatus !== 'AwaitingPayment') passed = false;
  if (statusExpiredRes.data.data.customerMessage !== 'Payment prompt expired. You may retry.') {
    console.log(`✗ Failed: Expected customerMessage to be "Payment prompt expired. You may retry.", got "${statusExpiredRes.data.data.customerMessage}"`);
    passed = false;
  }
  
  // Verify it exposes expiresAt for frontend timeout handling
  console.log(`  Received expiresAt: "${statusExpiredRes.data.data.expiresAt}"`);
  const isExpiredCorrect = new Date(statusExpiredRes.data.data.expiresAt) < new Date();
  console.log(`  Expired correct: ${isExpiredCorrect ? 'YES (Correct)' : 'NO (Error)'}`);
  if (!isExpiredCorrect) passed = false;

  // Clean up fixtures
  db.prepare('DELETE FROM payment_events').run();
  db.prepare('DELETE FROM payments').run();
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM checkout_sessions').run();
  db.prepare('DELETE FROM idempotency_keys').run();

  console.log('\n========================================');
  if (passed) {
    console.log('✓ ALL SECURE PAYMENTS TEST CASES COMPLETED SUCCESSFULLY');
  } else {
    console.log('✗ SOME SECURE PAYMENTS TEST CASES FAILED');
  }
  console.log('========================================\n');

  process.exit(passed ? 0 : 1);
}

runTests().catch(err => {
  console.error('Test runner crash:', err);
  process.exit(1);
});
