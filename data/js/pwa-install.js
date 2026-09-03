/* Per-surface PWA install helpers (manifest route TBD per app) */
(function (global) {
  'use strict';

  let deferredPrompt = null;

  global.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  function canInstall() {
    return Boolean(deferredPrompt);
  }

  function promptInstall() {
    if (!deferredPrompt) return Promise.resolve(false);
    deferredPrompt.prompt();
    return deferredPrompt.userChoice.then((choice) => {
      deferredPrompt = null;
      return choice.outcome === 'accepted';
    });
  }

  global.MicrPwa = {
    canInstall: () => canInstall(),
    promptInstall: () => promptInstall()
  };
})(window);
