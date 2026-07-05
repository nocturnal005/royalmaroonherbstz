export function Hero() {
  return `
    <section class="relative h-[819px] w-full overflow-hidden grain-overlay flex items-center justify-center">
      <div class="absolute inset-0 z-0">
         <img class="w-full h-full object-cover" 
             loading="eager"
             width="1920"
             height="819"
             alt="Herbalist grinding botanicals with stone mortar and pestle in golden morning sunlight." 
             src="/images/lifestyle/hero_banner.jpg"/>
        <div class="absolute inset-0 bg-primary/20 backdrop-brightness-75"></div>
      </div>
      <div class="relative z-10 text-center text-on-primary p-8 md:p-12 max-w-3xl rounded-xl bg-surface/10 backdrop-blur-md border border-surface/20 shadow-2xl transition-transform hover:scale-[1.01] duration-500">
        <span class="font-label-md text-label-md text-primary-fixed uppercase tracking-[0.2em] block mb-4">Tanzanian Botanical Apothecary</span>
        <h2 class="font-headline-xl text-headline-xl-mobile md:text-headline-xl mb-6">Ancient Wisdom, Modern Science</h2>
        <p class="font-body-lg text-body-lg text-surface-container-lowest opacity-90 mb-6 max-w-xl mx-auto">
          A curated selection of botanical formulas designed for everyday wellness routines and daily rituals.
        </p>
        <div class="mb-10 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-surface-container-low font-label-sm text-label-sm tracking-wider uppercase opacity-90">
          <span>Nationwide Delivery across Tanzania</span>
          <span class="opacity-30 hidden sm:inline">•</span>
          <span>M-Pesa, Tigo Pesa &amp; Airtel Money via Selcom</span>
        </div>
        <div class="flex flex-col items-center gap-4">
          <a class="bg-primary text-surface font-label-md text-label-md px-10 py-5 rounded-none hover:bg-surface hover:text-primary transition-all duration-300 uppercase tracking-widest animate-fade-in shadow-lg hover:shadow-xl" href="#collection">
            Explore Our Roots
          </a>
          <div class="mt-12 animate-bounce flex flex-col items-center gap-2 opacity-60">
            <span class="font-label-sm text-label-sm uppercase">Scroll to Explore</span>
            <span class="material-symbols-outlined">expand_more</span>
          </div>
        </div>
      </div>
    </section>
  `;
}
