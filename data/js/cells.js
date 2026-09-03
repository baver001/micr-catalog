/* micr.fun — cells engine (wikilinks, backlinks, feedback) */
(function () {
  'use strict';

  function lang() {
    return window.micrfun && window.micrfun.lang ? window.micrfun.lang() : 'en';
  }

  function t(key) {
    return window.micrfun && window.micrfun.t ? window.micrfun.t(key) : key;
  }

  function processWikilinks(container) {
    if (!container) return;
    container.innerHTML = container.innerHTML.replace(
      /\[\[([\w-]+)\]\]/g,
      function (match, slug) {
        return '<span class="wikilink" data-slug="' + slug + '">[[' + slug + ']]</span>';
      }
    );
    fetch('/data/graph.json')
      .then((r) => r.json())
      .then((data) => {
        container.querySelectorAll('.wikilink').forEach((el) => {
          const slug = el.dataset.slug;
          const cell = data.cells[slug];
          if (cell) {
            const title =
              window.MicrI18n && window.MicrI18n.resolveCellTitle
                ? window.MicrI18n.resolveCellTitle(cell)
                : cell.title.en;
            el.outerHTML =
              '<a href="/' + slug + '/" class="wikilink">' + title + '</a>';
          } else {
            el.classList.add('missing');
          }
        });
      })
      .catch(() => {});
  }

  function renderBacklinks(container, currentSlug) {
    if (!container) return;
    fetch('/data/graph.json')
      .then((r) => r.json())
      .then((data) => {
        const linkedFrom = [];
        Object.keys(data.cells).forEach((slug) => {
          const cell = data.cells[slug];
          if (cell.links_to && cell.links_to.includes(currentSlug)) {
            linkedFrom.push(cell);
          }
        });
        if (linkedFrom.length === 0) return;
        let html =
          '<h3 data-i18n="ui.referenced_in">' +
          t('ui.referenced_in') +
          '</h3><div class="backlinks-list">';
        linkedFrom.forEach((cell) => {
          const title =
            window.MicrI18n && window.MicrI18n.resolveCellTitle
              ? window.MicrI18n.resolveCellTitle(cell)
              : cell.title.en;
          html +=
            '<a href="/' +
            cell.slug +
            '/" class="backlink-item">' +
            (cell.icon || '') +
            ' ' +
            title +
            '</a>';
        });
        html += '</div>';
        container.innerHTML = html;
        if (window.micrfun && window.micrfun.applyTranslations) {
          window.micrfun.applyTranslations(container);
        }
      })
      .catch(() => {});
  }

  window.micrfun = Object.assign(window.micrfun || {}, {
    processWikilinks,
    renderBacklinks
  });

  document.addEventListener('click', function (e) {
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

  document.addEventListener('submit', function (e) {
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
    })
      .then((r) => {
        if (r.ok) {
          document.getElementById('feedback-form').style.display = 'none';
          document.getElementById('feedback-thanks').style.display = 'block';
        } else {
          alert('Error sending feedback');
        }
      })
      .catch(() => alert('Network error'));
  });
})();
