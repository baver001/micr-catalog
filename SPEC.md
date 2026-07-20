# micr.fun — Specification

## Overview

A catalog of micro-formats: games, experiments, tools & knowledge.
Each item is a "cell" — a self-contained interactive page. Categories organize the source tree; they do not appear in public URLs.

## Stack

- Plain HTML/CSS/JS (no frameworks)
- Static files served by nginx
- Node.js backend (`server/api/index.js`) for feedback
- Must work without JS disabled (core content accessible, interactivity progressive)

## Multilingual (i18n)

Start: Russian + English. Expandable to any language.

### Translation files

```
data/i18n/
  en.json     # base (fallback)
  ru.json
```

### Auto-detection

- HTML `<html lang="...">` set by JS on load
- Check `localStorage.getItem('lang')`
- Fallback: browser `navigator.language`
- Fallback: `en`

### Language switcher

- Subtle toggle in header/footer: `🇬🇧 EN` / `🇷🇺 RU`
- Switches all visible text in-place (no page reload)
- `localStorage.setItem('lang', code)` on change

### Cell content

Each cell has per-language content files:
```
cells/<category>/<slug>/
  index.html
  content.en.md     # optional, falls back to en
  content.ru.md
```

## URL Structure

```
/                               → catalog (landing page)
/<slug>/                        → cell page
```

Categories are additive and flexible — no hardcoded list in the router.
Current categories: `games`, `experiments`, `tools`, `knowledge`.

### Routing (nginx)

```nginx
location / {
    try_files $uri $uri/index.html $uri.html =404;
}
```

The source tree remains category-based (`cells/<category>/<slug>/`). Deployment exposes each cell through a root-level route alias (`/<slug>/`). Nginx serves the aliases as ordinary directories; category paths are implementation details, not public navigation.

## Catalog Page (`/index.html`)

### Hero section

- Title (i18n): "Каталог игр, экспериментов, инструментов и знаний"
- Subtitle (i18n): short description
- No slogans, no calls to action — just information

### Cell grid

- Cards sorted by category
- Each card: icon/emoji + title + category label + short description
- Click → navigate to `/<slug>/`
- No modals. Direct page transitions.

### Category sections

- Grouped under category headings: Games / Experiments / Tools / Knowledge
- Categories with no cells are hidden

## Cell Page (`/<slug>/index.html`)

### Structure

- `<header>`: back link (`← catalog`), category label, title, language switcher
- `<main>`: content rendered from `content.{lang}.md` (or fallback)
- `<footer>`: `[[links]]` section, backlinks, feedback link

### [[links]] system

Inline cross-references:
```markdown
This is related to [[laziness]] and [[focus]].
```

- On page load, JS scans the rendered content for `[[slug]]` patterns
- Replaces with `<a href="/<slug>/">Title</a>`
- Resolves the title from a central `data/graph.json` registry

### Backlinks

- `data/graph.json` stores all links between cells
- Each cell page shows "Referenced in: [list of pages that link here]"

### PWA

- Each cell can have its own `manifest.json` (scope = its own folder)
- Category page can have manifest (scope = category)
- Root can have manifest (scope = /)
- Install prompt via standard `beforeinstallprompt`

## Data Files

### `data/graph.json`

```json
{
  "cells": {
    "laziness": {
      "slug": "laziness",
      "category": "knowledge",
      "title": { "en": "Laziness", "ru": "Лень" },
      "description": { "en": "What laziness really is", "ru": "Что такое лень на самом деле" },
      "icon": "🦥",
      "links_to": ["focus", "habits"],
      "linked_from": []
    }
  }
}
```

### `data/feedback.json`

Append-only JSON array. Written by POST to `/api/feedback`, read by admin.

```json
[
  {
    "id": "uuid",
    "cell": "laziness",
    "message": "Great article!",
    "contact": "",
    "timestamp": "2026-07-07T12:00:00Z"
  }
]
```

## Feedback

- Button on each cell page → opens inline modal
- Fields: message (required), contact (optional)
- POST to `/api/feedback`
- Admin view: `/inbox.html` (password-protected)

## Migration Plan (existing cells)

| Current | New |
|---|---|
| `/laziness.html` | `/cells/knowledge/laziness/index.html` |
| `/smyslovye-yacheyki/breathing.html` | `/cells/tools/breathing/index.html` |
| `/smyslovye-yacheyki/palette.html` | `/cells/tools/palette/index.html` |
| `/smyslovye-yacheyki/dice.html` | `/cells/games/dice/index.html` |
| `/smyslovye-yacheyki/reaction.html` | `/cells/games/reaction/index.html` |
| `/smyslovye-yacheyki/elon.html` | `/cells/knowledge/elon/index.html` |

Old URLs: no redirects (user explicitly declined). Remove old files after migration.

## Design System

- Dark theme (`background: #0d1117`)
- Font: `Fraunces` (serif, for headings) + system sans-serif (for UI)
- Accent: gold `#d4a853`
- CSS variables per page (no shared design-tokens.css — each page is self-contained)
- Max content width: 720px
- Mobile-first responsive
- No personal branding (no author name, no logo)

## Implementation Order

1. `data/i18n/en.json` + `data/i18n/ru.json`
2. `data/graph.json` with all cells
3. CSS framework as a reusable template snippet
4. New catalog page (`/index.html`) with i18n, grid, categories
5. New cell page template with i18n, [[links]], backlinks
6. Migration: laziness → `/cells/knowledge/laziness/`
7. Migration: remaining cells
8. PWA manifests for root, categories, cells
9. Feedback integration into new cell template
10. Remove old files
