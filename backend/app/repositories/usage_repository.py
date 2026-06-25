"""
Data-access layer for the ``usage_records`` table.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usage import UsageRecord


class UsageRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, **kwargs) -> UsageRecord:
        record = UsageRecord(**kwargs)
        self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def get_by_id(self, record_id: uuid.UUID) -> Optional[UsageRecord]:
        result = await self.db.execute(
            select(UsageRecord).where(UsageRecord.id == record_id)
        )
        return result.scalar_one_or_none()

    async def get_user_usage(
        self,
        user_id: uuid.UUID,
        offset: int = 0,
        limit: int = 20,
    ) -> list[UsageRecord]:
        result = await self.db.execute(
            select(UsageRecord)
            .where(UsageRecord.user_id == user_id)
            .order_by(UsageRecord.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_user_usage(self, user_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count(UsageRecord.id)).where(
                UsageRecord.user_id == user_id
            )
        )
        return result.scalar_one()

    async def get_credits_used_today(self, user_id: uuid.UUID) -> int:
        """Return total credits consumed by the user today (UTC)."""
        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        result = await self.db.execute(
            select(func.coalesce(func.sum(UsageRecord.credits_used), 0)).where(
                UsageRecord.user_id == user_id,
                UsageRecord.created_at >= today_start,
            )
        )
        return result.scalar_one()

    async def get_total_credits_consumed(self, user_id: uuid.UUID) -> int:
        """Return lifetime total credits consumed."""
        result = await self.db.execute(
            select(func.coalesce(func.sum(UsageRecord.credits_used), 0)).where(
                UsageRecord.user_id == user_id
            )
        )
        return result.scalar_one()

    async def get_total_replies_generated(self, user_id: uuid.UUID) -> int:
        """Return total number of reply-generation actions."""
        result = await self.db.execute(
            select(func.count(UsageRecord.id)).where(
                UsageRecord.user_id == user_id,
                UsageRecord.action == "reply_generation",
            )
        )
        return result.scalar_one()

    async def get_usage_since(
        self, user_id: uuid.UUID, since: datetime
    ) -> list[UsageRecord]:
        result = await self.db.execute(
            select(UsageRecord)
            .where(
                UsageRecord.user_id == user_id,
                UsageRecord.created_at >= since,
            )
            .order_by(UsageRecord.created_at.desc())
        )
        return list(result.scalars().all())
