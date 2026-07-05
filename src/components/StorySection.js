export function StorySection() {
  return `
    <section class="w-full py-32 bg-primary-container relative overflow-hidden grain-overlay">
      <div class="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
        <svg class="w-full h-full text-surface-container-low fill-current" viewBox="0 0 100 100">
          <path d="M50,0 C65,10 85,25 90,50 C95,75 75,90 50,100 C25,90 5,75 10,50 C15,25 35,10 50,0 Z"></path>
        </svg>
      </div>
      <div class="px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div class="w-full md:w-1/2">
          <img class="w-full aspect-video object-cover rounded-none border border-on-primary-fixed-variant shadow-2xl" 
               loading="lazy" 
               width="800"
               height="450"
               alt="Herbalist pruning lavender branches in a sunlit greenhouse." 
               src="/images/lifestyle/hero_banner.jpg"/>
        </div>
        <div class="w-full md:w-1/2 text-on-primary">
          <span class="font-label-md text-label-md text-tertiary-fixed-dim uppercase tracking-[0.3em] mb-4 block">Our Commitment</span>
          <h2 class="font-headline-xl text-headline-xl mb-8">The Farm-to-Bottle Journey</h2>
          <p class="font-body-lg text-body-lg text-on-primary-container opacity-90 mb-8 leading-relaxed">
            Every extract and essence in our alchemy begins its journey in rich, volcanic soil. We select botanical crops at the precise peak of their seasonal rhythms as practiced for centuries.
          </p>
          <ul class="space-y-4 mb-10">
            <li class="flex items-center gap-4">
              <span class="material-symbols-outlined text-tertiary-fixed-dim" data-icon="eco">eco</span>
              <span class="font-label-md text-label-md uppercase tracking-wider">Wellness-Focused Botanical Extracts</span>
            </li>
            <li class="flex items-center gap-4">
              <span class="material-symbols-outlined text-tertiary-fixed-dim" data-icon="science">science</span>
              <span class="font-label-md text-label-md uppercase tracking-wider">Quality Tested Botanical Ingredients</span>
            </li>
            <li class="flex items-center gap-4">
              <span class="material-symbols-outlined text-tertiary-fixed-dim" data-icon="history_edu">history_edu</span>
              <span class="font-label-md text-label-md uppercase tracking-wider">Traditional Extraction Methodologies</span>
            </li>
          </ul>
          <a class="inline-block border border-tertiary-fixed-dim text-tertiary-fixed-dim px-8 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-tertiary-fixed-dim hover:text-primary transition-all duration-300" href="#">
            Our Full Story
          </a>
        </div>
      </div>
    </section>
  `;
}
