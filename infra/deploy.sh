#!/bin/bash
# micr.fun — Deploy to local Nginx server
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'
PROJECT_DIR="/root/projects/micr.fun"
TARGET="/var/www/micr.fun"

echo -e "${BLUE}📤 Deploying micr.fun...${NC}"

cd "$PROJECT_DIR"

# 1. Copy index.html
echo -e "${BLUE}📄 Copying index.html...${NC}"
cp index.html "$TARGET/"

# 2. Copy apps
echo -e "${BLUE}📦 Copying legacy apps (if present)...${NC}"
if [ -d apps ]; then cp -r apps "$TARGET/"; fi

# 3. Copy static pages, shared scripts, assets, and cell source tree
echo -e "${BLUE}📋 Copying static pages, scripts, assets, and cells...${NC}"
cp laziness.html "$TARGET/" 2>/dev/null || echo "  laziness.html not found, skipping"
for asset in favicon.svg icon.svg logo.svg logo.png logo-sm.png manifest.json sw.js; do
  cp "$asset" "$TARGET/" 2>/dev/null || echo "  $asset not found, skipping"
done
rm -rf "$TARGET/cells" "$TARGET/data" "$TARGET/js" "$TARGET/assets"
cp -r cells data js assets "$TARGET"

# Public static assets must be readable by nginx/www-data. Source files may be private (0600).
find "$TARGET/data" "$TARGET/cells" -type d -exec chmod 755 {} +
find "$TARGET/data" "$TARGET/cells" -type f -exec chmod 644 {} +

# Public URLs stay flat; categories exist only in the source tree.
declare -A CELL_CATEGORIES=(
  [breathing]=tools [focus]=tools [palette]=tools
  [dice]=games [reaction]=games [color-life]=games [life-3d]=games
  [elon]=knowledge [habits]=knowledge [laziness]=.
)
for slug in "${!CELL_CATEGORIES[@]}"; do
  ln -sfn "cells/${CELL_CATEGORIES[$slug]}/$slug" "$TARGET/$slug"
done
for category in games tools knowledge experiments; do
  ln -sfn "cells/$category" "$TARGET/$category"
done

# 4. Verify
echo -e "${BLUE}✅ Verifying...${NC}"
ls -la "$TARGET/index.html"

# 5. Restart API
if [ -f "server/api/index.js" ]; then
    echo -e "${BLUE}🔄 Restarting API...${NC}"
    cd "$PROJECT_DIR/server/api"
    pm2 restart micr-api 2>/dev/null || pm2 start index.js --name micr-api --cwd "$PROJECT_DIR/server/api"
    pm2 save > /dev/null
fi

echo ""
echo -e "${GREEN}🎉 Deploy complete!${NC}"
echo -e "  🌐 https://micr.fun"
echo -e "  🔌 http://localhost:3000/api/catalog"
