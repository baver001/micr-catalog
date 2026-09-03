/* micr.fun — Reusable Mascot Component */
(function initMascot() {
  function setup() {
    const mascot = document.getElementById('mascot');
    if (!mascot || mascot.dataset.mascotInitialized) return;
    mascot.dataset.mascotInitialized = 'true';

    const pupils = mascot.querySelectorAll('[data-mascot-pupil]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function lookAt(clientX, clientY) {
      if (typeof clientX !== 'number' || typeof clientY !== 'number') return;
      const rect = mascot.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (clientX - (rect.left + rect.width / 2)) / 180));
      const y = Math.max(-1, Math.min(1, (clientY - (rect.top + rect.height / 2)) / 140));
      pupils.forEach(pupil => {
        pupil.style.transform = `translate(${x * 3}px, ${y * 2}px)`;
      });
    }

    document.addEventListener('pointerdown', event => lookAt(event.clientX, event.clientY), { passive: true });
    mascot.addEventListener('focus', () => mascot.classList.add('is-happy'));
    mascot.addEventListener('blur', () => mascot.classList.remove('is-happy'));
    mascot.addEventListener('mouseenter', () => mascot.classList.add('is-happy'));
    mascot.addEventListener('mouseleave', () => {
      if (document.activeElement !== mascot) mascot.classList.remove('is-happy');
    });

    let blinkInterval = null;
    function startBlinking() {
      if (reducedMotion.matches) return;
      if (blinkInterval) clearInterval(blinkInterval);
      blinkInterval = window.setInterval(() => {
        if (document.hidden) return;
        mascot.classList.add('is-blinking');
        window.setTimeout(() => mascot.classList.remove('is-blinking'), 130);
      }, 4200);
    }

    startBlinking();

    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) {
          if (blinkInterval) {
            clearInterval(blinkInterval);
            blinkInterval = null;
          }
        } else {
          startBlinking();
        }
      });
    }

    window.updateMascotLang = function (lang) {
      if (!mascot) return;
      if (lang === 'ru') {
        mascot.setAttribute('aria-label', 'Маскот micr.fun');
        mascot.setAttribute('title', 'Привет!');
      } else {
        mascot.setAttribute('aria-label', 'micr.fun mascot');
        mascot.setAttribute('title', 'Hello!');
      }
    };

    if (window.MicrCatalog && typeof window.MicrCatalog.getLang === 'function') {
      window.updateMascotLang(window.MicrCatalog.getLang());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
