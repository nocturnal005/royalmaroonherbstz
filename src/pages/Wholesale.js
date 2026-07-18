// Wholesale — supply information page. Uses the storefront design system
// (Lora headlines / Plus Jakarta body, maroon-green palette).
// Sections: full-bleed hero, standalone shop-front feature, 3-step "how to
// order" explainer, an inquiry form that composes an email to the sales
// address, and an infinite card gallery adapted from the GSAP "Infinite
// card slider" demo (CodePen GreenSock/RwKwLWK). The original drives the
// loop by pinning the page and hijacking scroll; here the same
// seamless-loop timeline is driven by drag, the prev/next buttons, and a
// gentle autoplay so the rest of the page scrolls normally.
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

const GALLERY_IMAGES = Array.from({ length: 11 }, (_, i) =>
  `/images/wholesale/gallery-${String(i + 1).padStart(2, '0')}.jpg`
);

const SALES_EMAIL = 'sales@royalmaroonherbstz.com';
const WHATSAPP_NUMBER = '255793306987';
const WHATSAPP_TEXT = encodeURIComponent(
  'Hello Royal Maroon Herbs, I would like to place a wholesale order.\n' +
  '- Business / buyer name:\n' +
  '- Order description (products):\n' +
  '- Quantities needed:\n' +
  '- Delivery location (within Dar es Salaam):\n' +
  '- Contact phone:'
);

const STEPS = [
  {
    icon: 'call',
    title: '1. Contact Us',
    body: 'Reach the Royal Maroon Herbs team using the order form below, by email, on WhatsApp, or by phone. Wholesale enquiries are handled directly by the shop, no middlemen.'
  },
  {
    icon: 'checklist',
    title: '2. Share Your Order Details',
    body: 'Tell us who you are and what you need: your business or buyer name, a description of the products, the quantities required, and your delivery location.'
  },
  {
    icon: 'local_shipping',
    title: '3. We Confirm & Deliver',
    body: 'We confirm availability, pricing, and delivery arrangements with you. Wholesale deliveries are currently within Dar es Salaam only; delivery to every other region is being worked on and will be announced.'
  }
];

// Inquiry form fields; ids double as keys when composing the email body.
const FORM_FIELDS = [
  { id: 'ws-name', label: 'Business / Buyer Name', type: 'text', placeholder: 'e.g. Mwananchi Pharmacy Ltd', required: true },
  { id: 'ws-phone', label: 'Contact Phone', type: 'tel', placeholder: 'e.g. +255 7XX XXX XXX', required: true },
  { id: 'ws-order', label: 'Order Description (products)', type: 'textarea', placeholder: 'e.g. Moringa capsules, sea moss powder, black seed oil…', required: true },
  { id: 'ws-quantity', label: 'Quantities Needed', type: 'text', placeholder: 'e.g. 50 bottles / 20 kg per product', required: true },
  { id: 'ws-location', label: 'Delivery Location (within Dar es Salaam)', type: 'text', placeholder: 'e.g. Kariakoo, Ilala', required: true }
];

function formField(f) {
  const cls = 'w-full bg-surface-container-low border border-secondary-container focus:ring-2 focus:ring-primary focus:border-primary p-4 font-body-md text-primary rounded-lg';
  return `
    <div>
      <label for="${f.id}" class="block font-label-md text-label-md text-primary uppercase tracking-wider mb-2 font-bold">${f.label}${f.required ? ' *' : ''}</label>
      ${f.type === 'textarea'
        ? `<textarea id="${f.id}" ${f.required ? 'required' : ''} class="${cls} h-28" placeholder="${f.placeholder}"></textarea>`
        : `<input id="${f.id}" type="${f.type}" ${f.required ? 'required' : ''} class="${cls}" placeholder="${f.placeholder}" />`}
    </div>`;
}

