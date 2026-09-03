/* micr.fun — catalog hub: theme + settings UI (i18n via i18n-core.js) */
(function () {
  'use strict';

  const THEME_KEY = 'micrfun_theme';

  function detectTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  }

  function syncThemeToggle(theme) {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    const isLight = theme === 'light';
    toggle.setAttribute('aria-checked', isLight ? 'true' : 'false');
    const label = window.micrfun && window.micrfun.t
      ? window.micrfun.t(isLight ? 'settings.theme_light' : 'settings.theme_dark')
      : isLight
        ? 'Light'
        : 'Dark';
    toggle.setAttribute('aria-label', label);
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    syncThemeToggle(theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#f3f3f4' : '#0d0c0a';
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
  }

  function bindSettingsPanel() {
    const btn = document.getElementById('settingsBtn');
    const panel = document.getElementById('settingsPanel');
    if (!btn || !panel) return;

    function closePanel() {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      closeLangMenu();
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.hidden = !panel.hidden;
      btn.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
      if (panel.hidden) closeLangMenu();
    });

    document.addEventListener('click', (e) => {
      if (panel.hidden) return;
      if (e.target.closest('.header-settings')) return;
      closePanel();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLangMenu();
        if (!panel.hidden) closePanel();
      }
    });
  }

  function closeLangMenu() {
    const picker = document.getElementById('langPicker');
    const menu = document.getElementById('langPickerMenu');
    const trigger = document.getElementById('langPickerTrigger');
    if (!picker || !menu || !trigger) return;
    picker.classList.remove('is-open');
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function initLangPicker() {
    const picker = document.getElementById('langPicker');
    const menu = document.getElementById('langPickerMenu');
    const trigger = document.getElementById('langPickerTrigger');
    const valueEl = document.getElementById('langPickerValue');
    if (!picker || !menu || !trigger || !valueEl) return;
    if (!window.MicrI18n || !window.MicrI18n.locales) return;

    menu.innerHTML = '';
    window.MicrI18n.locales().forEach((loc) => {
      const item = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-picker__option';
      btn.setAttribute('role', 'option');
      btn.dataset.lang = loc.code;
      btn.innerHTML =
        '<span class="lang-picker__native">' +
        loc.native +
        '</span><span class="lang-picker__meta">' +
        loc.name +
        '</span>';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.MicrI18n.setLang(loc.code);
        closeLangMenu();
      });
      item.appendChild(btn);
      menu.appendChild(item);
    });

    function syncPickerValue() {
      const code = window.MicrI18n.lang();
      const loc = window.MicrI18n.locales().find((l) => l.code === code);
      valueEl.textContent = loc ? loc.native : code.toUpperCase();
      menu.querySelectorAll('.lang-picker__option').forEach((opt) => {
        const active = opt.dataset.lang === code;
        opt.classList.toggle('is-active', active);
        opt.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      if (open) {
        menu.hidden = false;
        picker.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      } else {
        closeLangMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (!picker.contains(e.target)) closeLangMenu();
    });

    document.addEventListener('langchange', syncPickerValue);
    syncPickerValue();
  }

  function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTheme();
    });
  }

  applyTheme(detectTheme());
  bindSettingsPanel();
  initThemeToggle();

  if (window.micrfun && window.micrfun.whenReady) {
    window.micrfun.whenReady(() => {
      initLangPicker();
      syncThemeToggle(detectTheme());
      if (window.micrfun.applyTranslations) {
        window.micrfun.applyTranslations(document.getElementById('settingsPanel'));
      }
    });
  } else {
    document.addEventListener('micrfun:ready', () => {
      initLangPicker();
      syncThemeToggle(detectTheme());
    });
  }

  document.addEventListener('langchange', () => {
    syncThemeToggle(document.documentElement.dataset.theme || 'dark');
  });

  window.micrfun = Object.assign(window.micrfun || {}, {
    theme: () => document.documentElement.dataset.theme || 'dark',
    setTheme: applyTheme
  });
})();
