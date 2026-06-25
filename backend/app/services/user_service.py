"""
User profile service.
"""

from __future__ import annotations

import logging
import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserProfile, UserUpdateRequest, UserListResponse

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.user_repo = UserRepository(db)

    async def get_profile(self, user_id: uuid.UUID) -> UserProfile:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return UserProfile.model_validate(user)

    async def update_profile(
        self, user_id: uuid.UUID, data: UserUpdateRequest
    ) -> UserProfile:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update",
            )

        # Check username uniqueness if changing
        if "username" in update_data:
            existing = await self.user_repo.get_by_username(update_data["username"])
            if existing and existing.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already taken",
                )

        user = await self.user_repo.update_user(user_id, **update_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        logger.info("Profile updated for user %s", user_id)
        return UserProfile.model_validate(user)

    async def list_users(self, page: int = 1, page_size: int = 20) -> UserListResponse:
        offset = (page - 1) * page_size
        users = await self.user_repo.list_users(offset=offset, limit=page_size)
        total = await self.user_repo.count()
        return UserListResponse(
            users=[UserProfile.model_validate(u) for u in users],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def deactivate_user(self, user_id: uuid.UUID) -> UserProfile:
        user = await self.user_repo.deactivate(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        logger.info("User deactivated: %s", user_id)
        return UserProfile.model_validate(user)
