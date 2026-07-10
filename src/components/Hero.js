// Hero — "Restorative Herbal Blends", a faithful native translation of the
// Claude Design handoff `Hero Section.dc.html` (project e-commerce-hero-section).
// The .dc runtime constructs (x-dc, sc-if, style-before/after/hover, {{ }})
// are translated to plain HTML/CSS: coordinates, sizes, colours, fonts,
// shadows, ring pseudo-elements and entrance animations are reproduced exactly
// from the source. Defaults honoured: showCta=true, showNav=false,
// showAnnouncement=false (the site supplies its own nav + announcement bar).
// px positions from the source's 1440x820 canvas are expressed as % so the
// composition scales. Assets: public/images/hero-dc/.

const ACCENT = '#37624A';
const HERB_SHADOW = 'drop-shadow(0 6px 9px rgba(70,62,50,.16))';

// [src, left%, top%, width-clamp] — scattered herb & spice cutouts (z1)
const HERBS = [
  ['h04_bigblend',   60,    15,    'clamp(120px,13vw,198px)'],
  ['h01_greenTL',    14,    18,    'clamp(92px,10vw,158px)'],
  ['h03_tanseeds',   37,    14,    'clamp(82px,9vw,144px)'],
  ['h02_nutmeg2',    25,    11,    'clamp(56px,6vw,96px)'],
  ['h05_cloves',     78,    24,    'clamp(58px,6.5vw,104px)'],
  ['h06_bark',       48.47, 28.78, 'clamp(54px,6vw,96px)'],
  ['h09_clovesLR',   87,    64,    'clamp(54px,6vw,96px)'],
  ['h10_greenBL',    15,    82,    'clamp(92px,10vw,158px)'],
  ['h11_tanseedsB',  28,    86,    'clamp(72px,8vw,124px)'],
  ['h12_greenblendB',41,    84,    'clamp(92px,10vw,158px)'],
  ['h07_almonds',    54,    83,    'clamp(52px,5.5vw,92px)'],
  ['h13_nutmeg3',    73,    85,    'clamp(76px,8vw,128px)'],
  ['h14_podsBR',     86,    81,    'clamp(72px,8vw,126px)']
];

function herbMarkup() {
  return HERBS.map(([name, left, top, width]) => `
      <img src="/images/hero-dc/herb/${name}.png" alt="" aria-hidden="true"
           style="position:absolute; z-index:1; left:${left}%; top:${top}%; width:${width}; transform:translate(-50%,-50%); filter:${HERB_SHADOW};"/>`).join('');
}

export function Hero() {
  return `
    <section class="grain-overlay"
             style="--accent:${ACCENT}; position:relative; width:100%; min-height:clamp(580px,86vh,880px); background:#E1E1DD; overflow:hidden; font-family:'Jost',sans-serif;"
             aria-label="Restorative Herbal Blends">

      <!-- subtle linen vignette (z0) -->
      <div style="position:absolute; inset:0; z-index:0; pointer-events:none; background:radial-gradient(130% 125% at 50% 44%, rgba(255,255,255,.22), rgba(206,203,196,0) 58%, rgba(176,173,165,.32) 100%);"></div>

      <!-- scattered herb & spice cutouts (z1) -->
      ${herbMarkup()}

      <!-- products (z2) -->
      <img src="/images/hero-dc/pouch.png" alt="Guava Leaves Powder" loading="eager"
           class="hero-fade-in"
           style="position:absolute; z-index:2; left:26%; top:50%; width:clamp(158px,16.5vw,250px); transform:translate(-50%,-50%); filter:drop-shadow(0 18px 22px rgba(64,58,46,.26));"/>
      <img src="/images/hero-dc/bottle.png" alt="Halim Capsules" loading="eager"
           class="hero-fade-in"
           style="position:absolute; z-index:2; left:74%; top:55%; width:clamp(126px,13vw,178px); transform:translate(-50%,-50%) rotate(12deg); filter:drop-shadow(0 6px 11px rgba(64,58,46,.2));"/>

      <!-- center badge (z3) -->
      <div class="hero-badge hero-rise-in"
           style="position:absolute; z-index:3; left:50%; top:46%; width:clamp(244px,26vw,348px); height:clamp(244px,26vw,348px); transform:translate(-50%,-50%); border-radius:50%; background:#F5F0E0; box-shadow:0 26px 60px -26px rgba(40,55,42,.55); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:11%;">
        <h1 style="font-family:'Cormorant Garamond',serif; font-weight:500; color:#26352A; font-size:clamp(32px,4vw,56px); line-height:1.06; letter-spacing:.004em; text-align:center;">Restorative<br>Herbal Blends</h1>
      </div>

      <!-- CTA (z4) — hero footer, bottom-centered -->
      <div style="position:absolute; z-index:4; left:50%; bottom:clamp(26px,4.5vh,48px); transform:translateX(-50%); display:flex; align-items:center; justify-content:center;">
        <a href="#collection" class="hero-dc-cta hero-fade-in-slow"
           style="background:rgba(245,240,224,.55); color:var(--accent); font-family:'Jost',sans-serif; font-size:11.5px; font-weight:500; letter-spacing:.28em; text-indent:.28em; text-transform:uppercase; white-space:nowrap; padding:13px 40px; border:1.5px solid var(--accent); border-radius:999px; backdrop-filter:blur(2px);">Explore</a>
      </div>

    </section>
  `;
}

// Single static design — no carousel. Kept as a safe no-op so main.js's
// setupHeroCarousel() call site stays valid.
export function setupHeroCarousel() {
  const container = document.getElementById('hero-carousel');
  if (!container) return;
  const slides = Array.from(container.querySelectorAll('[data-hero-slide]'));
  if (slides.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const DISPLAY_MS = 5000;
  let index = 0;
  setInterval(() => {
    const next = (index + 1) % slides.length;
    slides[index].classList.replace('opacity-100', 'opacity-0');
    slides[next].classList.replace('opacity-0', 'opacity-100');
    index = next;
  }, DISPLAY_MS);
}
