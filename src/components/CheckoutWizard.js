import { getCart, getCartTotal, clearCart } from '../utils/cartState.js';
import { formatTZS } from '../utils/currency.js';
import { validatePhone, normalizePhone } from '../utils/validation.js';
import { tanzaniaRegions } from '../data/tanzaniaRegions.js';

function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

let wizardElement = null;
let backdropElement = null;
let lastTriggeringElement = null;

// In-memory checkout flow state
let currentStep = 1;
let selectedRegion = null;
let selectedPaymentMethod = 'mpesa';

// Payment API State variables
let paymentReference = '';
let paymentStatus = 'CreatingSession'; // CreatingSession | InitiatingPayment | AwaitingPayment | Paid | Failed | Timeout | Error
let customerMessage = '';
let expiresAt = '';
let isPolling = false;
let pollIntervalId = null;
let errorMessage = '';
let checkoutSessionId = '';
let validatedEstimatedTotal = 0;

// Form inputs
let customerName = '';
let customerPhone = '';
let customerEmail = '';
let deliveryNotes = '';

/**
 * Initializes the Checkout Wizard DOM elements.
 */
export function initCheckoutWizard(triggeringElement) {
  lastTriggeringElement = triggeringElement;
  currentStep = 1;
  selectedRegion = null;
  selectedPaymentMethod = 'mpesa';
  
  // Reset payment state
  paymentReference = '';
  paymentStatus = 'CreatingSession';
  customerMessage = '';
  expiresAt = '';
  isPolling = false;
  pollIntervalId = null;
  errorMessage = '';
  checkoutSessionId = '';
  validatedEstimatedTotal = 0;

  customerName = '';
  customerPhone = '';
  customerEmail = '';
  deliveryNotes = '';

  // Prevent duplicate modals
  if (document.getElementById('checkout-wizard-modal')) return;

  // Lock body scroll
  document.body.classList.add('overflow-hidden');

  // Create backdrop
  backdropElement = document.createElement('div');
  backdropElement.id = 'checkout-wizard-backdrop';
  backdropElement.className = 'fixed inset-0 bg-primary/70 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-none z-[100]';
  document.body.appendChild(backdropElement);

  // Create wizard modal container
  wizardElement = document.createElement('div');
  wizardElement.id = 'checkout-wizard-modal';
  wizardElement.className = 'fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 opacity-0 transition-opacity duration-300 pointer-events-none';
  wizardElement.setAttribute('role', 'dialog');
  wizardElement.setAttribute('aria-modal', 'true');
  wizardElement.setAttribute('aria-labelledby', 'wizard-title');
  wizardElement.setAttribute('tabindex', '-1');

  document.body.appendChild(wizardElement);

  // Bind close triggers
  backdropElement.addEventListener('click', closeCheckoutWizard);

  // Renders initial Step
  renderWizard();

  // Show transition
  wizardElement.offsetHeight; // Force reflow
  backdropElement.classList.remove('pointer-events-none', 'opacity-0');
  backdropElement.classList.add('opacity-100');
  wizardElement.classList.remove('opacity-0', 'pointer-events-none');
  wizardElement.focus();

  document.addEventListener('keydown', handleKeydown);
  
  // Attach delegated input and click listeners to the wizard wrapper
  setupWizardListeners();
}

/**
 * Renders the checkout wizard steps based on `currentStep`.
 */
