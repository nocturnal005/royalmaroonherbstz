// About Us — brand story. Uses the storefront design system (Lora headlines /
// Plus Jakarta body, maroon-green palette). Full-bleed hero banner + an
// alternating image/text rhythm on a subtle white paper background (Stitch-
// generated watermark). Founder portrait is real press photography (Zanzibar
// Mail); a credibility strip references the coverage rather than reproducing it.

const VALUES = [
  { icon: 'favorite', title: 'Health Before Wealth', body: 'We prioritise the purity and potency of our herbs over cutting costs.' },
  { icon: 'spa', title: 'Beautify the Inside First', body: 'True health is an internal balance of life and energy. We nourish the root first.' },
  { icon: 'diversity_3', title: 'Cultural Resilience', body: 'We honour our shared history across continents by keeping traditional knowledge alive, practical, and accessible for the next generation.' },
  { icon: 'volunteer_activism', title: 'Love and Self-Cure', body: 'We give our community the genuine, natural tools required to take control of their own minds and bodies.' }
];

const PRESS = [
  { title: 'Healing the Land: Zanzibar’s Herbal Renaissance', meta: 'Zanzibar Mail, Local Feature, April 2026', href: '/press/healing-the-land' },
  { title: 'Blending Cultures Through Nature and Knowledge', meta: 'Zanzibar Mail, Local Feature, May 2026', href: '/press/blending-cultures' }
];