export function Wholesale() {
  return `
    <style>
      .ws-gallery { position: relative; width: 100%; height: 30rem; overflow: hidden; }
      .ws-cards { position: absolute; width: 15rem; height: 20rem; top: 45%; left: 50%; transform: translate(-50%, -50%); padding: 0; margin: 0; }
      .ws-cards li { list-style: none; padding: 0; margin: 0; width: 15rem; height: 20rem; position: absolute; top: 0; left: 0; border-radius: 0.8rem; background-size: cover; background-position: center top; box-shadow: 0 18px 40px rgba(0,0,0,.35); }
      /* Soft edge fades so cards slide "under" the band edges instead of
         being hard-clipped into narrow slivers. */
      .ws-gallery::before, .ws-gallery::after { content: ''; position: absolute; top: 0; bottom: 0; width: 14%; z-index: 5; pointer-events: none; }
      .ws-gallery::before { left: 0; background: linear-gradient(90deg, rgb(6,27,14), rgba(6,27,14,0)); }
      .ws-gallery::after { right: 0; background: linear-gradient(270deg, rgb(6,27,14), rgba(6,27,14,0)); }
      .ws-drag-proxy { visibility: hidden; position: absolute; }
      .ws-gallery-band { cursor: grab; }
      .ws-gallery-band:active { cursor: grabbing; }
      @media (max-width: 640px) {
        .ws-gallery { height: 24rem; }
        .ws-cards, .ws-cards li { width: 11.5rem; height: 15.5rem; }
      }
    </style>

    <section class="bg-surface">

      <!-- Full-bleed hero -->
      <div class="relative w-full min-h-[52vh] md:min-h-[58vh] flex items-center justify-center overflow-hidden">
        <img src="/images/wholesale/gallery-05.jpg" alt="" aria-hidden="true" class="absolute inset-0 w-full h-full object-cover object-top"/>
        <div class="absolute inset-0" style="background:linear-gradient(180deg, rgba(6,20,12,.6), rgba(6,20,12,.78));"></div>
        <!-- The photo behind the hero has "ROYAL MAROON HERBS" banner text baked
             in near the top; object-top pins it a fixed fraction (~13-16% of the
             scaled image) down from the hero top, so its Y position tracks the
             hero WIDTH, not its height. The label + heading are one group, the
             body + CTA another, and the two are spaced so the banner shows clear
             between them instead of being overlapped by the writing.
             - Narrow through large-tablet / small-laptop (< xl): the banner rides
               high, so a width-proportional top margin (mt-[22%], measured against
               the full-width column = hero width) drops the whole block just below
               it, banner on top and the text underneath.
             - Wide desktop (xl, the storefront's primary view): the banner sits
               mid-hero, so justify-between splits the block, heading above the
               banner and body + CTA below, leaving the banner clear in the middle. -->
        <div class="relative z-10 w-full flex flex-col items-center text-center justify-start xl:justify-between min-h-[560px] xl:min-h-[620px] pt-4 xl:pt-16 pb-14 xl:pb-16">
          <div class="w-full max-w-3xl px-margin-mobile md:px-margin-desktop mt-[22%] xl:mt-0">
            <span class="block font-label-md text-label-md uppercase tracking-[0.35em] text-tertiary-fixed-dim mb-5">Supply &amp; Partnerships</span>
            <h1 class="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-primary">Wholesale, Delivered in Dar es Salaam</h1>
          </div>
          <div class="w-full max-w-3xl px-margin-mobile md:px-margin-desktop mt-10 xl:mt-0">
            <p class="font-body-lg text-body-lg text-surface-container-lowest/90">
              Royal Maroon Herbs supplies shops, pharmacies, wellness practitioners, and market traders with pure botanical products. <strong class="text-tertiary-fixed-dim font-semibold">Deliveries are currently within Dar es Salaam only;</strong> every other region is being worked on and will follow.
            </p>
            <a href="#ws-contact" class="inline-block mt-8 bg-tertiary-fixed text-on-tertiary-container font-label-md text-label-md uppercase tracking-widest px-10 py-4 rounded-[999px] hover:opacity-90 transition-opacity shadow-lg">Start a Wholesale Order</a>
          </div>
        </div>
      </div>

      <!-- Standalone shop-front feature -->
      <div class="px-margin-mobile md:px-margin-desktop max-w-[1300px] mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-14 md:py-20">
          <figure>
            <div class="overflow-hidden rounded-xl border border-surface-container-high shadow-sm bg-white">
              <img src="/images/wholesale/shop-front.jpg" alt="The Royal Maroon Herbs shop front, with branded signage reading 'Prevention is cheaper than cure' above glass doors and shelves stocked with botanical products" loading="lazy" class="w-full h-auto object-cover"/>
            </div>
            <figcaption class="mt-3 font-label-sm text-label-sm text-secondary text-center">The Royal Maroon Herbs shop front, open to walk-in and wholesale buyers alike.</figcaption>
          </figure>
          <div class="about-prose">
            <span class="block font-label-md text-label-md uppercase tracking-[0.25em] text-on-tertiary-container mb-3">Visit the Shop</span>
            <h2 class="font-headline-lg text-headline-lg text-primary mb-5">A Real Shop, Behind Every Order</h2>
            <div class="flex flex-col gap-4 font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              <p>Every wholesale order is packed from the same shelves our retail customers browse every day. Under the sign that carries our motto, <em>“Prevention is cheaper than cure,”</em> you will find the full Royal Maroon Herbs range: capsules, powders, dried leaves and teas, seeds, and cold-pressed oils.</p>
              <p>Wholesale buyers are welcome to visit in person, inspect products on the shop floor, and talk through their order with our team, or to arrange everything remotely by email, WhatsApp, or phone. Wholesale deliveries currently cover Dar es Salaam, with more regions on the way.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- How it works + inquiry form -->
      <div id="ws-contact" class="bg-primary-container scroll-mt-24">
        <div class="px-margin-mobile md:px-margin-desktop py-16 md:py-20 max-w-[1300px] mx-auto">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="block font-label-md text-label-md uppercase tracking-[0.3em] text-tertiary-fixed mb-4">How It Works</span>
            <h2 class="font-headline-lg text-headline-lg text-on-primary mb-4">Ordering Wholesale Is Simple</h2>
            <p class="font-body-lg text-body-lg text-on-primary-container opacity-90">Three steps, one conversation.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 about-prose">
            ${STEPS.map(s => `
              <div class="bg-surface/10 border border-on-primary-fixed-variant/20 rounded-xl p-8">
                <span class="flex items-center justify-center w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-container mb-5">
                  <span class="material-symbols-outlined">${s.icon}</span>
                </span>
                <h3 class="font-headline-md text-headline-md text-on-primary mb-2">${s.title}</h3>
                <p class="font-body-md text-body-md text-on-primary-container opacity-85 leading-relaxed">${s.body}</p>
              </div>`).join('')}
          </div>

          <!-- Inquiry form: composes an email to the sales address -->
          <div class="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 items-start">
            <div class="lg:pt-6">
              <h3 class="font-headline-md text-headline-md text-on-primary mb-3">Send Your Order Inquiry</h3>
              <p class="about-prose font-body-md text-body-md text-on-primary-container opacity-85 leading-relaxed mb-6" style="text-align:justify;text-justify:inter-word;">Fill in the form and press send: it opens your email app with everything addressed to our sales team at <a class="underline hover:text-tertiary-fixed font-semibold" href="mailto:${SALES_EMAIL}">${SALES_EMAIL}</a>. Prefer to talk? Use WhatsApp or call the shop directly.</p>
              <div class="flex flex-col gap-3 mb-6">
                <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_TEXT}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 bg-tertiary-fixed text-on-tertiary-container font-label-md text-label-md uppercase tracking-widest px-8 py-4 rounded-[999px] hover:opacity-90 transition-opacity shadow-lg">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3A2.9 2.9 0 0 0 6 9.8c0 1.3.9 2.5 1 2.7a11 11 0 0 0 4.2 3.7c.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.3-.3z"/></svg>
                  WhatsApp Us
                </a>
                <a href="mailto:${SALES_EMAIL}" class="inline-flex items-center justify-center gap-2 border border-on-primary-fixed-variant/40 text-on-primary font-label-md text-label-md uppercase tracking-widest px-8 py-4 rounded-[999px] hover:bg-surface/10 transition-colors">
                  <span class="material-symbols-outlined text-[18px]">mail</span>
                  ${SALES_EMAIL}
                </a>
                <a href="tel:+255793306987" class="inline-flex items-center justify-center gap-2 border border-on-primary-fixed-variant/40 text-on-primary font-label-md text-label-md uppercase tracking-widest px-8 py-4 rounded-[999px] hover:bg-surface/10 transition-colors">
                  <span class="material-symbols-outlined text-[18px]">call</span>
                  Call the Shop
                </a>
              </div>
              <p class="font-body-sm text-label-sm text-on-primary-container opacity-75 leading-relaxed">
                Dar es Salaam: <a class="underline hover:text-tertiary-fixed" href="tel:+255793306987">+255 793 306 987</a> &middot; <a class="underline hover:text-tertiary-fixed" href="tel:+255776908735">+255 776 908 735</a><br/>
                Zanzibar: <a class="underline hover:text-tertiary-fixed" href="tel:+255650668094">+255 650 668 094</a>
              </p>
            </div>
            <form id="ws-inquiry-form" class="bg-surface rounded-2xl p-7 md:p-9 shadow-lg flex flex-col gap-5" novalidate>
              ${FORM_FIELDS.map(formField).join('')}
              <button type="submit" class="mt-1 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest px-10 py-4 rounded-[999px] hover:bg-primary-container transition-colors shadow-lg">
                Send Inquiry to Sales
              </button>
              <p id="ws-form-note" class="font-label-sm text-label-sm text-secondary text-center">Sends via your email app to ${SALES_EMAIL}.</p>
            </form>
          </div>
        </div>
      </div>

      <!-- Infinite gallery slider (GSAP) -->
      <div class="bg-primary ws-gallery-band">
        <div class="px-margin-mobile md:px-margin-desktop pt-16 max-w-[1300px] mx-auto text-center">
          <span class="block font-label-md text-label-md uppercase tracking-[0.3em] text-tertiary-fixed-dim mb-4">On the Shop Floor</span>
          <h2 class="font-headline-lg text-headline-lg text-on-primary mb-3">Life at Royal Maroon Herbs</h2>
          <p class="font-body-md text-body-md text-primary-fixed/80 max-w-xl mx-auto">Customers, partners, and our team, at the shop and at trade fairs across the region. Drag the cards or use the arrows.</p>
        </div>
        <div class="ws-gallery" aria-label="Photo gallery: the Royal Maroon Herbs shop floor, customers, and events">
          <ul class="ws-cards">
            ${GALLERY_IMAGES.map((src, i) => `<li role="img" aria-label="Royal Maroon Herbs shop and events photo ${i + 1}" style="background-image:url('${src}')"></li>`).join('')}
          </ul>
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
            <button type="button" class="ws-prev flex items-center justify-center w-11 h-11 rounded-full border border-on-primary/40 text-on-primary hover:bg-surface/10 transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary-fixed" aria-label="Previous photo">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <button type="button" class="ws-next flex items-center justify-center w-11 h-11 rounded-full border border-on-primary/40 text-on-primary hover:bg-surface/10 transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary-fixed" aria-label="Next photo">
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
        <div class="ws-drag-proxy"></div>
      </div>

      <!-- Closing CTA -->
      <div class="px-margin-mobile md:px-margin-desktop py-16 max-w-[1000px] mx-auto text-center">
        <h2 class="font-headline-md text-headline-md text-primary mb-6">Browse what we supply</h2>
        <a href="/#collection" class="inline-block bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest px-10 py-4 rounded-[999px] hover:bg-primary-container transition-colors shadow-lg">View the Full Collection</a>
      </div>
    </section>
  `;
}