function renderWizard() {
  if (!wizardElement) return;

  const cartItems = getCart();
  const subtotal = getCartTotal();
  const shippingFee = selectedRegion ? selectedRegion.shippingFee : 0;
  const estimatedTotal = subtotal + shippingFee;

  let wizardContentHtml = `
    <!-- Wizard Card -->
    <div class="relative bg-surface text-on-surface border border-secondary-container w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 transform scale-95 modal-card flex flex-col focus:outline-none" tabindex="-1">
      
      <!-- Close Button -->
      <button id="close-wizard-btn" class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary-container/50 text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors" aria-label="Close checkout">
        <span class="material-symbols-outlined">close</span>
      </button>

      <div class="p-6 md:p-10 flex-grow flex flex-col">
        <!-- Header & Step indicators -->
        <div class="mb-8">
          <span class="text-label-sm font-label-sm text-tertiary-fixed uppercase tracking-widest block mb-2">Secure Checkout Demo</span>
          <h3 id="wizard-title" class="font-headline-md text-headline-md text-primary uppercase">
            ${currentStep < 5 ? `Checkout — Step ${currentStep} of 5` : 'Step 5 of 5: Payment Status Preview'}
          </h3>
          
          <!-- Step indicator dots -->
          <div class="flex gap-2 mt-4">
            <div class="h-1.5 flex-grow ${currentStep >= 1 ? 'bg-primary' : 'bg-secondary-container/30'}"></div>
            <div class="h-1.5 flex-grow ${currentStep >= 2 ? 'bg-primary' : 'bg-secondary-container/30'}"></div>
            <div class="h-1.5 flex-grow ${currentStep >= 3 ? 'bg-primary' : 'bg-secondary-container/30'}"></div>
            <div class="h-1.5 flex-grow ${currentStep >= 4 ? 'bg-primary' : 'bg-secondary-container/30'}"></div>
            <div class="h-1.5 flex-grow ${currentStep >= 5 ? 'bg-primary' : 'bg-secondary-container/30'}"></div>
          </div>
        </div>

        <!-- Demo Warnings (Steps 1 to 4) -->
        ${currentStep < 5 ? `
          <div class="mb-6 p-4 bg-primary-container/20 border border-primary-container/30 text-xs text-secondary space-y-1">
            <p class="font-bold flex items-center gap-1 text-primary">
              <span class="material-symbols-outlined text-sm">info</span>
              This is a frontend checkout preview only.
            </p>
            <p>Do not enter real payment credentials or private financial data.</p>
            <p class="opacity-80">Final totals, order creation, and payment confirmation will be handled securely by the backend in a later stage.</p>
          </div>
        ` : ''}

        <!-- Step Specific Content -->
        <div class="flex-grow">
          ${renderStepContent(cartItems, subtotal, shippingFee, estimatedTotal)}
        </div>
      </div>
    </div>
  `;

  wizardElement.innerHTML = wizardContentHtml;
}

/**
 * Generates HTML content for each wizard step.
 */
