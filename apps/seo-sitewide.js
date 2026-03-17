(function () {
  var disclaimerId = 'tyfys-what-we-do-disclaimer';

  function createDisclaimerBlock() {
    var section = document.createElement('section');
    section.id = disclaimerId;
    section.className = 'bg-amber-50 border-y border-amber-200 py-5';
    section.setAttribute('aria-label', 'Service disclaimer');
    section.innerHTML =
      '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
      '<p class="text-sm md:text-base text-amber-900 leading-relaxed">' +
      '<strong class="font-semibold">What we do:</strong> We coordinate private medical evidence (DBQs and independent medical opinions) to support veterans\' disability claims. We do not provide legal advice, representation, or submit VA claims.' +
      '</p>' +
      '<div class="mt-3 flex flex-wrap gap-3 text-sm">' +
      '<a href="services.html" class="text-navy-800 underline hover:text-navy-700">Services</a>' +
      '<a href="faqs.html" class="text-navy-800 underline hover:text-navy-700">FAQs</a>' +
      '<a href="how-it-works.html" class="text-navy-800 underline hover:text-navy-700">How It Works</a>' +
      '</div>' +
      '</div>';

    return section;
  }

  function insertDisclaimer() {
    if (
      !document.body ||
      document.getElementById(disclaimerId) ||
      document.documentElement.classList.contains('embed-mode') ||
      document.body.dataset.page === 'app' ||
      document.body.dataset.page === 'sign-up'
    ) {
      return;
    }

    var disclaimer = createDisclaimerBlock();
    var footer = document.querySelector('footer');

    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(disclaimer, footer);
      return;
    }

    var lastMain = document.querySelector('main');
    if (lastMain && lastMain.parentNode) {
      if (lastMain.nextSibling) {
        lastMain.parentNode.insertBefore(disclaimer, lastMain.nextSibling);
      } else {
        lastMain.parentNode.appendChild(disclaimer);
      }
      return;
    }

    document.body.appendChild(disclaimer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertDisclaimer);
  } else {
    insertDisclaimer();
  }
})();
