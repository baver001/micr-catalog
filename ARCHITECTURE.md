# Architecture

## Overview

micr.fun is a single-page static catalog. The sidebar lists apps; selecting one loads it in an iframe. No SPA framework, no React, no build step required for basic usage.

```
┌────────────────────────────────────┐
│               USER                 │
└──────────────┬─────────────────────┘
               │ HTTPS
               ▼
┌────────────────────────────────────┐
│      CLOUDFLARE DNS + PROXY        │
│           (micr.fun)               │
└──────────────┬─────────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
┌──────────┐      ┌──────────────┐
│  Nginx   │      │  Express API │
│ :443     │      │ :3000 (PM2)  │
│          │      │              │
│ index.html│     │ /api/catalog │
│ apps/    │      │ /api/apps/*  │
└──────────┘      └──────────────┘
```

## Components

### Frontend (`index.html`)

- **Monolithic HTML** with embedded CSS and JS
- **Sidebar**: App list rendered from hardcoded `APPS` array
- **Iframe**: Loads selected app URL
- **Toolbar**: App name, badge, fullscreen, external link
- **Responsive**: Hamburger menu on mobile (<768px)

### Micro-Apps (`apps/*`)

Each app is an independent HTML file:

```
apps/breathing/
├── index.html    # Full app markup
└── manifest.json # { name, icon, description }
```

No build step. Apps are simply copied to the web root during deploy.

### API (`server/api/`)

Express server running under PM2:

```
GET  /api/catalog       → List all apps
POST /api/catalog       → Add new app (in-memory, resets on restart)
GET  /api/submissions   → List submissions (stub)
```

**MCP Server** (`mcp-server.js`): Agent integration via stdio transport. Not daemonized — started by the agent on demand.

### Proxy (Nginx)

- Serves static files from `/var/www/micr.fun/`
- Proxies `/api/` → Express on `localhost:3000`
- SSL via Let's Encrypt

## Data Flow

### Page Load

```
Browser → Nginx → index.html
  ↓ JS loads
  APPS array → render sidebar
  default: loadApp(APPS[0])  // "Лень"
```

### App Switch

```
Click sidebar item → loadApp(app)
  → update toolbar title/badge
  → set iframe src = app.url
  → iframe onload → hide loader
```

### Fullscreen Mode

```
Click ⛶ → clone iframe into overlay
  → overlay display: flex
  → Escape key or ✕ → close overlay
```

## State

No Redux, no stores. State is minimal:

```js
let currentApp = null;  // Currently loaded app object
// Everything else is DOM state
```

## Styling

CSS custom properties (variables) for theming:

```css
:root {
  --bg: #0d0c0a;
  --bg2: #15130f;
  --ink: #e8e3d6;
  --accent: #d4541c;
  --accent2: #e8a838;
}
```

## Security

- **CSP**: Not implemented (apps load external iframes)
- **X-Frame-Options**: Not set (apps are meant to be iframed on same origin)
- **HTTPS**: Enforced via Nginx redirect

## Scaling Limits

| Limit | Current | Ceiling |
|---|---|---|
| Apps | 5 | Sidebar scrolls, no hard limit |
| Storage | In-memory | Use SQLite/file for persistence |
| Concurrent users | Nginx handles it | Add CDN for static assets |

## Files Removed (Legacy)

The following were part of an earlier Cloudflare/Supabase/Netlify stack and have been removed:

- `worker/` — Cloudflare Worker API
- `wrangler.toml` — Worker config
- `netlify.toml` — Netlify config
- `js/supabase.js` — Supabase client
- `deploy.ps1` — Windows Netlify deploy
- Cloudflare/D1/Supabase documentation files
