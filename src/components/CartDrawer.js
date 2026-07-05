import { getCart, updateQuantity, removeFromCart, getCartTotal } from '../utils/cartState.js';
import { formatTZS } from '../utils/currency.js';

let drawerElement = null;
let backdropElement = null;
let lastTriggeringElement = null;

/**
 * Initializes the cart drawer DOM elements and registers changes.
 */
export function initCartDrawer(openCheckoutWizardCallback) {
  if (drawerElement) return;

  // Create backdrop
  backdropElement = document.createElement('div');
  backdropElement.id = 'cart-drawer-backdrop';
  backdropElement.className = 'fixed inset-0 bg-primary/50 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-none z-[80]';
  document.body.appendChild(backdropElement);

  // Create drawer container
  drawerElement = document.createElement('div');
  drawerElement.id = 'cart-drawer';
  drawerElement.className = 'fixed inset-y-0 right-0 w-full max-w-md bg-surface border-l border-secondary-container shadow-2xl z-[90] translate-x-full transition-transform duration-300 flex flex-col focus:outline-none';
  drawerElement.setAttribute('role', 'dialog');
  drawerElement.setAttribute('aria-modal', 'true');
  drawerElement.setAttribute('aria-label', 'Shopping Cart Drawer');
  drawerElement.setAttribute('tabindex', '-1');

  document.body.appendChild(drawerElement);

  // Attach event handlers
  backdropElement.addEventListener('click', closeCartDrawer);

  // Register listeners on the drawer itself for delegation
  drawerElement.addEventListener('click', (e) => {
    const target = e.target;

    // Close button
    if (target.closest('#close-cart-btn')) {
      closeCartDrawer();
      return;
    }

    // Quantity decrement
    const decBtn = target.closest('.qty-dec-btn');
    if (decBtn) {
      const id = parseInt(decBtn.dataset.id, 10);
      const qty = parseInt(decBtn.dataset.qty, 10);
      updateQuantity(id, qty - 1);
      return;
    }

    // Quantity increment
    const incBtn = target.closest('.qty-inc-btn');
    if (incBtn) {
      const id = parseInt(incBtn.dataset.id, 10);
      const qty = parseInt(incBtn.dataset.qty, 10);
      updateQuantity(id, qty + 1);
      return;
    }

    // Remove item
    const removeBtn = target.closest('.remove-cart-item-btn');
    if (removeBtn) {
      const id = parseInt(removeBtn.dataset.id, 10);
      removeFromCart(id);
      return;
    }

    // Proceed to Checkout
    if (target.closest('#checkout-btn')) {
      closeCartDrawer();
      if (openCheckoutWizardCallback) {
        openCheckoutWizardCallback();
      }
    }
  });
}

/**
 * Renders the cart contents inside the drawer.
 */