// Alternating story row: image on one side, prose on the other.
function storyRow({ eyebrow, title, paras, img, alt, imgSide }) {
  const figFirst = imgSide === 'left';
  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-14 md:py-16">
      <figure class="order-1 ${figFirst ? 'lg:order-1' : 'lg:order-2'}">
        <div class="aspect-[5/4] overflow-hidden rounded-xl border border-surface-container-high shadow-sm bg-white">
          <img src="${img}" alt="${alt}" loading="lazy" class="w-full h-full object-cover"/>
        </div>
      </figure>
      <div class="order-2 ${figFirst ? 'lg:order-2' : 'lg:order-1'} about-prose">
        ${eyebrow ? `<span class="block font-label-md text-label-md uppercase tracking-[0.25em] text-on-tertiary-container mb-3">${eyebrow}</span>` : ''}
        <h2 class="font-headline-lg text-headline-lg text-primary mb-5">${title}</h2>
        <div class="flex flex-col gap-4 font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
          ${paras.map(p => `<p>${p}</p>`).join('')}
        </div>
      </div>
    </div>`;
}

function valueRow(v) {
  return `
    <div class="flex items-start gap-5 p-7 md:p-8">
      <span class="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary-fixed text-primary">
        <span class="material-symbols-outlined">${v.icon}</span>
      </span>
      <div>
        <h3 class="font-headline-md text-headline-md text-primary mb-1.5">${v.title}</h3>
        <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${v.body}</p>
      </div>
    </div>`;
}

export function AboutUs() {
  return `
    <section style="background:#ffffff url('/images/about/bg-paper.jpg') center / cover fixed;">

      <!-- Full-bleed hero banner -->
      <div class="relative w-full min-h-[52vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
        <img src="/images/lifestyle/hero_env_forest.jpg" alt="" aria-hidden="true" class="absolute inset-0 w-full h-full object-cover"/>
        <div class="absolute inset-0" style="background:linear-gradient(180deg, rgba(6,20,12,.55), rgba(6,20,12,.72));"></div>
        <div class="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto py-20">
          <span class="block font-label-md text-label-md uppercase tracking-[0.35em] text-tertiary-fixed-dim mb-5">Our Story</span>
          <h1 class="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-primary mb-6">About Royal Maroon Herbs</h1>
          <p class="font-body-lg text-body-lg text-surface-container-lowest/90">
            We built Royal Maroon Herbs on one simple premise: <strong class="text-tertiary-fixed-dim font-semibold">health comes before wealth.</strong>
          </p>
        </div>
      </div>

      <!-- Alternating story rows -->
      <div class="px-margin-mobile md:px-margin-desktop max-w-[1300px] mx-auto divide-y divide-surface-container-high">
        ${storyRow({
          eyebrow: 'Our Roots',
          title: 'Rooted in the Legacy of the Maroons',
          paras: [
            'Our story is rooted in the legacy of the Maroons of Jamaica, communities of escaped Africans who resisted colonial forces and preserved their ancestral knowledge of plants to survive. For the Maroons, understanding herbs was a science of survival and a practice of self-reliance.',
            'We carry that exact same responsibility today in Stone Town, Zanzibar, acting as a living bridge between Jamaican traditions and East African heritage.'
          ],
          img: '/images/about/founder-stand.jpg',
          alt: 'Twin Brothers, General Manager of Royal Maroon Herbs, beside the branded Royal Maroon Herbs product stand',
          imgSide: 'right'
        })}
        ${storyRow({
          eyebrow: 'Purity, By Principle',
          title: 'Pure Plant Material, a Global Network',
          paras: [
            'Most of the global supplement market is crowded with additives, synthetic fillers, and shortcuts. We avoid them completely. Because traditional knowledge only remains relevant if it works, every product we create contains only pure, carefully selected plant material.',
            'Led by our General Manager, Twin Brothers, we intentionally build a global network, blending powerful botanicals from across Africa, the Caribbean, India, and South America with local Tanzanian herbs.'
          ],
          img: '/images/hub/moringa.jpg',
          alt: 'Moringa leaves, powder and capsules',
          imgSide: 'left'
        })}
        ${storyRow({
          eyebrow: 'Our Mission',
          title: 'Mastering Natural Remedies',
          paras: [
            'True well-being comes from understanding how to use nature to prevent illness and heal the body, reducing total dependence on synthetic solutions.',
            'Our mission in Zanzibar is to contribute to the community rather than extract from it, equipping families with the practical health knowledge they need to look after themselves.'
          ],
          img: '/images/hub/guava.jpg',
          alt: 'Guava leaves and powder',
          imgSide: 'right'
        })}
      </div>

      <!-- Core Values: feature split -->
      <div class="px-margin-mobile md:px-margin-desktop py-16 max-w-[1300px] mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-[2fr_3fr] rounded-2xl overflow-hidden border border-surface-container-high shadow-sm">
          <div class="relative bg-primary text-on-primary p-10 md:p-14 flex flex-col justify-center overflow-hidden">
            <span class="material-symbols-outlined absolute -bottom-10 -right-8 text-[240px] leading-none text-on-primary/5 pointer-events-none select-none">spa</span>
            <span class="relative block font-label-md text-label-md uppercase tracking-[0.3em] text-tertiary-fixed-dim mb-4">What Guides Us</span>
            <h2 class="relative font-headline-xl text-[34px] md:text-[46px] leading-[1.1] mb-5">Our Core Values</h2>
            <p class="relative font-body-lg text-body-lg text-primary-fixed/90 max-w-sm">Four principles shape every herb we select and every conversation we share with our community.</p>
          </div>
          <div class="bg-white/80 backdrop-blur-sm divide-y divide-surface-container-high">
            ${VALUES.map(valueRow).join('')}
          </div>
        </div>
      </div>

      <!-- Press credibility strip -->
      <div class="bg-primary-container">
        <div class="px-margin-mobile md:px-margin-desktop py-14 max-w-[1100px] mx-auto text-center">
          <span class="block font-label-md text-label-md uppercase tracking-[0.3em] text-tertiary-fixed mb-6">As Featured In</span>
          <p class="font-headline-lg text-headline-lg text-on-primary mb-3">Zanzibar Mail</p>
          <blockquote class="font-body-lg text-body-lg italic text-on-primary-container max-w-2xl mx-auto mb-8">
            “A quiet revolution: a shop that offers more than herbs. Knowledge, culture, and a bridge to centuries of African healing traditions.”
          </blockquote>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            ${PRESS.map(p => `
              <a href="${p.href}" class="group bg-surface/10 border border-on-primary-fixed-variant/20 hover:border-tertiary-fixed rounded-lg px-6 py-4 text-left sm:max-w-xs transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary-fixed">
                <p class="font-label-md text-label-md text-on-primary mb-1">${p.title}</p>
                <p class="font-label-sm text-label-sm text-on-primary-container opacity-70">${p.meta}</p>
                <span class="mt-3 inline-flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed group-hover:gap-2 transition-all">Read the feature <span class="material-symbols-outlined text-[16px]">arrow_forward</span></span>
              </a>`).join('')}
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="px-margin-mobile md:px-margin-desktop py-16 max-w-[1000px] mx-auto text-center">
        <h2 class="font-headline-md text-headline-md text-primary mb-6">Discover the collection</h2>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/#collection" class="inline-block bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest px-10 py-4 rounded-[999px] hover:bg-primary-container transition-colors shadow-lg">Shop Botanicals</a>
          <a href="/maroon-hub" class="inline-block border border-primary text-primary font-label-md text-label-md uppercase tracking-widest px-10 py-4 rounded-[999px] hover:bg-primary hover:text-on-primary transition-colors">Read the Journal</a>
        </div>
      </div>
    </section>
  `;
}