function renderStepContent(cartItems, subtotal, shippingFee, estimatedTotal) {
  switch (currentStep) {
    case 1:
      return `
        <form id="step-1-form" class="space-y-6">
          <div>
            <label for="checkout-name" class="block font-label-md text-label-md text-primary uppercase tracking-wider mb-2 font-bold">Full Name *</label>
            <input id="checkout-name" type="text" required value="${escapeHTML(customerName)}" class="w-full bg-surface-container-low border border-secondary-container focus:ring-2 focus:ring-primary focus:border-primary p-4 font-body-md text-primary" placeholder="e.g. Juma Kassim" />
          </div>

          <div>
            <label for="checkout-phone" class="block font-label-md text-label-md text-primary uppercase tracking-wider mb-2 font-bold">Tanzanian Mobile Number *</label>
            <input id="checkout-phone" type="tel" required value="${escapeHTML(customerPhone)}" class="w-full bg-surface-container-low border border-secondary-container focus:ring-2 focus:ring-primary focus:border-primary p-4 font-body-md text-primary" placeholder="e.g. +255 7XX XXX XXX or 07XX XXX XXX" />
            
            <!-- Inline validation container -->
            <div id="phone-validation-msg" class="text-xs font-medium mt-2 min-h-[1.25rem]"></div>
            
            <p class="text-[10px] text-secondary opacity-60 italic mt-1 leading-relaxed">Supports international format (+255 XXX XXX XXX) or local format (0XXX XXX XXX). Prioritizes +255 international prefix.</p>
          </div>

          <div>
            <label for="checkout-email" class="block font-label-md text-label-md text-primary uppercase tracking-wider mb-2 font-bold">Email Address *</label>
            <input id="checkout-email" type="email" required value="${escapeHTML(customerEmail)}" class="w-full bg-surface-container-low border border-secondary-container focus:ring-2 focus:ring-primary focus:border-primary p-4 font-body-md text-primary" placeholder="e.g. customer@domain.tz" />
          </div>

          <div>
            <label for="checkout-notes" class="block font-label-md text-label-md text-primary uppercase tracking-wider mb-2 font-bold">Delivery Notes (Optional)</label>
            <textarea id="checkout-notes" class="w-full bg-surface-container-low border border-secondary-container focus:ring-2 focus:ring-primary focus:border-primary p-4 font-body-md text-primary h-24" placeholder="e.g. House color, directions, or special instructions">${escapeHTML(deliveryNotes)}</textarea>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" class="bg-primary text-surface font-label-md text-label-md px-10 py-4 uppercase tracking-widest hover:bg-on-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2">
              <span>Next: Delivery Region</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </form>
      `;

    case 2:
      return `
        <div class="space-y-6">
          <div>
            <label for="checkout-region" class="block font-label-md text-label-md text-primary uppercase tracking-wider mb-2 font-bold">Select Delivery Region *</label>
            <select id="checkout-region" required class="w-full bg-surface-container-low border border-secondary-container focus:ring-2 focus:ring-primary focus:border-primary p-4 font-body-md text-primary">
              <option value="" disabled ${!selectedRegion ? 'selected' : ''}>-- Choose Region --</option>
              ${tanzaniaRegions.map(reg => `
                <option value="${reg.id}" ${selectedRegion && selectedRegion.id === reg.id ? 'selected' : ''}>${reg.name}</option>
              `).join('')}
            </select>
          </div>

          <!-- Region Details Display -->
          <div id="region-details-container" class="p-6 bg-surface-container border border-secondary-container/50 min-h-[100px] flex flex-col justify-center">
            ${selectedRegion ? `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span class="text-xs text-secondary uppercase block mb-1">Estimated Delivery Fee</span>
                  <span class="font-headline-sm text-headline-sm text-primary font-bold block">${formatTZS(selectedRegion.shippingFee)}</span>
                  <span class="text-[10px] text-secondary italic block mt-1">*Estimated fee to be validated by backend</span>
                </div>
                <div>
                  <span class="text-xs text-secondary uppercase block mb-1">Estimated Timeline</span>
                  <span class="font-headline-sm text-headline-sm text-primary font-bold block">${selectedRegion.estimatedDays}</span>
                  <span class="text-[10px] text-secondary italic block mt-1">Pending order verification</span>
                </div>
              </div>
            ` : `
              <p class="text-body-md text-secondary text-center italic">Please select a delivery region to display estimated timeline and shipping fees.</p>
            `}
          </div>

          <div class="flex justify-between pt-6 border-t border-secondary-container/30">
            <button id="back-to-step-1" class="border border-secondary text-primary font-label-md text-label-md px-8 py-4 uppercase tracking-widest hover:bg-secondary-container/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
              Back
            </button>
            <button id="next-to-step-3" ${!selectedRegion ? 'disabled' : ''} class="bg-primary text-surface font-label-md text-label-md px-10 py-4 uppercase tracking-widest hover:bg-on-primary-container disabled:opacity-50 disabled:pointer-events-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2">
              <span>Next: Payment Method</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      `;

    case 3:
      return `
        <div class="space-y-6">
          <span class="block font-label-md text-label-md text-primary uppercase tracking-wider font-bold mb-4">Choose Payment Method *</span>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="border p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors ${selectedPaymentMethod === 'mpesa' ? 'border-primary bg-primary-container/10' : 'border-secondary-container'}" for="pay-mpesa">
              <input type="radio" id="pay-mpesa" name="payment-method" value="mpesa" ${selectedPaymentMethod === 'mpesa' ? 'checked' : ''} class="form-radio text-primary border-secondary" />
              <div>
                <span class="font-label-md text-label-md text-primary uppercase block font-bold">Vodacom M-Pesa</span>
                <span class="text-xs text-secondary">Pay via mobile money prompt</span>
              </div>
            </label>

            <label class="border p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors ${selectedPaymentMethod === 'tigo' ? 'border-primary bg-primary-container/10' : 'border-secondary-container'}" for="pay-tigo">
              <input type="radio" id="pay-tigo" name="payment-method" value="tigo" ${selectedPaymentMethod === 'tigo' ? 'checked' : ''} class="form-radio text-primary border-secondary" />
              <div>
                <span class="font-label-md text-label-md text-primary uppercase block font-bold">Tigo Pesa</span>
                <span class="text-xs text-secondary">Pay via mobile money prompt</span>
              </div>
            </label>

            <label class="border p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors ${selectedPaymentMethod === 'airtel' ? 'border-primary bg-primary-container/10' : 'border-secondary-container'}" for="pay-airtel">
              <input type="radio" id="pay-airtel" name="payment-method" value="airtel" ${selectedPaymentMethod === 'airtel' ? 'checked' : ''} class="form-radio text-primary border-secondary" />
              <div>
                <span class="font-label-md text-label-md text-primary uppercase block font-bold">Airtel Money</span>
                <span class="text-xs text-secondary">Pay via mobile money prompt</span>
              </div>
            </label>

            <label class="border p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors ${selectedPaymentMethod === 'card' ? 'border-primary bg-primary-container/10' : 'border-secondary-container'}" for="pay-card">
              <input type="radio" id="pay-card" name="payment-method" value="card" ${selectedPaymentMethod === 'card' ? 'checked' : ''} class="form-radio text-primary border-secondary" />
              <div>
                <span class="font-label-md text-label-md text-primary uppercase block font-bold">Credit/Debit Card</span>
                <span class="text-xs text-secondary">Processed via Stakaba secure checkout</span>
              </div>
            </label>
          </div>

          <div class="p-4 bg-error-container/10 border border-error-container/30 text-xs text-secondary">
            <span class="font-bold text-error uppercase block mb-1">Secure checkout notice</span>
            Mobile money sends a USSD prompt to your phone; card payments open Stakaba's PCI-DSS hosted checkout. Card details are never entered on or stored by this site.
          </div>

          <div class="flex justify-between pt-6 border-t border-secondary-container/30">
            <button id="back-to-step-2" class="border border-secondary text-primary font-label-md text-label-md px-8 py-4 uppercase tracking-widest hover:bg-secondary-container/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
              Back
            </button>
            <button id="next-to-step-4" class="bg-primary text-surface font-label-md text-label-md px-10 py-4 uppercase tracking-widest hover:bg-on-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2">
              <span>Next: Review Order</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      `;

    case 4:
      return `
        <div class="space-y-6">
          
          <!-- Summary Review Box -->
          <div class="border border-secondary-container/50 p-6 space-y-4 bg-surface-container-lowest">
            <h4 class="font-label-md text-label-md text-primary uppercase tracking-wider block font-bold border-b border-secondary-container/30 pb-2">Order Summary</h4>
            
            <div class="max-h-36 overflow-y-auto space-y-3 pr-2">
              ${cartItems.map(item => `
                <div class="flex justify-between text-body-sm text-secondary">
                  <span class="truncate pr-4">${item.product.name} (x${item.quantity})</span>
                  <span class="font-bold flex-shrink-0">${formatTZS(item.product.price * item.quantity)}</span>
                </div>
              `).join('')}
            </div>

            <div class="border-t border-secondary-container/30 pt-4 space-y-2 text-body-sm">
              <div class="flex justify-between text-secondary">
                <span>Estimated Subtotal</span>
                <span>${formatTZS(subtotal)}</span>
              </div>
              <div class="flex justify-between text-secondary">
                <span>Estimated Delivery Fee (${selectedRegion ? selectedRegion.name : 'None'})</span>
                <span>${formatTZS(shippingFee)}</span>
              </div>
              <div class="flex justify-between text-primary font-bold border-t border-secondary-container/30 pt-3 text-headline-sm">
                <span>Estimated Total</span>
                <span>${formatTZS(estimatedTotal)}</span>
              </div>
            </div>
            
            <span class="text-[10px] text-secondary block opacity-70 italic mt-2 text-center">*Final total to be confirmed securely by backend.</span>
          </div>

          <!-- Customer details preview -->
          <div class="border border-secondary-container/50 p-6 bg-surface-container-low grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-label-sm">
            <div>
              <span class="text-primary font-bold block uppercase mb-1">Customer Details</span>
              <p class="text-secondary">Name: ${escapeHTML(customerName)}</p>
              <p class="text-secondary">Phone: ${escapeHTML(normalizePhone(customerPhone))}</p>
              <p class="text-secondary">Email: ${escapeHTML(customerEmail)}</p>
            </div>
            <div>
              <span class="text-primary font-bold block uppercase mb-1">Delivery Info</span>
              <p class="text-secondary">Region: ${selectedRegion ? selectedRegion.name : ''} (${selectedRegion ? selectedRegion.estimatedDays : ''})</p>
              <p class="text-secondary">Notes: ${escapeHTML(deliveryNotes) || 'None'}</p>
              <p class="text-secondary">Method: ${selectedPaymentMethod.toUpperCase()}</p>
            </div>
          </div>

          <div class="flex justify-between pt-6 border-t border-secondary-container/30">
            <button id="back-to-step-3" class="border border-secondary text-primary font-label-md text-label-md px-8 py-4 uppercase tracking-widest hover:bg-secondary-container/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
              Back
            </button>
            <button id="submit-checkout-wizard" class="bg-primary text-surface font-label-md text-label-md px-10 py-5 uppercase tracking-widest hover:bg-on-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2">
              <span>Continue to Payment Preview</span>
              <span class="material-symbols-outlined text-[18px]">verified</span>
            </button>
          </div>
        </div>
      `;    case 5:
      let contentHtml = '';
      
      if (paymentStatus === 'CreatingSession' || paymentStatus === 'InitiatingPayment') {
        contentHtml = `
          <div class="space-y-4 py-8">
            <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 class="font-headline-sm text-headline-sm text-primary uppercase">${paymentStatus === 'CreatingSession' ? 'Creating Order Session' : 'Initiating Payment'}</h4>
            <p class="text-body-md text-secondary max-w-md mx-auto leading-relaxed">${customerMessage}</p>
          </div>
        `;
      } else if (paymentStatus === 'AwaitingPayment') {
        const timeRemaining = expiresAt ? Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000)) : 0;
        contentHtml = `
          <div class="space-y-4 py-8">
            <div class="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 class="font-headline-sm text-headline-sm text-primary uppercase">Awaiting Authorization</h4>
            <p class="text-body-md text-secondary max-w-md mx-auto leading-relaxed">
              We have sent a mobile money wallet USSD payment prompt to your phone: <strong class="text-primary">${escapeHTML(normalizePhone(customerPhone))}</strong>.
            </p>
            <p class="text-xs text-secondary font-medium">Please unlock your phone, enter your mobile money PIN to authorize the payment.</p>
            <p class="text-body-sm text-amber-700 font-bold bg-amber-50 p-2 border border-amber-100 rounded max-w-xs mx-auto">
              Prompt expires in: <span id="payment-countdown">${timeRemaining}</span>s
            </p>
            <p class="text-xs text-secondary italic opacity-75">${customerMessage}</p>
          </div>
        `;
      } else if (paymentStatus === 'Paid') {
        contentHtml = `
          <div class="space-y-4 py-8">
            <span class="material-symbols-outlined text-green-700 text-5xl">check_circle</span>
            <h4 class="font-headline-sm text-headline-sm text-primary uppercase">Payment Successful!</h4>
            <p class="text-body-md text-secondary max-w-md mx-auto leading-relaxed">
              Thank you, <strong class="text-primary">${escapeHTML(customerName)}</strong>! Your payment of <strong>${formatTZS(validatedEstimatedTotal)}</strong> has been confirmed successfully.
            </p>
            <div class="border border-green-200 bg-green-50 p-4 rounded text-xs text-green-800 text-left max-w-md mx-auto space-y-1 font-mono">
              <p>Order Reference: ${escapeHTML(checkoutSessionId)}</p>
              <p>Payment Reference: ${escapeHTML(paymentReference)}</p>
              <p>Order Status: FulfilmentPending</p>
            </div>
            <p class="text-xs text-secondary opacity-80">Order details and updates have been processed. We will email you at: <strong class="text-primary">${escapeHTML(customerEmail)}</strong></p>
          </div>
        `;
      } else if (paymentStatus === 'Failed' || paymentStatus === 'Timeout' || paymentStatus === 'Error') {
        contentHtml = `
          <div class="space-y-4 py-8">
            <span class="material-symbols-outlined text-error text-5xl">cancel</span>
            <h4 class="font-headline-sm text-headline-sm text-primary uppercase">Payment ${paymentStatus}</h4>
            <p class="text-body-md text-secondary max-w-md mx-auto leading-relaxed">
              ${paymentStatus === 'Timeout' ? 'The USSD prompt timed out without customer PIN verification.' : (errorMessage || customerMessage || 'Transaction was rejected by customer or provider.')}
            </p>
            <div class="flex gap-4 justify-center pt-4">
              <button id="retry-payment-btn" class="bg-primary text-surface font-label-md text-label-md px-8 py-3 uppercase tracking-widest hover:bg-on-primary-container transition-colors focus:ring-2 focus:ring-primary flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">replay</span>
                <span>Retry Payment</span>
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="space-y-6">
          <div class="p-8 bg-surface-container border border-secondary-container/50 min-h-[260px] flex flex-col items-center justify-center text-center">
            ${contentHtml}
          </div>

          <!-- Wizard Completion Footer -->
          <div class="flex justify-end pt-6 border-t border-secondary-container/30">
            ${paymentStatus === 'Paid' ? `
              <button id="close-wizard-success-btn" class="bg-primary text-surface font-label-md text-label-md px-10 py-5 uppercase tracking-widest hover:bg-on-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                Finish Order
              </button>
            ` : `
              <button id="close-wizard-fail-btn" class="border border-secondary text-primary font-label-md text-label-md px-8 py-4 uppercase tracking-widest hover:bg-secondary-container/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                Close
              </button>
            `}
          </div>
        </div>
      `;
  }
}

