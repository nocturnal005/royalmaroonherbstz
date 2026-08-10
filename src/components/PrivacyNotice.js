// First-visit privacy notice.
//
// Deliberately NOT a cookie consent banner: the storefront sets no cookies and
// writes nothing to client-side storage (the cart is in-memory, and there is no
// analytics or advertising script), so asking consent for cookies would be a
// false statement. Instead this states what is actually true — which is also a
// stronger position than the usual banner.
//
// Dismissal is remembered in localStorage. That single functional key is the
// only thing the storefront persists, and it is disclosed in section 8 of the
// Privacy Policy. Keep the two in step: if this key changes or others are
// added, update that section.

const DISMISSED_KEY = 'rmh_privacy_notice_ack';

function isDismissed() {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === '1';
  } catch (e) {
    // Private browsing or storage disabled: fail closed and show the notice
    // rather than throwing. It simply reappears next visit.
    return false;
  }
}

function setDismissed() {
  try {
    window.localStorage.setItem(DISMISSED_KEY, '1');
  } catch (e) {
    // Nothing to do — the notice will show again next visit.
  }
}

export function PrivacyNotice() {
  if (isDismissed()) return '';

  return `
    <div id="privacy-notice" role="region" aria-label="Privacy notice"
         class="fixed bottom-0 left-0 right-0 z-[60] bg-primary-container border-t border-on-primary-fixed-variant px-margin-mobile md:px-margin-desktop py-4">
      <div class="max-w-container-max mx-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <p class="text-xs sm:text-body-md sm:font-body-md text-on-primary-container opacity-90 leading-relaxed flex-1">
          <span class="font-bold text-tertiary-fixed">Your privacy.</span>
          We collect only what is needed to process and deliver your order.
          No tracking cookies, no analytics, no advertising.
        </p>
        <div class="flex items-center gap-3 shrink-0">
          <a href="/privacy"
             class="font-label-md text-label-md uppercase tracking-wider text-tertiary-fixed underline hover:text-on-primary transition-colors">
            Privacy Policy
          </a>
          <button id="privacy-notice-dismiss" type="button"
                  class="bg-tertiary-fixed text-primary font-label-md text-label-md px-6 py-2.5 uppercase tracking-wider hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-tertiary-fixed focus:ring-offset-2">
            Got it
          </button>
        </div>
      </div>
    </div>
  `;
}

export function setupPrivacyNotice() {
  const notice = document.getElementById('privacy-notice');
  if (!notice) return;

  // The notice sits at z-[60], above the back-to-top button (z-50), so it
  // covers that button while showing. That is deliberate: the notice is
  // dismissed in a single tap, and back-to-top is hidden at the top of the page
  // anyway, so lifting the button would add coupling for no real gain.
  const dismiss = document.getElementById('privacy-notice-dismiss');
  if (!dismiss) return;

  dismiss.addEventListener('click', () => {
    setDismissed();
    notice.remove();
  });
}
