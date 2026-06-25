"""
Wingman AI — FastAPI Application Entry Point.

Assembles middleware, routes, CORS, and lifecycle events.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.middleware.auth import AuthMiddleware
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.utils.logger import setup_logging

# Route imports
from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.replies import router as replies_router
from app.api.routes.usage import router as usage_router
from app.api.routes.health import router as health_router

logger = logging.getLogger(__name__)


# ── Lifecycle ────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown lifecycle."""
    setup_logging()
    logger.info(
        "Starting %s v%s [%s]",
        settings.APP_NAME,
        settings.APP_VERSION,
        settings.ENVIRONMENT,
    )

    # Create tables (development only — use Alembic in production)
    if settings.is_development:
        async with engine.begin() as conn:
            # Import all models so Base.metadata is populated
            import app.models  # noqa: F401
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created (dev mode)")

    yield

    # Shutdown
    await engine.dispose()
    logger.info("Application shutdown complete")


# ── App factory ──────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="AI-powered conversation reply assistant",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    # ── Custom middleware (order matters — outermost runs first) ──────
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(AuthMiddleware)

    # ── Routes ───────────────────────────────────────────────────────
    api_prefix = "/api/v1"
    app.include_router(health_router)
    app.include_router(auth_router, prefix=api_prefix)
    app.include_router(users_router, prefix=api_prefix)
    app.include_router(replies_router, prefix=api_prefix)
    app.include_router(usage_router, prefix=api_prefix)

    return app


# Module-level instance used by uvicorn
app = create_app()
