"""
Authentication service — register, login, refresh, logout, password change.
"""

from __future__ import annotations

import hashlib
import logging
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    LoginRequest,
    LogoutRequest,
    PasswordChangeRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)

logger = logging.getLogger(__name__)


def _hash_token(token: str) -> str:
    """SHA-256 hash of a refresh token for safe DB storage."""
    return hashlib.sha256(token.encode()).hexdigest()


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.user_repo = UserRepository(db)
        self.session_repo = SessionRepository(db)

    # ── Register ─────────────────────────────────────────────────────────

    async def register(self, data: RegisterRequest) -> TokenResponse:
        # Check duplicate email
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        # Check duplicate username
        existing = await self.user_repo.get_by_username(data.username)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken",
            )

        # Create user
        user = await self.user_repo.create(
            email=data.email,
            username=data.username,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            credits_remaining=settings.FREE_TIER_DAILY_CREDITS,
        )

        logger.info("User registered: %s (%s)", user.email, user.id)
        return await self._issue_tokens(user)

    # ── Login ────────────────────────────────────────────────────────────

    async def login(
        self,
        data: LoginRequest,
        device_info: str | None = None,
        ip_address: str | None = None,
    ) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )

        logger.info("User logged in: %s", user.email)
        return await self._issue_tokens(user, device_info, ip_address)

    # ── Refresh ──────────────────────────────────────────────────────────

    async def refresh(self, data: RefreshTokenRequest) -> TokenResponse:
        try:
            payload = decode_refresh_token(data.refresh_token)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )

        token_hash = _hash_token(data.refresh_token)
        session = await self.session_repo.get_by_token_hash(token_hash)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session not found or revoked",
            )

        # Revoke old session
        await self.session_repo.revoke_session(session.id)

        user = await self.user_repo.get_by_id(uuid.UUID(payload["sub"]))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or deactivated",
            )

        return await self._issue_tokens(user)

    # ── Logout ───────────────────────────────────────────────────────────

    async def logout(self, data: LogoutRequest) -> None:
        token_hash = _hash_token(data.refresh_token)
        await self.session_repo.revoke_by_token_hash(token_hash)
        logger.info("Session revoked")

    async def logout_all(self, user_id: uuid.UUID) -> None:
        await self.session_repo.revoke_all_for_user(user_id)
        logger.info("All sessions revoked for user %s", user_id)

    # ── Password change ─────────────────────────────────────────────────

    async def change_password(
        self, user_id: uuid.UUID, data: PasswordChangeRequest
    ) -> None:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(data.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        await self.user_repo.update_user(
            user_id, hashed_password=hash_password(data.new_password)
        )
        # Revoke all existing sessions for security
        await self.session_repo.revoke_all_for_user(user_id)
        logger.info("Password changed for user %s", user_id)

    # ── Helpers ──────────────────────────────────────────────────────────

    async def _issue_tokens(
        self,
        user: User,
        device_info: str | None = None,
        ip_address: str | None = None,
    ) -> TokenResponse:
        user_id_str = str(user.id)
        access = create_access_token(user_id_str, extra={"plan": user.plan})
        refresh = create_refresh_token(user_id_str)

        # Persist session
        await self.session_repo.create(
            user_id=user.id,
            refresh_token_hash=_hash_token(refresh),
            device_info=device_info,
            ip_address=ip_address,
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )

        return TokenResponse(
            access_token=access,
            refresh_token=refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
