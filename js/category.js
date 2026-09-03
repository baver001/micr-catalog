/* micr.fun — страница категории: рендер карточек одной категории из graph.json */
(function () {
  const category = document.body.dataset.category;
  const grid = document.getElementById('appGrid');
  const empty = document.getElementById('emptyState');
  const titleEl = document.getElementById('catTitle');
  const backLink = document.querySelector('.back-link');
  const langBtns = document.querySelectorAll('.lang-btn');

  let APPS = [];
  let currentLang = window.MicrCatalog ? window.MicrCatalog.getLang() : 'ru';

  function updateTexts(lang) {
    if (!window.MicrCatalog) return;
    const catLabel = window.MicrCatalog.getCategoryLabel(category, lang);
    if (titleEl) titleEl.textContent = catLabel;
    document.title = 'micr.fun — ' + catLabel;
    if (backLink) backLink.textContent = window.MicrCatalog.t('backLink', lang);
    if (empty) empty.textContent = window.MicrCatalog.t('categoryEmptyState', lang);
    if (typeof window.updateMascotLang === 'function') window.updateMascotLang(lang);
    langBtns.forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function renderCategoryCards() {
    if (!window.MicrCatalog) return;
    const filtered = APPS.filter(a => a.category === category);
    window.MicrCatalog.render({ apps: filtered, gridEl: grid, emptyEl: empty, lang: currentLang });
    if (filtered.length === 0 && empty) {
      empty.textContent = window.MicrCatalog.t('categoryEmptyState', currentLang);
      empty.style.display = 'block';
    }
  }

  function setLanguage(lang) {
    if (!window.MicrCatalog) return;
    currentLang = window.MicrCatalog.setLang(lang);
    updateTexts(currentLang);
    renderCategoryCards();
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });

  updateTexts(currentLang);

  if (window.MicrCatalog) {
    window.MicrCatalog.load()
      .then(apps => {
        APPS = apps;
        renderCategoryCards();
      })
      .catch(err => {
        console.error('Failed to load graph.json:', err);
        if (empty) {
          empty.textContent = window.MicrCatalog.t('loadError', currentLang);
          empty.style.display = 'block';
        }
      });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
})();
