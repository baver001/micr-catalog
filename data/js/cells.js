/* micr.fun — Core Engine */
(function(){
  'use strict';

  // --- i18n ---
  const LANG_KEY = 'micrfun_lang';

  function detectLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored) return stored;
    const browser = (navigator.language || '').split('-')[0];
    if (browser === 'ru') return 'ru';
    return 'en';
  }

  function loadStrings(lang) {
    return fetch('/data/i18n/' + lang + '.json')
      .then(r => { if (!r.ok) throw new Error('i18n not found'); return r.json(); })
      .catch(() => fetch('/data/i18n/en.json').then(r => r.json()));
  }

  let currentLang = detectLang();
  let strings = {};

  function t(key) {
    const parts = key.split('.');
    let obj = strings;
    for (const p of parts) {
      if (obj && typeof obj === 'object' && p in obj) obj = obj[p];
      else return key;
    }
    return typeof obj === 'string' ? obj : key;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.documentElement.lang = currentLang;
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    loadStrings(lang).then(s => {
      strings = s;
      applyTranslations();
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });
      // re-render dynamic content if on catalog
      if (window.renderCatalog) window.renderCatalog();
    });
  }

  // Init i18n
  loadStrings(currentLang).then(s => {
    strings = s;
    applyTranslations();
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  });

  // Expose globally
  window.micrfun = {
    t: t,
    lang: () => currentLang,
    setLang: setLang
  };

  // --- Language switcher binding ---
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.lang-btn');
    if (btn && btn.dataset.lang) setLang(btn.dataset.lang);
  });

  // --- [[link]] parser ---
  function processWikilinks(container) {
    if (!container) return;
    // Parse [[slug]] patterns
    container.innerHTML = container.innerHTML.replace(/\[\[([\w-]+)\]\]/g, function(match, slug) {
      return '<span class="wikilink" data-slug="' + slug + '">[[' + slug + ']]</span>';
    });
    // Resolve titles from graph.json
    fetch('/data/graph.json').then(r => r.json()).then(data => {
      container.querySelectorAll('.wikilink').forEach(el => {
        const slug = el.dataset.slug;
        const cell = data.cells[slug];
        if (cell) {
          const title = cell.title[currentLang] || cell.title.en;
          const cat = cell.category;
          el.outerHTML = '<a href="/' + slug + '/" class="wikilink">' + title + '</a>';
        } else {
          el.classList.add('missing');
        }
      });
    }).catch(() => {});
  }

  window.micrfun.processWikilinks = processWikilinks;

  // --- Backlinks ---
  function renderBacklinks(container, currentSlug) {
    if (!container) return;
    fetch('/data/graph.json').then(r => r.json()).then(data => {
      const linkedFrom = [];
      Object.keys(data.cells).forEach(slug => {
        const cell = data.cells[slug];
        if (cell.links_to && cell.links_to.includes(currentSlug)) {
          linkedFrom.push(cell);
        }
      });
      if (linkedFrom.length === 0) return;
      let html = '<h3 data-i18n="ui.referenced_in">' + t('ui.referenced_in') + '</h3><div class="backlinks-list">';
      linkedFrom.forEach(cell => {
        const title = cell.title[currentLang] || cell.title.en;
        html += '<a href="/' + cell.slug + '/" class="backlink-item">' + (cell.icon || '') + ' ' + title + '</a>';
      });
      html += '</div>';
      container.innerHTML = html;
      applyTranslations();
    }).catch(() => {});
  }

  window.micrfun.renderBacklinks = renderBacklinks;

  // --- Feedback ---
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.feedback-btn');
    if (btn) {
      const modal = document.getElementById('feedback-modal');
      if (modal) {
        modal.classList.add('open');
        const cellInput = modal.querySelector('[name="cell"]');
        if (cellInput) cellInput.value = btn.dataset.cell || '';
      }
    }
    const close = e.target.closest('.feedback-close');
    if (close) {
      const modal = document.getElementById('feedback-modal');
      if (modal) modal.classList.remove('open');
    }
    const overlay = e.target.closest('.feedback-modal');
    if (overlay && !e.target.closest('.feedback-modal-content')) {
      overlay.classList.remove('open');
    }
  });

  document.addEventListener('submit', function(e) {
    const form = e.target.closest('#feedback-form');
    if (!form) return;
    e.preventDefault();
    const data = new FormData(form);
    const body = JSON.stringify({
      cell: data.get('cell') || '',
      message: data.get('message') || '',
      contact: data.get('contact') || ''
    });
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    }).then(r => {
      if (r.ok) {
        document.getElementById('feedback-form').style.display = 'none';
        document.getElementById('feedback-thanks').style.display = 'block';
      } else {
        alert('Error sending feedback');
      }
    }).catch(() => alert('Network error'));
  });

})();
