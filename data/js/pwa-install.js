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

  function isStandalone() {
    return Boolean(
      (global.matchMedia && global.matchMedia('(display-mode: standalone)').matches) ||
      global.navigator.standalone === true
    );
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(global.navigator.userAgent || '') && !global.MSStream;
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
    promptInstall: () => promptInstall(),
    isStandalone: () => isStandalone(),
    isIOS: () => isIOS()
  };
})(window);
