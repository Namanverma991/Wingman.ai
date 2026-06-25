#!/bin/bash
# Wingman AI Developer Setup Script

set -e

echo "=== Setting up Wingman AI Development Environment ==="

# Backend setup
if [ -d "backend" ]; then
    echo "Installing Python dependencies..."
    cd backend
    if [ ! -d ".venv" ]; then
        python3 -m venv .venv
    fi
    # Use standard virtual environment activation
    if [ -d ".venv/Scripts" ]; then
        source .venv/Scripts/activate
    else
        source .venv/bin/activate
    fi
    pip install -r requirements.txt
    cd ..
else
    echo "Warning: backend directory not found."
fi

# Extension setup
if [ -d "extension" ]; then
    echo "Installing Chrome Extension dependencies..."
    cd extension
    npm install
    cd ..
else
    echo "Warning: extension directory not found."
fi

echo "=== Setup complete! ==="
