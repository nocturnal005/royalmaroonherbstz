// Floating "back to top" control — appears once the user has scrolled past
// the hero, returns them to the top of the page on tap.
export function BackToTop() {
  return `
    <button id="back-to-top" type="button" aria-label="Back to top"
            class="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center opacity-0 translate-y-3 pointer-events-none transition-all duration-300 hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
      <span class="material-symbols-outlined">arrow_upward</span>
    </button>
  `;
}

export function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const toggle = () => {
    const show = window.scrollY > 500;
    btn.classList.toggle('opacity-0', !show);
    btn.classList.toggle('translate-y-3', !show);
    btn.classList.toggle('pointer-events-none', !show);
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });

  btn.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
}