// ---- Inquiry form: compose a structured email to sales ---------------------

function setupInquiryForm() {
  const form = document.getElementById('ws-inquiry-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (id) => (document.getElementById(id)?.value || '').trim();
    const missing = FORM_FIELDS.filter(f => f.required && !val(f.id));
    const note = document.getElementById('ws-form-note');
    if (missing.length) {
      if (note) note.textContent = `Please fill in: ${missing.map(f => f.label).join(', ')}`;
      return;
    }
    const body =
      'Hello Royal Maroon Herbs,\n\nI would like to place a wholesale order.\n\n' +
      FORM_FIELDS.map(f => `${f.label}: ${val(f.id)}`).join('\n') +
      '\n\nPlease confirm availability, pricing, and delivery arrangements.\n';
    const url = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent('Wholesale Order Inquiry')}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    if (note) note.textContent = `Your email app should now open, addressed to ${SALES_EMAIL}.`;
  });
}

// ---- Infinite card slider mechanics (ported from the GSAP demo) -----------

// Builds a timeline that appears to loop seamlessly: extra staggered copies
// of each card animation pad both ends, and the outer timeline scrubs the
// raw sequence between two matching states. Taken from GreenSock's demo.
function buildSeamlessLoop(items, spacing, animateFunc) {
  let overlap = Math.ceil(1 / spacing),
    startTime = items.length * spacing + 0.5,
    loopTime = (items.length + overlap) * spacing + 1,
    rawSequence = gsap.timeline({ paused: true }),
    seamlessLoop = gsap.timeline({
      paused: true,
      repeat: -1,
      onRepeat() {
        this._time === this._dur && (this._tTime += this._dur - 0.01);
      }
    }),
    l = items.length + overlap * 2,
    time, i, index;

  for (i = 0; i < l; i++) {
    index = i % items.length;
    time = i * spacing;
    rawSequence.add(animateFunc(items[index]), time);
  }

  rawSequence.time(startTime);
  seamlessLoop.to(rawSequence, {
    time: loopTime,
    duration: loopTime - startTime,
    ease: 'none'
  }).fromTo(rawSequence, { time: overlap * spacing + 1 }, {
    time: startTime,
    duration: startTime - (overlap * spacing + 1),
    immediateRender: false,
    ease: 'none'
  });
  return seamlessLoop;
}

