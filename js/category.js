/* micr.fun — страница категории: рендер карточек одной категории из graph.json */
(function () {
  const TITLES = {
    games: 'Игры',
    tools: 'Инструменты',
    experiments: 'Эксперименты',
    knowledge: 'Знания'
  };

  const category = document.body.dataset.category;
  const grid = document.getElementById('appGrid');
  const empty = document.getElementById('emptyState');
  const titleEl = document.getElementById('catTitle');

  if (titleEl) titleEl.textContent = TITLES[category] || category;
  document.title = 'micr.fun — ' + (TITLES[category] || category);

  MicrCatalog.load()
    .then(apps => {
      apps = apps.filter(a => a.category === category);
      MicrCatalog.render({ apps, gridEl: grid, emptyEl: empty });
    })
    .catch(err => {
      console.error('Failed to load graph.json:', err);
      empty.textContent = 'Не удалось загрузить каталог';
      empty.style.display = 'block';
    });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
})();
