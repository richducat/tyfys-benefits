(function () {
  const primaryLinks = [
    { label: 'Home', href: 'index.html', group: 'Primary', icon: 'home' },
    { label: 'About Us', href: 'about_us.html', group: 'Primary', icon: 'info' },
    { label: 'Our Team', href: 'mission_team.html', group: 'Primary', icon: 'users' },
    { label: 'Our Process', href: 'process.html', group: 'Primary', icon: 'route' }
  ];

  const claimTypes = [
    {
      label: 'Mental Health & PTSD',
      href: 'mental-health-ptsd.html',
      group: 'VA Claims',
      icon: 'brain',
      description: 'Therapy DBQs, stressor statements, and nexus support.'
    },
    {
      label: 'Back, Neck & Joints',
      href: 'back-neck-joints.html',
      group: 'VA Claims',
      icon: 'bone',
      description: 'Orthopedic exams, ROM charts, and pain documentation.'
    },
    {
      label: 'Intake',
      href: 'intake-portal.html',
      group: 'VA Claims',
      icon: 'clipboard-list',
      description: 'Start your VA claim intake with our team.'
    }
  ];

  const resources = [
    {
      label: 'Backpay Calculator',
      href: 'calculator.html',
      group: 'Resources',
      icon: 'calculator',
      description: 'Project potential monthly increases instantly.'
    },
    {
      label: 'Compare: VSO vs. Us',
      href: 'comparison.html',
      group: 'Resources',
      icon: 'scale',
      description: 'Understand how private evidence accelerates claims.'
    },
    {
      label: 'Briefing Room',
      href: 'education.html',
      group: 'Resources',
      icon: 'graduation-cap',
      description: 'Step-by-step guides to avoid VA claim pitfalls.'
    },
    {
      label: 'Blog',
      href: 'blog.html',
      group: 'Resources',
      icon: 'book-open',
      description: 'Expert commentary on ratings, appeals, and benefits.'
    }
  ];

  const quickActions = [
    {
      label: 'Book Discovery Call',
      href: 'contact.html',
      group: 'Actions',
      icon: 'phone',
      description: 'Talk with our team about your claim strategy.'
    }
  ];

  function renderIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function loadZohoChatbot() {
    window.$zoho = window.$zoho || {};
    window.$zoho.salesiq = window.$zoho.salesiq || {
      widgetcode:
        'siq35bf0a29016e5b6eae510612bb880161a4e56e656f3acdb27e7710a7382ec6a67487e3bc88487509391c82b8bc489eba',
      values: {},
      ready: function () {}
    };

    if (document.getElementById('zsiqscript')) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'zsiqscript';
    script.defer = true;
    script.src = 'https://salesiq.zoho.com/widget';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else if (document.head) {
      document.head.appendChild(script);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('[data-site-nav]');
    if (!nav) return;

    const navLinks = [...primaryLinks, ...claimTypes, ...resources, ...quickActions];

    // Glassmorphism scroll state
    const setNavSurface = () => {
      const scrolled = window.scrollY > 12;
      nav.classList.toggle('is-scrolled', scrolled);
    };
    setNavSurface();
    window.addEventListener('scroll', setNavSurface, { passive: true });

    // Accessibility controls
    const root = document.documentElement;
    let fontScale = 1;

    const applyFontScale = () => {
      const scale = clamp(fontScale, 0.9, 1.25);
      root.style.setProperty('--font-scale', scale.toFixed(2));
      root.style.fontSize = `${16 * scale}px`;
    };

    const toggleButton = nav.querySelector('[data-accessibility-toggle]');
    const panel = nav.querySelector('[data-accessibility-panel]');

    toggleButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      const expanded = toggleButton.getAttribute('aria-expanded') === 'true';
      toggleButton.setAttribute('aria-expanded', (!expanded).toString());
      panel?.classList.toggle('hidden', expanded);
    });

    document.addEventListener('click', (event) => {
      if (!panel || !toggleButton) return;
      if (panel.contains(event.target) || toggleButton.contains(event.target)) return;
      panel.classList.add('hidden');
      toggleButton.setAttribute('aria-expanded', 'false');
    });

    nav.querySelectorAll('[data-font-increase]').forEach((button) => {
      button.addEventListener('click', () => {
        fontScale = clamp(fontScale + 0.05, 0.9, 1.25);
        applyFontScale();
      });
    });

    nav.querySelectorAll('[data-font-decrease]').forEach((button) => {
      button.addEventListener('click', () => {
        fontScale = clamp(fontScale - 0.05, 0.9, 1.25);
        applyFontScale();
      });
    });

    nav.querySelectorAll('[data-contrast-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const enabled = document.body.classList.toggle('high-contrast');
        button.setAttribute('aria-pressed', enabled.toString());
      });
    });

    nav.querySelectorAll('[data-grayscale-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const enabled = document.body.classList.toggle('grayscale-mode');
        button.setAttribute('aria-pressed', enabled.toString());
      });
    });

    applyFontScale();

    // Mobile drawer
    const mobileToggle = nav.querySelector('[data-mobile-menu-toggle]');
    const mobileContainer = nav.querySelector('[data-mobile-drawer-container]');
    const mobileOverlay = nav.querySelector('[data-mobile-overlay]');
    const mobileDrawer = nav.querySelector('[data-mobile-drawer]');
    const mobileClose = nav.querySelector('[data-mobile-close]');

    const isDrawerOpen = () => mobileToggle?.getAttribute('aria-expanded') === 'true';

    function closeDrawer() {
      if (!mobileContainer || !mobileOverlay || !mobileDrawer || !mobileToggle) return;
      mobileOverlay.classList.add('opacity-0');
      mobileDrawer.classList.add('translate-x-full');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('overflow-hidden');
      mobileOverlay.addEventListener(
        'transitionend',
        () => {
          mobileContainer.classList.add('hidden');
          mobileContainer.classList.add('pointer-events-none');
        },
        { once: true }
      );
    }

    function openDrawer() {
      if (!mobileContainer || !mobileOverlay || !mobileDrawer || !mobileToggle) return;
      mobileContainer.classList.remove('hidden');
      mobileContainer.classList.remove('pointer-events-none');
      document.body.classList.add('overflow-hidden');
      mobileToggle.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => {
        mobileOverlay.classList.remove('opacity-0');
        mobileDrawer.classList.remove('translate-x-full');
      });
    }

    mobileToggle?.addEventListener('click', () => {
      if (isDrawerOpen()) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    mobileOverlay?.addEventListener('click', closeDrawer);
    mobileClose?.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    });

    nav.querySelectorAll('[data-mobile-cta]').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });

    // Command palette
    const palette = nav.querySelector('[data-command-palette]');
    const paletteInput = palette?.querySelector('[data-command-input]');
    const paletteResults = palette?.querySelector('[data-command-results]');
    const paletteTriggers = nav.querySelectorAll('[data-command-trigger]');
    const paletteClosers = palette?.querySelectorAll('[data-command-close]') ?? [];

    const renderList = (items) => {
      if (!paletteResults) return;
      paletteResults.innerHTML = '';

      if (!items.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'px-5 py-6 text-sm text-slate-500';
        emptyState.textContent = 'No matches found. Try a broader search.';
        paletteResults.appendChild(emptyState);
        return;
      }

      const grouped = items.reduce((acc, item) => {
        acc[item.group] = acc[item.group] || [];
        acc[item.group].push(item);
        return acc;
      }, {});

      Object.entries(grouped).forEach(([group, entries]) => {
        const label = document.createElement('div');
        label.className = 'command-group-label';
        label.textContent = group;
        paletteResults.appendChild(label);

        entries.forEach((item) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'command-result';
          button.innerHTML = `
            <div class="flex items-center gap-3">
              <span class="h-9 w-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center"><i data-lucide="${item.icon}"></i></span>
              <div class="flex-1 text-left">
                <p class="text-sm font-semibold text-slate-900">${item.label}</p>
                ${item.description ? `<p class="text-xs text-slate-500 mt-0.5">${item.description}</p>` : ''}
              </div>
              <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">${item.group}</span>
            </div>
          `;
          button.addEventListener('click', () => {
            window.location.href = item.href;
            closePalette();
          });
          paletteResults.appendChild(button);
        });
      });

      renderIcons();
    };

    const openPalette = () => {
      if (!palette) return;
      if (isDrawerOpen()) closeDrawer();
      palette.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      renderList(navLinks);
      paletteInput?.focus();
    };

    const closePalette = () => {
      if (!palette) return;
      palette.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      if (paletteInput) paletteInput.value = '';
      renderList(navLinks);
    };

    paletteTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        openPalette();
      });
    });

    paletteClosers.forEach((closer) => {
      closer.addEventListener('click', closePalette);
    });

    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        openPalette();
      }
      if (key === 'escape' && palette && !palette.classList.contains('hidden')) {
        closePalette();
      }
    });

    paletteInput?.addEventListener('input', (event) => {
      const value = event.target.value.toLowerCase();
      const filtered = navLinks.filter((item) => {
        const haystack = `${item.label} ${item.description || ''}`.toLowerCase();
        return haystack.includes(value);
      });
      renderList(filtered);
    });

    palette?.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.hasAttribute('data-command-close')) {
        closePalette();
      }
    });

    loadZohoChatbot();

    // Re-render lucide icons after DOM is ready
    renderIcons();
  });
})();
