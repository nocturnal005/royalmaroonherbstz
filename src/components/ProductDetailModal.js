import { formatTZS } from '../utils/currency.js';

/**
 * Creates and displays an accessible product detail modal with compliance fields.
 * @param {Object} product - The product object to render details for.
 * @param {HTMLElement} triggeringElement - The button element that triggered the modal, for focus restoration.
 */
export function showProductDetailModal(product, triggeringElement) {
  // Prevent duplicate modals
  if (document.getElementById('product-detail-modal')) return;

  // Helper to render arrays as lists
  const renderList = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return '<p class="text-body-sm text-secondary opacity-70">None</p>';
    return `<ul class="list-disc pl-4 space-y-1 text-body-sm text-secondary">${arr.map(item => `<li>${item}</li>`).join('')}</ul>`;
  };

  // Lock body scroll
  document.body.classList.add('overflow-hidden');

  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'product-detail-modal';
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 opacity-0 transition-opacity duration-300 pointer-events-none';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');
  
  modal.innerHTML = `
    <!-- Modal Backdrop -->
    <div class="absolute inset-0 bg-primary/70 backdrop-blur-sm modal-backdrop"></div>
    
    <!-- Modal Content Card -->
    <div class="relative bg-surface text-on-surface border border-secondary-container w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 transform scale-95 modal-card flex flex-col focus:outline-none" tabindex="-1">
      
      <!-- Sticky Close Header (Ensures Close button is always accessible while scrolling) -->
      <div class="sticky top-0 bg-surface/90 backdrop-blur-md z-10 flex justify-end p-4 border-b border-secondary-container/10">
        <button class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container text-primary hover:text-tertiary-fixed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors close-modal-btn" 
                aria-label="Close details">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Main Scrollable Body Content -->
      <div class="p-6 md:p-10 pt-2 grid grid-cols-1 md:grid-cols-5 gap-8 overflow-y-auto">
        
        <!-- Sidebar / Media Area (2 Columns) -->
        <div class="md:col-span-2 space-y-6">
          <div class="aspect-[4/5] bg-secondary-container overflow-hidden border border-secondary-container/50">
            <img class="w-full h-full object-cover" 
                 src="${product.image}" 
                 alt="${product.imageAlt}" 
                 width="400" 
                 height="500" />
          </div>

          <!-- Specific Product Health Disclaimer Block -->
          <div class="p-4 bg-primary-container/20 border border-primary-container/30 rounded-none">
            <span class="font-label-sm text-label-sm text-tertiary block mb-2 uppercase tracking-wider font-bold">Safety Notice</span>
            <p class="font-body-sm text-label-sm text-secondary italic leading-relaxed">${product.healthDisclaimer}</p>
          </div>
        </div>

        <!-- Details Info Area (3 Columns) -->
        <div class="md:col-span-3 space-y-6">
          <div>
            <span class="font-label-sm text-label-sm text-secondary uppercase tracking-widest block mb-1">${product.category}</span>
            <h3 id="modal-title" class="font-headline-lg text-headline-lg text-primary">${product.name}</h3>
            <div class="font-headline-md text-headline-md text-tertiary mt-2">${formatTZS(product.price)}</div>
            <span class="text-[10px] text-secondary opacity-60 italic block mt-1">*Placeholder price pending client approval</span>
          </div>

          <!-- Product description -->
          <div>
            <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider block mb-1">Description</span>
            <p class="font-body-md text-body-md text-secondary leading-relaxed">${product.shortDescription}</p>
          </div>

          <!-- Key Ingredients (quick highlight) -->
          <div>
            <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider block mb-1">Key Botanicals</span>
            <p class="font-body-sm text-body-sm text-secondary font-medium">${product.keyIngredients}</p>
          </div>

          <!-- Full Ingredients & Directions -->
          <div class="border-t border-secondary-container/50 pt-6 space-y-6">
            
            <!-- Full Ingredients (Array list) -->
            <div>
              <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider block mb-2 font-bold">Full Ingredient Panel</span>
              ${renderList(product.fullIngredients)}
            </div>

            <!-- Instructions & Guidance Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider block mb-1 font-bold">Usage Directions</span>
                <p class="text-body-sm text-secondary leading-relaxed">${product.usageInstructions}</p>
              </div>
              <div>
                <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider block mb-1 font-bold">Suggested Use</span>
                <p class="text-body-sm text-secondary leading-relaxed">${product.servingGuidance}</p>
              </div>
            </div>

            <!-- Warnings & Storage -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider block mb-2 font-bold">Warnings &amp; Precautions</span>
                ${renderList(product.warnings)}
              </div>
              <div>
                <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider block mb-1 font-bold">Storage Guidelines</span>
                <p class="text-body-sm text-secondary leading-relaxed">${product.storageInstructions}</p>
              </div>
            </div>

            <!-- Contraindications -->
            <div>
              <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider block mb-2 font-bold">Contraindications</span>
              ${renderList(product.contraindications)}
            </div>

            <!-- Allergy Alert (Red/warning box) -->
            <div class="p-4 bg-error-container/20 border border-error-container/30 rounded-none">
              <span class="font-label-sm text-label-sm text-error uppercase tracking-wider block mb-1 font-bold">Allergy Warning</span>
              <p class="text-body-sm text-on-error-container leading-relaxed font-medium">${product.allergyWarning}</p>
            </div>

            <!-- Suitable For Lists -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div class="p-4 bg-surface-container-low border border-secondary-container/50">
                <span class="text-primary font-label-sm uppercase tracking-wider font-bold block mb-2">Suitable For:</span>
                ${renderList(product.suitableFor)}
              </div>
              <div class="p-4 bg-surface-container-low border border-secondary-container/50">
                <span class="text-error font-label-sm uppercase tracking-wider font-bold block mb-2">Not Recommended For:</span>
                ${renderList(product.notSuitableFor)}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Setup elements for focus trapping
  const focusableElementsString = 'button, [href], input, select, textarea, [tabindex="0"]';
  let focusableElements = Array.from(modal.querySelectorAll(focusableElementsString));
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  const closeModal = () => {
    // Release scroll lock
    document.body.classList.remove('overflow-hidden');

    // Fade out animations
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');
    
    const card = modal.querySelector('.modal-card');
    if (card) {
      card.classList.remove('scale-100');
      card.classList.add('scale-95');
    }
    
    // Remove element after transition
    setTimeout(() => {
      modal.remove();
      // Restore focus to triggering details button
      if (triggeringElement) {
        triggeringElement.focus();
      }
    }, 300);

    document.removeEventListener('keydown', handleKeydown);
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      e.preventDefault();
    }
    if (e.key === 'Tab') {
      // Re-query in case DOM shifted (though static here)
      focusableElements = Array.from(modal.querySelectorAll(focusableElementsString));
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
  };

  // Attach event listeners
  modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', handleKeydown);

  // Trigger modal entry transitions
  // Force a reflow
  modal.offsetHeight;
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  
  const card = modal.querySelector('.modal-card');
  if (card) {
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    // Set initial focus to the card container (for screen readers)
    card.focus();
  }
}