function setupGallerySlider() {
  const cards = gsap.utils.toArray('.ws-cards li');
  if (!cards.length) return;

  gsap.set(cards, { xPercent: 400, opacity: 0, scale: 0 });

  const spacing = 0.1,
    snapTime = gsap.utils.snap(spacing),
    animateFunc = (element) => {
      const tl = gsap.timeline();
      tl.fromTo(element,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: 'power1.in', immediateRender: false })
        .fromTo(element,
          { xPercent: 400 },
          { xPercent: -400, duration: 1, ease: 'none', immediateRender: false }, 0);
      return tl;
    },
    seamlessLoop = buildSeamlessLoop(cards, spacing, animateFunc),
    playhead = { offset: 0 },
    wrapTime = gsap.utils.wrap(0, seamlessLoop.duration()),
    scrub = gsap.to(playhead, {
      offset: 0,
      onUpdate() {
        seamlessLoop.time(wrapTime(playhead.offset));
      },
      duration: 0.5,
      ease: 'power3',
      paused: true
    });

  // In the original demo a pinned ScrollTrigger drives `scrub.vars.offset`
  // from page scroll; here drag, buttons, and autoplay drive it instead so
  // the page keeps normal scrolling.
  function scrollToOffset(offset) {
    scrub.vars.offset = snapTime(offset);
    scrub.invalidate().restart();
  }
  scrollToOffset(0);

  document.querySelector('.ws-next')?.addEventListener('click', () => {
    scrollToOffset(scrub.vars.offset + spacing);
    holdAutoplay();
  });
  document.querySelector('.ws-prev')?.addEventListener('click', () => {
    scrollToOffset(scrub.vars.offset - spacing);
    holdAutoplay();
  });

  Draggable.create('.ws-drag-proxy', {
    type: 'x',
    trigger: '.ws-cards',
    onPress() {
      this.startOffset = scrub.vars.offset;
      holdAutoplay();
    },
    onDrag() {
      scrub.vars.offset = this.startOffset + (this.startX - this.x) * 0.001;
      scrub.invalidate().restart();
    },
    onDragEnd() {
      scrollToOffset(scrub.vars.offset);
    }
  });

  // Gentle autoplay: advance one card every 4s, paused while the visitor
  // hovers or interacts, and skipped entirely under prefers-reduced-motion.
  let autoplayId = null, held = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startAutoplay = () => {
    if (reducedMotion || autoplayId) return;
    autoplayId = setInterval(() => {
      if (!held) scrollToOffset(scrub.vars.offset + spacing);
    }, 4000);
  };
  function holdAutoplay() {
    held = true;
    clearTimeout(holdAutoplay._t);
    holdAutoplay._t = setTimeout(() => { held = false; }, 8000);
  }
  const band = document.querySelector('.ws-gallery-band');
  band?.addEventListener('pointerenter', () => { held = true; });
  band?.addEventListener('pointerleave', () => { held = false; });
  startAutoplay();
}

export function setupWholesalePage() {
  setupGallerySlider();
  setupInquiryForm();
}
