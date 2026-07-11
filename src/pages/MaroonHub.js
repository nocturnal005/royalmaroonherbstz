import { articles } from '../data/knowledgeArticles.js';

// Maroon Knowledge Hub — "Scholarly Organic" research-poster articles adapted
// from five Stitch layouts (one per publishing week). Palette + fonts are
// scoped to this section. Fabricated-data widgets from the source templates
// (fake bar charts, pH/potency, CSV export) are replaced with honest elements:
// our qualitative evidence meter and a real fact strip. Illustrations fall
// back to product photos until the AI botanical plates are generated.

const SERIF = "font-family:'Playfair Display',serif";
const SANS = "font-family:'Inter',sans-serif";
const FALLBACK = (a) => `onerror="this.onerror=null;this.src='${a.image}'"`;
const firstSentence = (t) => { const m = t.match(/^[^.]*\./); return m ? m[0] : t; };

// Qualitative evidence-strength meter (a coded diagram, never a raster).
function meter(level, label) {
  const bars = [1, 2, 3].map(i =>
    `<span style="height:10px;width:34px;border-radius:2px;background:${i <= level ? '#283527' : 'rgba(40,53,39,0.15)'}"></span>`).join('');
  return `<span style="display:inline-flex;align-items:center;gap:6px" role="img" aria-label="Evidence strength ${level} of 3: ${label}">${bars}</span>`;
}

function factRows(a) {
  const row = (k, v) => `
    <div class="flex justify-between gap-4 py-2.5 border-b border-[#283527]/10">
      <span class="uppercase tracking-[0.12em] text-[11px] text-[#715a3e]" style="${SANS}">${k}</span>
      <span class="text-[13px] text-[#1b1c19] text-right" style="${SANS}">${v}</span>
    </div>`;
  return `
    ${row('Family', a.family)}
    ${row('Key compounds', a.compounds)}
    ${row('Traditional use', a.primaryUse)}
    <div class="flex justify-between items-center gap-4 py-2.5">
      <span class="uppercase tracking-[0.12em] text-[11px] text-[#715a3e]" style="${SANS}">Evidence</span>
      <span class="flex items-center gap-2">${meter(a.evidenceLevel, a.evidenceLabel)}<span class="text-[12px] text-[#283527]" style="${SANS}">${a.evidenceLabel}</span></span>
    </div>`;
}

function illustration(a, extra = '') {
  // Full lifestyle photos fill their frame (cover); transparent cutouts are
  // centered without cropping (contain).
  const fit = a.photo ? 'w-full h-full object-cover' : 'max-w-full max-h-full object-contain';
  const alt = a.photo ? `${a.herb} leaves, powder and capsules (${a.latin})` : `Botanical illustration of ${a.herb} (${a.latin})`;
  return `<img src="${a.illustration}" ${FALLBACK(a)} alt="${alt}" class="${fit} ${extra}"/>`;
}

function refsPanel(a) {
  return `
    <section class="mt-6 border-t border-[#283527]/20 pt-6">
      <h2 class="uppercase tracking-[0.15em] text-[13px] text-[#283527] mb-5 flex items-center gap-2" style="${SANS};font-weight:600">
        <span class="material-symbols-outlined text-[16px]">menu_book</span> References
      </h2>
      <ol class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 list-none counter-reset">
        ${a.references.map((r, i) => `<li class="flex gap-3 text-[13px] leading-relaxed text-[#444842]" style="${SANS}"><span class="text-[#715a3e] tabular-nums">${String(i + 1).padStart(2, '0')}</span><span class="break-words">${r}</span></li>`).join('')}
      </ol>
    </section>`;
}

const disclaimer = `<p class="mt-8 text-[12px] italic text-[#444842]/70 leading-relaxed" style="${SANS}">Educational content only. Royal Maroon Herbs products are for general wellness and are not intended to diagnose, treat, cure, or prevent any disease.</p>`;

