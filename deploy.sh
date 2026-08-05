#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="/var/www/member.bluevisionsolucoes.com.br"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$PROJECT_DIR"

echo "==> Building..."
npm run build

if [ ! -d "$PROJECT_DIR/dist" ]; then
  echo "Build failed: dist/ not found" >&2
  exit 1
fi

echo "==> Deploying to $DEPLOY_DIR"
rsync -a --delete "$PROJECT_DIR/dist/" "$DEPLOY_DIR/"
chown -R www-data:www-data "$DEPLOY_DIR"

echo "==> Done."
