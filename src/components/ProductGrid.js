import { ProductCard } from './ProductCard.js';
import { products } from '../data/products.js';
import { formatNames } from './FilterSidebar.js';

function renderGroupedProducts(filteredProducts) {
  if (filteredProducts.length === 0) {
    return `
      <div class="col-span-full text-center py-12">
        <span class="material-symbols-outlined text-secondary text-5xl mb-3">sentiment_dissatisfied</span>
        <p class="font-headline-md text-headline-md text-primary">No products found matching this selection.</p>
      </div>
    `;
  }

  // Group products by format
  const grouped = {};
  filteredProducts.forEach(p => {
    if (!grouped[p.format]) {
      grouped[p.format] = [];
    }
    grouped[p.format].push(p);
  });

  // Render each group
  let html = '';
  const formatsPresent = Object.keys(formatNames).filter(f => grouped[f]);

  for (const format of formatsPresent) {
    const formatProducts = grouped[format];
    const heading = formatNames[format];
    html += `
      <div class="mb-16 w-full">
        <h3 class="font-headline-lg text-headline-lg text-primary border-b border-surface-container-high pb-4 mb-8">${heading}</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-gutter gap-y-12 w-full">
          ${formatProducts.map(p => ProductCard(p)).join('')}
        </div>
      </div>
    `;
  }
  return html;
}

export function ProductGrid() {
  const urlParams = new URLSearchParams(window.location.search);
  const need = urlParams.get('need') || 'all';
  
  let filtered = products;
  if (need !== 'all') {
    filtered = products.filter(p => p.concern === need);
  }

  return `
    <div id="product-grid-container" class="w-full">
      ${renderGroupedProducts(filtered)}
    </div>
  `;
}

export function setupProductGridFilters() {
  const dropdown = document.getElementById('need-dropdown');
  if (!dropdown) return;

  dropdown.addEventListener('change', (e) => {
    const selectedNeed = e.target.value;
    window.location.href = `/?need=${selectedNeed}#collection`;
  });
}