// End-of-article purchase call-to-action, linking to the related product
// (the storefront deep-link opens its detail + add-to-cart).
function buyBlock(a) {
  return `
    <section class="mt-8 border border-[#283527]/15 bg-white p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
      <div>
        <p class="uppercase tracking-[0.2em] text-[12px] text-[#715a3e] mb-1" style="${SANS};font-weight:600">From Journal to Ritual</p>
        <h2 class="text-[#283527] text-[24px] md:text-[28px] leading-tight" style="${SERIF}">Bring ${a.herb} into your routine</h2>
        <p class="text-[14px] text-[#444842] mt-1" style="${SANS}">Shop ${a.shopName} from the Royal Maroon Herbs collection.</p>
      </div>
      <a href="/?product=${a.shopSlug}" class="shrink-0 inline-flex items-center justify-center gap-2 bg-[#283527] text-white px-8 py-4 uppercase tracking-widest text-[13px] hover:bg-[#3e4c3d] transition-colors" style="${SANS};font-weight:600">
        <span class="material-symbols-outlined text-[18px]">shopping_bag</span> Shop ${a.shopName}
      </a>
    </section>`;
}

const backLink = `<a href="/maroon-hub" class="inline-flex items-center gap-2 text-[13px] text-[#715a3e] hover:text-[#283527] transition-colors mb-8" style="${SANS}"><span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to the Knowledge Hub</a>`;

function bullets(items) {
  return `<ul class="space-y-3">${items.map(t => `<li class="flex items-start gap-2 text-[15px] text-[#444842] leading-relaxed" style="${SANS}"><span class="text-[#283527] font-bold">+</span><span>${t}</span></li>`).join('')}</ul>`;
}

const eyebrow = (t) => `<p class="uppercase tracking-[0.2em] text-[12px] text-[#715a3e] mb-2" style="${SANS};font-weight:600">${t}</p>`;
const secHead = (icon, t) => `<h2 class="uppercase tracking-[0.12em] text-[13px] text-[#283527] border-b border-[#283527]/10 pb-2 mb-4 flex items-center gap-2" style="${SANS};font-weight:600"><span class="material-symbols-outlined text-[16px]">${icon}</span>${t}</h2>`;

/* ============ TEMPLATE 1 — Modern Asymmetric (Week 1) ============ */
function tModernAsymmetric(a) {
  const [origin, benefits, evidence] = a.sections;
  return `
    ${backLink}
    <header class="mb-10 border-b border-[#283527]/10 pb-8">
      <div class="max-w-3xl">
        <h1 class="text-[#283527] leading-[1.05] text-[32px] md:text-[44px]" style="${SERIF}">${a.title}</h1>
        <p class="mt-2 italic text-[#715a3e] text-[18px]" style="${SERIF}">${a.herb} (${a.latin})</p>
        <p class="mt-1 text-[14px] text-[#444842]" style="${SANS}">${a.date}</p>
      </div>
    </header>
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr_1fr] gap-8 items-start">
      <aside class="space-y-8">
        <section>${secHead('menu_book', origin.label)}<p class="text-[15px] text-[#444842] leading-relaxed" style="${SANS}">${origin.body}</p></section>
        <div class="h-px bg-[#283527]/15"></div>
        <section class="border border-[#283527]/15 p-5 bg-white">
          <p class="uppercase tracking-[0.12em] text-[10px] text-[#715a3e] mb-3" style="${SANS}">Fig 01 · Evidence Strength</p>
          <div class="mb-3">${meter(a.evidenceLevel, a.evidenceLabel)}</div>
          <p class="text-[12px] text-[#444842] mb-4" style="${SANS}">Qualitative appraisal: <span class="italic">${a.evidenceLabel}</span>.</p>
          ${bullets([`Family: ${a.family}`, `Key compounds: ${a.compounds}`, `Traditional use: ${a.primaryUse}`])}
        </section>
      </aside>
      <section>
        <div class="aspect-[3/4] bg-[#f5f3ee] overflow-hidden relative border border-[#283527]/10 flex items-center justify-center p-6">
          ${illustration(a)}
          <div class="absolute top-0 left-0 w-24 h-24 border-l border-t border-[#283527]/20 m-5"></div>
          <div class="absolute bottom-0 right-0 w-24 h-24 border-r border-b border-[#283527]/20 m-5"></div>
        </div>
        <div class="mt-6 p-6 border-l-4 border-[#283527] bg-white">
          ${eyebrow('From the Research')}
          <p class="italic text-[19px] text-[#1b1c19] leading-snug" style="${SERIF}">“${firstSentence(benefits.body)}”</p>
        </div>
      </section>
      <aside class="space-y-8">
        <section>${secHead('science', benefits.label)}<p class="text-[15px] text-[#444842] leading-relaxed" style="${SANS}">${benefits.body}</p></section>
        <section class="p-6 bg-[#283527] text-white">
          <h2 class="uppercase tracking-[0.12em] text-[13px] text-[#becca3] mb-3 flex items-center gap-2" style="${SANS};font-weight:600"><span class="material-symbols-outlined text-[16px]">verified</span>${evidence.label}</h2>
          <p class="text-[15px] leading-relaxed text-white/90" style="${SANS}">${evidence.body}</p>
        </section>
      </aside>
    </div>
    ${refsPanel(a)}${buyBlock(a)}${disclaimer}`;
}

