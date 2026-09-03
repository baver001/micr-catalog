/* micr.fun — embed external mini-apps with floating cross-nav */
(function () {
  'use strict';

  const body = document.body;
  const slug = body.dataset.surface;
  const category = body.dataset.hubCategory || 'tools';

  if (slug && global.MicrCrossNav) {
    global.MicrCrossNav.mountNav(document.getElementById('micr-cross-nav-root'), {
      slug: slug,
      hubCategory: category,
      placement: 'overlay'
    });
  }
})(window);
