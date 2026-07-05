import '../src/styles/main.css';

// Global State
let adminState = {
  user: null,
  csrfToken: '',
  activeTab: 'products', // products, orders, audit-logs
  products: [],
  orders: [],
  auditLogs: [],
  selectedProduct: null, // For edit form
  selectedOrder: null, // For order detail modal
  isNewProduct: false,
  errorMsg: '',
  successMsg: '',
  riskyTermsFound: []
};

// Base API URL
const API_BASE = '/api';

// Fetch helper that automatically attaches credentials, headers, and CSRF token
async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (adminState.csrfToken) {
    headers['X-CSRF-Token'] = adminState.csrfToken;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    // Session expired or unauthenticated
    adminState.user = null;
    adminState.csrfToken = '';
    renderApp();
    throw new Error('Unauthorized');
  }

  return res;
}

// Check auth status on startup
async function checkAuth() {
  try {
    const res = await apiRequest('/admin/me');
    if (res.status === 200) {
      const payload = await res.json();
      adminState.user = payload.data;
      if (payload.csrfToken) {
        adminState.csrfToken = payload.csrfToken;
      }
    }
  } catch (err) {
    console.log('Not logged in:', err.message);
  }
  renderApp();
}

// ----------------------------------------
// UI Rendering Engine
// ----------------------------------------

function renderApp() {
  const container = document.getElementById('admin-app');
  if (!container) return;

  if (!adminState.user) {
    container.innerHTML = renderLoginForm();
    bindLoginEvents();
  } else {
    container.innerHTML = `
      <div class="flex min-h-screen bg-stone-100 font-sans">
        ${renderSidebar()}
        <main class="flex-grow p-8 max-w-7xl mx-auto overflow-y-auto">
          ${renderHeader()}
          ${renderAlerts()}
          ${renderContent()}
        </main>
      </div>
    `;
    bindDashboardEvents();
  }
}

