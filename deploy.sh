#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/ubuntu/app"

if [[ ! -d "$APP_DIR" ]]; then
  echo "ERROR: $APP_DIR not found. Clone repo there first." >&2
  exit 1
fi

cd "$APP_DIR"

echo "==> Pulling latest code"
git pull

echo "==> Backend install + restart"
cd "$APP_DIR/backend"
npm ci --omit=dev

if command -v pm2 >/dev/null 2>&1; then
  pm2 restart lakshayindia-backend || pm2 start server.js --name lakshayindia-backend
  pm2 save
else
  echo "PM2 not found. Install with: sudo npm i -g pm2" >&2
  exit 1
fi

echo "==> Frontend install + build"
cd "$APP_DIR/frontend"
npm ci
npm run build

echo "==> Reload nginx"
sudo systemctl reload nginx

echo "DEPLOY OK"
