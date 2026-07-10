import { products } from '../data/products.js';
import { formatTZS } from '../utils/currency.js';
import { showProductDetailModal } from './ProductDetailModal.js';

// Full-screen search overlay. Opened from the header search button; matches
// products by name, category, or key ingredients and opens the detail modal.
export function SearchOverlay() {
  return `
    <div id="search-overlay" class="hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm px-4" role="dialog" aria-modal="true" aria-label="Search products">
      <div class="bg-surface w-full max-w-2xl mx-auto mt-24 rounded-xl shadow-2xl overflow-hidden">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-surface-container-high">
          <span class="material-symbols-outlined text-secondary">search</span>
          <input id="search-input" type="search" autocomplete="off" spellcheck="false"
                 placeholder="Search products, e.g. moringa, turmeric, oil…"
                 class="w-full bg-transparent outline-none border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-secondary" />
          <button id="search-close" type="button" aria-label="Close search" class="text-secondary hover:text-primary transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <ul id="search-results" class="max-h-[55vh] overflow-y-auto py-2"></ul>
      </div>
    </div>
  `;
}

export function setupSearch() {
  const overlay = document.getElementById('search-overlay');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const openBtn = document.getElementById('search-btn');
  const closeBtn = document.getElementById('search-close');
  if (!overlay || !input || !results) return;

  const open = () => {
    overlay.classList.remove('hidden');
    input.value = '';
    render('');
    setTimeout(() => input.focus(), 50);
  };
  const close = () => overlay.classList.add('hidden');

  const match = (q) => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.category || '').toLowerCase().includes(term) ||
      (p.keyIngredients || '').toLowerCase().includes(term)
    ).slice(0, 24);
  };

  const render = (q) => {
    const hits = match(q);
    if (!q.trim()) {
      results.innerHTML = `<li class="px-5 py-6 text-center font-body-sm text-label-sm text-secondary">Start typing to search the collection.</li>`;
      return;
    }
    if (!hits.length) {
      results.innerHTML = `<li class="px-5 py-6 text-center font-body-sm text-label-sm text-secondary">No products match “${q}”.</li>`;
      return;
    }
    results.innerHTML = hits.map(p => `
      <li>
        <button type="button" class="search-result w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-surface-variant transition-colors" data-id="${p.id}">
          <img src="${p.image}" alt="" class="w-12 h-12 object-contain rounded bg-white border border-stone-100 shrink-0" loading="lazy"/>
          <span class="flex-1 min-w-0">
            <span class="block font-label-md text-label-md text-on-surface truncate">${p.name}</span>
            <span class="block font-label-sm text-[11px] text-secondary uppercase tracking-wider">${p.category}</span>
          </span>
          <span class="font-bold text-on-surface text-sm shrink-0">${formatTZS(p.price)}</span>
        </button>
      </li>
    `).join('');
  };

  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  input.addEventListener('input', () => render(input.value));

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) close();
  });

  results.addEventListener('click', (e) => {
    const btn = e.target.closest('.search-result');
    if (!btn) return;
    const product = products.find(p => p.id === parseInt(btn.dataset.id, 10));
    if (product) {
      close();
      showProductDetailModal(product, null);
    }
  });
}
