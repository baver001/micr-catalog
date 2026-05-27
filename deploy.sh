#!/bin/bash

# Deploy script for micr.fun
# This script deploys both Worker and Frontend

set -e

echo "🚀 Deploying micr.fun..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler is not installed. Install it with: npm install -g wrangler"
    exit 1
fi

# Check if netlify is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI is not installed. Install it with: npm install -g netlify-cli"
    exit 1
fi

# Deploy Worker
echo -e "${BLUE}📦 Deploying Cloudflare Worker...${NC}"
wrangler deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Worker deployed successfully!${NC}"
else
    echo "❌ Worker deployment failed!"
    exit 1
fi

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully!${NC}"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# Deploy to Netlify
echo -e "${BLUE}📤 Deploying to Netlify...${NC}"
netlify deploy --prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
else
    echo "❌ Frontend deployment failed!"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Check your sites:"
echo "  🌐 Frontend: https://micr.fun"
echo "  🔌 API: https://api.micr.fun/api/apps"
