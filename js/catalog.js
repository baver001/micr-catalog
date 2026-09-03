/* micr.fun — общий каталог-рендерер из data/graph.json */
(function () {
  const LANG_STORAGE_KEY = 'micrfun_lang';

  const I18N = {
    ru: {
      docTitle: 'micr.fun — Каталог микроприложений',
      searchPlaceholder: 'Найти приложение...',
      emptyState: 'Ничего не найдено',
      categoryEmptyState: 'В этой категории пока пусто',
      loadError: 'Не удалось загрузить каталог',
      openApp: 'Открыть ',
      screenshotAlt: 'Скриншот: ',
      missingPreview: 'Предпросмотр недоступен',
      backLink: '← micr.fun',
      footer: 'micr.fun · 2026',
      categories: {
        all: 'Все',
        games: 'Игры',
        tools: 'Инструменты',
        experiments: 'Эксперименты',
        knowledge: 'Знания'
      }
    },
    en: {
      docTitle: 'micr.fun — Micro-app catalog',
      searchPlaceholder: 'Search apps...',
      emptyState: 'Nothing found',
      categoryEmptyState: 'This category is empty',
      loadError: 'Failed to load catalog',
      openApp: 'Open ',
      screenshotAlt: 'Screenshot: ',
      missingPreview: 'Preview unavailable',
      backLink: '← micr.fun',
      footer: 'micr.fun · 2026',
      categories: {
        all: 'All',
        games: 'Games',
        tools: 'Tools',
        experiments: 'Experiments',
        knowledge: 'Knowledge'
      }
    }
  };

  function detectLanguage() {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored === 'ru' || stored === 'en') return stored;
    } catch (e) {}

    const navLangs = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ''];

    for (const l of navLangs) {
      if (typeof l === 'string' && l.toLowerCase().startsWith('ru')) {
        return 'ru';
      }
    }
    return 'en';
  }

  let currentLang = detectLanguage();

  window.MicrCatalog = {
    i18n: I18N,
    storageKey: LANG_STORAGE_KEY,

    getLang() {
      return currentLang;
    },

    setLang(lang) {
      if (lang !== 'ru' && lang !== 'en') lang = 'en';
      currentLang = lang;
      try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch (e) {}
      document.documentElement.lang = lang;
      if (typeof window.updateMascotLang === 'function') {
        window.updateMascotLang(lang);
      }
      try {
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
      } catch (e) {}
      return currentLang;
    },

    t(key, lang) {
      const l = lang || currentLang;
      const dict = I18N[l] || I18N.en;
      const parts = key.split('.');
      let val = dict;
      for (const p of parts) {
        if (val && typeof val === 'object' && p in val) {
          val = val[p];
        } else {
          return key;
        }
      }
      return typeof val === 'string' ? val : key;
    },

    getCategoryLabel(cat, lang) {
      const l = lang || currentLang;
      return (I18N[l] && I18N[l].categories && I18N[l].categories[cat]) ||
             (I18N.en && I18N.en.categories && I18N.en.categories[cat]) || cat;
    },

    get labels() {
      const l = currentLang;
      return (I18N[l] && I18N[l].categories) || I18N.en.categories;
    },

    async load() {
      const res = await fetch('/data/graph.json');
      if (!res.ok) throw new Error('graph.json: HTTP ' + res.status);
      const data = await res.json();
      return Object.values(data.cells);
    },

    getPreviewSrc(slug, lang) {
      const l = lang || currentLang;
      return '/data/previews/' + slug + '.' + l + '.png';
    },

    getFallbackPreviewSrc(slug) {
      return '/data/previews/' + slug + '.png';
    },

    card(app, lang) {
      const l = lang || currentLang;
      const name = (app.title && app.title[l]) || (app.title && app.title.en) || (app.title && app.title.ru) || app.slug;
      const description = (app.description && app.description[l]) || (app.description && app.description.en) || (app.description && app.description.ru) || '';

      const el = document.createElement('div');
      el.className = 'app-card';
      el.dataset.id = app.slug;
      el.dataset.category = app.category;
      el.tabIndex = 0;
      el.setAttribute('role', 'link');
      el.setAttribute('aria-label', this.t('openApp', l) + name);

      const label = this.getCategoryLabel(app.category, l);
      const color = app.color || '#3b82f6';
      const primarySrc = this.getPreviewSrc(app.slug, l);
      const fallbackSrc = this.getFallbackPreviewSrc(app.slug);
      const altText = this.t('screenshotAlt', l) + name;

      el.innerHTML =
        '<div class="card-preview">' +
          '<img src="' + primarySrc + '" data-fallback="' + fallbackSrc + '" alt="' + altText + '" loading="lazy" onerror="MicrCatalog.handleImageError(this)">' +
          '<span class="card-badge-overlay" style="background:' + color + '20;color:' + color + ';border:1px solid ' + color + '40">' + label + '</span>' +
          '<div class="card-title-overlay">' + name + '</div>' +
        '</div>' +
        '<div class="card-desc">' + description + '</div>';

      const open = () => { window.location.href = app.url; };
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
      return el;
    },

    handleImageError(image) {
      const fallback = image.dataset.fallback;
      if (fallback && image.getAttribute('src') !== fallback && !image.dataset.triedFallback) {
        image.dataset.triedFallback = 'true';
        image.src = fallback;
        return;
      }
      this.previewError(image);
    },

    previewError(image) {
      image.onerror = null;
      const span = document.createElement('span');
      span.className = 'missing-preview';
      span.textContent = this.t('missingPreview', currentLang);
      image.replaceWith(span);
    },

    /* opts: { apps, gridEl, emptyEl, filter, query, lang } */
    render(opts) {
      const l = opts.lang || currentLang;
      const grid = opts.gridEl;
      grid.innerHTML = '';
      let count = 0;
      const q = (opts.query || '').trim().toLowerCase();

      for (const app of opts.apps) {
        const matchesFilter = !opts.filter || opts.filter === 'all' || app.category === opts.filter;

        const titleL = ((app.title && app.title[l]) || '').toLowerCase();
        const descL = ((app.description && app.description[l]) || '').toLowerCase();
        const titleRu = ((app.title && app.title.ru) || '').toLowerCase();
        const descRu = ((app.description && app.description.ru) || '').toLowerCase();
        const titleEn = ((app.title && app.title.en) || '').toLowerCase();
        const descEn = ((app.description && app.description.en) || '').toLowerCase();

        const matchesSearch = !q ||
          titleL.includes(q) || descL.includes(q) ||
          titleRu.includes(q) || descRu.includes(q) ||
          titleEn.includes(q) || descEn.includes(q);

        if (matchesFilter && matchesSearch) {
          grid.appendChild(this.card(app, l));
          count++;
        }
      }
      if (opts.emptyEl) {
        opts.emptyEl.style.display = count === 0 ? 'block' : 'none';
        opts.emptyEl.textContent = this.t('emptyState', l);
      }
      return count;
    }
  };
})();
