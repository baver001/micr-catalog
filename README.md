# micr.fun — Micro-App Catalog

Personal production instance for [micr.fun](https://micr.fun), maintained in `baver001/micr-catalog`.

Self-hosted micro-app portal. Single-page catalog with discovery, cells, standalone apps, external play surfaces and an optional Express API.

```
┌──────────────┐ ┌────────────────────┐
│  µ micr.fun  │ │  Toolbar           │
│              │ ├────────────────────┤
│  Breathing   │ │                    │
│  Palette     │ │   ┌────────────┐   │
│  Dice        │ │   │  iframe    │   │
│  Reaction    │ │   │            │   │
│  Elon's $   │ │   │  App runs  │   │
│              │ │   │  here      │   │
│              │ │   └────────────┘   │
└──────────────┘ └────────────────────┘
```

## What's Inside

```
├── index.html              # Main catalog UI (sidebar + iframe)
├── cells/<category>/<slug>/ # Categorized source cells
├── data/                   # Graph, surfaces, i18n, shared JS/CSS and previews
├── play/                   # Embedded external surfaces
├── laziness.html           # Preserved direct article route
├── apps/                   # Micro-applications
│   ├── breathing/
│   ├── color-palette/
│   ├── dice/
│   └── reaction-test/
├── server/api/             # Express API + MCP server
│   ├── index.js            # /api/catalog endpoint
│   ├── mcp-server.js       # MCP for agent integration
│   └── package.json
├── config/catalog.json     # Brand config & app list
├── infra/
│   ├── deploy.sh           # Deploy script
│   ├── nginx-micr.fun.conf # Nginx config
│   └── pm2.config.json     # PM2 process config
├── admin/                  # Admin panel
└── locales/                # API/UI translations
```

## Stack

| Layer | Tool |
|---|---|
| Frontend | Static HTML + CSS + Vanilla JS |
| Build | Vite (optional, for bundling) |
| Server | Nginx |
| API | Express.js + PM2 |
| Agent Integration | MCP (Model Context Protocol) |
| SSL | Let's Encrypt (Certbot) |

## Quick Start

### 1. Run the personal catalog locally

From the Micr workspace:

```powershell
cd D:\02_Projects\Micr\catalog
npm run dev
```

The local static server uses the same source tree that is pushed to `baver001/micr-catalog`.

### 2. Configure or add an app

Edit `config/catalog.json`:

```json
{
  "name": "My Catalog",
  "description": "My micro-app collection",
  "language": "en",
  "domain": "example.com",
  "apps": ["my-app-1", "my-app-2"]
}
```

### 3. Deploy to the server

See [DEPLOYMENT.md](DEPLOYMENT.md) for full server setup or use the deploy script:

```bash
./infra/deploy.sh
```

Pushes to `main` run the quality gate and, after the `production` environment is configured with `DEPLOY_ENABLED=true`, deploy automatically to the VPS. `workflow_dispatch` remains available for an explicit run; root control pushes never deploy this catalog.

## This Repository

This specific repo (`baver001/micr-catalog`) is the **live deployment source** for [micr.fun](https://micr.fun). It contains:

- Personal branding and copy (Russian language, "Лень", etc.)
- 6 custom micro-apps
- The running production configuration

The previously documented `micrfun/micr` engine upstream is not currently verified. Do not treat this personal repository as a generic engine or fork it for unrelated catalogs until a canonical engine repository is confirmed.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md)

## API

See [API.md](API.md)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md)

Repository roles and the control workflow are documented in the parent control repository: [repository strategy](../docs/repository-strategy.md), [development workflow](../docs/development-workflow.md), and [deployment boundary](../docs/deployment.md).

## License

MIT
