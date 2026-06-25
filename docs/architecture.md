# Wingman AI — System Architecture

This document describes the high-level architecture of Wingman AI, outlining how components interact across the web browser, local storage, API gateway, and backend services.

## System Topology

```mermaid
graph TD
    subgraph Client [Chrome Extension Client]
        CS[Content Script: WA/IG]
        SP[Side Panel Interface: React]
        BG[Service Worker: Background]
        POP[Browser Action Popup]
    end
    
    subgraph Gateway [Nginx Reverse Proxy / Load Balancer]
        NGX[Nginx]
    end

    subgraph Core [FastAPI Application Instance]
        API[API Endpoints / Routers]
        SVC[Services: Auth, Reply, Usage]
        REPO[Repositories: DB Access Layer]
    end

    subgraph Data [Data Persistence Layer]
        DB[(PostgreSQL Database)]
        KV[(Redis Cache / Rate Limiter)]
    end

    subgraph External [External Interfaces]
        LLM[OpenAI API Services]
    end

    CS -->|Observe & Extract| BG
    BG -->|Pipe Message Payload| SP
    POP -->|Status Check| BG
    SP -->|Send Text Generation Request| NGX
    NGX -->|Forward Port 8000| API
    API -->|Process & Verify Auth| SVC
    SVC -->|Query/Update Record| REPO
    REPO -->|Read/Write ORM| DB
    API -->|Validate Limits| KV
    SVC -->|Request Generation| LLM
```

## Core Modules

### 1. Browser Extension
- **Content Scripts (`src/content/`)**: Extract HTML elements from WhatsApp and Instagram threads, normalize text content, and watch DOM changes using `MutationObserver`.
- **Side Panel (`src/sidepanel/`)**: React-based panel hosting conversation state, account settings, tone selections, and list of recommended responses.
- **Service Worker (`src/background/`)**: Manages the lifespans of extension assets, listens to events (e.g. extension button clicks), and coordinates side panel states.

### 2. Backend Web Application
- **API Routers (`app/api/routes/`)**: Handle requests, format schemas, validate headers, and inject dependencies.
- **Services (`app/services/`)**: Orchestrate business logic, call OpenAI APIs using configured style sheets, and deduct user credit balances.
- **ORM & Database (`app/models/` and `app/repositories/`)**: Manage transactional tables via SQLAlchemy and execute raw SQL statements via repository interfaces.
