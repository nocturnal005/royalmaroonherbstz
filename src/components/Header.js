import { botanicalFilters } from './FilterSidebar.js';

export function Header() {
  return `
    <header class="sticky top-0 left-0 right-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto bg-surface dark:bg-surface-container border-b border-secondary-container transition-all duration-300">
      <div class="flex items-center gap-4 xl:gap-8">
        <a href="#" class="flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" aria-label="Royal Maroon Herbs Home">
          <img src="/images/brand/logo.png" alt="Royal Maroon Herbs Logo" class="h-20 w-auto object-contain" />
        </a>
        <nav class="hidden lg:flex items-center gap-4 xl:gap-6" aria-label="Main Navigation">
          <a class="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" href="/about">About Us</a>
          <a class="font-label-md text-label-md text-primary font-bold border-b-2 border-tertiary-fixed-dim pb-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" href="/">Shop</a>

          <div class="relative">
            <button id="desktop-wellness-btn" class="flex items-center gap-1 font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" aria-expanded="false" aria-haspopup="true">
              Botanicals
              <span class="material-symbols-outlined text-sm transition-transform duration-200" id="desktop-wellness-icon">expand_more</span>
            </button>
            <!-- Two columns of five so the 10 sections stay a compact height -->
            <div id="desktop-wellness-menu" class="absolute left-0 top-full mt-2 w-[22rem] bg-surface/95 backdrop-blur-md border border-surface/20 shadow-lg rounded-xl grid grid-rows-5 grid-flow-col gap-x-1 p-1.5 hidden z-50 overflow-hidden">
              ${botanicalFilters.map(([value, label]) => `
                <a href="/#cat-${value}" class="block px-4 py-2.5 font-label-sm text-label-sm text-secondary hover:text-primary hover:bg-surface-variant transition-colors rounded-lg">${label}</a>
              `).join('')}
            </div>
          </div>

          <a class="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" href="/maroon-hub">Maroon Hub</a>
          <a class="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" href="/wholesale">Wholesale</a>
          <a class="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" href="#contact">Contact</a>
        </nav>
      </div>
      <div class="flex items-center gap-6">
        <button id="search-btn" class="flex items-center gap-1.5 bg-primary text-on-primary rounded-[999px] px-3 py-2 sm:px-5 sm:py-2.5 hover:bg-primary-container transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" aria-label="Search">
          <span class="material-symbols-outlined text-[20px]" data-icon="search">search</span>
          <span class="hidden sm:inline font-label-md text-label-md uppercase tracking-wider">Search</span>
        </button>
        <button class="text-primary hover:text-tertiary-fixed-variant transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1" aria-label="Account">
          <span class="material-symbols-outlined" data-icon="person">person</span>
        </button>
        <button id="cart-btn" class="text-primary hover:text-tertiary-fixed-variant transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1" aria-label="Shopping Cart">
          <span class="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
          <span id="cart-badge" class="absolute -top-2 -right-2 bg-tertiary-container text-on-tertiary-container text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">0</span>
        </button>
        <!-- Mobile Hamburger Menu Button -->
        <button id="mobile-menu-toggle" class="lg:hidden text-primary hover:text-tertiary-fixed-variant transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1" aria-label="Open Navigation Menu" aria-expanded="false">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-menu" class="hidden lg:!hidden absolute top-20 left-0 right-0 bg-surface border-b border-secondary-container p-6 flex flex-col gap-4 shadow-lg z-40 transition-all duration-300 max-h-[calc(100vh-5rem)] overflow-y-auto">
        <nav class="flex flex-col gap-4" aria-label="Mobile Navigation">
          <a class="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary p-2" href="/about">About Us</a>
          <a class="font-label-md text-label-md text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary p-2" href="/">Shop</a>

          <div>
            <button id="mobile-wellness-btn" class="w-full flex items-center justify-between font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary p-2">
              Botanicals
              <span class="material-symbols-outlined text-sm transition-transform duration-200" id="mobile-wellness-icon">expand_more</span>
            </button>
            <div id="mobile-wellness-menu" class="hidden flex-col pl-4 mt-2 border-l-2 border-surface-variant">
              ${botanicalFilters.map(([value, label]) => `
                <a href="/#cat-${value}" class="block p-2 font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">${label}</a>
              `).join('')}
            </div>
          </div>

          <a class="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary p-2" href="/maroon-hub">Maroon Hub</a>
          <a class="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary p-2" href="/wholesale">Wholesale</a>
          <a class="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary p-2" href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  `;
}

export function setupHeaderScrollListener() {
  const header = document.querySelector('header');
  if (!header) return;

  // "Contact" links scroll to the footer address block (id="contact").
  // On a long page the lazy-loaded product images below the fold shift the
  // footer down mid-scroll, so a one-shot native hash jump lands short; and
  // re-clicking when the hash is already #contact does nothing. Handle it
  // explicitly, with a corrective re-scroll once the layout has settled.
  if (!window.__contactScrollBound) {
    window.__contactScrollBound = true;
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href="#contact"]');
      if (!link) return;
      e.preventDefault();
      const el = document.getElementById('contact');
      if (!el) return;
      try { history.replaceState(null, '', '#contact'); } catch (_) {}
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 550);
    });
  }

  // Visual feedback: Add shadow/opacity on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('shadow-md');
      header.classList.add('bg-surface/95');
      header.classList.remove('bg-surface');
    } else {
      header.classList.remove('shadow-md');
      header.classList.remove('bg-surface/95');
      header.classList.add('bg-surface');
    }
  });

  // Mobile menu toggle logic
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      toggleBtn.innerHTML = isExpanded 
        ? '<span class="material-symbols-outlined">menu</span>' 
        : '<span class="material-symbols-outlined">close</span>';
      
      if (isExpanded) {
        mobileMenu.classList.add('hidden');
      } else {
        mobileMenu.classList.remove('hidden');
      }
    });

    // Close the mobile menu when any nav link inside it is tapped (anchor
    // links scroll without a reload, so the menu must dismiss itself).
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
      });
    });

    // Close mobile menu on window resize if switching to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) { // lg breakpoint — desktop nav takes over
        if (!mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
        }
      }
    });
  }

  // Desktop Wellness Dropdown Logic
  const desktopBtn = document.getElementById('desktop-wellness-btn');
  const desktopMenu = document.getElementById('desktop-wellness-menu');
  const desktopIcon = document.getElementById('desktop-wellness-icon');

  if (desktopBtn && desktopMenu) {
    desktopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      desktopMenu.classList.toggle('hidden');
      desktopIcon.classList.toggle('rotate-180');
    });

    document.addEventListener('click', (e) => {
      if (!desktopBtn.contains(e.target) && !desktopMenu.contains(e.target)) {
        desktopMenu.classList.add('hidden');
        desktopIcon.classList.remove('rotate-180');
      }
    });
  }

  // Mobile Wellness Dropdown Logic
  const mobileWellnessBtn = document.getElementById('mobile-wellness-btn');
  const mobileWellnessMenu = document.getElementById('mobile-wellness-menu');
  const mobileWellnessIcon = document.getElementById('mobile-wellness-icon');

  if (mobileWellnessBtn && mobileWellnessMenu) {
    mobileWellnessBtn.addEventListener('click', () => {
      mobileWellnessMenu.classList.toggle('hidden');
      mobileWellnessMenu.classList.toggle('flex');
      mobileWellnessIcon.classList.toggle('rotate-180');
    });
  }
}
