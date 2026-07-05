export function Footer() {
  return `
    <footer class="w-full py-16 px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter bg-primary-container border-t border-on-primary-fixed-variant">
      <div class="col-span-1 md:col-span-1">
        <h3 class="font-headline-md text-headline-md text-on-primary dark:text-primary-fixed uppercase tracking-widest mb-6">Royal Maroon Herbs</h3>
        <p class="font-body-md text-body-md text-on-primary-container opacity-80 mb-6">
          Bridging the gap between ancestral plant wisdom and modern apothecary precision. 
        </p>
        <div class="flex gap-4">
          <a class="text-on-primary-container hover:text-tertiary-fixed transition-colors" href="#" aria-label="Instagram"><span class="material-symbols-outlined">camera</span></a>
          <a class="text-on-primary-container hover:text-tertiary-fixed transition-colors" href="#" aria-label="Email"><span class="material-symbols-outlined">mail</span></a>
          <a class="text-on-primary-container hover:text-tertiary-fixed transition-colors" href="#" aria-label="Find Us"><span class="material-symbols-outlined">pin_drop</span></a>
        </div>
        <div class="mt-8">
          <span class="font-label-sm text-label-sm text-tertiary-fixed uppercase tracking-wider block mb-2">Tanzania Payments</span>
          <p class="font-body-sm text-label-sm text-on-primary-container opacity-60 leading-relaxed">
            M-Pesa, Tigo Pesa, Airtel Money &amp; cards securely processed via Selcom.
          </p>
        </div>
      </div>
      <div>
        <h4 class="font-label-md text-label-md text-tertiary-fixed uppercase mb-6">Collection</h4>
        <ul class="space-y-4">
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="#">Shop All</a></li>
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="#">Tinctures</a></li>
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="#">Botanical Rituals</a></li>
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="#">Limited Batches</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-label-md text-label-md text-tertiary-fixed uppercase mb-6">Customer Care</h4>
        <ul class="space-y-4">
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="#">Shipping &amp; Returns</a></li>
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="#">Wholesale</a></li>
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="#">Contact Us</a></li>
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="#">Privacy Policy</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-label-md text-label-md text-tertiary-fixed uppercase mb-6">Maroon Herbs Journal</h4>
        <p class="font-body-md text-body-md text-on-primary-container opacity-80 mb-6">
          Receive our monthly digest on herbal rituals and seasonal wellness.
        </p>
        <form class="bg-surface/10 p-1 flex" onsubmit="event.preventDefault(); alert('Subscribed to Journal!');">
          <label for="footer-email" class="sr-only">Email Address</label>
          <input id="footer-email" required class="bg-transparent border-none text-on-primary placeholder:text-on-primary-container/50 font-label-md text-label-md w-full focus:ring-0" placeholder="Join Rituals" type="email"/>
          <button type="submit" class="text-tertiary-fixed px-2 focus:outline-none focus:ring-2 focus:ring-tertiary-fixed rounded" aria-label="Submit Journal Subscription"><span class="material-symbols-outlined">arrow_forward</span></button>
        </form>
      </div>
      <div class="col-span-1 md:col-span-4 mt-12 p-6 bg-surface/5 border border-on-primary-fixed-variant/10 text-center">
        <p class="font-body-sm text-label-sm text-on-primary-container opacity-70 leading-relaxed max-w-3xl mx-auto">
          <strong>General Wellness Disclaimer:</strong> Royal Maroon Herbs products are crafted for general wellness and self-care rituals. These products are not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before using herbal products, especially if you are pregnant, breastfeeding, taking medication, managing a health condition, or purchasing for a child.
        </p>
      </div>
      <div class="col-span-1 md:col-span-4 mt-8 pt-8 border-t border-on-primary-fixed-variant/20 text-center">
        <span class="font-body-md text-body-md text-on-primary-container opacity-60">
          © 2024 Royal Maroon Herbs. Crafted with ancient wisdom and modern science.
        </span>
      </div>
    </footer>
  `;
}
