"""
User profile API routes.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.core.database import get_db
from app.schemas.user import UserProfile, UserUpdateRequest
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfile)
async def get_current_profile(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Return the authenticated user's profile."""
    svc = UserService(db)
    return await svc.get_profile(user_id)


@router.patch("/me", response_model=UserProfile)
async def update_profile(
    data: UserUpdateRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update the authenticated user's profile fields."""
    svc = UserService(db)
    return await svc.update_profile(user_id, data)


@router.delete("/me", response_model=UserProfile)
async def deactivate_account(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate the authenticated user's account."""
    svc = UserService(db)
    return await svc.deactivate_user(user_id)
