import { formatTZS } from '../utils/currency.js';

export function ProductCard(product) {
  return `
    <div class="botanical-card group relative transition-transform duration-500 hover:-translate-y-1" data-id="${product.id}">
      <div class="product-image-container relative aspect-square bg-white border border-stone-100 rounded-xl p-4 flex items-center justify-center mb-4 overflow-hidden transition-all duration-300 group-hover:shadow-md">
        <img class="max-w-full max-h-full object-contain transition-transform duration-500" 
             style="--image-scale: ${product.imageScale || 1.0};"
             loading="lazy" 
             alt="${product.imageAlt}" 
             src="${product.image}"
             width="400"
             height="400"/>

        <!-- Quick Add button revealed on hover -->
        <div class="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
          <button class="quick-add-btn w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-label-md text-label-md uppercase tracking-wider transition-all duration-200 shadow-md" data-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
      
      <!-- Product Details Left-Aligned -->
      <div class="text-left px-1 mt-3">
        <h4 class="font-semibold text-stone-900 mb-0.5 group-hover:text-stone-700 transition-colors text-sm line-clamp-2 cursor-pointer view-details-btn" data-id="${product.id}">${product.name}</h4>
        <span class="font-bold text-stone-900 text-sm block mb-2">${formatTZS(product.price)}</span>
        
        <button class="view-details-btn text-stone-500 hover:text-stone-900 text-xs font-semibold underline underline-offset-4 focus:outline-none transition-colors" 
                data-id="${product.id}"
                aria-label="View details for ${product.name}">
          Learn More
        </button>
      </div>
    </div>
  `;
}