/**
 * Attaches event listeners for wizard form submissions, navigation, selects, inputs, and tab clicks.
 */
function setupWizardListeners() {
  if (!wizardElement) return;

  // Listen to clicks inside the wizard modal
  wizardElement.addEventListener('click', (e) => {
    const target = e.target;

    // Close button
    if (target.closest('#close-wizard-btn')) {
      closeCheckoutWizard();
      return;
    }

    // Step 2 Back
    if (target.closest('#back-to-step-1')) {
      currentStep = 1;
      renderWizard();
      return;
    }

    // Step 2 Next
    if (target.closest('#next-to-step-3')) {
      if (selectedRegion) {
        currentStep = 3;
        renderWizard();
      }
      return;
    }

    // Step 3 Back
    if (target.closest('#back-to-step-2')) {
      currentStep = 2;
      renderWizard();
      return;
    }

    // Step 3 Next
    if (target.closest('#next-to-step-4')) {
      currentStep = 4;
      renderWizard();
      return;
    }

    // Step 4 Back
    if (target.closest('#back-to-step-3')) {
      currentStep = 3;
      renderWizard();
      return;
    }

    // Step 4 Submit (Initiates session and payment)
    if (target.closest('#submit-checkout-wizard')) {
      submitCheckout();
      return;
    }

    // Retry payment in Step 5
    if (target.closest('#retry-payment-btn')) {
      retryCheckoutPayment(checkoutSessionId, validatedEstimatedTotal);
      return;
    }

    // Close wizard success (clears cart)
    if (target.closest('#close-wizard-success-btn')) {
      clearCart();
      closeCheckoutWizard();
      return;
    }

    // Close wizard fail
    if (target.closest('#close-wizard-fail-btn')) {
      closeCheckoutWizard();
      return;
    }
  });

  // Handle Form Submission for Step 1
  wizardElement.addEventListener('submit', (e) => {
    e.preventDefault();
    if (e.target.id === 'step-1-form') {
      const nameVal = document.getElementById('checkout-name').value.trim();
      const phoneVal = document.getElementById('checkout-phone').value.trim();
      const emailVal = document.getElementById('checkout-email').value.trim();
      const notesVal = document.getElementById('checkout-notes').value.trim();

      // Run tanzania validation utilities on submit as fallback
      if (!validatePhone(phoneVal)) {
        showPhoneValidationMsg("✗ Please enter a valid Tanzanian mobile number (e.g. 07XXXXXXXX)", "text-error");
        document.getElementById('checkout-phone').focus();
        return;
      }

      // Save to state variables
      customerName = nameVal;
      customerPhone = phoneVal;
      customerEmail = emailVal;
      deliveryNotes = notesVal;

      currentStep = 2;
      renderWizard();
    }
  });

  // Handle Input events for phone validation (live feedback) and Region changes
  wizardElement.addEventListener('input', (e) => {
    if (e.target.id === 'checkout-phone') {
      const phone = e.target.value.trim();
      
      // Save temp value to maintain state during render cycle
      customerPhone = phone;

      if (phone === '') {
        showPhoneValidationMsg("", "");
        return;
      }

      if (validatePhone(phone)) {
        const normalized = normalizePhone(phone);
        showPhoneValidationMsg(`✓ Valid phone. Normalizes to: ${normalized}`, "text-green-700");
      } else {
        showPhoneValidationMsg("✗ Invalid format. Use 07XXXXXXXX, 06XXXXXXXX or +255...", "text-error");
      }
    }

    if (e.target.id === 'checkout-name') {
      customerName = e.target.value;
    }
    if (e.target.id === 'checkout-email') {
      customerEmail = e.target.value;
    }
    if (e.target.id === 'checkout-notes') {
      deliveryNotes = e.target.value;
    }
  });

  // Handle Region dropdown selection
  wizardElement.addEventListener('change', (e) => {
    if (e.target.id === 'checkout-region') {
      const regionId = e.target.value;
      const found = tanzaniaRegions.find(r => r.id === regionId);
      if (found) {
        selectedRegion = found;
        renderWizard();
      }
    }

    if (e.target.name === 'payment-method') {
      selectedPaymentMethod = e.target.value;
      renderWizard();
    }
  });
}

