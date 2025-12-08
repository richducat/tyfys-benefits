(function() {
  const links = [
    { label: 'Home', href: 'index.html' },
    { label: 'About Us', href: 'about_us.html' },
    { label: 'Our Team', href: 'mission_team.html' },
    { label: 'Our Process', href: 'process.html' },
    { label: 'Intake', href: 'intake-portal.html' },
  ];

  const claimTypes = [
    { label: 'Mental Health & PTSD', href: 'claims_mental_health.html' },
    { label: 'Back, Neck & Joints', href: 'claims_musculoskeletal.html' },
  ];

  const resources = [
    { label: 'Backpay Calculator', href: 'calculator.html' },
    { label: 'Compare: VSO vs. Us', href: 'comparison.html' },
    { label: 'Briefing Room', href: 'education.html' },
    { label: 'Blog', href: 'blog.html' },
  ];

  function createLink({ label, href }) {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.textContent = label;
    anchor.className = 'block w-full text-left px-4 py-3 rounded-lg font-semibold text-slate-800 hover:bg-navy-50 hover:text-navy-800 transition';
    anchor.setAttribute('role', 'menuitem');
    return anchor;
  }

  function createSection(title, items) {
    const section = document.createElement('div');
    section.className = 'space-y-2';

    const header = document.createElement('p');
    header.className = 'text-xs font-bold uppercase tracking-[0.2em] text-slate-400 px-2';
    header.textContent = title;
    section.appendChild(header);

    items.forEach((item) => section.appendChild(createLink(item)));
    return section;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const toggleButton = nav?.querySelector('[data-mobile-menu-toggle]');

    if (!nav || !toggleButton) return;

    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'md:hidden fixed inset-0 z-50 hidden';

    menuWrapper.innerHTML = `
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm opacity-0 transition-opacity duration-300" data-mobile-overlay></div>
      <div class="absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl transform translate-x-full transition-transform duration-300" data-mobile-panel>
        <div class="flex items-center justify-between h-16 px-5 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <i data-lucide="shield-check" class="h-6 w-6 text-navy-800"></i>
            <span class="font-serif font-bold text-lg text-slate-900">TYFYS</span>
          </div>
          <button type="button" class="text-slate-500 hover:text-slate-700" aria-label="Close navigation" data-mobile-menu-close>
            <i data-lucide="x" class="h-6 w-6"></i>
          </button>
        </div>
        <div class="h-[calc(100%-4rem)] overflow-y-auto p-5 space-y-6" data-mobile-menu>
          <div class="space-y-2" data-mobile-primary></div>
          <div class="space-y-2" data-mobile-claims></div>
          <div class="space-y-2" data-mobile-resources></div>
          <a href="contact.html" class="block text-center bg-navy-800 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-navy-900 transition" data-mobile-cta>Book Discovery Call</a>
        </div>
      </div>
    `;

    const overlay = menuWrapper.querySelector('[data-mobile-overlay]');
    const panel = menuWrapper.querySelector('[data-mobile-panel]');
    const closeButton = menuWrapper.querySelector('[data-mobile-menu-close]');
    const primaryContainer = menuWrapper.querySelector('[data-mobile-primary]');
    const claimContainer = menuWrapper.querySelector('[data-mobile-claims]');
    const resourceContainer = menuWrapper.querySelector('[data-mobile-resources]');
    const menuLinks = menuWrapper.querySelector('[data-mobile-menu]');

    links.forEach((item) => primaryContainer.appendChild(createLink(item)));
    claimContainer.appendChild(createSection('Claim Types', claimTypes));
    resourceContainer.appendChild(createSection('Resources', resources));

    function openMenu() {
      menuWrapper.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      toggleButton.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        panel.classList.remove('translate-x-full');
      });
    }

    function closeMenu() {
      overlay.classList.add('opacity-0');
      panel.classList.add('translate-x-full');
      toggleButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('overflow-hidden');
      overlay.addEventListener('transitionend', () => menuWrapper.classList.add('hidden'), { once: true });
    }

    toggleButton.addEventListener('click', () => {
      const expanded = toggleButton.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay?.addEventListener('click', closeMenu);
    closeButton?.addEventListener('click', closeMenu);

    menuLinks?.addEventListener('click', (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggleButton.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });

    document.body.appendChild(menuWrapper);

    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  });
})();
