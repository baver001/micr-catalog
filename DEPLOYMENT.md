# Deployment

## Production Setup (Debian/Ubuntu)

### 1. Prerequisites

```bash
apt update && apt install -y nginx nodejs npm certbot python3-certbot-nginx
npm install -g pm2
```

### 2. Clone Repository

```bash
git clone git@github.com:baver001/micr-catalog.git /root/projects/micr.fun
cd /root/projects/micr.fun
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install API Dependencies

```bash
cd server/api
npm install
cd ../..
```

### 5. Configure Nginx

```bash
cp infra/nginx-micr.fun.conf /etc/nginx/sites-enabled/micr.fun
nginx -t && nginx -s reload
```

Example config:

```nginx
server {
    listen 443 ssl;
    server_name micr.fun;

    root /var/www/micr.fun;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    ssl_certificate /etc/letsencrypt/live/micr.fun/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/micr.fun/privkey.pem;
}

server {
    listen 80;
    server_name micr.fun;
    return 301 https://$host$request_uri;
}
```

### 6. SSL Certificate

```bash
certbot --nginx -d micr.fun
```

### 7. Deploy

```bash
./infra/deploy.sh
```

This script:
1. Builds frontend (`npm run build`)
2. Copies `dist/` → `/var/www/micr.fun/`
3. Copies `apps/` → `/var/www/micr.fun/apps/`
4. Copies `laziness.html` → `/var/www/micr.fun/`
5. Installs API deps and restarts PM2 process

### 8. Verify

```bash
curl https://micr.fun         # Should return HTML
curl https://micr.fun/api/catalog  # Should return JSON
```

## Local Development

```bash
# Terminal 1: API server
cd server/api
node index.js

# Terminal 2: Vite dev server
npm run dev
```

Or serve static files directly:

```bash
cd /root/projects/micr.fun
npx vite --port 5173
# Open http://localhost:5173
```

Note: `/api/` calls won't work without the Nginx proxy in local dev. Use direct `http://localhost:3000/api/catalog` for testing.

## PM2 Management

```bash
pm2 list                    # Show processes
pm2 logs micr-api           # View logs
pm2 restart micr-api        # Restart API
pm2 save                    # Save process list
pm2 startup                 # Auto-start on boot
```

## Update

```bash
cd /root/projects/micr.fun
git pull
./infra/deploy.sh
```

## Troubleshooting

### 502 Bad Gateway on /api/

```bash
pm2 status                 # Is micr-api running?
pm2 logs micr-api          # Check for errors
netstat -tlnp | grep 3000  # Is port 3000 bound?
```

### Static files not updating

```bash
# Check what's actually deployed
ls -la /var/www/micr.fun/

# Rebuild manually
cd /root/projects/micr.fun
npm run build
cp -r dist/* /var/www/micr.fun/
cp -r apps /var/www/micr.fun/
```

### Nginx config errors

```bash
nginx -t                    # Test config syntax
journalctl -u nginx         # Check logs
```

## Stack Summary

| Component | Path / Command |
|---|---|
| Web root | `/var/www/micr.fun/` |
| Project | `/root/projects/micr.fun/` |
| Nginx config | `/etc/nginx/sites-enabled/micr.fun` |
| API process | `pm2 restart micr-api` |
| API source | `server/api/index.js` |
| Deploy | `./infra/deploy.sh` |
| SSL | Certbot (`/etc/letsencrypt/live/micr.fun/`) |
