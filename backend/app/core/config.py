"""
Application configuration module.

Loads environment variables using pydantic-settings and exposes a singleton
``settings`` instance used throughout the application. All secrets and tuning
knobs live here so the rest of the codebase never touches ``os.environ``
directly.
"""

from __future__ import annotations

import secrets
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    """
    Application-wide settings sourced from environment variables / .env file.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────
    APP_NAME: str = "Wingman AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"  # development | staging | production

    # ── Server ───────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: str | List[str] = [
        "chrome-extension://*",
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://wingman:wingman@localhost:5432/wingman_db"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE: int = 3600
    DB_ECHO: bool = False

    # ── Redis ────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 60
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # ── JWT / Auth ───────────────────────────────────────────────────────
    SECRET_KEY: str = secrets.token_urlsafe(64)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── OpenAI / LLM ────────────────────────────────────────────────────
    OPENAI_BASE_URL: str = "https://nim.api.nvidia.com/v1"
    OPENAI_API_KEY: str = "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"
    OPENAI_MODEL: str = "nicoboss/DeepSeek-R1-Distill-Qwen-32B-Uncensored"
    OPENAI_MAX_TOKENS: int = 1024
    OPENAI_TEMPERATURE: float = 0.5
    OPENAI_TIMEOUT_SECONDS: int = 30

    # ── Usage / Billing ──────────────────────────────────────────────────
    FREE_TIER_DAILY_CREDITS: int = 10
    PRO_TIER_DAILY_CREDITS: int = 200
    CREDITS_PER_REPLY: int = 1

    # ── Logging ──────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json | text

    # ── Validators ───────────────────────────────────────────────────────
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @field_validator("LOG_LEVEL", mode="before")
    @classmethod
    def uppercase_log_level(cls, v: str) -> str:
        return v.upper()

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


@lru_cache()
def get_settings() -> Settings:
    """Return a cached singleton of the application settings."""
    return Settings()


# Convenience singleton
settings: Settings = get_settings()
