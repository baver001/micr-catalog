/* micr.fun — modular i18n (locale registry, browser detect, fallbacks) */
(function (global) {
  'use strict';

  const LANG_KEY = 'micrfun_lang';
  const STORAGE_VERSION = 1;

  let localeMeta = { default: 'en', fallback: 'en', supported: [] };
  let currentLang = 'en';
  let strings = {};
  let ready = false;
  const readyWaiters = [];

  function normalizeCode(raw) {
    if (!raw) return '';
    const part = String(raw).trim().toLowerCase().replace('_', '-');
    if (!part) return '';
    const base = part.split('-')[0];
    const supported = localeMeta.supported.map((l) => l.code);
    if (supported.includes(part)) return part;
    if (supported.includes(base)) return base;
    return '';
  }

  function detectLang() {
    const stored = localStorage.getItem(LANG_KEY);
    const fromStore = normalizeCode(stored);
    if (fromStore) return fromStore;

    const list =
      global.navigator.languages && global.navigator.languages.length
        ? global.navigator.languages
        : [global.navigator.language || 'en'];

    for (let i = 0; i < list.length; i += 1) {
      const match = normalizeCode(list[i]);
      if (match) return match;
    }
    return localeMeta.default || 'en';
  }

  function t(key, vars) {
    const parts = key.split('.');
    let obj = strings;
    for (let i = 0; i < parts.length; i += 1) {
      const p = parts[i];
      if (obj && typeof obj === 'object' && p in obj) obj = obj[p];
      else return key;
    }
    if (typeof obj !== 'string') return key;
    if (!vars) return obj;
    return obj.replace(/\{(\w+)\}/g, (_, name) =>
      vars[name] !== undefined ? String(vars[name]) : `{${name}}`
    );
  }

  function applyTranslations(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    const meta = localeMeta.supported.find((l) => l.code === currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = meta && meta.rtl ? 'rtl' : 'ltr';

    const titleEl = document.querySelector('title[data-i18n-doc]');
    if (titleEl) {
      document.title = t(titleEl.getAttribute('data-i18n-doc'));
    }
  }

  function loadStrings(lang) {
    const code = normalizeCode(lang) || localeMeta.fallback || 'en';
    return fetch('/data/i18n/' + code + '.json')
      .then((r) => {
        if (!r.ok) throw new Error('missing locale');
        return r.json();
      })
      .catch(() => {
        if (code === (localeMeta.fallback || 'en')) {
          return {};
        }
        return fetch('/data/i18n/' + (localeMeta.fallback || 'en') + '.json').then(
          (r) => r.json()
        );
      });
  }

  function syncLangControls() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    document.querySelectorAll('[data-lang-select]').forEach((select) => {
      select.value = currentLang;
    });
  }

  function setLang(lang) {
    const next = normalizeCode(lang);
    if (!next) return Promise.resolve();
    currentLang = next;
    localStorage.setItem(LANG_KEY, next);
    localStorage.setItem('micrfun_lang_v', String(STORAGE_VERSION));
    return loadStrings(next).then((s) => {
      strings = s;
      applyTranslations();
      syncLangControls();
      document.dispatchEvent(
        new CustomEvent('langchange', { detail: { lang: currentLang } })
      );
      if (typeof global.renderCatalog === 'function') global.renderCatalog();
    });
  }

  function localizedPreviewUrl(appId, version) {
    const v = version || '20260904';
    const lang = currentLang;
    return '/data/previews/' + appId + '.' + lang + '.png?v=' + v;
  }

  function defaultPreviewUrl(appId, version) {
    const v = version || '20260904';
    return '/data/previews/' + appId + '.png?v=' + v;
  }

  function resolveCellTitle(cell) {
    if (!cell || !cell.title) return '';
    return (
      cell.title[currentLang] ||
      cell.title[localeMeta.fallback] ||
      cell.title.en ||
      cell.slug ||
      ''
    );
  }

  function whenReady(fn) {
    if (ready) fn();
    else readyWaiters.push(fn);
  }

  function flushReady() {
    ready = true;
    readyWaiters.splice(0).forEach((fn) => fn());
    document.dispatchEvent(new Event('micrfun:ready'));
  }

  function populateLangSelect(select) {
    if (!select) return;
    select.innerHTML = '';
    localeMeta.supported.forEach((loc) => {
      const opt = document.createElement('option');
      opt.value = loc.code;
      opt.textContent = loc.native + ' (' + loc.code.toUpperCase() + ')';
      select.appendChild(opt);
    });
    select.value = currentLang;
    select.addEventListener('change', () => setLang(select.value));
  }

  function initLangSelects() {
    document.querySelectorAll('[data-lang-select]').forEach(populateLangSelect);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (btn && btn.dataset.lang) setLang(btn.dataset.lang);
  });

  global.addEventListener('storage', (e) => {
    if (e.key === LANG_KEY && e.newValue) setLang(e.newValue);
  });

  fetch('/data/i18n/locales.json')
    .then((r) => r.json())
    .then((meta) => {
      localeMeta = meta;
      currentLang = detectLang();
      return loadStrings(currentLang);
    })
    .then((s) => {
      strings = s;
      applyTranslations();
      syncLangControls();
      initLangSelects();
      flushReady();
    })
    .catch(() => {
      currentLang = 'en';
      flushReady();
    });

  const api = {
    t,
    lang: () => currentLang,
    setLang,
    whenReady,
    applyTranslations,
    resolveCellTitle,
    localizedPreviewUrl,
    defaultPreviewUrl,
    locales: () => localeMeta.supported.slice(),
    normalizeCode
  };

  global.MicrI18n = api;
  global.micrfun = Object.assign(global.micrfun || {}, api);
})(window);
