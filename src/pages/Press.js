// Press features — readable web reproductions of the two Zanzibar Mail
// print features about Royal Maroon Herbs. The original clippings are
// low-resolution newspaper scans; the copy below is transcribed faithfully
// from them so it is fully legible on screen. Each article is its own route
// (registered in main.js); the original scan is shown as a figure so readers
// can see the source. Uses the storefront design system (Lora headlines /
// Plus Jakarta body, maroon-green palette) like the About page.

const ARTICLES = {
  'healing-the-land': {
    slug: 'healing-the-land',
    kicker: 'Zanzibar Mail · Local Feature',
    date: 'Monday, 20–26 April 2026',
    page: 'Page 7',
    headline: 'Healing the Land: Zanzibar’s Herbal Renaissance',
    byline: 'By Seleman Tambulegeni',
    clipping: '/images/press/healing-the-land-clipping.jpg',
    lead: 'In the streets of Stone Town, Zanzibar, a quiet revolution is taking place.',
    sections: [
      {
        paras: [
          'Away from the bustling markets and tourist lanes, a small shop offers more than herbs — it offers knowledge, culture and a bridge to centuries of African healing traditions.',
          'The shop, Royal Maroon Herbal, is a testament to a philosophy rooted in history, culture and holistic wellness.',
          'The General Manager of Royal Maroon Herbal, Twin Brothers, spoke passionately about his mission, reflecting on the diverse cultures and languages of Africa and the diaspora.',
          'He emphasized the importance of shared knowledge and explained that in East Africa, where there are over 150 tribes, a unifying language like Kiswahili is essential to maintain order and connection.',
          'He drew parallels with the Maroons of Jamaica, noting that just as they preserved their heritage, the shop is committed to preserving herbal knowledge for the health and benefit of the continent.'
        ]
      },
      {
        heading: 'Royal Maroon Herbal: More than a shop',
        paras: [
          'Located in Stone Town, Royal Maroon Herbal is a shop with a big mission.',
          'The herbalist stated that the name ‘Royal Maroon’ was chosen to honor the Maroons of Jamaica, a group known for resisting slavery and preserving African traditions.',
          'He explained that their deep connection with the land, herbs and culture continues to inspire the work carried out at the shop.',
          'Inside, shelves display herbs sourced from across the world, including moringa from Ethiopia, kanna from South Africa, amla from India and native Zanzibari and Tanzanian plants.',
          'The shop’s approach is primarily educational rather than commercial.',
          'The owner explained that simply possessing herbs is not enough and that true benefit comes from understanding how to use them properly, turning knowledge into power.'
        ]
      },
      {
        heading: 'The legacy of the Maroons',
        paras: [
          'The Maroons, a group of escaped slaves in Jamaica, serve as a historical inspiration for the shop.',
          'They preserved African knowledge while resisting colonial forces through strategic use of their environment.',
          'Their understanding of herbs and plants extended beyond human use to include animals, reflecting a holistic approach to survival and health.',
          'Twin Brothers explained that this deep, all-encompassing knowledge of plants is the same principle being applied at Royal Maroon Herbal today, where healing is viewed as both a science and a cultural practice.'
        ]
      },
      {
        heading: 'From Jamaica to Zanzibar: A global herb network',
        paras: [
          'While rooted in Jamaican tradition, Royal Maroon Herbal operates on a global scale.',
          'The founder sources plants from Africa, the Caribbean, India and South America, blending them with local Tanzanian herbs.',
          'He highlighted the wide-ranging benefits of moringa, including strengthening the immune system and cleansing the blood.',
          'He also pointed to Guinea hen weed, which has been researched in Jamaica and Germany and has shown potential in fighting cancer while protecting healthy cells.',
          'He further explained that humans have always relied on nature for healing, tracing this dependence back to ancient civilizations such as Egypt’s 18th dynasty.',
          'He noted that pharmaceutical medicine is relatively recent, whereas herbal medicine has existed for centuries.'
        ]
      },
      {
        heading: 'Education: The core mission',
        paras: [
          'Beyond selling herbs, the shop places strong emphasis on education.',
          'The owner expressed a vision of integrating herbal knowledge into school curricula, where children would learn about the functions of organs such as the liver and kidneys, alongside the preventive benefits of herbs by an early age.',
          'He pointed out that many people complete higher education without understanding their own bodies, and stressed the importance of equipping future generations with practical health knowledge.',
          'This mission extends to adults, as the shop encourages visitors not only to buy herbs but to understand their consistent use for both prevention and healing.',
          'Herbs such as fenugreek and moringa are presented as tools that require knowledge and practice to be effective.'
        ]
      },
      {
        heading: 'Challenges and opportunities',
        paras: [
          'Operating such a shop in Zanzibar presents challenges, including widespread misconceptions about herbal medicine and the undervaluation of traditional knowledge.',
          'However, the founder approaches these challenges as opportunities for growth and awareness.',
          'He explained that difficulties serve as learning experiences and emphasized the importance of reaching people with knowledge, even when its value is not immediately recognized.',
          'By situating the shop in Stone Town, he demonstrates that traditional medicine remains relevant and accessible in modern society.'
        ]
      },
      {
        heading: 'A holistic philosophy',
        paras: [
          'At the core of the shop’s approach is a holistic philosophy centered on balance.',
          'Herbs are used both for prevention and treatment, reflecting a comprehensive understanding of health.',
          'The owner explained that the body communicates through discomfort and illness, and that ignoring these signals often leads to dependence on pharmaceutical solutions instead of natural remedies.',
          'He emphasized that achieving balance in health, life and energy is essential, and that understanding this balance empowers both individuals and communities.'
        ]
      },
      {
        heading: 'Connecting past and present',
        paras: [
          'Royal Maroon Herbal connects historical knowledge with contemporary practice.',
          'The founder’s education came not only from formal learning but also from lived experiences across cities such as Zanzibar, Moshi, Dar es Salaam, Kampala, Nairobi and Kingston.',
          'He stressed that true knowledge is gained through direct engagement with culture, nature and traditional practices.',
          'He explained that nature communicates in its own way, and that by learning to understand it, communities can heal themselves without relying solely on Western medicine.'
        ]
      },
      {
        heading: 'The future: Spreading the knowledge',
        paras: [
          'The vision of Royal Maroon Herbal extends beyond Zanzibar to East Africa and potentially the global stage.',
          'The owner outlined plans for schools, workshops and community programs aimed at teaching herbal knowledge to people of all ages.',
          'The goal is to empower individuals with the ability to maintain their health, understand their bodies and reconnect with nature.',
          'He noted that the initiative is part of a broader movement focused on knowledge sharing, cultural preservation and inspiring curiosity about natural healing.'
        ]
      },
      {
        heading: 'Healing as culture',
        paras: [
          'Royal Maroon Herbal stands as a symbol of holistic health, cultural resilience and historical continuity.',
          'It highlights the importance of understanding the relationship between the body, the land and natural remedies that have sustained humanity for generations.',
          'Twin emphasized that the mission centers on healing people, educating communities and respecting the wisdom of nature, noting that achieving these goals would naturally lead to broader success.'
        ]
      }
    ]
  },

  'blending-cultures': {
    slug: 'blending-cultures',
    kicker: 'Zanzibar Mail · Local Feature',
    date: 'Monday, 11–17 May 2026',
    page: 'Page 8',
    headline: 'Blending Cultures Through Nature and Knowledge',
    byline: 'By Seleman Tambulegeni',
    clipping: '/images/press/blending-cultures-clipping.jpg',
    lead: 'During a recent event held in the heart of Unguja, a Jamaican-born herbal practitioner known as Twin Brothers, who serves as General Manager of Royal Maroon Herbs, introduced a set of products and ideas that go beyond business.',
    sections: [
      {
        paras: [
          'Instead, his message revolved around culture, self-reliance and the value of natural knowledge.',
          'The event, which brought together media practitioners, residents and visitors, was not framed as a commercial launch alone.',
          'It was presented as part of a wider conversation about heritage, health and Africa’s place in a globalized world.'
        ]
      },
      {
        heading: 'A moment rooted in history',
        paras: [
          'Speaking during the gathering, Twin Brothers linked the occasion to a broader historical context.',
          'He noted that the launch came shortly after African Liberation Day, a date he said has held personal significance since his youth.',
          'For him, the timing was symbolic — it reflected a deeper intention to reconnect African-descended communities across continents, not only through shared history but through practical engagement with culture, food and traditional knowledge.',
          'He described Zanzibar as a natural meeting point for this exchange, pointing to its long-standing identity as a center of trade, culture and spices.'
        ]
      },
      {
        heading: 'Flavors that tell a story',
        paras: [
          'At the center of the event were two products: a traditional Jamaican sorrel drink and a family-based jerk sauce.',
          'Rather than presenting them as imported goods, Twin Brothers explained them as cultural expressions shaped by both Jamaican heritage and Tanzanian context.',
          'The sorrel drink, widely consumed in Jamaica during festive seasons, was introduced as both a cultural beverage and a reflection of traditional knowledge about plants.',
          'He noted that such drinks have long been associated with wellbeing, though his emphasis remained on cultural continuity rather than medical claims.',
          'The jerk sauce, on the other hand, carried a deeper personal narrative — he described it as a recipe rooted in family tradition spanning more than four decades, previously linked to a long-running restaurant business abroad.',
          'He said that the sauce had even received recognition at food festivals in Jamaica.',
          'What makes its introduction in Zanzibar significant, he explained, is the discovery that many of the spices used in its preparation are also found locally.',
          'He suggested that this overlap creates a natural bridge between the two cultures.'
        ]
      },
      {
        heading: 'More than a shop',
        paras: [
          'Beyond the products, the discussion extended to the broader role of Royal Maroon Herbs as a space for knowledge and exchange.',
          'Twin explained that the herbs available in the shop are sourced from various parts of the world, including Africa and the Caribbean, but are integrated with local plants found in Zanzibar.',
          'His argument was that valuable knowledge often exists within communities, even if it is not always recognized.',
          'He suggested that in many households, there are plants with potential uses that people overlook, largely due to lack of awareness.',
          'His message, delivered with strong conviction, emphasized learning, sharing and rediscovering what already exists within one’s environment.'
        ]
      },
      {
        heading: 'A message of identity and responsibility',
        paras: [
          'Throughout his remarks, Twin returned repeatedly to themes of identity, dignity and responsibility.',
          'He stressed that his work in Africa is guided by a commitment to contribute rather than extract, stating that his intention is to build within the continent and reinvest in it.',
          'He also spoke about unity, urging communities to see themselves as connected rather than divided.',
          'Using cultural symbols, colors and references to nature, he framed Africa as a space rich in resources, knowledge and potential.',
          'At its core, his message was less about commerce and more about mindset — a call for people to value what they have and to approach development with awareness and purpose.'
        ]
      },
      {
        heading: 'Voices from the community',
        paras: [
          'The event also drew responses from local leaders and residents, many of whom viewed the initiative through a broader social and economic lens.',
          'A senior journalist and Director of Azam Media Zanzibar, Dr. Yussuf Khamis Yussuf, described the concept as a positive example of how businesses rooted in natural products and traditional knowledge can be developed in an African context.',
          'He noted that the shop stands out for its professional approach, particularly when compared to some existing outlets.',
          'He also highlighted its alignment with practices seen in other parts of the world, such as Asia, where natural remedies are widely integrated into daily life.',
          'According to him, the presence of such a business in Zanzibar offers reassurance to consumers seeking alternatives that are closer to natural and culturally grounded practices.',
          'He also pointed to its economic contribution, noting that the shop has created employment opportunities for local residents, thereby supporting livelihoods and contributing to the local economy.'
        ]
      },
      {
        heading: 'A space for learning and tourism',
        paras: [
          'Residents who attended the event shared similar sentiments, particularly regarding the shop’s potential to attract both locals and visitors.',
          'Fadhil Jumanne, a tour guide, described it as a new and unique addition to Stone Town.',
          'He suggested that tourists visiting the area will not only purchase products but also gain knowledge, adding value to their experience.',
          'He noted that such interactions can contribute to the broader economy, as spending circulates through wages, services and related activities.',
          'Another resident, Asya Asagile, viewed the initiative as an opportunity rather than a threat to local entrepreneurs.',
          'She explained that the presence of the shop could inspire others to learn, innovate and build their own ventures, especially given that many of the materials used originate from the local environment.',
          'For her, the concept highlights the potential of using readily available resources — plants, fruits and traditional knowledge — to create sustainable opportunities.'
        ]
      }
    ]
  }
};

