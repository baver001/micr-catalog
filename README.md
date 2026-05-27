# My micr Catalog 🎮

Personal micro-app catalog powered by [micrfun/micr](https://github.com/micrfun/micr).

## Structure

```
micr-catalog/
├── apps/          # Your micro-apps
│   ├── breathing/
│   ├── color-palette/
│   ├── dice/
│   └── ...
├── styles/        # Your custom styles
│   └── main.css
├── config/        # Your catalog config
│   └── catalog.json
└── review.html    # Admin review page
```

## Setup

1. Clone the engine: `git clone https://github.com/micrfun/micr.git`
2. Clone your catalog: `git clone https://github.com/YOU/micr-catalog.git`
3. Link them: `./scripts/link-catalog.sh` (coming soon)
4. Run: `npm install && npm run dev`
