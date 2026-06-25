"""
Unit tests for usage tracking and credit management.
"""

from __future__ import annotations

import pytest

from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


def test_password_hashing():
    """Hashed password should verify correctly."""
    plain = "MySecretPass123!"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed)
    assert not verify_password("WrongPassword", hashed)


def test_access_token_lifecycle():
    """Access token should encode and decode correctly."""
    user_id = "550e8400-e29b-41d4-a716-446655440000"
    token = create_access_token(user_id, extra={"plan": "free"})
    payload = decode_access_token(token)
    assert payload["sub"] == user_id
    assert payload["type"] == "access"
    assert payload["plan"] == "free"


def test_settings_loaded():
    """Settings should load with defaults."""
    assert settings.APP_NAME == "Wingman AI"
    assert settings.FREE_TIER_DAILY_CREDITS > 0
    assert settings.JWT_ALGORITHM == "HS256"
