#!/bin/bash
# Wingman AI Release Packaging Script

set -e

echo "=== Creating Wingman AI Production Release ==="

# Build extension first
if [ -f "./scripts/build-extension.sh" ]; then
    bash ./scripts/build-extension.sh
elif [ -f "build-extension.sh" ]; then
    bash build-extension.sh
fi

# Package build output
echo "Packaging extension into release zip archive..."
if [ -d "extension/dist" ]; then
    cd extension/dist
    if command -v zip >/dev/null 2>&1; then
        zip -r ../../wingman-ai-extension.zip .
    else
        # Fallback to python zip utility for cross-platform compatibility
        python3 -c "import zipfile, os; zipf = zipfile.ZipFile('../../wingman-ai-extension.zip', 'w', zipfile.ZIP_DEFLATED); [zipf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), '.')) for root, dirs, files in os.walk('.') for file in files]; zipf.close()"
    fi
    cd ../..
    echo "=== Release packaging complete! Release zip saved as wingman-ai-extension.zip ==="
else
    echo "Error: extension/dist/ folder does not exist. Build may have failed."
    exit 1
fi