/* ============ TEMPLATE 2 — Three-Column Research (Week 2) ============ */
function tThreeColumn(a) {
  const [origin, benefits, evidence] = a.sections;
  const card = (inner) => `<div class="border border-[#283527]/15 bg-white p-7 flex flex-col">${inner}</div>`;
  return `
    ${backLink}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      ${card(`
        ${eyebrow('Botanical Research')}
        <h1 class="text-[#283527] text-[30px] leading-tight mb-4" style="${SERIF}">${origin.label}</h1>
        <p class="text-[15px] text-[#444842] leading-relaxed" style="${SANS}">${origin.body}</p>
        <p class="mt-4 italic text-[#715a3e] text-[15px]" style="${SERIF}">${a.herb} (${a.latin})</p>
        <p class="mt-1 text-[13px] text-[#444842]" style="${SANS}">${a.date}</p>`)}
      ${card(`
        <h2 class="text-[#283527] text-[26px] leading-tight mb-5" style="${SERIF}">${benefits.label}</h2>
        <p class="text-[15px] text-[#444842] leading-relaxed mb-5" style="${SANS}">${benefits.body}</p>
        <div class="mt-auto border border-[#283527]/15 bg-white p-3">
          <div class="aspect-square bg-[#f5f3ee] flex items-center justify-center p-4">${illustration(a)}</div>
          <p class="text-center italic text-[13px] text-[#444842] mt-2" style="${SERIF}">${a.latin}</p>
        </div>`)}
      ${card(`
        <h2 class="text-[#283527] text-[24px] leading-tight mb-3 pb-2 border-b border-[#283527]/15" style="${SERIF}">${evidence.label}</h2>
        <p class="italic text-[17px] text-[#1b1c19] leading-snug mb-4" style="${SERIF}">“${firstSentence(evidence.body)}”</p>
        <div class="border-l-2 border-[#283527] bg-[#f5f3ee] p-4 mb-5"><p class="text-[14px] text-[#444842]" style="${SANS}">${evidence.body}</p></div>
        <div class="mt-auto"><p class="uppercase tracking-[0.12em] text-[11px] text-[#715a3e] mb-2" style="${SANS}">Evidence strength</p><div class="flex items-center gap-3">${meter(a.evidenceLevel, a.evidenceLabel)}<span class="text-[13px] text-[#283527]" style="${SANS}">${a.evidenceLabel}</span></div></div>`)}
    </div>
    ${refsPanel(a)}${buyBlock(a)}${disclaimer}`;
}

