#!/bin/bash
# micr.fun — Deploy script
# Pulls latest from origin, copies to /var/www/, restarts pm2
set -e

echo "🚀 Deploying micr.fun..."

# 1. Copy static files
cp -f index.html /var/www/micr.fun/
cp -f server/index.html /var/www/micr.fun/ 2>/dev/null
cp -f server/laziness.html /var/www/micr.fun/ 2>/dev/null
cp -f server/sky-render/index.html /var/www/micr.fun/sky.html 2>/dev/null

# 2. Restart API
pm2 restart micr-api

echo "✅ Deployed!"
