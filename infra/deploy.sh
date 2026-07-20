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
echo -e "${BLUE}📦 Copying apps...${NC}"
cp -r apps "$TARGET/"

# 3. Copy static pages and cell source tree
echo -e "${BLUE}📋 Copying static pages and cells...${NC}"
cp laziness.html "$TARGET/" 2>/dev/null || echo "  laziness.html not found, skipping"
cp favicon.svg "$TARGET/" 2>/dev/null || echo "  favicon.svg not found, skipping"
cp icon.svg "$TARGET/" 2>/dev/null || echo "  icon.svg not found, skipping"
cp manifest.json "$TARGET/" 2>/dev/null || echo "  manifest.json not found, skipping"
rm -rf "$TARGET/cells" "$TARGET/data"
cp -r cells data "$TARGET"

# Public static assets must be readable by nginx/www-data. Source files may be private (0600).
find "$TARGET/data" "$TARGET/cells" -type d -exec chmod 755 {} +
find "$TARGET/data" "$TARGET/cells" -type f -exec chmod 644 {} +

# Public URLs stay flat; categories exist only in the source tree.
declare -A CELL_CATEGORIES=(
  [breathing]=tools [focus]=tools [palette]=tools
  [dice]=games [reaction]=games
  [elon]=knowledge [habits]=knowledge [laziness]=.
)
for slug in "${!CELL_CATEGORIES[@]}"; do
  ln -sfn "cells/${CELL_CATEGORIES[$slug]}/$slug" "$TARGET/$slug"
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
