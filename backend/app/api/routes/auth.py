"""
Authentication API routes: register, login, refresh, logout, change password.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.core.database import get_db
from app.schemas.auth import (
    AuthMessageResponse,
    LoginRequest,
    LogoutRequest,
    PasswordChangeRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user and return access + refresh tokens."""
    svc = AuthService(db)
    return await svc.register(data)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate with email + password."""
    device = request.headers.get("User-Agent")
    ip = request.client.host if request.client else None
    svc = AuthService(db)
    return await svc.login(data, device_info=device, ip_address=ip)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Exchange a valid refresh token for a new token pair."""
    svc = AuthService(db)
    return await svc.refresh(data)


@router.post("/logout", response_model=AuthMessageResponse)
async def logout(
    data: LogoutRequest,
    db: AsyncSession = Depends(get_db),
):
    """Revoke a specific refresh token / session."""
    svc = AuthService(db)
    await svc.logout(data)
    return AuthMessageResponse(message="Logged out successfully")


@router.post("/logout-all", response_model=AuthMessageResponse)
async def logout_all(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Revoke all sessions for the current user."""
    svc = AuthService(db)
    await svc.logout_all(user_id)
    return AuthMessageResponse(message="All sessions revoked")


@router.post("/change-password", response_model=AuthMessageResponse)
async def change_password(
    data: PasswordChangeRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Change the authenticated user's password."""
    svc = AuthService(db)
    await svc.change_password(user_id, data)
    return AuthMessageResponse(message="Password changed — all sessions revoked")
