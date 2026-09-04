(function (global) {
  'use strict';

  const VERSION = '0.2.0';
  const REGISTRY_KEY = 'micrfun_registry_snapshot_v1';
  const CATEGORY_LABELS = {
    ru: { games: 'Игры', tools: 'Инструменты', experiments: 'Эксперименты', knowledge: 'Знания', creative: 'Творчество', fun: 'Развлечения' },
    en: { games: 'Games', tools: 'Tools', experiments: 'Experiments', knowledge: 'Knowledge', creative: 'Creative', fun: 'Fun' }
  };
  const COPY = {
    ru: { nav: 'Навигация micr.fun', previous: 'Предыдущее приложение', next: 'Следующее приложение', open: 'Открыть меню приложения', close: 'Закрыть', catalog: 'Весь каталог', install: 'Установить приложение', installed: 'Приложение уже установлено и открыто отдельно.', ios: 'Для установки нажмите «Поделиться», затем «На экран “Домой”».', only: 'В этой категории пока только одно приложение.' },
    en: { nav: 'micr.fun navigation', previous: 'Previous app', next: 'Next app', open: 'Open app menu', close: 'Close', catalog: 'All apps', install: 'Install app', installed: 'This app is already installed and open separately.', ios: 'To install, tap Share, then “Add to Home Screen”.', only: 'There is only one app in this category.' }
  };

  const emit = (name, payload) => {
    const detail = { name, payload: payload || {} };
    global.dispatchEvent(new CustomEvent('micr:analytics', { detail }));
    if (global.MicrAnalytics && typeof global.MicrAnalytics.track === 'function') global.MicrAnalytics.track(name, payload || {});
  };
  const lang = () => document.documentElement.lang && document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'ru';
  const copy = (value, locale) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[locale] || value.ru || value.en || Object.values(value)[0] || '';
  };
  const safe = value => String(value || '').replace(/[&<>\"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\\': '&#92;', '"': '&quot;' }[character]));
  const hrefFor = cell => cell && cell.url ? cell.url : '/';

  function readSnapshot() {
    try {
      const snapshot = JSON.parse(global.localStorage.getItem(REGISTRY_KEY) || 'null');
      if (snapshot && snapshot.graph && snapshot.surfaceData) return snapshot;
    } catch (error) { /* local fallback is best effort */ }
    return { graph: { cells: {} }, surfaceData: { hubCatalog: [], surfaces: {} } };
  }

  function loadRegistry() {
    const fallback = readSnapshot();
    return Promise.all([
      fetch('/data/graph.json').then(response => response.ok ? response.json() : null),
      fetch('/data/surfaces.json').then(response => response.ok ? response.json() : null)
    ]).then(([graph, surfaceData]) => {
      const result = { graph: graph && graph.cells ? graph : fallback.graph, surfaceData: surfaceData || fallback.surfaceData };
      try { global.localStorage.setItem(REGISTRY_KEY, JSON.stringify(result)); } catch (error) { /* cache is optional */ }
      return result;
    }).catch(() => fallback);
  }

  function mount(options) {
    const opts = options || {};
    const slug = opts.slug || document.body.dataset.micrSurface;
    if (!slug || new URLSearchParams(global.location.search).get('preview') === '1') return null;
    const host = opts.root || document.getElementById('micr-shell-root') || document.body;
    if (host.dataset.micrShellMounted === 'true') return null;
    host.dataset.micrShellMounted = 'true';

    const root = document.createElement('div');
    root.className = 'micr-shell-root';
    root.innerHTML = '<div class="micr-shell-dock" aria-label="' + COPY.ru.nav + '">' +
      '<a class="micr-shell-arrow micr-shell-prev" data-action="prev" href="#">‹</a>' +
      '<button class="micr-shell-current" data-action="open" type="button"><span class="micr-shell-mascot-host" data-micr-mascot data-size="sm"></span></button>' +
      '<a class="micr-shell-arrow micr-shell-next" data-action="next" href="#">›</a>' +
      '</div>' +
      '<div class="micr-shell-sheet-backdrop" data-action="close" hidden></div>' +
      '<section class="micr-shell-sheet" role="dialog" aria-modal="true" aria-labelledby="micr-shell-title" hidden>' +
      '<div class="micr-shell-handle" aria-hidden="true"></div>' +
      '<div class="micr-shell-sheet-head"><div><h2 id="micr-shell-title">micr.fun</h2><p class="micr-shell-category"></p></div>' +
      '<button class="micr-shell-close" data-action="close" type="button"></button></div>' +
      '<div class="micr-shell-actions"><a class="micr-shell-action primary" data-action="category" href="#"></a>' +
      '<a class="micr-shell-action" data-action="catalog" href="/"></a><button class="micr-shell-action" data-action="install" type="button"></button></div>' +
      '<div class="micr-shell-siblings" aria-label=""></div><p class="micr-shell-install-note" hidden></p></section>';
    host.appendChild(root);

    const sheet = root.querySelector('.micr-shell-sheet');
    const backdrop = root.querySelector('.micr-shell-sheet-backdrop');
    let lastFocus = null;
    let currentCategory = 'tools';
    let registry = readSnapshot();

    const updateInstall = () => {
      const locale = lang();
      const button = root.querySelector('[data-action="install"]');
      const note = root.querySelector('.micr-shell-install-note');
      button.textContent = COPY[locale].install;
      if (global.MicrPwa && global.MicrPwa.isStandalone && global.MicrPwa.isStandalone()) {
        button.hidden = true;
        note.hidden = false;
        note.textContent = COPY[locale].installed;
      } else if (global.MicrPwa && global.MicrPwa.isIOS && global.MicrPwa.isIOS()) {
        button.hidden = true;
        note.hidden = false;
        note.textContent = COPY[locale].ios;
      } else {
        button.hidden = !(global.MicrPwa && global.MicrPwa.canInstall && global.MicrPwa.canInstall());
        note.hidden = true;
      }
    };
    const close = () => {
      if (sheet.hidden) return;
      sheet.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      global.setTimeout(() => { sheet.hidden = true; backdrop.hidden = true; }, 220);
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
      emit('micr_shell_close', { slug });
    };
    const open = () => {
      lastFocus = document.activeElement;
      sheet.hidden = false;
      backdrop.hidden = false;
      global.requestAnimationFrame(() => { sheet.classList.add('is-open'); backdrop.classList.add('is-open'); root.querySelector('.micr-shell-close').focus(); });
      emit('micr_shell_open', { slug });
    };
    const render = ({ graph, surfaceData }) => {
      registry = { graph, surfaceData };
      const locale = lang();
      const cell = graph.cells[slug] || { slug, url: '/', category: 'tools', title: { ru: slug } };
      const surface = surfaceData.surfaces && surfaceData.surfaces[slug] || {};
      currentCategory = cell.category || 'tools';
      const catalog = Array.isArray(surfaceData.hubCatalog) ? surfaceData.hubCatalog : Object.keys(graph.cells);
      const ids = catalog.filter(id => graph.cells[id]);
      if (!ids.includes(slug)) ids.push(slug);
      const siblings = ids.filter(id => (graph.cells[id].category || '') === currentCategory);
      const position = siblings.indexOf(slug);
      const previous = siblings.length > 1 ? siblings[(position - 1 + siblings.length) % siblings.length] : null;
      const next = siblings.length > 1 ? siblings[(position + 1) % siblings.length] : null;
      const labels = CATEGORY_LABELS[locale] || CATEGORY_LABELS.ru;
      const strings = COPY[locale] || COPY.ru;
      root.querySelector('.micr-shell-dock').setAttribute('aria-label', strings.nav);
      root.querySelector('.micr-shell-current').setAttribute('aria-label', strings.open);
      root.querySelector('.micr-shell-prev').setAttribute('aria-label', strings.previous);
      root.querySelector('.micr-shell-next').setAttribute('aria-label', strings.next);
      root.querySelector('.micr-shell-close').textContent = '×';
      root.querySelector('.micr-shell-close').setAttribute('aria-label', strings.close);
      root.querySelector('#micr-shell-title').textContent = copy(cell.title, locale) || slug;
      root.querySelector('.micr-shell-category').textContent = labels[currentCategory] || currentCategory;
      const categoryLink = root.querySelector('[data-action="category"]');
      categoryLink.href = '/' + encodeURIComponent(currentCategory) + '/';
      categoryLink.textContent = (labels[currentCategory] || currentCategory) + ' →';
      root.querySelector('[data-action="catalog"]').textContent = strings.catalog;
      const prevLink = root.querySelector('.micr-shell-prev');
      const nextLink = root.querySelector('.micr-shell-next');
      prevLink.href = previous ? hrefFor(graph.cells[previous]) : '#';
      nextLink.href = next ? hrefFor(graph.cells[next]) : '#';
      prevLink.hidden = !previous;
      nextLink.hidden = !next;
      const siblingHost = root.querySelector('.micr-shell-siblings');
      siblingHost.setAttribute('aria-label', labels[currentCategory] || currentCategory);
      siblingHost.innerHTML = siblings.filter(id => id !== slug).map(id => {
        const item = graph.cells[id];
        return '<a class="micr-shell-sibling" data-sibling="' + safe(id) + '" href="' + safe(hrefFor(item)) + '"><strong>' + safe(copy(item.title, locale) || id) + '</strong><small>' + safe(labels[item.category] || item.category) + '</small></a>';
      }).join('') || '<span class="micr-shell-install-note">' + strings.only + '</span>';
      if (global.MicrMascot && global.MicrMascot.mountMascot) {
        const mascot = surface.mascot || {};
        global.MicrMascot.mountMascot(root.querySelector('[data-micr-mascot]'), { surface: 'miniapp', appSlug: slug, categoryId: currentCategory, accentColor: mascot.face, faceRx: mascot.rx, faceShape: mascot.shape });
      }
      updateInstall();
      if (global.MicrPwa && global.MicrPwa.isStandalone && global.MicrPwa.isStandalone()) emit('standalone_launch', { slug });
    };

    root.addEventListener('click', event => {
      const target = event.target.closest('[data-action]');
      const action = target && target.dataset.action;
      if (action === 'open' || action === 'close') { event.preventDefault(); action === 'open' ? open() : close(); }
      if (action === 'prev' && !target.hidden) emit('micr_prev_app', { from: slug, to: target.href });
      if (action === 'next' && !target.hidden) emit('micr_next_app', { from: slug, to: target.href });
      if (action === 'category') emit('micr_category_open', { category: currentCategory });
      if (action === 'catalog') emit('micr_catalog_open', { from: slug });
      if (action === 'install') {
        emit('micr_install_intent', { slug });
        if (global.MicrPwa && global.MicrPwa.promptInstall) global.MicrPwa.promptInstall().then(accepted => { if (accepted) emit('micr_install_completed', { slug }); updateInstall(); });
      }
      if (target && target.dataset.sibling) emit('micr_sibling_open', { from: slug, to: target.dataset.sibling });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') close();
      if (sheet.hidden || event.key !== 'Tab') return;
      const focusables = Array.from(sheet.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])')).filter(item => !item.hidden);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    global.addEventListener('micr:pwa-installable', updateInstall);
    global.addEventListener('langchange', () => render(registry));
    global.addEventListener('visibilitychange', updateInstall);
    loadRegistry().then(render);
    return { version: VERSION, open, close };
  }

  global.MicrShell = { version: VERSION, mount };
})(window);
