/* micr.fun — cross-surface navigation (mascot → catalog ring) */
(function (global) {
  'use strict';

  var mounted = false;

  function t(key, vars) {
    if (global.micrfun && global.micrfun.t) {
      var s = global.micrfun.t(key);
      if (!vars) return s;
      return s.replace(/\{(\w+)\}/g, function (_, n) {
        return vars[n] !== undefined ? String(vars[n]) : '{' + n + '}';
      });
    }
    return key;
  }

  function categoryFilterUrl(category) {
    if (!category || category === 'all') return '/';
    return '/?category=' + encodeURIComponent(category);
  }

  function loadSurfaces() {
    return fetch('/data/surfaces.json')
      .then(function (r) {
        return r.json();
      })
      .catch(function () {
        return {
          surfaces: {},
          hubFilters: {},
          hubCatalog: ['laziness', 'mapmapmaps', 'cameravox']
        };
      });
  }

  function loadGraph() {
    return fetch('/data/graph.json')
      .then(function (r) {
        return r.json();
      })
      .catch(function () {
        return { cells: {} };
      });
  }

  function catalogList(registry) {
    if (registry.hubCatalog && registry.hubCatalog.length) {
      return registry.hubCatalog.slice();
    }
    return ['laziness', 'mapmapmaps', 'cameravox'];
  }

  function resolveAppTitle(id, registry, graph) {
    if (graph.cells[id] && global.MicrI18n) {
      return global.MicrI18n.resolveCellTitle(graph.cells[id]);
    }
    var key = 'apps.' + id + '.name';
    if (global.micrfun && global.micrfun.t(key) !== key) {
      return global.micrfun.t(key);
    }
    return id;
  }

  function hubCategoryFor(id, registry, graph) {
    if (graph && graph.cells && graph.cells[id] && graph.cells[id].category) {
      return graph.cells[id].category;
    }
    var s = registry.surfaces[id] || {};
    return s.hubCategory || s.category || 'tools';
  }

  function surfaceHref(id, surface, graph) {
    if (graph && graph.cells && graph.cells[id] && graph.cells[id].url) return graph.cells[id].url;
    if (!surface) return '/';
    if (surface.type === 'external' && surface.url) return surface.url;
    return '/' + id + '/';
  }

  function ringNeighbors(slug, list) {
    if (!list.length) return { prev: null, next: null };
    var idx = slug ? list.indexOf(slug) : -1;
    var n = list.length;
    if (idx < 0) {
      return { prev: list[n - 1], next: list[0] };
    }
    return {
      prev: list[(idx - 1 + n) % n],
      next: list[(idx + 1) % n]
    };
  }

  function ensureHost(host) {
    if (host) return host;
    var root = document.getElementById('micr-cross-nav-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'micr-cross-nav-root';
      document.body.appendChild(root);
    }
    return root;
  }

  function mountNav(host, options) {
    host = ensureHost(host);
    if (!host) return null;

    var opts = options || {};
    var slug = opts.slug || null;
    var category = opts.hubCategory || opts.category || 'all';
    var placement = opts.placement || 'overlay';
    var triggerEl =
      typeof opts.trigger === 'string'
        ? document.querySelector(opts.trigger)
        : opts.trigger || null;

    host.className =
      'micr-cross-nav micr-cross-nav--' +
      (placement === 'header' ? 'header' : 'overlay');
    host.innerHTML =
      (placement === 'overlay'
        ? '<button type="button" class="micr-cross-nav__fab" aria-expanded="false" aria-haspopup="dialog" data-i18n-aria="nav.open">' +
          '<span class="micr-cross-nav__fab-mascot" data-micr-mascot data-size="sm"></span></button>'
        : '') +
      '<div class="micr-cross-nav__sheet" role="dialog" aria-modal="false" hidden>' +
      '<p class="micr-cross-nav__title" data-i18n="nav.menu">Navigation</p>' +
      '<nav class="micr-cross-nav__links" aria-label="Cross navigation"></nav>' +
      '<div class="micr-cross-nav__ring"></div>' +
      '<ul class="micr-cross-nav__catalog" aria-label="Catalog"></ul>' +
      '<div class="micr-cross-nav__actions">' +
      '<button type="button" class="micr-cross-nav__install" hidden data-i18n="nav.install">' +
      t('nav.install') +
      '</button></div></div>';

    var fab = host.querySelector('.micr-cross-nav__fab');
    var sheet = host.querySelector('.micr-cross-nav__sheet');
    var links = host.querySelector('.micr-cross-nav__links');
    var ring = host.querySelector('.micr-cross-nav__ring');
    var catalog = host.querySelector('.micr-cross-nav__catalog');
    var installBtn = host.querySelector('.micr-cross-nav__install');
    var mascotApi = null;
    var open = false;
    var suppressOutsideUntil = 0;

    function positionSheet() {
      if (!open || placement !== 'header' || !triggerEl) return;
      var rect = triggerEl.getBoundingClientRect();
      sheet.style.position = 'fixed';
      sheet.style.top = Math.round(rect.bottom + 8) + 'px';
      sheet.style.left = Math.round(rect.left) + 'px';
      sheet.style.right = 'auto';
      sheet.style.bottom = 'auto';
      sheet.style.zIndex = '10001';
    }

    function setExpanded(next) {
      open = next;
      host.classList.toggle('is-expanded', open);
      if (fab) fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (triggerEl) triggerEl.setAttribute('aria-expanded', open ? 'true' : 'false');
      sheet.hidden = !open;
      if (open) {
        positionSheet();
        global.requestAnimationFrame(positionSheet);
      }
    }

    function closeSheet() {
      setExpanded(false);
    }

    function toggleSheet(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      suppressOutsideUntil = Date.now() + 280;
      setExpanded(!open);
    }

    if (fab) {
      fab.addEventListener('click', toggleSheet);
    }
    if (triggerEl) {
      triggerEl.addEventListener('click', toggleSheet);
    }

    global.addEventListener(
      'resize',
      function () {
        if (open) positionSheet();
      },
      { passive: true }
    );

    document.addEventListener('mousedown', function (e) {
      if (!open || Date.now() < suppressOutsideUntil) return;
      if (host.contains(e.target)) return;
      if (triggerEl && triggerEl.contains(e.target)) return;
      closeSheet();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSheet();
    });

    function renderSheet(registry, graph) {
      var surface = slug ? registry.surfaces[slug] || {} : {};
      var list = catalogList(registry);
      var currentCategory = slug && graph.cells[slug] ? graph.cells[slug].category : category;
      var navigationList = currentCategory && currentCategory !== 'all'
        ? list.filter(function (id) { return hubCategoryFor(id, registry, graph) === currentCategory; })
        : list;
      var neighbors = ringNeighbors(slug, navigationList);

      links.innerHTML =
        '<a class="micr-cross-nav__link micr-cross-nav__link--home" href="/">' +
        t('nav.catalog') +
        '</a>';

      if (category && category !== 'all') {
        links.innerHTML +=
          '<span class="micr-cross-nav__sep">/</span>' +
          '<a class="micr-cross-nav__link" href="' +
          categoryFilterUrl(category) +
          '">' +
          t('categories.' + category) +
          '</a>';
      }

      ring.innerHTML = '';
      if (neighbors.prev) {
        var prevSurface = registry.surfaces[neighbors.prev] || {};
        var prevTitle = resolveAppTitle(neighbors.prev, registry, graph);
        ring.innerHTML +=
          '<a class="micr-cross-nav__jump micr-cross-nav__jump--prev" href="' +
          surfaceHref(neighbors.prev, prevSurface, graph) +
          '">' +
          t('nav.prev_app', { name: prevTitle }) +
          '</a>';
      }
      if (neighbors.next) {
        var nextSurface = registry.surfaces[neighbors.next] || {};
        var nextTitle = resolveAppTitle(neighbors.next, registry, graph);
        ring.innerHTML +=
          '<a class="micr-cross-nav__jump micr-cross-nav__jump--next" href="' +
          surfaceHref(neighbors.next, nextSurface, graph) +
          '">' +
          t('nav.next_app', { name: nextTitle }) +
          '</a>';
      }

      catalog.innerHTML = '';
      list.forEach(function (id) {
        var s = registry.surfaces[id] || {};
        var title = resolveAppTitle(id, registry, graph);
        var cat = hubCategoryFor(id, registry, graph);
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = surfaceHref(id, s, graph);
        a.className = 'micr-cross-nav__catalog-link';
        if (id === slug) a.classList.add('is-current');
        a.innerHTML =
          '<span class="micr-cross-nav__catalog-name">' +
          title +
          '</span>' +
          '<span class="micr-cross-nav__catalog-cat">' +
          t('categories.' + cat) +
          '</span>';
        li.appendChild(a);
        catalog.appendChild(li);
      });

      if (placement === 'overlay') {
        var mascotHost = host.querySelector('[data-micr-mascot]');
        if (mascotHost && global.MicrMascot && slug) {
          var m = surface.mascot || {};
          mascotApi = global.MicrMascot.mountMascot(mascotHost, {
            surface: 'miniapp',
            appSlug: slug,
            categoryId: hubCategoryFor(slug, registry, graph) || category,
            accentColor: m.face,
            faceRx: m.rx,
            faceShape: m.shape
          });
        }
      }

      if (slug && installBtn && global.MicrPwa && global.MicrPwa.canInstall()) {
        installBtn.hidden = false;
        installBtn.addEventListener('click', function () {
          global.MicrPwa.promptInstall(slug);
        });
      }
    }

    Promise.all([loadSurfaces(), loadGraph()]).then(function (results) {
      renderSheet(results[0], results[1]);
    });

    if (global.micrfun && global.micrfun.whenReady) {
      global.micrfun.whenReady(function () {
        if (global.micrfun.applyTranslations) {
          global.micrfun.applyTranslations(host);
        }
      });
    }

    return {
      destroy: function () {
        if (mascotApi) mascotApi.destroy();
        host.remove();
      }
    };
  }

  function autoBoot() {
    if (mounted) return;
    var body = document.body;
    var surfaceSlug = body && body.dataset.micrSurface;
    var hubTrigger = document.getElementById('hubMascotNav');

    if (surfaceSlug) {
      mounted = true;
      mountNav(document.getElementById('micr-cross-nav-root'), {
        slug: surfaceSlug,
        hubCategory: body.dataset.hubCategory || 'tools',
        placement: 'overlay'
      });
      return;
    }

    if (hubTrigger) {
      mounted = true;
      mountNav(null, {
        placement: 'header',
        trigger: hubTrigger,
        hubCategory: 'all'
      });
    }
  }

  global.MicrCrossNav = { mountNav: mountNav, autoBoot: autoBoot };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBoot);
  } else {
    autoBoot();
  }
})(window);