/* ============ TEMPLATE 3 — Technical Monograph (Week 3) ============ */
function tTechnicalMonograph(a) {
  const [origin, benefits, evidence] = a.sections;
  const navItem = (icon, t, active) => `<div class="flex items-center gap-3 px-4 py-2.5 ${active ? 'bg-[#283527] text-white' : 'text-[#444842]'}" style="${SANS}"><span class="material-symbols-outlined text-[18px]">${icon}</span><span class="text-[14px]">${t}</span></div>`;
  return `
    ${backLink}
    <div class="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-8 items-start">
      <aside class="hidden lg:block sticky top-24">
        <p class="text-[#283527] text-[22px] mb-1" style="${SERIF};font-weight:700">Research Monograph</p>
        <p class="uppercase tracking-[0.15em] text-[11px] text-[#715a3e] mb-6 italic" style="${SANS}">${a.latin}</p>
        <nav class="border border-[#283527]/15">${navItem('menu_book', 'Origin', true)}${navItem('science', 'Benefits')}${navItem('verified', 'Evidence')}${navItem('article', 'References')}</nav>
      </aside>
      <article>
        <p class="inline-block border border-[#283527]/25 px-3 py-1 uppercase tracking-[0.15em] text-[11px] text-[#444842] mb-5" style="${SANS}">Technical Monograph</p>
        <h1 class="text-[#283527] leading-[1.05] text-[34px] md:text-[46px] mb-4" style="${SERIF}">${a.title}</h1>
        <p class="italic text-[18px] text-[#715a3e] mb-1" style="${SERIF}">${a.herb} (${a.latin})</p>
        <p class="text-[14px] text-[#444842] mb-8" style="${SANS}">${a.date}</p>
        <section class="mb-8"><h2 class="text-[#283527] text-[20px] mb-3 pb-2 border-b border-[#283527]/15" style="${SERIF}">I. ${origin.label}</h2><p class="text-[16px] text-[#444842] leading-relaxed" style="${SANS}">${origin.body}</p></section>
        <section class="mb-8"><h2 class="text-[#283527] text-[20px] mb-3 pb-2 border-b border-[#283527]/15" style="${SERIF}">II. ${benefits.label}</h2><p class="text-[16px] text-[#444842] leading-relaxed" style="${SANS}">${benefits.body}</p></section>
        <section><h2 class="text-[#283527] text-[20px] mb-3 pb-2 border-b border-[#283527]/15" style="${SERIF}">III. ${evidence.label}</h2><p class="text-[16px] text-[#444842] leading-relaxed" style="${SANS}">${evidence.body}</p></section>
      </article>
      <aside class="border border-[#283527]/15 bg-[#f5f3ee] p-6">
        <h2 class="uppercase tracking-[0.12em] text-[12px] text-[#283527] pb-3 mb-4 border-b border-[#283527]/15" style="${SANS};font-weight:600">At a Glance</h2>
        <div class="aspect-square bg-white border border-[#283527]/10 flex items-center justify-center p-4 mb-5">${illustration(a)}</div>
        ${factRows(a)}
        <div class="mt-5 bg-[#fdddb9]/40 border-l-2 border-[#715a3e] p-4"><p class="uppercase tracking-[0.1em] text-[10px] text-[#715a3e] mb-1" style="${SANS}">Curator's Note</p><p class="text-[13px] italic text-[#444842] leading-relaxed" style="${SANS}">${firstSentence(evidence.body)}</p></div>
      </aside>
    </div>
    ${a.illustration2 ? `<figure class="mt-8 aspect-[16/9] md:aspect-[5/2] overflow-hidden border border-[#283527]/15"><img src="${a.illustration2}" alt="${a.herb} in leaf, root and powder form (${a.latin})" class="w-full h-full object-cover"/></figure>` : ''}
    ${refsPanel(a)}${buyBlock(a)}${disclaimer}`;
}

/* ============ TEMPLATE 4 — Modular Grid (Week 4) ============ */
function tModularGrid(a) {
  const [origin, benefits, evidence] = a.sections;
  return `
    ${backLink}
    <header class="text-center max-w-4xl mx-auto mb-10">
      ${eyebrow('Botanical Monograph')}
      <h1 class="text-[#283527] leading-[1.1] text-[32px] md:text-[44px]" style="${SERIF}">${a.title}</h1>
      <p class="mt-3 italic text-[#715a3e] text-[18px]" style="${SERIF}">${a.herb} (${a.latin})</p>
      <p class="mt-1 text-[14px] text-[#444842]" style="${SANS}">${a.date}</p>
      <div class="flex items-center justify-center gap-3 mt-5"><span class="h-px w-16 bg-[#283527]/20"></span><span class="text-[#283527] text-[10px]">◆</span><span class="h-px w-16 bg-[#283527]/20"></span></div>
    </header>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <section class="border border-[#283527]/15 bg-white p-6">
        ${secHead('menu_book', origin.label)}
        <p class="text-[15px] text-[#444842] leading-relaxed mb-5" style="${SANS}">${origin.body}</p>
        <div class="aspect-[4/3] bg-[#f5f3ee] border border-[#283527]/10 flex items-center justify-center p-4">${illustration(a)}</div>
      </section>
      <section class="border border-[#283527]/15 bg-white p-6">
        ${secHead('science', benefits.label)}
        <div class="bg-[#f5f3ee] p-4 mb-4"><p class="text-[#283527] text-[18px] mb-1" style="${SERIF}">Plate I · Constituents</p><p class="text-[14px] text-[#444842]" style="${SANS}">${a.compounds}.</p></div>
        <p class="text-[15px] text-[#444842] leading-relaxed" style="${SANS}">${benefits.body}</p>
      </section>
      <section class="border border-[#283527]/15 bg-white p-6">
        ${secHead('analytics', 'Analysis')}
        <p class="uppercase tracking-[0.1em] text-[11px] text-[#715a3e] mb-2" style="${SANS}">Evidence strength</p>
        <div class="flex items-center gap-3 mb-4">${meter(a.evidenceLevel, a.evidenceLabel)}<span class="text-[14px] text-[#283527]" style="${SANS}">${a.evidenceLabel}</span></div>
        <div class="bg-[#f5f3ee] p-4"><p class="uppercase tracking-[0.1em] text-[10px] text-[#715a3e] mb-1" style="${SANS}">Verified Potency</p><p class="text-[14px] text-[#444842] leading-relaxed" style="${SANS}">${evidence.body}</p></div>
      </section>
    </div>
    ${refsPanel(a)}${buyBlock(a)}${disclaimer}`;
}

