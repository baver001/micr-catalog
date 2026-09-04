# Architecture

## Runtime model

```text
graph.json ───────────────┐
                          ├─ catalog hub and category pages
surfaces.json ────────────┤
                          └─ Micr Shell, previews, PWA/deploy validation

local cell source ── /<slug>/ ── standalone PWA + shared Micr Shell
external origin ─── direct URL ── owns its own runtime and deployment
```

`data/graph.json` is the single source of truth for catalog content. `data/surfaces.json` describes delivery behavior and deliberate exceptions. The hub and category pages do not maintain a second hardcoded app list.

## Local app contract

Every local app enabled in `surfaces.json` has a canonical source, a generated flat route, its own manifest/service worker/icons, the shared mobile-first Micr Shell, a scope limited to `/<slug>/`, offline caching for its entry point and shared shell assets, and RU/EN preview images validated as 16:9 PNGs.

The shell stores a small registry snapshot locally and can render navigation from that snapshot when the network is unavailable. It is skipped for `?preview=1`, which keeps previews clean and deterministic.

## External apps

External-origin entries use their canonical URL directly from the catalog. `play/` wrappers remain compatibility/preview surfaces and are not the primary runtime. Their shell exception is recorded in `surfaces.json` because the catalog cannot safely inject a same-origin service worker or navigation shell into another origin.

## Deployment flow

```text
change → local checks → commit/push catalog/main
      → GitHub quality gate
      → VPS fast-forward + infra/deploy.sh
      → release marker + public HTTP/API smoke check
```

The root Micr control repository is not deployed by this workflow. The production catalog is deployed from `baver001/micr-catalog` only.

## API and server

`server/api/` is an optional Express/PM2 feedback/catalog API behind Nginx. Static catalog delivery does not require a frontend build step. Nginx serves the catalog and proxies `/api/` to the API process.

## Known boundary

The generic reusable engine repository/upstream is still unconfirmed. External projects remain independent until their source ownership and shell contract are explicitly confirmed.
