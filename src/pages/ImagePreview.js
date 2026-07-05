import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

export function ImagePreviewGallery() {
  return `
    ${Header()}
    <main class="flex-grow pt-24 pb-16 px-4 max-w-7xl mx-auto w-full min-h-screen">
      <h1 class="text-4xl text-stone-900 font-serif mb-4">Staging Gallery</h1>
      <p class="text-lg text-stone-600 mb-8 max-w-2xl">
        Preview of all raw products processed through the automated White-Point Adjustment pipeline.
        These images have been automatically isolated onto pure white square backgrounds while preserving natural shadows.
      </p>
      
      <div id="staging-gallery-container">
        <div class="flex items-center justify-center py-20">
          <div class="animate-pulse flex flex-col items-center">
            <div class="h-12 w-12 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4"></div>
            <p class="text-stone-600 font-medium">Loading images...</p>
          </div>
        </div>
      </div>
    </main>
    ${Footer()}
  `;
}

export function initImagePreview() {
  const container = document.getElementById('staging-gallery-container');
  if (!container) return;

  const loadImages = () => {
    // Add cache busting query to bypass vite cache
    fetch('/src/data/stagingImages.json?t=' + Date.now())
      .then(res => res.json())
      .then(images => {
        if (!images || images.length === 0) {
            throw new Error("Empty manifest");
        }
        
        container.innerHTML = `
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${images.map(img => `
              <div class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-stone-100 transition-shadow hover:shadow-md">
                <div class="aspect-square relative w-full bg-white">
                  <img
                    src="/images/staging/${img}"
                    alt="Staging preview ${img}"
                    loading="lazy"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="p-3 bg-stone-50 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500 font-mono">
                  <span>${img}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      })
      .catch(err => {
        console.warn("Manifest not ready, retrying...", err);
        container.innerHTML = `
          <div class="flex items-center justify-center py-20">
            <div class="animate-pulse flex flex-col items-center">
              <div class="h-12 w-12 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4"></div>
              <p class="text-stone-600 font-medium">Batch processing images, please wait...</p>
            </div>
          </div>
        `;
        setTimeout(loadImages, 3000);
      });
  };

  loadImages();
}
