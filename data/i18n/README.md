# micr.fun i18n bundles

- **`locales.json`** — supported locale codes, native labels, RTL flags.
- **`en.json`** — source-of-truth UI strings for hub, nav, settings, categories.
- **`<code>.json`** — full locale bundle (same keys as `en.json`).

## Adding a locale

1. Add entry to `locales.json`.
2. Copy `en.json` → `<code>.json` and translate all string values.
3. Run the quality workflow in `skills/micr-i18n-quality/SKILL.md` (multi-pass review).
4. Add localized card previews: `data/previews/<appId>.<code>.png` (fallback: `<appId>.png`).

## Runtime

`data/js/i18n-core.js` loads registry, detects browser language (`navigator.languages`), persists override in `localStorage.micrfun_lang`, exposes `window.MicrI18n` / `window.micrfun`.

Cell/page content remains in `cells/<cat>/<slug>/content.<lang>.html` with fallback to `content.en.html`.
