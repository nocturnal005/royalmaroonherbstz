export function setupFilterDetailsAdjuster() {
  const detailsElements = document.querySelectorAll('aside details');
  if (detailsElements.length === 0) return;

  const adjustDetails = () => {
    const isDesktop = window.innerWidth >= 768; // md breakpoint matches Tailwind
    detailsElements.forEach(details => {
      if (isDesktop) {
        details.setAttribute('open', '');
      } else {
        details.removeAttribute('open');
      }
    });
  };

  // Run on load and resize
  adjustDetails();
  window.addEventListener('resize', adjustDetails);
}

export function setupIngredientToggles() {
  document.addEventListener('click', (e) => {
    // Check if clicked the toggle button
    const toggleBtn = e.target.closest('.ingredient-toggle-btn');
    if (toggleBtn) {
      e.stopPropagation();
      const card = toggleBtn.closest('.botanical-card');
      if (card) {
        const revealPanel = card.querySelector('.ingredient-reveal');
        if (revealPanel) {
          const isVisible = revealPanel.classList.contains('opacity-100');
          if (isVisible) {
            revealPanel.classList.remove('opacity-100', 'pointer-events-auto');
            revealPanel.classList.add('opacity-0', 'pointer-events-none');
            toggleBtn.setAttribute('aria-expanded', 'false');
          } else {
            revealPanel.classList.add('opacity-100', 'pointer-events-auto');
            revealPanel.classList.remove('opacity-0', 'pointer-events-none');
            toggleBtn.setAttribute('aria-expanded', 'true');
          }
        }
      }
      return;
    }

    // Check if clicked on the active reveal panel itself, close it
    const revealPanel = e.target.closest('.ingredient-reveal');
    if (revealPanel && revealPanel.classList.contains('opacity-100')) {
      revealPanel.classList.remove('opacity-100', 'pointer-events-auto');
      revealPanel.classList.add('opacity-0', 'pointer-events-none');
      const card = revealPanel.closest('.botanical-card');
      const btn = card?.querySelector('.ingredient-toggle-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });
}
