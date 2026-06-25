"""
Async database engine, session factory, and FastAPI dependency.

Uses SQLAlchemy 2.x async API with ``asyncpg`` as the driver.
"""

from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# ── Engine ───────────────────────────────────────────────────────────────

# SQLite does not support pool_size and max_overflow. We conditionally define engine arguments.
engine_kwargs = {
    "echo": settings.DB_ECHO,
    "pool_recycle": settings.DB_POOL_RECYCLE,
    "pool_pre_ping": True,
}
if not settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

# ── Session factory ──────────────────────────────────────────────────────

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# ── Declarative base ────────────────────────────────────────────────────

class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


# ── FastAPI dependency ───────────────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an async database session for a single request lifecycle.

    The session is automatically closed at the end of the request.
    Commits must be performed explicitly in service / repository layers.
    """
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
