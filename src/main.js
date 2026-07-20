import './styles/main.css';
import { AnnouncementBar } from './components/AnnouncementBar.js';
import { Header, setupHeaderScrollListener } from './components/Header.js';
import { Hero, setupHeroCarousel } from './components/Hero.js';
import { ProductGrid, setupProductGridFilters } from './components/ProductGrid.js';
import { Footer } from './components/Footer.js';
import { BackToTop, setupBackToTop } from './components/BackToTop.js';
import { SearchOverlay, setupSearch } from './components/Search.js';
import { MaroonHub } from './pages/MaroonHub.js';
import { AboutUs } from './pages/AboutUs.js';
import { Wholesale, setupWholesalePage } from './pages/Wholesale.js';
import { Press } from './pages/Press.js';
import { showProductDetailModal } from './components/ProductDetailModal.js';
import { products } from './data/products.js';
import { initCartDrawer, openCartDrawer, renderCartDrawer } from './components/CartDrawer.js';
import { initCheckoutWizard } from './components/CheckoutWizard.js';
import { onCartChange, addToCart, getCartCount } from './utils/cartState.js';

// Import performance and accessibility helpers
import { initConnectionAwareness } from './utils/connection.js';
import { setupFilterDetailsAdjuster, setupIngredientToggles } from './utils/accessibility.js';

// Import Tanzanian localization utilities
import { formatTZS } from './utils/currency.js';
import { validatePhone, normalizePhone } from './utils/validation.js';
import { tanzaniaRegions } from './data/tanzaniaRegions.js';

// Expose utilities on window for frontend-only verification
window.NaturesAlchemy = {
  formatTZS,
  validatePhone,
  normalizePhone,
  tanzaniaRegions
};

import { ImagePreviewGallery, initImagePreview } from './pages/ImagePreview.js';

function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  // Simple Router
  if (window.location.pathname === '/preview') {
    app.innerHTML = ImagePreviewGallery();
    initImagePreview();
    return;
  }

  // Static content pages (Maroon Knowledge Hub, About Us, Wholesale, Press).
  // Press features live under /press/<slug>; the Press component reads the
  // slug from the pathname itself.
  const CONTENT_PAGES = { '/maroon-hub': MaroonHub, '/about': AboutUs, '/wholesale': Wholesale };
  const isPressRoute = window.location.pathname.startsWith('/press/');
  const contentPage = CONTENT_PAGES[window.location.pathname] || (isPressRoute ? Press : null);
  if (contentPage) {
    app.innerHTML = `
      ${AnnouncementBar()}
      ${Header()}
      <main>${contentPage()}</main>
      ${Footer()}
      ${BackToTop()}
      ${SearchOverlay()}
    `;
    setupHeaderScrollListener();
    setupBackToTop();
    setupSearch();
    if (window.location.pathname === '/wholesale') setupWholesalePage();
    initCartDrawer(() => initCheckoutWizard(document.getElementById('cart-btn')));
    document.getElementById('app').addEventListener('click', (e) => {
      const cartBtn = e.target.closest('#cart-btn');
      if (cartBtn) { e.preventDefault(); openCartDrawer(cartBtn); }
    });
    onCartChange(() => {
      const badge = document.getElementById('cart-badge');
      if (badge) badge.textContent = getCartCount();
      renderCartDrawer();
    });
    window.scrollTo(0, 0);
    return;
  }

  app.innerHTML = `
    ${AnnouncementBar()}
    ${Header()}
    <main>
      ${Hero()}
      <section class="px-margin-mobile md:px-margin-desktop py-12 md:py-24 flex flex-col gap-8 max-w-[1800px] w-full mx-auto" id="collection">
        <div class="w-full">
          ${ProductGrid()}
        </div>
      </section>
    </main>
    ${Footer()}
    ${BackToTop()}
    ${SearchOverlay()}
  `;

  // Initialize UI interactive scripts (presentation-only)
  setupHeaderScrollListener();
  setupHeroCarousel();
  setupProductGridFilters();
  setupBackToTop();
  setupSearch();
  setupFilterDetailsAdjuster();
  setupIngredientToggles();

  // Set up unified event delegation for details modal, cart, and checkout triggers
  document.getElementById('app').addEventListener('click', (e) => {
    const target = e.target;

    // 1. View details modal
    const viewDetailsBtn = target.closest('.view-details-btn');
    if (viewDetailsBtn) {
      const productId = parseInt(viewDetailsBtn.dataset.id, 10);
      const product = products.find(p => p.id === productId);
      if (product) {
        showProductDetailModal(product, viewDetailsBtn);
      }
      return;
    }

    // 2. Cart toggle button click
    const cartBtn = target.closest('#cart-btn');
    if (cartBtn) {
      e.preventDefault();
      openCartDrawer(cartBtn);
      return;
    }

    // 3. Quick Add button click
    const quickAddBtn = target.closest('.quick-add-btn');
    if (quickAddBtn) {
      e.preventDefault();
      const productId = parseInt(quickAddBtn.dataset.id, 10);
      const product = products.find(p => p.id === productId);
      if (product) {
        addToCart(product);
        // Visual feedback: slide open the cart drawer when adding an item
        openCartDrawer(quickAddBtn);
      }
      return;
    }
  });

  // Initialize the Cart Drawer (delegating checkout wizard trigger)
  initCartDrawer(() => initCheckoutWizard(document.getElementById('cart-btn')));

  // Subscribe cart counters and renderings to cart changes
  onCartChange(() => {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = getCartCount();
    }
    renderCartDrawer();
  });
}

// Initialize connection-aware adaptive loading
initConnectionAwareness();

initApp();

// Deep-linking product modal router (Option B - temporary MVP bridge)
const urlParams = new URLSearchParams(window.location.search);
const paramProduct = urlParams.get('product');
if (paramProduct) {
  const product = products.find(p => {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return p.id.toString() === paramProduct || slug === paramProduct;
  });
  if (product) {
    setTimeout(() => {
      showProductDetailModal(product, null);
    }, 500);
  }
}
