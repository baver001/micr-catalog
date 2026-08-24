/* micr.fun — общий каталог-рендерер из data/graph.json */
(function () {
  const CATEGORY_LABELS = {
    games: 'Игры',
    tools: 'Инструменты',
    experiments: 'Эксперименты',
    knowledge: 'Знания'
  };

  window.MicrCatalog = {
    labels: CATEGORY_LABELS,

    async load() {
      const res = await fetch('/data/graph.json');
      if (!res.ok) throw new Error('graph.json: HTTP ' + res.status);
      const data = await res.json();
      return Object.values(data.cells);
    },

    card(app) {
      const name = app.title.ru;
      const description = app.description.ru;
      const el = document.createElement('div');
      el.className = 'app-card';
      el.dataset.id = app.slug;
      el.dataset.category = app.category;
      el.tabIndex = 0;
      el.setAttribute('role', 'link');
      el.setAttribute('aria-label', 'Открыть ' + name);

      const label = CATEGORY_LABELS[app.category] || app.category;
      const color = app.color || '#3b82f6';
      el.innerHTML =
        '<div class="card-preview">' +
          '<img src="/data/previews/' + app.slug + '.png" alt="Screenshot: ' + name + '" loading="lazy" onerror="MicrCatalog.previewError(this)">' +
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

    previewError(image) {
      image.onerror = null;
      const span = document.createElement('span');
      span.className = 'missing-preview';
      span.textContent = 'Предпросмотр недоступен';
      image.replaceWith(span);
    },

    /* opts: { apps, gridEl, emptyEl, filter, query } */
    render(opts) {
      const grid = opts.gridEl;
      grid.innerHTML = '';
      let count = 0;
      const q = (opts.query || '').toLowerCase();

      for (const app of opts.apps) {
        const matchesFilter = !opts.filter || opts.filter === 'all' || app.category === opts.filter;
        const matchesSearch = !q ||
          app.title.ru.toLowerCase().includes(q) ||
          app.description.ru.toLowerCase().includes(q);
        if (matchesFilter && matchesSearch) {
          grid.appendChild(this.card(app));
          count++;
        }
      }
      if (opts.emptyEl) opts.emptyEl.style.display = count === 0 ? 'block' : 'none';
      return count;
    }
  };
})();