/* ============ TEMPLATE 5 — Comparative / Tradition vs Science (Week 5) ============ */
function tComparative(a) {
  const [origin, benefits, evidence] = a.sections;
  const col = (tag, title, inner) => `
    <div class="flex-1 min-w-0">
      ${eyebrow(tag)}
      <h2 class="text-[#283527] text-[28px] leading-tight mb-1" style="${SERIF}">${title}</h2>
      ${inner}
    </div>`;
  return `
    ${backLink}
    <header class="text-center max-w-3xl mx-auto mb-10">
      ${eyebrow('Botanical Analysis')}
      <h1 class="text-[#283527] leading-[1.1] text-[32px] md:text-[44px]" style="${SERIF}">${a.title}</h1>
      <p class="mt-3 text-[16px] text-[#444842]" style="${SANS}">${a.herb} <span class="italic">(${a.latin})</span> — tradition weighed against the current evidence.</p>
      <p class="mt-2 text-[14px] text-[#444842]" style="${SANS}">${a.date}</p>
    </header>
    <div class="flex flex-col md:flex-row gap-0 md:gap-10 md:divide-x md:divide-[#283527]/15">
      ${col('Traditional Knowledge', origin.label, `
        <p class="italic text-[#715a3e] text-[15px] mb-5" style="${SERIF}">Family ${a.family}</p>
        <div class="aspect-[4/3] overflow-hidden border border-[#283527]/15 mb-5">${illustration(a)}</div>
        <p class="text-[15px] text-[#444842] leading-relaxed" style="${SANS}">${origin.body}</p>`)}
      <div class="flex-1 min-w-0 md:pl-10">${col('Modern Evidence', benefits.label, `
        <p class="text-[15px] text-[#444842] leading-relaxed mb-5" style="${SANS}">${benefits.body}</p>
        <div class="p-5 bg-[#283527] text-white mb-4">
          <h3 class="uppercase tracking-[0.12em] text-[12px] text-[#becca3] mb-2 flex items-center gap-2" style="${SANS};font-weight:600"><span class="material-symbols-outlined text-[15px]">verified</span>${evidence.label}</h3>
          <p class="text-[14px] leading-relaxed text-white/90" style="${SANS}">${evidence.body}</p>
        </div>
        <div class="flex items-center gap-3"><span class="uppercase tracking-[0.1em] text-[11px] text-[#715a3e]" style="${SANS}">Strength</span>${meter(a.evidenceLevel, a.evidenceLabel)}<span class="text-[13px] text-[#283527]" style="${SANS}">${a.evidenceLabel}</span></div>
        ${a.illustration2 ? `<div class="aspect-[4/3] overflow-hidden border border-[#283527]/15 mt-6"><img src="${a.illustration2}" alt="${a.herb} preparations (${a.latin})" class="w-full h-full object-cover"/></div>` : ''}`)}</div>
    </div>
    ${refsPanel(a)}${buyBlock(a)}${disclaimer}`;
}

const TEMPLATES = {
  'Week 1': tModernAsymmetric,
  'Week 2': tThreeColumn,
  'Week 3': tTechnicalMonograph,
  'Week 4': tModularGrid,
  'Week 5': tComparative
};

