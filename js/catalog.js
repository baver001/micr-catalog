/* Registry-driven category renderer. The graph is content truth; surfaces only add runtime presentation. */
(function () {
  'use strict';

  const labels = {
    ru: { all: 'Все', games: 'Игры', tools: 'Инструменты', experiments: 'Эксперименты', knowledge: 'Знания', creative: 'Творчество', fun: 'Развлечения' },
    en: { all: 'All', games: 'Games', tools: 'Tools', experiments: 'Experiments', knowledge: 'Knowledge', creative: 'Creative', fun: 'Fun' }
  };
  const copy = (value, locale) => typeof value === 'string' ? value : (value && (value[locale] || value.ru || value.en)) || '';
  const escape = value => String(value || '').replace(/[&<>\"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\\': '&#92;', '"': '&quot;' }[character]));
  const getLang = () => { try { return localStorage.getItem('micrfun_lang') === 'ru' ? 'ru' : 'en'; } catch (error) { return document.documentElement.lang.startsWith('ru') ? 'ru' : 'en'; } };
  let currentLang = getLang();
  let graph = { cells: {} };
  let surfaces = { surfaces: {}, hubCatalog: [] };

  window.MicrCatalog = {
    getLang: () => currentLang,
    setLang(lang) {
      currentLang = lang === 'ru' ? 'ru' : 'en';
      try { localStorage.setItem('micrfun_lang', currentLang); } catch (error) { /* optional */ }
      document.documentElement.lang = currentLang;
      document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
      return currentLang;
    },
    getCategoryLabel: (category, lang) => (labels[lang || currentLang] || labels.ru)[category] || category,
    get labels() { return labels[currentLang] || labels.ru; },
    t(key, lang) {
      const locale = lang || currentLang;
      const table = {
        'backLink': { ru: '← micr.fun', en: '← micr.fun' },
        'categoryEmptyState': { ru: 'В этой категории пока пусто', en: 'This category is empty' },
        'emptyState': { ru: 'Ничего не найдено', en: 'Nothing found' }
      };
      return table[key] ? table[key][locale] : key;
    },
    async load() {
      const [graphResponse, surfaceResponse] = await Promise.all([fetch('/data/graph.json'), fetch('/data/surfaces.json')]);
      if (!graphResponse.ok || !surfaceResponse.ok) throw new Error('registry unavailable');
      graph = await graphResponse.json();
      surfaces = await surfaceResponse.json();
      return Object.values(graph.cells || {});
    },
    getPreviewSrc(slug, lang) { return '/data/previews/' + encodeURIComponent(slug) + '.' + (lang || currentLang) + '.png?v=20260904'; },
    getFallbackPreviewSrc(slug) { return '/data/previews/' + encodeURIComponent(slug) + '.png?v=20260904'; },
    card(app, lang) {
      const locale = lang || currentLang;
      const surface = surfaces.surfaces && surfaces.surfaces[app.slug] || {};
      const name = copy(app.title, locale) || app.slug;
      const description = copy(app.description, locale);
      const color = app.color || '#3b82f6';
      const preview = surface.preview && surface.preview.mode === 'tile'
        ? '<div class="card-art" style="--accent:' + escape(color) + '" aria-hidden="true"><span class="card-art-glyph">' + escape(app.icon || '✦') + '</span><span class="card-art-line"></span></div>'
        : '<img src="' + escape(this.getPreviewSrc(app.slug, locale)) + '" data-fallback="' + escape(this.getFallbackPreviewSrc(app.slug)) + '" alt="' + escape((locale === 'ru' ? 'Превью: ' : 'Preview: ') + name) + '" loading="eager">';
      const link = document.createElement('a');
      link.className = 'app-card';
      link.href = app.url || '/';
      link.dataset.id = app.slug;
      link.dataset.category = app.category;
      link.setAttribute('aria-label', (locale === 'ru' ? 'Открыть ' : 'Open ') + name);
      link.innerHTML = '<div class="card-preview" style="--accent:' + escape(color) + '">' + preview + '<span class="card-category" style="color:' + escape(color) + '">' + escape(this.getCategoryLabel(app.category, locale)) + '</span></div><div class="card-content"><h3>' + escape(name) + '</h3><p class="card-desc">' + escape(description) + '</p></div>';
      const image = link.querySelector('img');
      if (image) image.addEventListener('error', () => { if (image.dataset.fallback && image.src !== image.dataset.fallback) image.src = image.dataset.fallback; });
      return link;
    },
    render({ apps, gridEl, emptyEl, filter, query, lang }) {
      const locale = lang || currentLang;
      const q = String(query || '').trim().toLowerCase();
      gridEl.innerHTML = '';
      const visible = apps.filter(app => (!filter || filter === 'all' || app.category === filter) && (!q || [copy(app.title, locale), copy(app.title, 'ru'), copy(app.title, 'en'), copy(app.description, locale), copy(app.description, 'ru'), copy(app.description, 'en')].join(' ').toLowerCase().includes(q)));
      visible.forEach(app => gridEl.appendChild(this.card(app, locale)));
      if (emptyEl) { emptyEl.style.display = visible.length ? 'none' : 'block'; emptyEl.textContent = visible.length ? '' : this.t('categoryEmptyState', locale); }
      return visible.length;
    }
  };
})();
