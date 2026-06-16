# micr.fun — Micro-App Catalog

[![Engine: micrfun/micr](https://img.shields.io/badge/Engine-micrfun%2Fmicr-000?logo=github)](https://github.com/micrfun/micr)

Self-hosted micro-app portal. Single-page catalog with a sidebar and iframe embed. Zero external backend dependencies.

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
├── laziness.html           # Static content page ("Work #1")
├── apps/                   # Micro-applications
│   ├── breathing/
│   ├── color-palette/
│   ├── dice/
│   ├── reaction-test/
│   └── spend-elons-money/
├── server/api/             # Express API + MCP server
│   ├── index.js            # /api/catalog endpoint
│   ├── mcp-server.js       # MCP for agent integration
│   └── package.json
├── config/catalog.json     # Brand config & app list
├── infra/
│   ├── deploy.sh           # Deploy script
│   ├── nginx-micr.fun.conf # Nginx config
│   └── pm2.config.json     # PM2 process config
├── styles/                 # CSS
├── js/                     # Client JS (api client, i18n)
├── admin/                  # Admin panel
└── locales/                # Translations (ru, en)
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

### 1. Clone the engine

For your own catalog, fork the engine:

```bash
git clone https://github.com/micrfun/micr.git my-catalog
cd my-catalog
```

### 2. Configure

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

### 3. Add an app

```bash
mkdir apps/my-app
cat > apps/my-app/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>My App</title></head>
<body><h1>Hello!</h1></body>
</html>
EOF
```

### 4. Deploy to your server

See [DEPLOYMENT.md](DEPLOYMENT.md) for full server setup or use the deploy script:

```bash
./infra/deploy.sh
```

## This Repository

This specific repo (`baver001/micr-catalog`) is the **live deployment** for [micr.fun](https://micr.fun). It contains:

- Personal branding and copy (Russian language, "Лень", etc.)
- 5 custom micro-apps
- The running production configuration

The clean open-source engine lives at [`micrfun/micr`](https://github.com/micrfun/micr). Fork that if you want your own catalog.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md)

## API

See [API.md](API.md)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md)

## License

MIT
