#!/bin/bash
# Wingman AI Deployment Trigger Script

set -e

echo "=== Deploying Wingman AI API Services ==="

if [ -d "backend" ]; then
    cd backend
    if [ -f "alembic.ini" ]; then
        echo "Running alembic migrations..."
        if [ -d ".venv/Scripts" ]; then
            source .venv/Scripts/activate
        elif [ -d ".venv/bin" ]; then
            source .venv/bin/activate
        fi
        alembic upgrade head || echo "Migration skipped or failed"
    fi
    cd ..
fi

echo "Restarting services via Docker Compose..."
docker-compose down
docker-compose up -d --build backend

echo "=== Deployment script complete! ==="