/**
 * Render inline validation message.
 */
function showPhoneValidationMsg(msg, className) {
  const container = document.getElementById('phone-validation-msg');
  if (container) {
    container.textContent = msg;
    container.className = `text-xs font-medium mt-2 min-h-[1.25rem] ${className}`;
  }
}

/**
 * Submits the checkout parameters to build a session, and then initiates payment.
 */
async function submitCheckout() {
  currentStep = 5;
  paymentStatus = 'CreatingSession';
  customerMessage = 'Registering order and preparing secure payment gateway...';
  errorMessage = '';
  renderWizard();

  try {
    const cartItems = getCart();
    const subtotal = getCartTotal();
    const shippingFee = selectedRegion ? selectedRegion.shippingFee : 0;
    const estimatedTotal = subtotal + shippingFee;
    validatedEstimatedTotal = estimatedTotal;

    // 1. Create Checkout Session on backend
    const checkoutIdempotencyKey = `chk_idem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionRes = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': checkoutIdempotencyKey
      },
      body: JSON.stringify({
        customerName,
        customerPhone: normalizePhone(customerPhone),
        customerEmail,
        deliveryNotes,
        deliveryRegion: selectedRegion.id,
        paymentMethod: selectedPaymentMethod,
        items: cartItems.map(item => ({
          productId: String(item.product.id),
          quantity: item.quantity
        }))
      })
    });

    const sessionData = await sessionRes.json();
    if (!sessionRes.ok || !sessionData.success) {
      throw new Error(sessionData.error?.message || 'Failed to create checkout session.');
    }

    checkoutSessionId = sessionData.data.checkoutSessionId;

    // 2. Initiate Payment Prompt on backend
    paymentStatus = 'InitiatingPayment';
    customerMessage = 'Sending USSD mobile wallet authorization prompt to your phone...';
    renderWizard();

    const paymentIdempotencyKey = `pay_idem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    // Amount is intentionally omitted — the backend uses the checkout session
    // total as the authoritative amount.
    const initiateRes = await fetch('/api/payments/stakaba/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': paymentIdempotencyKey
      },
      body: JSON.stringify({
        checkoutSessionId,
        paymentMethod: selectedPaymentMethod,
        customerPhone: normalizePhone(customerPhone)
      })
    });

    const initiateData = await initiateRes.json();
    if (!initiateRes.ok || !initiateData.success) {
      throw new Error(initiateData.error?.message || 'Payment initiation failed.');
    }

    // Card payments use Stakaba's hosted PCI checkout — redirect the customer
    // there. Mobile money returns no checkoutUrl and continues with polling.
    if (initiateData.data.checkoutUrl) {
      paymentReference = initiateData.data.paymentReference;
      customerMessage = 'Redirecting you to the secure card checkout page…';
      renderWizard();
      window.location.assign(initiateData.data.checkoutUrl);
      return;
    }

    paymentReference = initiateData.data.paymentReference;
    paymentStatus = initiateData.data.paymentStatus;
    customerMessage = initiateData.data.customerMessage;
    expiresAt = initiateData.data.expiresAt;

    renderWizard();
    startPollingStatus(checkoutSessionId, validatedEstimatedTotal);
  } catch (err) {
    paymentStatus = 'Error';
    errorMessage = err.message;
    renderWizard();
  }
}

