# micr.fun — Pavel's Micro-App Catalog 🎮

[![Engine: micrfun/micr](https://img.shields.io/badge/Engine-micrfun%2Fmicr-000?logo=github)](https://github.com/micrfun/micr)

This is **my personal micr catalog** — a complete deployment template showing how to build, brand, and self-host your own micro-app portal.

## What's Inside

```
micr-catalog/
├── apps/              # My micro-apps (6 apps)
│   ├── breathing/
│   ├── color-palette/
│   ├── dice/
│   ├── reaction/
│   ├── reaction-test/
│   └── spend-elons-money/
├── styles/            # Custom branding & themes
├── config/            # Catalog metadata
├── js/                # Core engine (from micrfun/micr)
├── worker/            # Cloudflare Worker backend
├── server/            # Self-hosting: API, MCP, sky-render
│   ├── api/           # Express API + MCP server
│   └── sky-render/    # Live sky background
├── infra/             # Nginx, PM2, deploy scripts
└── docs/              # Full documentation
```

## Architecture

```
micrfun/micr (engine) ← upstream
        │
        ▼
baver001/micr-catalog (this repo)
        │
        │  git push
        ▼
  Netlify (frontend)  +  senko.network (server)
```

## Deploy Options

### Option A: Netlify (free, easiest)
```bash
npm install && npm run build
npx netlify deploy --prod
```

### Option B: Self-hosted (full control)
```bash
# Copy static files
cp -f index.html /var/www/micr.fun/

# Start API
pm2 start infra/pm2.config.json

# Configure nginx
cp infra/nginx-micr.fun.conf /etc/nginx/sites-enabled/
nginx -t && nginx -s reload
```

## For New Users

Want your own catalog? This repo is a **reference template**:

1. Fork the [micrfun/micr engine](https://github.com/micrfun/micr)
2. Study this repo for production setup patterns
3. Customize `config/catalog.json` with your name
4. Add your apps to `apps/`
5. Deploy!

## License

MIT
