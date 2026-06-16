#!/bin/bash
# micr.fun — Deploy to local Nginx server
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'
PROJECT_DIR="/root/projects/micr.fun"
TARGET="/var/www/micr.fun"

echo -e "${BLUE}🔨 Building micr.fun...${NC}"

cd "$PROJECT_DIR"

# 1. Install deps if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
fi

# 2. Build with Vite (index.html + static assets)
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build complete${NC}"

# 3. Copy dist/ to web root
echo -e "${BLUE}📤 Copying dist to $TARGET...${NC}"
rm -rf "$TARGET"/*
cp -r dist/* "$TARGET/"

# 4. Copy apps and server-side pages
echo -e "${BLUE}📦 Copying apps and static pages...${NC}"
cp -r apps "$TARGET/"
cp laziness.html "$TARGET/" 2>/dev/null || echo "  laziness.html not found, skipping"
cp server/sky-render/index.html "$TARGET/sky.html" 2>/dev/null || echo "  sky-render not found, skipping"

echo -e "${GREEN}✅ Static files deployed${NC}"

# 5. Restart API
echo -e "${BLUE}🔄 Restarting API...${NC}"
cd "$PROJECT_DIR/server/api"
npm install 2>/dev/null || true
pm2 restart micr-api 2>/dev/null || pm2 start index.js --name micr-api --cwd "$PROJECT_DIR/server/api"
pm2 save > /dev/null

echo ""
echo -e "${GREEN}🎉 Deploy complete!${NC}"
echo -e "  🌐 https://micr.fun"
echo -e "  🔌 http://localhost:3000/api/catalog"
