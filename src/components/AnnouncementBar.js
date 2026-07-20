// Top utility bar in the site header: shows the shop's physical address and
// direct phone lines. Rendered above the sticky nav on every page.
export function AnnouncementBar() {
  return `
    <div class="w-full bg-primary border-b border-primary-container z-50">
      <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-2 flex flex-col gap-1 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
        <p class="flex items-center justify-center sm:justify-start gap-2 font-label-sm text-label-sm text-tertiary-fixed-dim">
          <span class="material-symbols-outlined text-[16px] shrink-0" aria-hidden="true">location_on</span>
          <span>Palm Village, Mikocheni B &ndash; Mwai Kibaki Road, Kinondoni District, Dar es Salaam, Tanzania &ndash; East Africa</span>
        </p>
        <p class="flex items-center justify-center sm:justify-end gap-2 font-label-sm text-label-sm text-tertiary-fixed-dim whitespace-nowrap">
          <span class="material-symbols-outlined text-[16px] shrink-0" aria-hidden="true">call</span>
          <a href="tel:+255793306987" class="hover:text-on-primary transition-colors">+255 793 306 987</a>
          <span aria-hidden="true">&middot;</span>
          <a href="tel:+255776908735" class="hover:text-on-primary transition-colors">+255 776 908 735</a>
        </p>
      </div>
    </div>
  `;
}
