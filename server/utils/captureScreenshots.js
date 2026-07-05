import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import bcrypt from 'bcryptjs';
import puppeteer from 'puppeteer-core';

// Enforce isolated test environment variables
process.env.PORT = '5999';
process.env.NODE_ENV = 'test';
process.env.SELCOM_MODE = 'mock';
process.env.DATABASE_PATH = './server/db/nature_alchemy_test.db';
process.env.JWT_SECRET = 'test_secret_for_stage11_jwt_validation';
process.env.CORS_ORIGIN = 'http://localhost:5999,http://127.0.0.1:5999,http://localhost:5000,http://127.0.0.1:5000';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = 'C:\\Users\\frank\\.gemini\\antigravity\\brain\\c95d0aff-d3dd-40c8-80c0-3c921c3aa6e4';
const PORT = '5999';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('=== STARTING PUPPETEER-BASED SCREENSHOT GENERATOR ===');

  // 1. Reset and Seed database
  try {
    const { default: db } = await import('../config/database.js');
    db.prepare('DELETE FROM payment_events').run();
    db.prepare('DELETE FROM payments').run();
    db.prepare('DELETE FROM order_items').run();
    db.prepare('DELETE FROM orders').run();
    db.prepare('DELETE FROM checkout_sessions').run();
    db.prepare('DELETE FROM product_compliance').run();
    db.prepare('DELETE FROM products').run();
    db.prepare('DELETE FROM admin_users').run();
    db.prepare('DELETE FROM shipping_regions').run();

    const salt = bcrypt.genSaltSync(12);
    const superHash = bcrypt.hashSync('Admin123!', salt);

    db.prepare(`
      INSERT INTO admin_users (id, username, email, password_hash, role, is_active)
      VALUES ('usr_super', 'super_admin', 'super@naturesalchemy.co', ?, 'admin', 1)
    `).run(superHash);

    db.prepare("INSERT OR IGNORE INTO shipping_regions (id, name, shipping_fee, estimated_days) VALUES ('dar', 'Dar es Salaam', 5000, '1-2 Days')").run();

    db.prepare(`
      INSERT INTO products (id, name, category, format, concern, price, currency, image, image_alt, short_description, stock_quantity, stock_status, is_published)
      VALUES ('prod-test-draft', 'Tanzanian Lemon Tea', 'Teas', 'Loose Leaf', 'Wellness', 12000, 'TZS', '/images/lemon_tea.jpg', 'Lemon Tea Alt', 'Organic loose leaf tea.', 10, 'in_stock', 1)
    `).run();

    db.prepare(`
      INSERT INTO product_compliance (product_id, key_ingredients, full_ingredients, usage_instructions, serving_guidance, warnings, contraindications, allergy_warning, storage_instructions, health_disclaimer, suitable_for, not_suitable_for)
      VALUES ('prod-test-draft', '["Lemon", "Tea Leaves"]', '["Lemon Peel", "Standard Tea Leaves"]', 'Steep for 5 minutes in hot water.', 'Drink warm.', '["None"]', '["None"]', 'Contains citrus allergens.', 'Store in dry place.', 'This product is not intended to diagnose, treat, cure, or prevent any disease.', '["Adults"]', '["None"]')
    `).run();

    console.log('✓ Test Database Seeded.');
  } catch (dbErr) {
    console.error('✗ Database seeding error:', dbErr.message);
    process.exit(1);
  }

  // Define paths to source files
  const mainJsPath = path.join(process.cwd(), 'src', 'main.js');
  const adminJsPath = path.join(process.cwd(), 'admin', 'admin.js');
  const wizardPath = path.join(process.cwd(), 'src', 'components', 'CheckoutWizard.js');
  const mainCssPath = path.join(process.cwd(), 'src', 'styles', 'main.css');

  // 2. Backup source files
  const mainJsOriginal = fs.readFileSync(mainJsPath, 'utf8');
  const adminJsOriginal = fs.readFileSync(adminJsPath, 'utf8');
  const wizardOriginal = fs.readFileSync(wizardPath, 'utf8');
  const mainCssOriginal = fs.readFileSync(mainCssPath, 'utf8');
  console.log('✓ Backed up source code files.');

  // 3. Inject preview routing into CheckoutWizard.js
  const wizardInject = `
  // Injected test view overrides
  const params = new URLSearchParams(window.location.search);
  const testView = params.get('test_view');
  if (testView === 'checkout' || testView === 'checkout_shipping' || testView === 'checkout_confirm' || testView === 'payment' || testView === 'payment_success') {
    selectedRegion = tanzaniaRegions[0];
    selectedPaymentMethod = 'mpesa';
    paymentReference = 'pay_ref_test_123456';
    checkoutSessionId = 'sess_test_123456';
    validatedEstimatedTotal = 30000;
    customerName = 'Test Customer';
    customerPhone = '+255712345678';
    customerEmail = 'customer@example.com';
    deliveryNotes = 'Door 10';

    if (testView === 'checkout') {
      currentStep = 2;
    } else if (testView === 'checkout_shipping') {
      currentStep = 3;
    } else if (testView === 'checkout_confirm') {
      currentStep = 4;
    } else if (testView === 'payment') {
      currentStep = 5;
      paymentStatus = 'AwaitingPayment';
      customerMessage = 'Please check your mobile handset for the wallet prompt and enter your PIN.';
    } else if (testView === 'payment_success') {
      currentStep = 5;
      paymentStatus = 'Paid';
      customerMessage = 'Payment confirmed successfully.';
    }
  }
  `;

  const wizardMarker = 'renderWizard();';
  const wizardNewContent = wizardOriginal.replace(wizardMarker, `${wizardInject}\n  ${wizardMarker}`);
  fs.writeFileSync(wizardPath, wizardNewContent);

  // 4. Inject preview routing into src/main.js
  const mainInject = `
  // Injected test view routing
  const params = new URLSearchParams(window.location.search);
  const testView = params.get('test_view');
  if (testView === 'checkout' || testView === 'checkout_shipping' || testView === 'checkout_confirm' || testView === 'payment' || testView === 'payment_success') {
    addToCart(products[0]);
    initCheckoutWizard(null);
  } else if (testView === 'cart') {
    addToCart(products[0]);
    openCartDrawer(null);
  } else if (testView === 'modal') {
    showProductDetailModal(products[0], null);
  } else if (testView === 'mobile_nav') {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.remove('hidden');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  }
  `;
  const mainNewContent = mainJsOriginal.replace('initApp();', `${mainInject}\n  initApp();`);
  fs.writeFileSync(mainJsPath, mainNewContent);

  // 5. Inject auto-login and routing into admin.js
  const adminInject = `
  setTimeout(() => {
    const params = new URLSearchParams(window.location.search);
    const testView = params.get('test_view');
    if (testView && testView.startsWith('admin_') && testView !== 'admin_login') {
      if (!adminState.user) {
        const userField = document.getElementById('username');
        const passField = document.getElementById('password');
        const loginBtn = document.querySelector('button[type="submit"]');
        if (userField && passField && loginBtn) {
          userField.value = 'super_admin';
          passField.value = 'Admin123!';
          loginBtn.click();
        }
      } else {
        if (testView === 'admin_products') {
          adminState.activeTab = 'products';
          renderApp();
        } else if (testView === 'admin_orders') {
          adminState.activeTab = 'orders';
          renderApp();
        } else if (testView === 'admin_audit_logs') {
          adminState.activeTab = 'audit-logs';
          renderApp();
        } else if (testView === 'admin_edit_form') {
          adminState.activeTab = 'products';
          adminState.isNewProduct = true;
          adminState.selectedProduct = null;
          renderApp();
        }
      }
    }
  }, 100);
  `;
  fs.writeFileSync(adminJsPath, adminJsOriginal + '\n' + adminInject);

  // 6. Disable transitions in CSS
  const cssInject = `
  * {
    transition: none !important;
    animation: none !important;
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }
  `;
  fs.writeFileSync(mainCssPath, mainCssOriginal + '\n' + cssInject);
  console.log('✓ Modified source code and CSS configurations.');

  // 7. Compile files with Vite
  console.log('✓ Compiling frontend bundle...');
  try {
    execSync('npx vite build');
    console.log('✓ Frontend bundle compiled successfully.');
  } catch (buildErr) {
    console.error('✗ Compilation error:', buildErr.message);
    restoreSourceCode();
    process.exit(1);
  }

  // 8. Start server
  const express = (await import('express')).default;
  const { default: apiRouter } = await import('../routes/index.js');
  const { default: cookieParser } = await import('cookie-parser');
  const { configureCors } = await import('../middleware/security.js');

  const previewApp = express();
  previewApp.use(express.json());
  previewApp.use(cookieParser());
  previewApp.use(configureCors());

  previewApp.use('/api', apiRouter);
  previewApp.use(express.static(path.join(process.cwd(), 'dist')));

  previewApp.get('/admin', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'admin', 'index.html'));
  });
  previewApp.get('/admin/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'admin', 'index.html'));
  });
  previewApp.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });

  const server = previewApp.listen(PORT, async () => {
    console.log(`✓ Preview Server listening on port ${PORT}. Starting screenshot capture...`);
    await sleep(1000);

    const screenshots = [
      { name: '1_homepage_desktop.png', url: `http://localhost:${PORT}/?test_view=desktop`, size: { width: 1280, height: 800 } },
      { name: '2_homepage_mobile.png', url: `http://localhost:${PORT}/?test_view=mobile`, size: { width: 375, height: 812 } },
      { name: '3_product_listing.png', url: `http://localhost:${PORT}/#collection`, size: { width: 1280, height: 800 } },
      { name: '4_product_detail_modal.png', url: `http://localhost:${PORT}/?test_view=modal`, size: { width: 1280, height: 800 } },
      { name: '5_cart_drawer.png', url: `http://localhost:${PORT}/?test_view=cart`, size: { width: 1280, height: 800 } },
      { name: '6_checkout_flow.png', url: `http://localhost:${PORT}/?test_view=checkout`, size: { width: 1280, height: 800 } },
      { name: '7_checkout_shipping.png', url: `http://localhost:${PORT}/?test_view=checkout_shipping`, size: { width: 1280, height: 800 } },
      { name: '8_payment_waiting.png', url: `http://localhost:${PORT}/?test_view=payment`, size: { width: 1280, height: 800 } },
      { name: '9_payment_success.png', url: `http://localhost:${PORT}/?test_view=payment_success`, size: { width: 1280, height: 800 } },
      { name: '10_mobile_navigation.png', url: `http://localhost:${PORT}/?test_view=mobile_nav`, size: { width: 375, height: 812 } },
      { name: '11_tablet_view.png', url: `http://localhost:${PORT}/?test_view=tablet`, size: { width: 768, height: 1024 } },
      { name: '12_admin_login.png', url: `http://localhost:${PORT}/admin/?test_view=admin_login`, size: { width: 1280, height: 800 } },
      { name: '13_admin_dashboard_products.png', url: `http://localhost:${PORT}/admin/?test_view=admin_products`, size: { width: 1280, height: 800 } },
      { name: '14_admin_edit_form.png', url: `http://localhost:${PORT}/admin/?test_view=admin_edit_form`, size: { width: 1280, height: 800 } },
      { name: '15_admin_orders.png', url: `http://localhost:${PORT}/admin/?test_view=admin_orders`, size: { width: 1280, height: 800 } },
      { name: '16_admin_audit_logs.png', url: `http://localhost:${PORT}/admin/?test_view=admin_audit_logs`, size: { width: 1280, height: 800 } }
    ];

    try {
      const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-gpu']
      });

      for (const sc of screenshots) {
        console.log(`  → Capturing: ${sc.name}...`);
        const page = await browser.newPage();
        page.on('console', msg => console.log(`    [Browser Console] ${msg.type()}: ${msg.text()}`));
        page.on('pageerror', err => console.error(`    [Browser Error] ${err.message}`));
        await page.setViewport(sc.size);
        
        // Load page and wait for network connections to drop to 0
        await page.goto(sc.url, { waitUntil: 'networkidle0', timeout: 15000 });
        
        // Extra time for JS render loop to paint
        await sleep(1000);

        const outPath = path.join(OUTPUT_DIR, sc.name);
        await page.screenshot({ path: outPath });
        await page.close();
        console.log(`    ✓ Done.`);
      }

      await browser.close();
    } catch (chromeErr) {
      console.error('✗ Puppeteer / Chrome error:', chromeErr.message);
    }

    // 9. Restore source files
    restoreSourceCode();

    // 10. Re-compile clean assets
    console.log('✓ Restoring clean compiled assets...');
    try {
      execSync('npx vite build');
      console.log('✓ Clean assets compiled.');
    } catch (rebuildErr) {
      console.error('✗ Re-compilation warning:', rebuildErr.message);
    }

    // 11. Copy to local previews directory
    const localPreviewsDir = path.join(process.cwd(), 'previews');
    if (!fs.existsSync(localPreviewsDir)) {
      fs.mkdirSync(localPreviewsDir);
    }
    for (const sc of screenshots) {
      const src = path.join(OUTPUT_DIR, sc.name);
      const dest = path.join(localPreviewsDir, sc.name);
      fs.copyFileSync(src, dest);
    }
    console.log('✓ Copied newly captured screenshots to local previews folder.');

    console.log('=== SCREENSHOTS GENERATED SUCCESSFULLY ===');
    server.close(() => {
      console.log('✓ Server closed.');
      process.exit(0);
    });
  });

  function restoreSourceCode() {
    fs.writeFileSync(mainJsPath, mainJsOriginal);
    fs.writeFileSync(adminJsPath, adminJsOriginal);
    fs.writeFileSync(wizardPath, wizardOriginal);
    fs.writeFileSync(mainCssPath, mainCssOriginal);
    console.log('✓ Restored all source code files.');
  }
}

main();
