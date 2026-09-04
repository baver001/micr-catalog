/* Lightweight per-surface install contract. */
(function (global) {
  'use strict';

  let deferredPrompt = null;
  const announce = () => global.dispatchEvent(new CustomEvent('micr:pwa-installable'));

  global.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    announce();
  });
  global.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    announce();
  });

  const isStandalone = () => Boolean(
    (global.matchMedia && global.matchMedia('(display-mode: standalone)').matches) ||
    global.navigator.standalone === true
  );
  const isIOS = () => /iphone|ipad|ipod/i.test(global.navigator.userAgent || '') && !global.MSStream;

  global.MicrPwa = {
    canInstall: () => Boolean(deferredPrompt) && !isStandalone(),
    promptInstall: async () => {
      if (!deferredPrompt || isStandalone()) return false;
      const prompt = deferredPrompt;
      deferredPrompt = null;
      prompt.prompt();
      const choice = await prompt.userChoice;
      announce();
      return choice && choice.outcome === 'accepted';
    },
    isStandalone,
    isIOS
  };
})(window);
