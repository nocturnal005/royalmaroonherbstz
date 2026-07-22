import { botanicalFilters } from './FilterSidebar.js';

export function Footer() {
  return `
    <footer class="w-full py-12 md:py-16 px-margin-mobile md:px-margin-desktop grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter bg-primary-container border-t border-on-primary-fixed-variant">
      <div class="col-span-1 md:col-span-1">
        <h3 class="font-headline-md text-headline-md text-on-primary dark:text-primary-fixed uppercase tracking-widest mb-6">Royal Maroon Herbs</h3>
        <p class="font-body-md text-body-md text-on-primary-container opacity-80 mb-6">
          Bridging the gap between ancestral plant wisdom and modern apothecary precision. 
        </p>
        <div class="flex gap-5 items-center">
          <a class="text-on-primary-container hover:text-tertiary-fixed transition-colors" href="https://www.facebook.com/share/1HFY2gZvEe/" target="_blank" aria-label="Facebook" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22C18.34 21.21 22 17.06 22 12.06z"/></svg>
          </a>
          <a class="text-on-primary-container hover:text-tertiary-fixed transition-colors" href="https://www.instagram.com/royal_maroon_herbs_tz/" target="_blank" aria-label="Instagram" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>
          </a>
          <a class="text-on-primary-container hover:text-tertiary-fixed transition-colors" href="https://www.tiktok.com/@royal_maroon_herbs?_r=1&_t=ZS-97wYOPCowwE" target="_blank" aria-label="TikTok" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 2h3c.2 1.6.9 2.94 2 3.85A6 6 0 0 0 22 7v3a9 9 0 0 1-5-1.55V15a6 6 0 1 1-6-6c.34 0 .67.03 1 .08v3.12A2.9 2.9 0 1 0 11 14.9V2h3z"/></svg>
          </a>
          <a class="text-on-primary-container hover:text-tertiary-fixed transition-colors" href="https://youtube.com/@videotwin?si=vgW8rTcUxuwOnsTe" target="_blank" aria-label="YouTube" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.76-1.77C19.29 5.13 12 5.13 12 5.13s-7.29 0-8.84.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.76 1.77c1.55.4 8.84.4 8.84.4s7.29 0 8.84-.4A2.5 2.5 0 0 0 22.6 16.7C23 15.2 23 12 23 12zM9.75 15.02v-6l5.2 3-5.2 3z"/></svg>
          </a>
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
          ${botanicalFilters.map(([value, label]) => `
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="/#cat-${value}">${label}</a></li>`).join('')}
        </ul>
      </div>
      <div>
        <h4 class="font-label-md text-label-md text-tertiary-fixed uppercase mb-6">Customer Care</h4>
        <ul class="space-y-4">
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="#">Shipping &amp; Returns</a></li>
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="/wholesale">Wholesale</a></li>
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="mailto:sales@royalmaroonherbstz.com">Contact Us</a></li>
          <li><a class="text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-all font-body-md text-body-md" href="#">Privacy Policy</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-label-md text-label-md text-tertiary-fixed uppercase mb-6">Maroon Knowledge Hub</h4>
        <p class="font-body-md text-body-md text-on-primary-container opacity-80 mb-6">
          Receive our monthly digest on herbal rituals and seasonal wellness.
        </p>
        <form class="bg-surface/10 p-1 flex" onsubmit="event.preventDefault(); alert('Subscribed to Journal!');">
          <label for="footer-email" class="sr-only">Email Address</label>
          <input id="footer-email" required class="bg-transparent border-none text-on-primary placeholder:text-on-primary-container/50 font-label-md text-label-md w-full focus:ring-0" placeholder="Join Rituals" type="email"/>
          <button type="submit" class="text-tertiary-fixed px-2 focus:outline-none focus:ring-2 focus:ring-tertiary-fixed rounded" aria-label="Submit Journal Subscription"><span class="material-symbols-outlined">arrow_forward</span></button>
        </form>
      </div>

      <!-- Visit / contact us: physical shops and direct phone lines.
           id="contact" is the scroll target for the header's Contact link;
           scroll-mt clears the sticky header. -->
      <div id="contact" class="sm:col-span-2 lg:col-span-4 mt-4 pt-10 scroll-mt-28 border-t border-on-primary-fixed-variant/40 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div class="flex items-start gap-4">
          <span class="material-symbols-outlined text-tertiary-fixed shrink-0 mt-0.5">storefront</span>
          <div>
            <span class="font-label-sm text-label-sm text-tertiary-fixed uppercase tracking-wider block mb-2">Dar es Salaam Shop</span>
            <p class="font-body-md text-body-md text-on-primary-container opacity-80 leading-relaxed mb-3">
              Palm Village, Mikocheni B &ndash; Mwai Kibaki Road,<br/>
              Kinondoni District, Dar es Salaam,<br/>
              Tanzania &ndash; East Africa
            </p>
            <p class="font-body-md text-body-md text-on-primary-container opacity-80 leading-relaxed">
              For local inquiries or orders, contact the shop directly:<br/>
              <a class="hover:text-tertiary-fixed hover:opacity-100 transition-all" href="tel:+255793306987">+255 793 306 987</a>
              &nbsp;&middot;&nbsp;
              <a class="hover:text-tertiary-fixed hover:opacity-100 transition-all" href="tel:+255776908735">+255 776 908 735</a>
            </p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <span class="material-symbols-outlined text-tertiary-fixed shrink-0 mt-0.5">storefront</span>
          <div>
            <span class="font-label-sm text-label-sm text-tertiary-fixed uppercase tracking-wider block mb-2">Zanzibar Shop</span>
            <p class="font-body-md text-body-md text-on-primary-container opacity-80 leading-relaxed">
              Reach our Stone Town, Zanzibar shop directly:<br/>
              <a class="hover:text-tertiary-fixed hover:opacity-100 transition-all" href="tel:+255650668094">+255 650 668 094</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  `;
}
