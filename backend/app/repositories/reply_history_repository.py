"""
Data-access layer for the ``reply_histories`` table.
"""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reply_history import ReplyHistory


class ReplyHistoryRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, **kwargs) -> ReplyHistory:
        record = ReplyHistory(**kwargs)
        self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def get_by_id(
        self, record_id: uuid.UUID
    ) -> Optional[ReplyHistory]:
        result = await self.db.execute(
            select(ReplyHistory).where(ReplyHistory.id == record_id)
        )
        return result.scalar_one_or_none()

    async def get_user_history(
        self,
        user_id: uuid.UUID,
        offset: int = 0,
        limit: int = 20,
        platform: Optional[str] = None,
        tone: Optional[str] = None,
    ) -> list[ReplyHistory]:
        query = select(ReplyHistory).where(ReplyHistory.user_id == user_id)
        if platform:
            query = query.where(ReplyHistory.platform == platform)
        if tone:
            query = query.where(ReplyHistory.tone == tone)
        query = query.order_by(ReplyHistory.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_user_history(
        self,
        user_id: uuid.UUID,
        platform: Optional[str] = None,
        tone: Optional[str] = None,
    ) -> int:
        query = select(func.count(ReplyHistory.id)).where(
            ReplyHistory.user_id == user_id
        )
        if platform:
            query = query.where(ReplyHistory.platform == platform)
        if tone:
            query = query.where(ReplyHistory.tone == tone)
        result = await self.db.execute(query)
        return result.scalar_one()

    async def update_selected_reply(
        self, record_id: uuid.UUID, selected_index: int
    ) -> Optional[ReplyHistory]:
        record = await self.get_by_id(record_id)
        if record is None:
            return None
        record.selected_reply_index = selected_index
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def delete(self, record_id: uuid.UUID) -> bool:
        record = await self.get_by_id(record_id)
        if record is None:
            return False
        await self.db.delete(record)
        await self.db.commit()
        return True