/* ---------------- Index ---------------- */
function articleCard(a, featured = false) {
  return `
    <a href="/maroon-hub?article=${a.slug}" class="group flex flex-col border border-[#283527]/15 bg-white hover:border-[#283527] transition-colors ${featured ? 'md:flex-row md:col-span-3' : ''}">
      <div class="relative ${featured ? 'md:w-1/2 aspect-[16/10] md:aspect-auto' : 'aspect-[4/3]'} bg-[#eef0e9] flex items-center justify-center p-6 overflow-hidden">
        ${illustration(a, 'transition-transform duration-500 group-hover:scale-105')}
        <span class="absolute top-4 left-4 uppercase tracking-[0.2em] text-[11px] text-[#715a3e]" style="font-family:'Inter',sans-serif">${featured ? 'Featured' : a.family}</span>
      </div>
      <div class="p-6 ${featured ? 'md:w-1/2 md:flex md:flex-col md:justify-center md:p-10' : ''}">
        <span class="block uppercase tracking-[0.15em] text-[11px] text-[#715a3e] mb-2" style="font-family:'Inter',sans-serif">${a.date}</span>
        <h3 class="text-[#283527] leading-snug ${featured ? 'text-[28px] md:text-[34px]' : 'text-[22px]'} mb-2" style="font-family:'Playfair Display',serif">${a.title}</h3>
        <p class="italic text-[#715a3e] text-[15px] mb-4" style="font-family:'Playfair Display',serif">${a.herb} (${a.latin})</p>
        <span class="uppercase tracking-[0.12em] text-[12px] text-[#283527] group-hover:text-[#715a3e] transition-colors" style="font-family:'Inter',sans-serif">Read the journal →</span>
      </div>
    </a>`;
}

function indexView() {
  const [lead, ...rest] = articles;
  return `
    <div class="max-w-[1400px] mx-auto">
      <header class="text-center mb-12">
        <p class="uppercase tracking-[0.3em] text-[12px] text-[#715a3e] mb-4" style="font-family:'Inter',sans-serif;font-weight:600">Maroon Knowledge Hub</p>
        <h1 class="text-[#283527] leading-tight text-[36px] md:text-[54px]" style="font-family:'Playfair Display',serif;font-weight:700">The Botanical Journal</h1>
        <p class="mt-4 text-[17px] text-[#444842] max-w-2xl mx-auto" style="font-family:'Inter',sans-serif">A weekly research brief on the plants behind our collection — reviewing current herbal and botanical science, published across five editions.</p>
      </header>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${lead ? articleCard(lead, true) : ''}
        ${rest.map(a => articleCard(a)).join('')}
      </div>
    </div>`;
}

// "Continue Reading" strip — appended once at the page level so it works the
// same across all five templates. Wraps around to the first article after
// the last, so readers can browse the whole journal without returning to the
// index each time.
function continueReading(current) {
  const i = articles.findIndex(a => a.slug === current.slug);
  const next = articles[(i + 1) % articles.length];
  return `
    <div class="max-w-[1280px] mx-auto mt-10 pt-8 border-t border-[#283527]/10">
      <p class="uppercase tracking-[0.2em] text-[11px] text-[#715a3e] mb-4" style="font-family:'Inter',sans-serif;font-weight:600">Continue Reading</p>
      <a href="/maroon-hub?article=${next.slug}" class="group flex items-center justify-between gap-6 border border-[#283527]/15 bg-white p-5 md:p-6 hover:border-[#283527] transition-colors">
        <div class="min-w-0">
          <p class="italic text-[#715a3e] text-[14px] mb-1" style="font-family:'Playfair Display',serif">${next.herb} (${next.latin})</p>
          <h3 class="text-[#283527] text-[19px] md:text-[22px] leading-snug truncate" style="font-family:'Playfair Display',serif">${next.title}</h3>
        </div>
        <span class="material-symbols-outlined text-[#283527] text-[28px] shrink-0 transition-transform group-hover:translate-x-1">arrow_forward</span>
      </a>
    </div>`;
}

export function MaroonHub() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('article');
  const current = slug ? articles.find(a => a.slug === slug) : null;
  let inner;
  if (current) {
    const render = TEMPLATES[current.week] || tModernAsymmetric;
    inner = `<article class="max-w-[1280px] mx-auto">${render(current)}</article>${continueReading(current)}`;
  } else if (articles.length) {
    inner = indexView();
  } else {
    inner = `<p class="text-center py-16 max-w-[1400px] mx-auto" style="font-family:'Inter',sans-serif">New journal entries are being prepared. Please check back soon.</p>`;
  }
  return `<section class="px-margin-mobile md:px-margin-desktop py-16 md:py-20 min-h-[70vh]" style="background:#fbf9f4">${inner}</section>`;
}