/**
 * Retries payment prompting using the existing checkout session.
 */
async function retryCheckoutPayment(sessionId, amount) {
  paymentStatus = 'InitiatingPayment';
  customerMessage = 'Sending a new USSD mobile wallet authorization prompt to your phone...';
  errorMessage = '';
  renderWizard();

  try {
    const paymentIdempotencyKey = `pay_idem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const initiateRes = await fetch('/api/payments/stakaba/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': paymentIdempotencyKey
      },
      body: JSON.stringify({
        checkoutSessionId: sessionId,
        paymentMethod: selectedPaymentMethod,
        customerPhone: normalizePhone(customerPhone)
      })
    });

    const initiateData = await initiateRes.json();
    if (!initiateRes.ok || !initiateData.success) {
      throw new Error(initiateData.error?.message || 'Payment initiation failed.');
    }

    if (initiateData.data.checkoutUrl) {
      paymentReference = initiateData.data.paymentReference;
      customerMessage = 'Redirecting you to the secure card checkout page…';
      renderWizard();
      window.location.assign(initiateData.data.checkoutUrl);
      return;
    }

    paymentReference = initiateData.data.paymentReference;
    paymentStatus = initiateData.data.paymentStatus;
    customerMessage = initiateData.data.customerMessage;
    expiresAt = initiateData.data.expiresAt;

    renderWizard();
    startPollingStatus(sessionId, amount);
  } catch (err) {
    paymentStatus = 'Error';
    errorMessage = err.message;
    renderWizard();
  }
}

/**
 * Periodically polls the local backend status endpoint.
 */
function startPollingStatus(sessionId, amount) {
  stopPolling();

  isPolling = true;
  pollIntervalId = setInterval(async () => {
    // Local expiry check
    if (expiresAt && new Date() > new Date(expiresAt)) {
      stopPolling();
      paymentStatus = 'Timeout';
      customerMessage = 'The USSD payment prompt has timed out.';
      renderWizard();
      return;
    }

    try {
      const res = await fetch(`/api/payments/stakaba/status/${paymentReference}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const status = data.data.paymentStatus;
        if (status === 'Paid') {
          stopPolling();
          paymentStatus = 'Paid';
          customerMessage = 'Payment confirmed successfully!';
          renderWizard();
        } else if (status === 'Failed') {
          stopPolling();
          paymentStatus = 'Failed';
          errorMessage = data.data.customerMessage || 'Transaction was rejected by customer or provider.';
          renderWizard();
        } else {
          // Update live countdown in Step 5 DOM if present
          const countdownElem = document.getElementById('payment-countdown');
          if (countdownElem) {
            const timeRemaining = expiresAt ? Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000)) : 0;
            countdownElem.textContent = timeRemaining;
          }
        }
      }
    } catch (err) {
      console.error('Error polling status:', err.message);
    }
  }, 3000);
}

