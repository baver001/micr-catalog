#!/usr/bin/env bash
# micr.fun — deploy the catalog checkout to the VPS web root.
set -Eeuo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
PROJECT_DIR="${PROJECT_DIR:-/root/projects/micr.fun}"
TARGET="${TARGET:-/var/www/micr.fun}"
STATE_DIR="${STATE_DIR:-/var/lib/micr.fun}"
FEEDBACK_FILE="${FEEDBACK_FILE:-$STATE_DIR/feedback.json}"
RELEASE_SHA="${RELEASE_SHA:-$(git -C "$PROJECT_DIR" rev-parse HEAD)}"
RELEASE_FILE="$STATE_DIR/release.commit"
RELEASE_JSON="$STATE_DIR/release.json"

echo -e "${BLUE}📤 Deploying micr.fun ${RELEASE_SHA}...${NC}"

cd "$PROJECT_DIR"
umask 027
mkdir -p "$TARGET" "$STATE_DIR"

if [ -n "$(git status --porcelain)" ]; then
  echo "VPS checkout is not clean; refusing to deploy over local changes."
  exit 1
fi

# Migrate the old feedback location once, then keep mutable data outside the
# disposable static web-root tree. The API receives the same path via PM2 env.
if [ -f "$TARGET/data/feedback.json" ] && [ ! -f "$FEEDBACK_FILE" ]; then
  cp "$TARGET/data/feedback.json" "$FEEDBACK_FILE"
fi

echo -e "${BLUE}📦 Syncing public files...${NC}"
rm -rf "$TARGET/apps" "$TARGET/admin" "$TARGET/assets" "$TARGET/cells" "$TARGET/data" "$TARGET/js" "$TARGET/locales" "$TARGET/play"
for directory in apps admin assets cells data js locales play; do
  if [ -d "$directory" ]; then
    cp -r "$directory" "$TARGET/"
  fi
done
cp index.html laziness.html manifest.json sw.js "$TARGET/"

for asset in favicon.svg icon.svg logo-sm.png logo.png logo.svg; do
  if [ -f "$asset" ]; then
    cp "$asset" "$TARGET/"
  fi
done

# Public static assets must be readable by nginx/www-data. Source files may be private (0600).
for directory in apps admin assets cells data js locales play; do
  if [ -d "$TARGET/$directory" ]; then
    find "$TARGET/$directory" -type d -exec chmod 755 {} +
    find "$TARGET/$directory" -type f -exec chmod 644 {} +
  fi
done
chmod 644 "$TARGET"/*.html "$TARGET"/*.json "$TARGET"/*.js 2>/dev/null || true

# Public URLs stay flat; categories exist only in the source tree.
declare -A CELL_CATEGORIES=(
  [breathing]=tools [focus]=tools [palette]=tools
  [dice]=games [reaction]=games [color-life]=experiments [life-3d]=experiments [mask-clock]=tools
  [elon]=knowledge [habits]=knowledge [laziness]=knowledge
)
for slug in "${!CELL_CATEGORIES[@]}"; do
  link="$TARGET/$slug"
  if [ -e "$link" ] && [ ! -L "$link" ]; then
    rm -rf "$link"
  fi
  ln -sfn "cells/${CELL_CATEGORIES[$slug]}/$slug" "$link"
done

declare -A CATEGORY_ROUTES=(
  [games]=games [tools]=tools [experiments]=experiments [knowledge]=knowledge
)
for category in "${!CATEGORY_ROUTES[@]}"; do
  link="$TARGET/$category"
  if [ -e "$link" ] && [ ! -L "$link" ]; then
    rm -rf "$link"
  fi
  ln -sfn "cells/$category" "$link"
done

echo -e "${BLUE}✅ Verifying deployed tree...${NC}"
test -s "$TARGET/index.html"
test -s "$TARGET/sw.js"
test -s "$TARGET/data/i18n/locales.json"
test -s "$TARGET/play/mapmapmaps/index.html"
for slug in "${!CELL_CATEGORIES[@]}"; do
  test -L "$TARGET/$slug"
done

if [ -f "$PROJECT_DIR/server/api/package-lock.json" ]; then
  echo -e "${BLUE}📚 Installing API dependencies...${NC}"
  (cd "$PROJECT_DIR/server/api" && npm ci --omit=dev --ignore-scripts)
fi

if [ -f "$PROJECT_DIR/server/api/index.js" ]; then
  echo -e "${BLUE}🔄 Restarting API...${NC}"
  pm2 startOrRestart "$PROJECT_DIR/infra/pm2.config.json" --update-env
  pm2 save > /dev/null
fi

printf '%s\n' "$RELEASE_SHA" > "$RELEASE_FILE"
printf '{"commit":"%s","deployedAt":"%s"}\n' "$RELEASE_SHA" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$RELEASE_JSON"
chmod 640 "$RELEASE_FILE" "$RELEASE_JSON"

echo -e "${GREEN}🎉 Deploy complete!${NC}"
echo -e "  🌐 https://micr.fun"
echo -e "  🔌 http://localhost:3000/api/catalog"
echo -e "  🧾 release: $RELEASE_FILE"