export function renderCartDrawer() {
  if (!drawerElement) return;

  const items = getCart();
  const subtotal = getCartTotal();

  let contentHtml = `
    <!-- Header -->
    <div class="p-6 border-b border-secondary-container flex justify-between items-center bg-primary-container/10">
      <h3 class="font-headline-md text-headline-md text-primary uppercase tracking-wider flex items-center gap-2">
        <span class="material-symbols-outlined">shopping_bag</span>
        <span>Your Selection</span>
      </h3>
      <button id="close-cart-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary-container/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Close cart drawer">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  `;

  if (items.length === 0) {
    contentHtml += `
      <!-- Empty State -->
      <div class="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <span class="material-symbols-outlined text-secondary text-6xl mb-4">shopping_basket</span>
        <p class="font-headline-sm text-headline-sm text-primary mb-2">Your basket is empty</p>
        <p class="text-body-md text-secondary max-w-xs mb-6">Explore our botanical formulas and add them to your daily rituals.</p>
        <button onclick="document.getElementById('close-cart-btn').click();" class="bg-primary text-surface font-label-md text-label-md px-8 py-4 tracking-widest uppercase hover:bg-on-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          Start Exploring
        </button>
      </div>
    `;
  } else {
    contentHtml += `
      <!-- Items List -->
      <div class="flex-grow overflow-y-auto p-6 space-y-6">
        ${items.map(item => `
          <div class="flex gap-4 pb-6 border-b border-secondary-container/50 last:border-b-0 items-start">
            <div class="w-20 h-20 bg-secondary-container overflow-hidden border border-secondary-container/30 flex-shrink-0">
              <img class="w-full h-full object-cover" src="${item.product.image}" alt="${item.product.imageAlt}" width="80" height="80" />
            </div>
            <div class="flex-grow min-w-0">
              <h4 class="font-label-md text-label-md text-primary truncate font-bold mb-1">${item.product.name}</h4>
              <span class="text-label-sm text-secondary block mb-2">${item.product.category}</span>
              
              <!-- Quantity Controls & Remove -->
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center border border-secondary-container">
                  <button class="qty-dec-btn w-8 h-8 flex items-center justify-center text-primary hover:bg-secondary-container/30 focus:outline-none focus:ring-1 focus:ring-primary" 
                          data-id="${item.product.id}" 
                          data-qty="${item.quantity}" 
                          aria-label="Decrease quantity for ${item.product.name}">
                    <span class="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span class="px-3 font-label-md text-label-md text-primary" aria-label="Current quantity is ${item.quantity}">${item.quantity}</span>
                  <button class="qty-inc-btn w-8 h-8 flex items-center justify-center text-primary hover:bg-secondary-container/30 focus:outline-none focus:ring-1 focus:ring-primary" 
                          data-id="${item.product.id}" 
                          data-qty="${item.quantity}" 
                          aria-label="Increase quantity for ${item.product.name}">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
                
                <button class="remove-cart-item-btn text-error hover:text-red-700 font-label-sm text-label-sm underline underline-offset-4 focus:outline-none focus:ring-1 focus:ring-error rounded px-1" 
                        data-id="${item.product.id}" 
                        aria-label="Remove ${item.product.name} from basket">
                  Remove
                </button>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="font-headline-sm text-headline-sm text-primary font-bold">${formatTZS(item.product.price * item.quantity)}</span>
              <span class="text-[10px] text-secondary block opacity-70 mt-1">${formatTZS(item.product.price)} each</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Footer Summary -->
      <div class="p-6 border-t border-secondary-container bg-primary-container/10 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <span class="font-label-md text-label-md text-primary uppercase tracking-wider block font-bold">Estimated Subtotal</span>
            <span class="text-[10px] text-secondary italic opacity-75">Final totals confirmed securely at checkout</span>
          </div>
          <span class="font-headline-md text-headline-md text-primary font-bold">${formatTZS(subtotal)}</span>
        </div>
        
        <div class="text-xs text-secondary leading-relaxed bg-surface/50 p-3 border border-secondary-container/50 italic">
          Please note: All prices displayed are placeholder/mock figures pending commercial approval.
        </div>

        <button id="checkout-btn" class="w-full bg-primary text-surface py-5 font-label-md text-label-md uppercase tracking-widest hover:bg-on-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center gap-2">
          <span>Proceed to Checkout</span>
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    `;
  }

  drawerElement.innerHTML = contentHtml;
}

/**
 * Opens the cart drawer.
 * @param {HTMLElement} triggeringElement - The button that was clicked to open the drawer
 */
export function openCartDrawer(triggeringElement) {
  if (!drawerElement) return;

  lastTriggeringElement = triggeringElement;
  renderCartDrawer();

  // Scroll Lock
  document.body.classList.add('overflow-hidden');

  // Animation open classes
  backdropElement.classList.remove('pointer-events-none', 'opacity-0');
  backdropElement.classList.add('opacity-100');

  drawerElement.classList.remove('translate-x-full');
  drawerElement.focus();

  document.addEventListener('keydown', handleKeydown);
}

/**
 * Closes the cart drawer.
 */
export function closeCartDrawer() {
  if (!drawerElement) return;

  // Release scroll lock
  document.body.classList.remove('overflow-hidden');

  // Animation close classes
  backdropElement.classList.remove('opacity-100');
  backdropElement.classList.add('pointer-events-none', 'opacity-0');

  drawerElement.classList.add('translate-x-full');

  document.removeEventListener('keydown', handleKeydown);

  // Focus restoration
  if (lastTriggeringElement) {
    lastTriggeringElement.focus();
  }
}

/**
 * Handle focus trap and Escape key bindings.
 */
function handleKeydown(e) {
  if (e.key === 'Escape') {
    closeCartDrawer();
    e.preventDefault();
  }
  if (e.key === 'Tab') {
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex="0"]';
    const focusableElements = Array.from(drawerElement.querySelectorAll(focusableElementsString));
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }
}
