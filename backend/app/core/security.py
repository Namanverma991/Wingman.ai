"""
Security utilities: password hashing, JWT token lifecycle.

Provides helpers used by auth_service, middleware, and API dependencies.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Password hashing ────────────────────────────────────────────────────


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of the given plaintext password."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        logger.warning("Password verification failed — possible hash corruption")
        return False


# ── JWT helpers ──────────────────────────────────────────────────────────

def _build_payload(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    extra: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Build a JWT payload dict with standard claims."""
    now = datetime.now(timezone.utc)
    payload: Dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    if extra:
        payload.update(extra)
    return payload


def create_access_token(
    user_id: str,
    extra: Optional[Dict[str, Any]] = None,
) -> str:
    """Create a short-lived JWT access token."""
    payload = _build_payload(
        subject=user_id,
        token_type="access",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra=extra,
    )
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    user_id: str,
    extra: Optional[Dict[str, Any]] = None,
) -> str:
    """Create a long-lived JWT refresh token."""
    payload = _build_payload(
        subject=user_id,
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        extra=extra,
    )
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.

    Raises
    ------
    ExpiredSignatureError
        If the token has expired.
    InvalidTokenError
        If the token is malformed or signature is invalid.
    """
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
        options={"require": ["sub", "type", "exp", "iat"]},
    )


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode a token and verify it is an access token."""
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise InvalidTokenError("Token is not an access token")
    return payload


def decode_refresh_token(token: str) -> Dict[str, Any]:
    """Decode a token and verify it is a refresh token."""
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise InvalidTokenError("Token is not a refresh token")
    return payload
