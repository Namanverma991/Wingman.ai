# Wingman AI 🚀

Wingman AI is a production-grade browser extension + backend SaaS system that acts as a socially intelligent dating wingman. It parses chat threads on WhatsApp Web and Instagram Direct, normalizes context, and queries an AI service to recommend highly personalized chat responses in real time.

---

## 📁 Repository Structure

```tree
├── backend/            # FastAPI Python web server
│   ├── app/            # Source code (routers, schemas, ORM models, services)
│   └── migrations/     # Database migration scripts (Alembic)
├── database/           # Baseline DDL SQL schemas, indexes, and seed files
├── docs/               # Architecture, API design, security, and deployment documentation
├── extension/          # Chrome Extension source code (Vite + React + Tailwind + TypeScript)
│   └── src/            # Extension modules (popup, sidepanel, content scripts, background worker)
├── infrastructure/     # Sentry, Docker, workflows, render, and railway settings
└── scripts/            # Helper/automation scripts for developer setups and builds
```

---

## 🛠️ Prerequisites

To run this project locally, ensure you have:
- **Python** (v3.10 or higher)
- **Node.js** (v18 or higher)
- **Docker & Docker Compose**
- **OpenAI API Key** (for generating replies)

---

## 🚀 Quick Start

### 1. Run Databases (PostgreSQL & Redis)
Deploy databases via Docker Compose:
```bash
docker-compose up -d postgres redis
```

### 2. Configure & Start Backend API
Navigate to backend directory, prepare settings, install packages, and boot FastAPI:
```bash
cd backend
cp .env.example .env
# Edit .env and supply your OPENAI_API_KEY
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
The interactive API documentation will be available at `http://localhost:8000/docs`.

### 3. Build & Load Chrome Extension
Initialize extension dependencies and build modules:
```bash
cd extension
npm install
npm run build
```
To load the extension into Chrome:
1. Open Google Chrome and go to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top right.
3. Click **Load unpacked** in the top left.
4. Select the build directory `extension/dist`.

---

## 🎨 System Tones

Wingman AI recommends response options mapped to 5 distinct conversational tones:
- **Confident**: Bold, direct, and magnetic.
- **Flirty**: Playful banter, compliments, and tension-building.
- **Funny**: Observational humor, light sarcasm, and jokes.
- **Romantic**: Deeply affectionate, sweet, and genuine.
- **Smooth**: Calm, mature, and efforts-free charm.
