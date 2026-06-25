#!/bin/bash
# Wingman AI Chrome Extension Build Script

set -e

echo "=== Building Wingman AI Chrome Extension ==="

if [ -d "extension" ]; then
    cd extension
    # Run type checks and build output assets via Vite
    npm run build
    
    # Generate production manifest.json with compiled paths
    node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
manifest.background.service_worker = 'serviceWorker.js';
manifest.content_scripts[0].js = ['whatsappContent.js'];
manifest.content_scripts[1].js = ['instagramContent.js'];
fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
"
    
    cd ..
    echo "=== Build complete! Output is located in extension/dist/ ==="
else
    echo "Error: extension/ directory not found."
    exit 1
fi