/**
 * Stops any active status check interval.
 */
function stopPolling() {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  isPolling = false;
}

/**
 * Closes the checkout wizard modal.
 */
export function closeCheckoutWizard() {
  stopPolling();
  if (!wizardElement) return;

  // Release scroll lock
  document.body.classList.remove('overflow-hidden');

  // Fade out animations
  backdropElement.classList.remove('opacity-100');
  backdropElement.classList.add('pointer-events-none', 'opacity-0');

  wizardElement.classList.remove('opacity-100');
  wizardElement.classList.add('pointer-events-none', 'opacity-0');

  document.removeEventListener('keydown', handleKeydown);

  // Remove wizard modal elements after transition
  setTimeout(() => {
    wizardElement.remove();
    backdropElement.remove();
    wizardElement = null;
    backdropElement = null;
    
    // Focus restoration
    if (lastTriggeringElement) {
      lastTriggeringElement.focus();
    }
  }, 300);
}

/**
 * Escape key and tab trapping handlers.
 */
function handleKeydown(e) {
  if (e.key === 'Escape') {
    closeCheckoutWizard();
    e.preventDefault();
  }
  if (e.key === 'Tab') {
    if (!wizardElement) return;
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex="0"]';
    const focusableElements = Array.from(wizardElement.querySelectorAll(focusableElementsString));
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
