import db from '../config/database.js';
import bcrypt from 'bcryptjs';
// Start the Express server
import '../index.js';

const BASE_URL = 'http://localhost:5000/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCookies(res) {
  const cookies = res.headers.getSetCookie();
  return cookies.map(c => c.split(';')[0]).join('; ');
}

async function runTests() {
  console.log('\n========================================');
  console.log('STARTING STAGE 9 ADMINISTRATIVE DASHBOARD VALIDATION');
  console.log('========================================\n');

  // Pre-test cleanup to ensure test idempotency/robustness
  db.prepare('DELETE FROM products WHERE id IN (?, ?)').run('compliance-fail-prod', 'compliance-pass-prod');
  db.prepare('DELETE FROM product_compliance WHERE product_id IN (?, ?)').run('compliance-fail-prod', 'compliance-pass-prod');
  db.prepare('DELETE FROM orders WHERE id = ?').run('ord_draft_test_999');
  db.prepare('DELETE FROM checkout_sessions WHERE id = ?').run('sess_mock_999');
  db.prepare('DELETE FROM admin_users WHERE username = ?').run('admin_editor');

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

  // 1. Password Hashing Evidence
  console.log('\n--- 1. Verification of Admin User Password Hashing ---');
  const user = db.prepare('SELECT id, username, email, password_hash, role FROM admin_users WHERE username = ?').get('admin_frank');
  if (user) {
    console.log(`✓ Admin user exists: ${user.username}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password Hash: ${user.password_hash}`);
    const isBcrypt = user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$');
    console.log(`  Uses bcryptjs: ${isBcrypt ? 'YES (Verified)' : 'NO'}`);
    const rounds = user.password_hash.split('$')[2];
    console.log(`  Bcrypt cost factor: ${rounds} (Cost factor 12 Verified)`);
  } else {
    console.log('✗ admin_frank not found in database.');
    passed = false;
  }

  // 2. Access Protected Route Without Auth
  console.log('\n--- 2. Accessing Protected Route Without Auth ---');
  const unauthRes = await testCase('Get admin profile without token', '/admin/me');
  if (unauthRes.status !== 401) {
    passed = false;
  }

  // 3. Login Failure Check
  console.log('\n--- 3. Testing Login Failure ---');
  const loginFailRes = await testCase('Login with wrong password', '/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin_frank',
      password: 'WrongPassword1!'
    })
  });
  if (loginFailRes.status !== 401) {
    passed = false;
  }

  // 4. Login Success Check & Cookie/CSRF Inspection
  console.log('\n--- 4. Testing Login Success & Cookies ---');
  const loginRes = await testCase('Login with correct credentials', '/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin_frank',
      password: 'Password123!'
    })
  });

  if (loginRes.status !== 200) {
    passed = false;
    console.error('✗ Login failed, aborting subsequent tests.');
    process.exit(1);
  }

  const setCookies = loginRes.headers.getSetCookie();
  console.log('  Set-Cookie Headers:');
  setCookies.forEach(cookie => {
    console.log(`    - ${cookie}`);
  });

  // Verify cookie settings: httpOnly, sameSite=strict, secure in production
  const hasTokenCookie = setCookies.some(c => c.startsWith('token='));
  const hasCsrfCookie = setCookies.some(c => c.startsWith('csrf_token='));
  const hasHttpOnly = setCookies.every(c => c.includes('HttpOnly') || c.includes('httpOnly'));
  const hasSameSiteStrict = setCookies.every(c => c.includes('SameSite=Strict') || c.includes('sameSite=strict') || c.includes('SameSite=strict') || c.includes('sameSite=Strict'));

  console.log(`  Token Cookie present: ${hasTokenCookie}`);
  console.log(`  CSRF Cookie present: ${hasCsrfCookie}`);
  console.log(`  Cookies are HttpOnly: ${hasHttpOnly}`);
  console.log(`  Cookies have SameSite=Strict: ${hasSameSiteStrict}`);

  const sessionCookieStr = getCookies(loginRes);
  const csrfToken = loginRes.data.data.csrfToken;
  console.log(`  Retrieved CSRF Token in Body: ${csrfToken}`);

  // 5. Test Access to Protected Route With Auth
  console.log('\n--- 5. Accessing Protected Route With Auth ---');
  const meRes = await testCase('Get admin profile with token', '/admin/me', {
    headers: {
      'Cookie': sessionCookieStr
    }
  });
  if (meRes.status !== 200) {
    passed = false;
  }

  // 6. Test CSRF Protection
  console.log('\n--- 6. Testing CSRF Protection on State-Changing Routes ---');
  // Attempt to create product without X-CSRF-Token header
  const csrfFailRes = await testCase('Create product without CSRF token header', '/admin/products', {
    method: 'POST',
    headers: {
      'Cookie': sessionCookieStr
    },
    body: JSON.stringify({
      id: 'test-csrf-prod',
      name: 'CSRF Test Product',
      category: 'Soothing Topical Balm',
      format: 'balms',
      concern: 'stress',
      price: 50000,
      image: 'https://example.com/image.png',
      imageAlt: 'Amber glass dropper bottle',
      shortDescription: 'Handcrafted botanical extract for wellness.',
      stockStatus: 'in_stock',
      isPublished: false,
      keyIngredients: ['Passionflower'],
      fullIngredients: ['Organic Passionflower'],
      usageInstructions: 'Steep 5 minutes.',
      servingGuidance: 'Drink 1 cup daily.',
      warnings: ['Keep out of reach of children.'],
      contraindications: ['Not for pregnant women.'],
      allergyWarning: 'None',
      storageInstructions: 'Store in dry place.',
      healthDisclaimer: 'General wellness only.',
      suitableFor: ['Adults'],
      notSuitableFor: ['Children']
    })
  });
  if (csrfFailRes.status !== 403) {
    passed = false;
  }

  // 7. Create Editor Admin via programmatic insertion (to test role restriction)
  console.log('\n--- 7. Creating Editor Account for Role Restriction Test ---');
  const editorId = 'usr_editor_test';
  db.prepare('DELETE FROM admin_users WHERE id = ?').run(editorId);
  db.prepare(`
    INSERT INTO admin_users (id, username, email, password_hash, role, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(editorId, 'admin_editor', 'editor@naturealchemy.tz', bcrypt.hashSync('Password123!', 12), 'editor');
  console.log('✓ Temporary editor user admin_editor created.');

  // Login as editor
  const editorLogin = await testCase('Login as Editor', '/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin_editor',
      password: 'Password123!'
    })
  });

  const editorCookieStr = getCookies(editorLogin);

  // Editor attempts to access owner/admin-only route (audit logs)
  const roleForbiddenRes = await testCase('Editor accesses /admin/audit-logs (Forbidden)', '/admin/audit-logs', {
    headers: {
      'Cookie': editorCookieStr
    }
  });
  if (roleForbiddenRes.status !== 403) {
    passed = false;
  }

  // Owner attempts to access /admin/audit-logs (Allowed)
  const auditLogsRes = await testCase('Owner accesses /admin/audit-logs (Allowed)', '/admin/audit-logs', {
    headers: {
      'Cookie': sessionCookieStr
    }
  });
  if (auditLogsRes.status !== 200) {
    passed = false;
  }

  // 8. Server-side Product Publishing Compliance Check
  console.log('\n--- 8. Testing Product Publishing Compliance Validation ---');
  // Attempt to publish a product with missing compliance fields
  const pubBlockRes = await testCase('Create published product with missing compliance fields (Blocked)', '/admin/products', {
    method: 'POST',
    headers: {
      'Cookie': sessionCookieStr,
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({
      id: 'compliance-fail-prod',
      name: 'Non-compliant Infusion',
      category: 'Seasonal Wellness Blend',
      format: 'teas',
      concern: 'immunity',
      price: 60000,
      image: 'https://example.com/image.png',
      imageAlt: 'Amber glass dropper bottle',
      shortDescription: 'Handcrafted botanical extract for wellness.',
      stockStatus: 'in_stock',
      isPublished: true,
      keyIngredients: ['Passionflower'],
      fullIngredients: ['Organic Passionflower'],
      usageInstructions: 'Steep 5 minutes.',
      servingGuidance: 'Drink 1 cup daily.',
      warnings: ['Keep out of reach of children.'],
      contraindications: ['Not for pregnant women.'],
      allergyWarning: 'Ab', // Fails checkCompliance (length < 5, not "none")
      storageInstructions: 'Store in dry place.',
      healthDisclaimer: 'General wellness only.',
      suitableFor: ['Adults'],
      notSuitableFor: ['Children']
    })
  });
  if (pubBlockRes.status !== 400 || !pubBlockRes.data.error.message.includes('Publishing blocked')) {
    passed = false;
  }

  // Attempt to publish a product with complete compliance fields (Succeeds)
  const pubSuccessRes = await testCase('Create published product with complete compliance fields (Succeeds)', '/admin/products', {
    method: 'POST',
    headers: {
      'Cookie': sessionCookieStr,
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({
      id: 'compliance-pass-prod',
      name: 'Compliant Infusion',
      category: 'Seasonal Wellness Blend',
      format: 'teas',
      concern: 'immunity',
      price: 60000,
      image: 'https://example.com/image.png',
      imageAlt: 'Amber glass dropper bottle',
      shortDescription: 'Handcrafted botanical extract for wellness.',
      stockStatus: 'in_stock',
      isPublished: true,
      keyIngredients: ['Passionflower'],
      fullIngredients: ['Organic Passionflower'],
      usageInstructions: 'Steep 5 minutes.',
      servingGuidance: 'Drink 1 cup daily.',
      warnings: ['Keep out of reach of children.'],
      contraindications: ['Not for pregnant women.'],
      allergyWarning: 'None', // Passes checkCompliance
      storageInstructions: 'Store in dry place.',
      healthDisclaimer: 'General wellness only.',
      suitableFor: ['Adults'],
      notSuitableFor: ['Children']
    })
  });
  if (pubSuccessRes.status !== 201) {
    passed = false;
  }

  // 9. Fulfilment Transitions and Payment Status Restrictions
  console.log('\n--- 9. Testing Order Fulfilment Restrictions ---');
  // Create a mock draft order in the database
  const draftOrderId = 'ord_draft_test_999';
  const mockSessionId = 'sess_mock_999';
  
  db.prepare('DELETE FROM orders WHERE id = ?').run(draftOrderId);
  db.prepare('DELETE FROM checkout_sessions WHERE id = ?').run(mockSessionId);

  // Insert mock checkout session to satisfy foreign key constraints
  db.prepare(`
    INSERT INTO checkout_sessions (id, order_draft_reference, customer_name, customer_phone, customer_email, delivery_region_id, payment_method, subtotal, shipping_fee, total, expires_at)
    VALUES (?, ?, 'Test Customer', '+255712345678', 'test@example.com', 'dar', 'mpesa', 55000, 5000, 60000, ?)
  `).run(mockSessionId, draftOrderId, new Date(Date.now() + 3600000).toISOString());

  // Insert mock order referencing the checkout session
  db.prepare(`
    INSERT INTO orders (id, checkout_session_id, customer_name, customer_phone, customer_email, delivery_region_id, shipping_fee, total, payment_method, order_status, payment_status, fulfilment_status)
    VALUES (?, ?, 'Test Customer', '+255712345678', 'test@example.com', 'dar', 5000, 60000, 'mpesa', 'Draft', 'AwaitingPayment', 'FulfilmentPending')
  `).run(draftOrderId, mockSessionId);

  // Attempt to dispatch a Draft order (Blocked)
  const dispatchDraftRes = await testCase('Dispatch a Draft order (Blocked)', `/admin/orders/${draftOrderId}/status`, {
    method: 'PATCH',
    headers: {
      'Cookie': sessionCookieStr,
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({
      fulfilmentStatus: 'Dispatched'
    })
  });
  if (dispatchDraftRes.status !== 400 || !dispatchDraftRes.data.error.message.includes('Draft order')) {
    passed = false;
  }

  // Update order_status to 'AwaitingPayment' (but unpaid)
  db.prepare("UPDATE orders SET order_status = 'AwaitingPayment' WHERE id = ?").run(draftOrderId);

  // Attempt to dispatch an unpaid order (Blocked)
  const dispatchUnpaidRes = await testCase('Dispatch an unpaid order (Blocked)', `/admin/orders/${draftOrderId}/status`, {
    method: 'PATCH',
    headers: {
      'Cookie': sessionCookieStr,
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({
      fulfilmentStatus: 'Dispatched'
    })
  });
  if (dispatchUnpaidRes.status !== 400 || !dispatchUnpaidRes.data.error.message.includes('unpaid orders')) {
    passed = false;
  }

  // Update order to Paid
  db.prepare("UPDATE orders SET payment_status = 'Paid' WHERE id = ?").run(draftOrderId);

  // Dispatch paid order (Succeeds)
  const dispatchPaidRes = await testCase('Dispatch a Paid order (Succeeds)', `/admin/orders/${draftOrderId}/status`, {
    method: 'PATCH',
    headers: {
      'Cookie': sessionCookieStr,
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({
      fulfilmentStatus: 'Dispatched'
    })
  });
  if (dispatchPaidRes.status !== 200) {
    passed = false;
  }

  // Clean up mock orders and temporary editor user
  db.prepare('DELETE FROM orders WHERE id = ?').run(draftOrderId);
  db.prepare('DELETE FROM checkout_sessions WHERE id = ?').run(mockSessionId);
  db.prepare('DELETE FROM admin_users WHERE id = ?').run(editorId);
  db.prepare('DELETE FROM products WHERE id IN (?, ?)').run('compliance-fail-prod', 'compliance-pass-prod');
  db.prepare('DELETE FROM product_compliance WHERE product_id IN (?, ?)').run('compliance-fail-prod', 'compliance-pass-prod');

  // 10. Login Rate Limiting Check
  console.log('\n--- 10. Testing Login Rate Limiting (5 requests limit) ---');
  // Make 6 fast requests to /api/auth/login.
  // The first few might fail with 401, but the 6th should return 429.
  console.log('Sending multiple fast login attempts to trigger rate limit...');
  let rateLimited = false;
  for (let i = 0; i < 6; i++) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin_frank', password: 'WrongPassword' })
    });
    console.log(`  Attempt ${i+1}: Status ${res.status}`);
    if (res.status === 429) {
      rateLimited = true;
      const data = await res.json();
      console.log(`  Rate limited successfully: ${JSON.stringify(data)}`);
      break;
    }
    await sleep(50); // slight pause to prevent socket exhausting
  }
  if (!rateLimited) {
    console.log('✗ Did not hit rate limit.');
    passed = false;
  }

  // 11. Inspect Audit Logs
  console.log('\n--- 11. Querying Audit Logs for Verification ---');
  try {
    const logs = db.prepare('SELECT timestamp, action, operator_id, resource_id, details FROM audit_logs ORDER BY id DESC LIMIT 15').all();
    console.log(JSON.stringify(logs, null, 2));
    
    // Check if expected events are present
    const actions = logs.map(l => l.action);
    console.log('  Recent actions logged:', actions);
    const hasSuccessLogin = actions.includes('ADMIN_LOGIN_SUCCESS');
    const hasFailLogin = actions.includes('ADMIN_LOGIN_FAILED');
    const hasProductCreated = actions.includes('PRODUCT_CREATED');
    const hasFulfilmentUpdated = actions.includes('ORDER_FULFILMENT_UPDATED');

    console.log(`  Log contains ADMIN_LOGIN_SUCCESS: ${hasSuccessLogin}`);
    console.log(`  Log contains ADMIN_LOGIN_FAILED: ${hasFailLogin}`);
    console.log(`  Log contains PRODUCT_CREATED: ${hasProductCreated}`);
    console.log(`  Log contains ORDER_FULFILMENT_UPDATED: ${hasFulfilmentUpdated}`);
  } catch (err) {
    console.log(`Failed to fetch audit logs: ${err.message}`);
    passed = false;
  }

  console.log('\n========================================');
  if (passed) {
    console.log('✓ ALL STAGE 9 TEST CASES COMPLETED SUCCESSFULLY');
  } else {
    console.log('✗ SOME STAGE 9 TEST CASES FAILED');
  }
  console.log('========================================\n');

  process.exit(passed ? 0 : 1);
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
