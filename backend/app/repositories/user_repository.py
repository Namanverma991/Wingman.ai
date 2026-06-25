"""
Data-access layer for the ``users`` table.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, **kwargs) -> User:
        user = User(**kwargs)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def update_user(self, user_id: uuid.UUID, **kwargs) -> Optional[User]:
        kwargs["updated_at"] = datetime.now(timezone.utc)
        await self.db.execute(
            update(User).where(User.id == user_id).values(**kwargs)
        )
        await self.db.commit()
        return await self.get_by_id(user_id)

    async def deduct_credits(self, user_id: uuid.UUID, amount: int = 1) -> Optional[User]:
        """Atomically deduct credits, never going below zero."""
        await self.db.execute(
            update(User)
            .where(User.id == user_id, User.credits_remaining >= amount)
            .values(
                credits_remaining=User.credits_remaining - amount,
                updated_at=datetime.now(timezone.utc),
            )
        )
        await self.db.commit()
        return await self.get_by_id(user_id)

    async def reset_credits(self, user_id: uuid.UUID, credits: int) -> Optional[User]:
        """Reset daily credits for a user."""
        now = datetime.now(timezone.utc)
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(
                credits_remaining=credits,
                credits_reset_at=now,
                updated_at=now,
            )
        )
        await self.db.commit()
        return await self.get_by_id(user_id)

    async def count(self) -> int:
        result = await self.db.execute(select(func.count(User.id)))
        return result.scalar_one()

    async def list_users(self, offset: int = 0, limit: int = 20) -> list[User]:
        result = await self.db.execute(
            select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars().all())

    async def deactivate(self, user_id: uuid.UUID) -> Optional[User]:
        return await self.update_user(user_id, is_active=False)