// 1. Login Form View
function renderLoginForm() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-stone-900 px-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 border border-stone-800">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-serif font-bold text-stone-900">Royal Maroon Herbs</h1>
          <p class="text-stone-500 mt-2 text-sm">Administrative Portal Gateway</p>
        </div>
        ${adminState.errorMsg ? `<div class="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 font-medium border border-red-100">${adminState.errorMsg}</div>` : ''}
        <form id="login-form" class="space-y-6">
          <div>
            <label class="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">Username</label>
            <input type="text" id="username" required class="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-stone-900 text-sm transition-all" placeholder="Enter username">
          </div>
          <div>
            <label class="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">Password</label>
            <input type="password" id="password" required class="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-stone-900 text-sm transition-all" placeholder="••••••••">
          </div>
          <button type="submit" class="w-full py-3 bg-emerald-800 hover:bg-emerald-950 text-white rounded-lg font-medium text-sm transition-all shadow-md">Sign In to Dashboard</button>
        </form>
      </div>
    </div>
  `;
}

// 2. Sidebar View
function renderSidebar() {
  const isOwnerOrAdmin = ['owner', 'admin'].includes(adminState.user.role);
  return `
    <aside class="w-64 bg-stone-900 text-stone-300 flex flex-col justify-between border-r border-stone-850">
      <div>
        <div class="p-6 border-b border-stone-800">
          <h2 class="text-xl font-serif font-bold text-white tracking-wide">Royal Maroon Herbs</h2>
          <span class="text-xs text-stone-500 font-semibold tracking-wider uppercase mt-1 block">Admin Console</span>
        </div>
        <nav class="mt-6 px-4 space-y-1">
          <a href="#" data-tab="products" class="tab-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${adminState.activeTab === 'products' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-stone-800 hover:text-white'}">
            <span>📦</span> Products Catalog
          </a>
          <a href="#" data-tab="orders" class="tab-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${adminState.activeTab === 'orders' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-stone-800 hover:text-white'}">
            <span>📋</span> Orders Tracking
          </a>
          ${isOwnerOrAdmin ? `
            <a href="#" data-tab="audit-logs" class="tab-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${adminState.activeTab === 'audit-logs' ? 'bg-emerald-800 text-white shadow-sm' : 'hover:bg-stone-800 hover:text-white'}">
              <span>🛡️</span> Security Audit Logs
            </a>
          ` : ''}
        </nav>
      </div>
      <div class="p-4 border-t border-stone-800 space-y-3">
        <div class="px-4 py-2 bg-stone-800 rounded-lg text-xs">
          <span class="block text-stone-500 font-bold uppercase tracking-wider">Operator</span>
          <span class="block text-white font-medium mt-0.5">${adminState.user.username} (${adminState.user.role})</span>
        </div>
        <a href="#" id="logout-btn" class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-stone-800 hover:text-red-300 transition-all">
          <span>🚪</span> Sign Out
        </a>
      </div>
    </aside>
  `;
}

// 3. Header View
function renderHeader() {
  let title = 'Products Catalog';
  if (adminState.activeTab === 'orders') title = 'Orders Management';
  if (adminState.activeTab === 'audit-logs') title = 'Security Audit Logs';
  if (adminState.selectedProduct) title = adminState.isNewProduct ? 'Create New Product' : `Edit: ${adminState.selectedProduct.name}`;

  return `
    <header class="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">${title}</h1>
        <p class="text-stone-500 text-sm mt-1">Manage compliance, catalog listings, and order fulfilment pipelines.</p>
      </div>
      ${adminState.activeTab === 'products' && !adminState.selectedProduct && ['owner', 'admin', 'editor'].includes(adminState.user.role) ? `
        <button id="create-product-btn" class="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white rounded-lg text-sm font-medium shadow transition-all">Add Product</button>
      ` : ''}
    </header>
  `;
}

// Alerts View
function renderAlerts() {
  let html = '';
  if (adminState.errorMsg) {
    html += `<div class="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium mb-6 border border-red-100 flex items-center justify-between">
      <span>${adminState.errorMsg}</span>
      <button class="close-alert-btn text-red-400 hover:text-red-600">×</button>
    </div>`;
  }
  if (adminState.successMsg) {
    html += `<div class="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-sm font-medium mb-6 border border-emerald-100 flex items-center justify-between">
      <span>${adminState.successMsg}</span>
      <button class="close-alert-btn text-emerald-400 hover:text-emerald-600">×</button>
    </div>`;
  }
  return html;
}

// 4. Main Router View
function renderContent() {
  if (adminState.selectedProduct) {
    return renderProductForm();
  }

  switch (adminState.activeTab) {
    case 'products':
      return renderProductsList();
    case 'orders':
      return renderOrdersList();
    case 'audit-logs':
      return renderAuditLogsList();
    default:
      return `<p class="text-stone-500">View not found.</p>`;
  }
}

// 5. Products List View
function renderProductsList() {
  if (adminState.products.length === 0) {
    return `<div class="text-center py-12 bg-white rounded-xl border border-stone-200 shadow-sm"><p class="text-stone-500 text-sm">No products found in database.</p></div>`;
  }

  const isEditor = ['owner', 'admin', 'editor'].includes(adminState.user.role);

  return `
    <div class="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-stone-50 border-b border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
            <th class="p-4">Product ID / Name</th>
            <th class="p-4">Category</th>
            <th class="p-4">Price (TZS)</th>
            <th class="p-4">Stock Status</th>
            <th class="p-4">Publish State</th>
            ${isEditor ? `<th class="p-4 text-right">Actions</th>` : ''}
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-200 text-sm">
          ${adminState.products.map(p => `
            <tr class="hover:bg-stone-50/55 transition-all text-stone-850">
              <td class="p-4">
                <span class="font-medium text-stone-900 block">${p.name}</span>
                <span class="text-xs text-stone-500 font-mono">${p.id}</span>
              </td>
              <td class="p-4 text-stone-600">${p.category}</td>
              <td class="p-4 font-medium">${p.price.toLocaleString()}</td>
              <td class="p-4">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full ${p.stockStatus === 'in_stock' ? 'bg-emerald-500' : p.stockStatus === 'low_stock' ? 'bg-amber-500' : 'bg-red-500'}"></span>
                  <span class="capitalize text-xs font-medium">${p.stockStatus.replace('_', ' ')} (${p.stockQuantity})</span>
                </div>
              </td>
              <td class="p-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-850'}">
                  ${p.isPublished ? 'Published' : 'Draft'}
                </span>
              </td>
              ${isEditor ? `
                <td class="p-4 text-right space-x-2">
                  <button data-id="${p.id}" class="edit-product-btn text-xs font-semibold px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-all">Edit</button>
                  <button data-id="${p.id}" class="toggle-publish-btn text-xs font-semibold px-2.5 py-1 ${p.isPublished ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'} rounded transition-all">
                    ${p.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </td>
              ` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 6. Product Create/Edit Form View
function renderProductForm() {
  const p = adminState.selectedProduct || {};
  const isNew = adminState.isNewProduct;

  return `
    <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-8 max-w-4xl">
      <!-- Disclaimer -->
      <div class="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg text-xs mb-6 font-medium">
        <span class="font-bold">Compliance Disclaimer:</span> Passing the built-in claims scanner warning check does not guarantee legal compliance or final regulatory approval. Always verify with legal standards before finalizing catalog publications.
      </div>

      <!-- Risky Claim Warning Box -->
      ${adminState.riskyTermsFound.length > 0 ? `
        <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-xs mb-6 space-y-1">
          <span class="font-bold text-sm block">⚠️ Flagged Medical/Therapeutic Claims:</span>
          <p>The following terms were flagged as medical or therapeutic claims: <span class="font-mono bg-red-100 px-1 py-0.5 rounded text-red-900">${adminState.riskyTermsFound.join(', ')}</span>. Please soften this language to ensure compliance with local advertising laws.</p>
        </div>
      ` : ''}

      <form id="product-form" class="space-y-8">
        <!-- Catalog Details -->
        <h3 class="text-sm font-bold text-stone-400 uppercase tracking-wider border-b pb-2">1. Catalog Metadata</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Product ID (Slug)</label>
            <input type="text" id="form-id" required ${!isNew ? 'readonly' : ''} class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-mono text-stone-900 ${!isNew ? 'bg-stone-100 cursor-not-allowed' : ''}" value="${p.id || ''}" placeholder="e.g. calmness-tincture">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Product Name</label>
            <input type="text" id="form-name" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${p.name || ''}" placeholder="e.g. Calmness Tincture">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Category</label>
            <input type="text" id="form-category" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${p.category || ''}" placeholder="e.g. Relaxation & Evening Rituals">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Format</label>
            <input type="text" id="form-format" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${p.format || ''}" placeholder="e.g. tinctures">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Concern</label>
            <input type="text" id="form-concern" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${p.concern || ''}" placeholder="e.g. sleep">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Price (Integer TZS) <span class="text-amber-500 font-bold text-xs">(Mock Price Warning)</span></label>
            <input type="number" id="form-price" required min="0" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${p.price || 0}">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Image URL</label>
            <input type="text" id="form-image" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${p.image || ''}" placeholder="https://example.com/image.png">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Image Alt Text</label>
            <input type="text" id="form-imageAlt" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${p.imageAlt || ''}" placeholder="Descriptive alternative text for screen readers">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Stock Status</label>
            <select id="form-stockStatus" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900 bg-white">
              <option value="in_stock" ${p.stockStatus === 'in_stock' ? 'selected' : ''}>In Stock</option>
              <option value="low_stock" ${p.stockStatus === 'low_stock' ? 'selected' : ''}>Low Stock</option>
              <option value="out_of_stock" ${p.stockStatus === 'out_of_stock' ? 'selected' : ''}>Out of Stock</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Stock Quantity</label>
            <input type="number" id="form-stockQuantity" required min="0" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${p.stockQuantity || 0}">
          </div>
        </div>

        <div class="space-y-4">
          <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Short Description</label>
          <textarea id="form-shortDescription" required rows="3" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" placeholder="Product overview for catalog displays">${p.shortDescription || ''}</textarea>
        </div>

        <!-- Compliance Details -->
        <h3 class="text-sm font-bold text-stone-400 uppercase tracking-wider border-b pb-2 pt-6">2. Safety & Compliance Information</h3>
        <p class="text-xs text-stone-500">Every publishing product must contain complete compliance data. Explicitly enter "None" or "Not Applicable" where necessary.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Key Ingredients (Comma-separated)</label>
            <input type="text" id="form-keyIngredients" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${(p.keyIngredients || []).join(', ')}" placeholder="Passionflower, Chamomile">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Full Ingredients (Comma-separated)</label>
            <input type="text" id="form-fullIngredients" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${(p.fullIngredients || []).join(', ')}" placeholder="Organic Elderberries, Spring Water">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Warnings (Comma-separated)</label>
            <input type="text" id="form-warnings" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${(p.warnings || []).join(', ')}" placeholder="Do not exceed serving size">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Contraindications (Comma-separated)</label>
            <input type="text" id="form-contraindications" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${(p.contraindications || []).join(', ')}" placeholder="Not for use with anxiety medications">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Suitable For (Comma-separated)</label>
            <input type="text" id="form-suitableFor" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${(p.suitableFor || []).join(', ')}" placeholder="Adults over 18">
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Not Suitable For (Comma-separated)</label>
            <input type="text" id="form-notSuitableFor" required class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" value="${(p.notSuitableFor || []).join(', ')}" placeholder="Pregnant mothers, Infants">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Usage Instructions</label>
            <textarea id="form-usageInstructions" required rows="3" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" placeholder="Shake well. Add 20 drops to warm water.">${p.usageInstructions || ''}</textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Serving Guidance</label>
            <textarea id="form-servingGuidance" required rows="3" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" placeholder="Enjoy in the evening before bedtime.">${p.servingGuidance || ''}</textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Allergy Warning</label>
            <textarea id="form-allergyWarning" required rows="3" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" placeholder="Processed in a facility that also processes almonds.">${p.allergyWarning || ''}</textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Storage Instructions</label>
            <textarea id="form-storageInstructions" required rows="3" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" placeholder="Store in a cool dark cabinet.">${p.storageInstructions || ''}</textarea>
          </div>
        </div>

        <div class="space-y-4 col-span-2">
          <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Health Disclaimer</label>
          <textarea id="form-healthDisclaimer" required rows="3" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm text-stone-900" placeholder="This product is for general wellness only...">${p.healthDisclaimer || ''}</textarea>
        </div>

        <div class="flex items-center gap-3">
          <input type="checkbox" id="form-isPublished" class="w-4 h-4 text-emerald-800 focus:ring-emerald-600 rounded border-stone-300" ${p.isPublished ? 'checked' : ''}>
          <label class="text-sm font-semibold text-stone-900" for="form-isPublished">Publish immediately? (Will run strict server-side compliance validation)</label>
        </div>

        <div class="flex justify-end gap-3 border-t border-stone-200 pt-6">
          <button type="button" id="cancel-product-btn" class="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm font-medium transition-all">Cancel</button>
          <button type="submit" class="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white rounded-lg text-sm font-medium shadow transition-all">Save Changes</button>
        </div>
      </form>
    </div>
  `;
}

// 7. Orders List View
function renderOrdersList() {
  if (adminState.orders.length === 0) {
    return `<div class="text-center py-12 bg-white rounded-xl border border-stone-200 shadow-sm"><p class="text-stone-500 text-sm">No orders found.</p></div>`;
  }

  return `
    <div class="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-stone-50 border-b border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
            <th class="p-4">Order ID</th>
            <th class="p-4">Customer Name</th>
            <th class="p-4">Total (TZS)</th>
            <th class="p-4">Order Status</th>
            <th class="p-4">Payment Status</th>
            <th class="p-4">Fulfilment Status</th>
            <th class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-200 text-sm">
          ${adminState.orders.map(o => `
            <tr class="hover:bg-stone-50/55 transition-all text-stone-850">
              <td class="p-4 font-mono font-medium text-stone-900">${o.id}</td>
              <td class="p-4">${o.customer_name}</td>
              <td class="p-4 font-medium">${o.total.toLocaleString()}</td>
              <td class="p-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${o.order_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'}">
                  ${o.order_status}
                </span>
              </td>
              <td class="p-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${o.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'}">
                  ${o.payment_status}
                </span>
              </td>
              <td class="p-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${o.fulfilment_status === 'Delivered' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-700'}">
                  ${o.fulfilment_status}
                </span>
              </td>
              <td class="p-4 text-right">
                <button data-id="${o.id}" class="view-order-btn text-xs font-semibold px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-all">Details</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ${adminState.selectedOrder ? renderOrderDetailModal() : ''}
  `;
}

// 8. Order Detail Modal View
function renderOrderDetailModal() {
  const o = adminState.selectedOrder;
  const isDraft = o.order_status === 'Draft';
  const isUnpaid = o.payment_status !== 'Paid';
  const canUpdateFulfilment = !isDraft && !isUnpaid;

  return `
    <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative border border-stone-200 max-h-[90vh] overflow-y-auto">
        <button id="close-modal-btn" class="absolute top-6 right-6 text-stone-400 hover:text-stone-700 text-2xl">×</button>
        <h2 class="text-2xl font-serif font-bold text-stone-900 mb-6">Order Details: ${o.id}</h2>

        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 class="text-xs font-bold text-stone-400 uppercase tracking-wider">Customer</h4>
            <p class="text-sm font-medium mt-1">${o.customer_name}</p>
            <p class="text-xs text-stone-600 font-mono mt-0.5">${o.customer_phone}</p>
            <p class="text-xs text-stone-600 mt-0.5">${o.customer_email}</p>
          </div>
          <div>
            <h4 class="text-xs font-bold text-stone-400 uppercase tracking-wider">Shipping Details</h4>
            <p class="text-sm font-medium mt-1">Region: <span class="uppercase">${o.delivery_region_id}</span> (${o.region_name || 'Tanzania'})</p>
            <p class="text-xs text-stone-600 mt-1">Notes: ${o.delivery_notes || 'None'}</p>
          </div>
        </div>

        <div class="border-t border-stone-200 py-6">
          <h4 class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Line Items</h4>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-stone-500 text-xs border-b border-stone-100 text-left">
                <th class="pb-2">Item</th>
                <th class="pb-2 text-center">Qty</th>
                <th class="pb-2 text-right">Unit Price</th>
                <th class="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${o.items.map(item => `
                <tr class="border-b border-stone-50">
                  <td class="py-2.5 font-medium">${item.name}</td>
                  <td class="py-2.5 text-center">${item.quantity}</td>
                  <td class="py-2.5 text-right">${item.unit_price.toLocaleString()}</td>
                  <td class="py-2.5 text-right">${(item.quantity * item.unit_price).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="pt-4 text-stone-500 font-medium">Shipping Fee</td>
                <td class="pt-4 text-right">${o.shipping_fee.toLocaleString()} TZS</td>
              </tr>
              <tr class="font-bold text-stone-900 border-t border-stone-200">
                <td colspan="3" class="pt-2">Total Amount</td>
                <td class="pt-2 text-right">${o.total.toLocaleString()} TZS</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="grid grid-cols-2 gap-6 border-t border-stone-200 pt-6 mb-6">
          <div>
            <h4 class="text-xs font-bold text-stone-400 uppercase tracking-wider">Payment Status</h4>
            <p class="text-sm font-medium mt-1 text-stone-900">${o.payment_status} <span class="text-xs text-stone-500">(Read-Only)</span></p>
            ${o.payment ? `<p class="text-xs text-stone-500 font-mono mt-0.5">Reference: ${o.payment.payment_reference}</p>` : ''}
          </div>
          <div>
            <h4 class="text-xs font-bold text-stone-400 uppercase tracking-wider">Fulfilment Control</h4>
            ${!canUpdateFulfilment ? `
              <div class="mt-2 text-xs font-medium text-red-700 bg-red-50 p-3 rounded border border-red-100">
                ⚠️ Dispatch and Delivery updates are locked for Draft or Unpaid orders.
              </div>
            ` : `
              <select id="update-fulfilment-select" data-id="${o.id}" class="mt-2 w-full px-3 py-2 rounded-lg border border-stone-350 bg-white text-sm outline-none">
                <option value="FulfilmentPending" ${o.fulfilment_status === 'FulfilmentPending' ? 'selected' : ''}>Fulfilment Pending</option>
                <option value="Dispatched" ${o.fulfilment_status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
                <option value="Delivered" ${o.fulfilment_status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              </select>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 9. Audit Logs View
function renderAuditLogsList() {
  if (adminState.auditLogs.length === 0) {
    return `<div class="text-center py-12 bg-white rounded-xl border border-stone-200 shadow-sm"><p class="text-stone-500 text-sm">No audit logs found.</p></div>`;
  }

  return `
    <div class="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider">
            <th class="p-4">Timestamp</th>
            <th class="p-4">Action</th>
            <th class="p-4">Operator</th>
            <th class="p-4">Resource ID</th>
            <th class="p-4">Details</th>
            <th class="p-4">IP Address</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-200 font-mono text-stone-800">
          ${adminState.auditLogs.map(l => `
            <tr class="hover:bg-stone-50/55 transition-all">
              <td class="p-4 text-stone-500">${l.timestamp}</td>
              <td class="p-4"><span class="font-bold text-stone-900">${l.action}</span></td>
              <td class="p-4 text-stone-600">${l.operator_id || 'SYSTEM/CLI'}</td>
              <td class="p-4 text-stone-600">${l.resource_id || '-'}</td>
              <td class="p-4 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-stone-500" title="${escapeHtml(l.details)}">${escapeHtml(l.details)}</td>
              <td class="p-4 text-stone-500">${l.ip_address || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ----------------------------------------
// Event Bindings & Logic
// ----------------------------------------

function bindLoginEvents() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    adminState.errorMsg = '';
    renderApp();

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const payload = await res.json();
      if (res.status === 200) {
        adminState.user = { username: payload.data.username, role: payload.data.role };
        adminState.csrfToken = payload.data.csrfToken;
        // Make it accessible for test injections
        window.csrfToken = payload.data.csrfToken;
        
        await loadData();
      } else {
        adminState.errorMsg = payload.error.message || 'Login failed.';
        renderApp();
      }
    } catch (err) {
      adminState.errorMsg = 'Failed to connect to backend server.';
      renderApp();
    }
  });
}

function bindDashboardEvents() {
  // Sidebar Links
  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const tab = e.target.closest('.tab-link').dataset.tab;
      adminState.activeTab = tab;
      adminState.selectedProduct = null;
      adminState.selectedOrder = null;
      adminState.successMsg = '';
      adminState.errorMsg = '';
      await loadData();
    });
  });

  // Logout Button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } catch (err) {}
      adminState.user = null;
      adminState.csrfToken = '';
      adminState.products = [];
      adminState.orders = [];
      adminState.auditLogs = [];
      renderApp();
    });
  }

  // Alerts close buttons
  document.querySelectorAll('.close-alert-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      adminState.errorMsg = '';
      adminState.successMsg = '';
      renderApp();
    });
  });

  // Product List Buttons
  document.querySelectorAll('.edit-product-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const prod = adminState.products.find(p => p.id === id);
      if (prod) {
        adminState.selectedProduct = { ...prod };
        adminState.isNewProduct = false;
        adminState.riskyTermsFound = [];
        renderApp();
        bindProductFormEvents();
      }
    });
  });

  // Toggle Publish Status button
  document.querySelectorAll('.toggle-publish-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const prod = adminState.products.find(p => p.id === id);
      if (!prod) return;

      adminState.successMsg = '';
      adminState.errorMsg = '';

      const action = prod.isPublished ? 'unpublish' : 'publish';
      try {
        const res = await apiRequest(`/admin/products/${id}/${action}`, {
          method: 'PATCH'
        });

        const payload = await res.json();
        if (res.status === 200) {
          adminState.successMsg = payload.message;
          await loadData();
        } else {
          adminState.errorMsg = payload.error.message;
          if (payload.error.details) {
            adminState.errorMsg += ' Issues: ' + payload.error.details.map(d => `${d.field}: ${d.issue}`).join('; ');
          }
          renderApp();
        }
      } catch (err) {
        adminState.errorMsg = `Failed to ${action} product.`;
        renderApp();
      }
    });
  });

  // Create Product Button
  const createProductBtn = document.getElementById('create-product-btn');
  if (createProductBtn) {
    createProductBtn.addEventListener('click', () => {
      adminState.selectedProduct = {
        id: '', name: '', category: '', format: '', concern: '', price: 0,
        image: '', imageAlt: '', shortDescription: '', stockStatus: 'in_stock', stockQuantity: 0,
        isPublished: false, keyIngredients: [], fullIngredients: [], usageInstructions: '',
        servingGuidance: '', warnings: [], contraindications: [], allergyWarning: '',
        storageInstructions: '', healthDisclaimer: '', suitableFor: [], notSuitableFor: []
      };
      adminState.isNewProduct = true;
      adminState.riskyTermsFound = [];
      renderApp();
      bindProductFormEvents();
    });
  }

  // Order Details Button
  document.querySelectorAll('.view-order-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      try {
        const res = await apiRequest(`/admin/orders/${id}`);
        const payload = await res.json();
        if (res.status === 200) {
          adminState.selectedOrder = payload.data;
          renderApp();
          bindOrderModalEvents();
        }
      } catch (err) {}
    });
  });
}

// 10. Risky claiming terms dictionary scanner
const RISKY_TERMS = [
  'cure', 'treat', 'prevent', 'heal', 'therapeutic', 'remedy', 'disease', 'pain relief', 'guaranteed results'
];

function scanRiskyClaims(text) {
  if (!text) return [];
  const found = [];
  const lower = text.toLowerCase();
  for (const term of RISKY_TERMS) {
    if (lower.includes(term)) {
      found.push(term);
    }
  }
  return found;
}

function bindProductFormEvents() {
  const form = document.getElementById('product-form');
  if (!form) return;

  const cancelBtn = document.getElementById('cancel-product-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      adminState.selectedProduct = null;
      adminState.riskyTermsFound = [];
      renderApp();
    });
  }

  // Bind keyup listeners on textareas to flag risky therapeutic claims
  const textareas = [
    'form-shortDescription',
    'form-usageInstructions',
    'form-servingGuidance',
    'form-allergyWarning',
    'form-storageInstructions',
    'form-healthDisclaimer'
  ];

  textareas.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        const found = scanRiskyClaims(el.value);
        // Union found terms
        const current = new Set(adminState.riskyTermsFound);
        found.forEach(t => current.add(t));
        // Remove terms that are no longer in any of the fields (simple approximation)
        // For simplicity, we just rebuild the found list from all textareas
        const allFound = [];
        textareas.forEach(tid => {
          const tel = document.getElementById(tid);
          if (tel) {
            allFound.push(...scanRiskyClaims(tel.value));
          }
        });
        adminState.riskyTermsFound = [...new Set(allFound)];
        
        // Re-render only the warning container dynamically if exists
        renderRiskyWarning();
      });
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    adminState.errorMsg = '';
    adminState.successMsg = '';

    const id = document.getElementById('form-id').value;
    const name = document.getElementById('form-name').value;
    const category = document.getElementById('form-category').value;
    const format = document.getElementById('form-format').value;
    const concern = document.getElementById('form-concern').value;
    const price = parseInt(document.getElementById('form-price').value, 10);
    const image = document.getElementById('form-image').value;
    const imageAlt = document.getElementById('form-imageAlt').value;
    const shortDescription = document.getElementById('form-shortDescription').value;
    const stockStatus = document.getElementById('form-stockStatus').value;
    const stockQuantity = parseInt(document.getElementById('form-stockQuantity').value, 10);
    const isPublished = document.getElementById('form-isPublished').checked;

    // Convert comma-separated fields
    const keyIngredients = document.getElementById('form-keyIngredients').value.split(',').map(s => s.trim()).filter(Boolean);
    const fullIngredients = document.getElementById('form-fullIngredients').value.split(',').map(s => s.trim()).filter(Boolean);
    const warnings = document.getElementById('form-warnings').value.split(',').map(s => s.trim()).filter(Boolean);
    const contraindications = document.getElementById('form-contraindications').value.split(',').map(s => s.trim()).filter(Boolean);
    const suitableFor = document.getElementById('form-suitableFor').value.split(',').map(s => s.trim()).filter(Boolean);
    const notSuitableFor = document.getElementById('form-notSuitableFor').value.split(',').map(s => s.trim()).filter(Boolean);

    const usageInstructions = document.getElementById('form-usageInstructions').value;
    const servingGuidance = document.getElementById('form-servingGuidance').value;
    const allergyWarning = document.getElementById('form-allergyWarning').value;
    const storageInstructions = document.getElementById('form-storageInstructions').value;
    const healthDisclaimer = document.getElementById('form-healthDisclaimer').value;

    const payload = {
      id, name, category, format, concern, price, image, imageAlt, shortDescription,
      stockStatus, stockQuantity, isPublished, keyIngredients, fullIngredients, warnings,
      contraindications, suitableFor, notSuitableFor, usageInstructions, servingGuidance,
      allergyWarning, storageInstructions, healthDisclaimer
    };

    const method = adminState.isNewProduct ? 'POST' : 'PUT';
    const path = adminState.isNewProduct ? '/admin/products' : `/admin/products/${id}`;

    try {
      const res = await apiRequest(path, {
        method,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.status === 200 || res.status === 201) {
        adminState.successMsg = data.message;
        adminState.selectedProduct = null;
        adminState.riskyTermsFound = [];
        await loadData();
      } else {
        adminState.errorMsg = data.error.message || 'Failed to save product.';
        if (data.error.details) {
          adminState.errorMsg += ' Issues: ' + data.error.details.map(d => `${d.field}: ${d.issue}`).join('; ');
        }
        renderApp();
        bindProductFormEvents();
      }
    } catch (err) {
      adminState.errorMsg = 'Failed to connect to backend server.';
      renderApp();
      bindProductFormEvents();
    }
  });
}

function renderRiskyWarning() {
  const container = document.getElementById('risky-warn-container');
  // Simple injection
  const formEl = document.getElementById('product-form');
  if (!formEl) return;

  let warnBox = document.getElementById('risky-warning-box');
  if (adminState.riskyTermsFound.length > 0) {
    if (!warnBox) {
      warnBox = document.createElement('div');
      warnBox.id = 'risky-warning-box';
      warnBox.className = 'bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-xs mb-6 space-y-1';
      formEl.parentNode.insertBefore(warnBox, formEl);
    }
    warnBox.innerHTML = `
      <span class="font-bold text-sm block">⚠️ Flagged Medical/Therapeutic Claims:</span>
      <p>The following terms were flagged as medical or therapeutic claims: <span class="font-mono bg-red-100 px-1 py-0.5 rounded text-red-900">${adminState.riskyTermsFound.join(', ')}</span>. Please soften this language to ensure compliance with local advertising laws.</p>
    `;
  } else {
    if (warnBox) {
      warnBox.remove();
    }
  }
}

function bindOrderModalEvents() {
  const closeBtn = document.getElementById('close-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      adminState.selectedOrder = null;
      renderApp();
    });
  }

  const select = document.getElementById('update-fulfilment-select');
  if (select) {
    select.addEventListener('change', async () => {
      const id = select.dataset.id;
      const status = select.value;

      adminState.errorMsg = '';
      adminState.successMsg = '';

      try {
        const res = await apiRequest(`/admin/orders/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ fulfilmentStatus: status })
        });

        const data = await res.json();
        if (res.status === 200) {
          adminState.successMsg = data.message;
          adminState.selectedOrder = null;
          await loadData();
        } else {
          adminState.errorMsg = data.error.message;
          adminState.selectedOrder = null;
          renderApp();
        }
      } catch (err) {
        adminState.errorMsg = 'Failed to update fulfilment status.';
        adminState.selectedOrder = null;
        renderApp();
      }
    });
  }
}

// ----------------------------------------
// Data Loading
// ----------------------------------------

async function loadData() {
  if (!adminState.user) return;
  
  try {
    if (adminState.activeTab === 'products') {
      const res = await apiRequest('/admin/products');
      const payload = await res.json();
      adminState.products = payload.data || [];
    } else if (adminState.activeTab === 'orders') {
      const res = await apiRequest('/admin/orders');
      const payload = await res.json();
      adminState.orders = payload.data || [];
    } else if (adminState.activeTab === 'audit-logs') {
      const res = await apiRequest('/admin/audit-logs');
      const payload = await res.json();
      adminState.auditLogs = payload.data || [];
    }
  } catch (err) {
    console.error('Failed to load data:', err.message);
  }
  renderApp();
}

// Startup
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

// Run auth check immediately in case DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  checkAuth();
}