// Slug lookup by pathname (routes: /press/healing-the-land, /press/blending-cultures)
export function pressSlugFromPath(pathname = window.location.pathname) {
  const m = pathname.match(/^\/press\/([a-z-]+)\/?$/);
  return m ? m[1] : null;
}

export const pressArticles = ARTICLES;

function sectionMarkup(s) {
  const heading = s.heading
    ? `<h2 class="font-headline-md text-[22px] md:text-[26px] text-primary mt-10 mb-3 pb-2 border-b border-surface-container-high">${s.heading}</h2>`
    : '';
  const paras = s.paras.map(p => `<p>${p}</p>`).join('');
  return `${heading}${paras}`;
}

export function Press() {
  const slug = pressSlugFromPath();
  const a = slug && ARTICLES[slug];

  if (!a) {
    return `
      <section style="background:#ffffff url('/images/about/bg-paper.jpg') center / cover fixed;" class="min-h-[60vh]">
        <div class="px-margin-mobile md:px-margin-desktop py-24 max-w-[720px] mx-auto text-center">
          <h1 class="font-headline-lg text-headline-lg text-primary mb-4">Feature not found</h1>
          <p class="font-body-lg text-body-lg text-on-surface-variant mb-8">The press feature you’re looking for isn’t available.</p>
          <a href="/about" class="inline-block bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest px-10 py-4 rounded-[999px] hover:bg-primary-container transition-colors shadow-lg">Back to About Us</a>
        </div>
      </section>
    `;
  }

  return `
    <section style="background:#ffffff url('/images/about/bg-paper.jpg') center / cover fixed;">
      <article class="px-margin-mobile md:px-margin-desktop py-12 md:py-20 max-w-[760px] mx-auto">

        <a href="/about" class="inline-flex items-center gap-2 font-label-md text-label-md uppercase tracking-wider text-on-tertiary-container hover:text-primary transition-colors mb-8">
          <span class="material-symbols-outlined text-[18px]">arrow_back</span> Back to About Us
        </a>

        <!-- Masthead line -->
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-primary/20 py-3 mb-6 font-label-sm text-label-sm uppercase tracking-[0.18em] text-on-tertiary-container">
          <span class="font-bold text-primary">Zanzibar Mail</span>
          <span aria-hidden="true" class="opacity-40">|</span>
          <span>Local Feature</span>
          <span aria-hidden="true" class="opacity-40">|</span>
          <span>${a.date}</span>
          <span aria-hidden="true" class="opacity-40 hidden sm:inline">|</span>
          <span class="hidden sm:inline">${a.page}</span>
        </div>

        <header class="mb-8">
          <h1 class="font-headline-xl text-[34px] md:text-[52px] leading-[1.08] text-primary mb-4">${a.headline}</h1>
          <p class="font-label-md text-label-md uppercase tracking-wider text-secondary">${a.byline}</p>
        </header>

        <!-- Body: single readable measure, generous leading, justified -->
        <div class="press-prose font-body-lg text-body-lg text-on-surface-variant leading-[1.75] flex flex-col gap-4"
             style="text-align:justify; text-justify:inter-word;">
          <p class="first-letter:font-headline-xl first-letter:text-primary first-letter:text-[64px] first-letter:leading-[0.8] first-letter:float-left first-letter:mr-3 first-letter:mt-1">${a.lead}</p>
          ${a.sections.map(sectionMarkup).join('')}
        </div>

        <!-- Original clipping -->
        <figure class="mt-14 pt-10 border-t border-surface-container-high">
          <figcaption class="font-label-md text-label-md uppercase tracking-wider text-on-tertiary-container mb-4">The feature as it appeared in print</figcaption>
          <a href="${a.clipping}" target="_blank" rel="noopener noreferrer" class="block overflow-hidden rounded-xl border border-surface-container-high shadow-sm bg-white">
            <img src="${a.clipping}" alt="Original Zanzibar Mail newspaper feature: ${a.headline}" loading="lazy" class="w-full h-auto"/>
          </a>
          <p class="mt-3 font-label-sm text-label-sm text-secondary italic">Tap the clipping to view the original scan full size. Zanzibar Mail, ${a.date}, ${a.page}.</p>
        </figure>

        <!-- Closing CTA -->
        <div class="mt-14 pt-10 border-t border-surface-container-high flex flex-col sm:flex-row gap-4">
          <a href="/#collection" class="inline-block text-center bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest px-10 py-4 rounded-[999px] hover:bg-primary-container transition-colors shadow-lg">Shop the Collection</a>
          <a href="/about" class="inline-block text-center border border-primary text-primary font-label-md text-label-md uppercase tracking-widest px-10 py-4 rounded-[999px] hover:bg-primary hover:text-on-primary transition-colors">Read Our Story</a>
        </div>
      </article>
    </section>
  `;
}
