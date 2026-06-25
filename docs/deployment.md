# Wingman AI — Deployment Guide

This document describes the steps required to deploy the Wingman AI backend and database services to production platforms like Railway or Render, and publish the Chrome Extension.

---

## 1. Backend & Databases

You can deploy the backend using the provided Docker configurations or native PaaS runtimes.

### Option A: Railway
1. Sign in to [Railway](https://railway.app/).
2. Click **New Project** and select **Deploy from GitHub repo**.
3. Choose the `wingman-ai` repository.
4. Railway will auto-detect configurations using `infrastructure/railway/railway.toml`.
5. Provision a **PostgreSQL Database** and a **Redis Database** inside your Railway canvas.
6. Configure the variables:
   - `DATABASE_URL`: Bind to the Postgres service connection string.
   - `REDIS_URL`: Bind to the Redis service connection string.
   - `OPENAI_API_KEY`: Provide your production OpenAI API key.
   - `SECRET_KEY`: Set a secure secret key for token signages.

### Option B: Render Blueprints
Render reads infrastructure setup from [render.yaml](file:///e:/CPF/wingman-ai/infrastructure/render/render.yaml):
1. Navigate to the Render Dashboard.
2. Select **Blueprints** and click **New Blueprint Instance**.
3. Link your git repository.
4. Render will deploy:
   - A managed PostgreSQL database.
   - A managed Redis cache.
   - A Python web service running FastAPI.
5. Provide the `OPENAI_API_KEY` parameter in the environment dashboard prompts.

### Alembic Database Migrations
Always run Alembic migrations during backend bootstrap:
```bash
alembic upgrade head
```
This is handled automatically in `scripts/deploy.sh` or through deploy workflows.

---

## 2. Chrome Extension Publishing

1. Build the production package of the Chrome extension:
   ```bash
   cd extension
   npm install
   npm run build
   ```
2. Navigate to the root directory and bundle:
   ```bash
   ./scripts/release.sh
   ```
   This compiles the project and generates `wingman-ai-extension.zip`.
3. Open the [Chrome Web Store Developer Console](https://developer.chrome.com/docs/webstore/publish/).
4. Create a developer account if you don't have one.
5. Click **Add new item** and upload the `wingman-ai-extension.zip` file.
6. Complete store descriptors (logo icon, screenshots, description) and submit for validation.
