# Deployment

## Automatic release

1. Commit the approved change in `baver001/micr-catalog`.
2. Push the catalog `main` branch.
3. GitHub Actions runs static, registry/PWA, preview, i18n, deployment-config and JavaScript checks, including a browser preview pass.
4. The production job fast-forwards `/root/projects/micr.fun` on the VPS and runs `infra/deploy.sh`.
5. The workflow verifies the deployed commit marker and public `https://micr.fun/` plus `/api/catalog`.

Deployment is gated by the repository/environment variable `DEPLOY_ENABLED=true`.

Required `production` environment secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_KNOWN_HOSTS`
- optional `DEPLOY_PORT` (defaults to `22`)

The SSH release uses keepalives because the VPS synchronization and dependency phase can exceed the default connection idle window.

## VPS layout

- source checkout: `/root/projects/micr.fun/`
- static web root: `/var/www/micr.fun/`
- release marker: `/var/lib/micr.fun/release.commit`
- feedback persistence: `/var/lib/micr.fun/feedback.json`
- API: PM2 process `micr-api` on localhost port `3000`

Nginx serves the static root and proxies `/api/`. TLS is managed by the existing Certbot/Nginx setup.

## Deploy script behavior

`infra/deploy.sh` synchronizes the catalog, shared data, cells, external previews, admin and server assets; recreates flat local app routes and category routes; applies public permissions; restarts the API when configured; and writes the release marker. It is the emergency/manual fallback when Actions is unavailable.

Before running it manually, verify the checkout is clean and on the intended catalog commit:

```bash
cd /root/projects/micr.fun
git status --short
git rev-parse HEAD
RELEASE_SHA="$(git rev-parse HEAD)" ./infra/deploy.sh
```

## Verification

```bash
curl -fsS https://micr.fun/ > /dev/null
curl -fsS https://micr.fun/api/catalog > /dev/null
cat /var/lib/micr.fun/release.commit
```

Do not use force-pushes, destructive VPS cleanup, DNS changes or Nginx rewrites as part of the normal release path.
