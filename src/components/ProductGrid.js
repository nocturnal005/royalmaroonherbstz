import { ProductCard } from './ProductCard.js';
import { products } from '../data/products.js';
import { botanicalFilters } from './FilterSidebar.js';

// Short thematic intro per Botanicals category (used as the section "theme").
const CATEGORY_THEMES = {
  capsules: 'Measured daily botanicals in a convenient capsule format.',
  powders:  'Finely milled botanicals for teas, smoothies, and everyday blends.',
  teas:     'Whole dried leaves and teas for slow, considered infusions.',
  seeds:    'Seeds and whole botanicals for kitchen rituals and tea preparation.',
  spice:    'Warming spice blends for food, drinks, and daily rituals.',
  oils:     'Cold-pressed oils for external beauty, hair, and grooming care.',
  rubb:     'Topical herbal rubs and liniments for targeted external comfort.',
  honey:    'Raw and infused natural honeys for spoonfuls, drinks, and rituals.',
  salts:    'Natural mineral salts for the kitchen table and warm bath soaks.',
  soaps:    'Botanical cleansing bars for everyday external skincare routines.'
};

// Assign each product to exactly one Botanicals category (priority order
// resolves overlaps — e.g. spice-category powders land under "Spice").
function botanicalCategory(p) {
  // Standalone sections routed by their own format.
  if (p.format === 'rubb') return 'rubb';
  if (p.format === 'honey') return 'honey';
  if (p.format === 'salts') return 'salts';
  if (p.format === 'soaps') return 'soaps';
  if (p.format === 'oils') return 'oils';
  // Remaining body-care items (butters) have no sub-tab of their own; group
  // them with the external beauty/grooming products under Oils rather than
  // Powders.
  if (p.format === 'body-care') return 'oils';
  if (p.format === 'capsules') return 'capsules';
  if (p.format === 'teas') return 'teas';
  if ((p.category || '').toLowerCase().includes('spice')) return 'spice';
  if (p.format === 'seeds') return 'seeds';
  return 'powders';
}

function renderGroupedProducts(filteredProducts) {
  if (filteredProducts.length === 0) {
    return `
      <div class="col-span-full text-center py-12">
        <span class="material-symbols-outlined text-secondary text-5xl mb-3">sentiment_dissatisfied</span>
        <p class="font-headline-md text-headline-md text-primary">No products found matching this selection.</p>
      </div>
    `;
  }

  // Bucket products by Botanicals category, listing each section A→Z
  const grouped = {};
  filteredProducts.forEach(p => {
    const cat = botanicalCategory(p);
    (grouped[cat] ||= []).push(p);
  });
  for (const items of Object.values(grouped)) {
    items.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Render sections in the Botanicals sub-tab order; each is an anchor target.
  let html = '';
  for (const [value, label] of botanicalFilters) {
    const items = grouped[value];
    if (!items || !items.length) continue;
    html += `
      <section id="cat-${value}" class="scroll-mt-28 mb-20 w-full">
        <div class="mb-8 border-b border-surface-container-high pb-5">
          <span class="block font-label-sm text-label-sm uppercase tracking-[0.25em] text-on-tertiary-container mb-2">Botanicals</span>
          <h3 class="font-headline-lg text-headline-lg text-primary">${label}</h3>
          <p class="mt-2 max-w-xl font-body-md text-body-md text-secondary">${CATEGORY_THEMES[value] || ''}</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-gutter gap-y-12 w-full">
          ${items.map(p => ProductCard(p)).join('')}
        </div>
      </section>
    `;
  }
  return html;
}

export function ProductGrid() {
  // Show every product, grouped into the Botanicals themes.
  return `
    <div id="product-grid-container" class="w-full">
      ${renderGroupedProducts(products)}
    </div>
  `;
}

export function setupProductGridFilters() {
  // Land the viewer at the start of a Botanicals section when arriving via a
  // #cat-<value> link (also handles direct loads where the hash is set before
  // the grid has rendered).
  const scrollToHashCategory = () => {
    const hash = window.location.hash;
    if (!hash.startsWith('#cat-')) return;
    const target = document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  if (window.location.hash.startsWith('#cat-')) {
    requestAnimationFrame(scrollToHashCategory);
  }
  window.addEventListener('hashchange', scrollToHashCategory);
}
