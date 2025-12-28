#!/bin/bash
set -e

echo "Building..."
npm run build

echo "Deploying to Home Assistant..."
ssh root@10.0.0.162 "mkdir -p /config/www/tv-shows-panel"
scp -r dist/* root@10.0.0.162:/config/www/tv-shows-panel/

echo "Done! Refresh browser to load new panel."
