"""
Data-access layer for the ``user_sessions`` table.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import UserSession


class SessionRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, **kwargs) -> UserSession:
        session = UserSession(**kwargs)
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def get_by_id(self, session_id: uuid.UUID) -> Optional[UserSession]:
        result = await self.db.execute(
            select(UserSession).where(UserSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def get_by_token_hash(self, token_hash: str) -> Optional[UserSession]:
        result = await self.db.execute(
            select(UserSession).where(
                UserSession.refresh_token_hash == token_hash,
                UserSession.is_revoked == False,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_active_sessions(self, user_id: uuid.UUID) -> list[UserSession]:
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(UserSession).where(
                UserSession.user_id == user_id,
                UserSession.is_revoked == False,  # noqa: E712
                UserSession.expires_at > now,
            )
        )
        return list(result.scalars().all())

    async def revoke_session(self, session_id: uuid.UUID) -> None:
        await self.db.execute(
            update(UserSession)
            .where(UserSession.id == session_id)
            .values(is_revoked=True)
        )
        await self.db.commit()

    async def revoke_by_token_hash(self, token_hash: str) -> None:
        await self.db.execute(
            update(UserSession)
            .where(UserSession.refresh_token_hash == token_hash)
            .values(is_revoked=True)
        )
        await self.db.commit()

    async def revoke_all_for_user(self, user_id: uuid.UUID) -> None:
        await self.db.execute(
            update(UserSession)
            .where(
                UserSession.user_id == user_id,
                UserSession.is_revoked == False,  # noqa: E712
            )
            .values(is_revoked=True)
        )
        await self.db.commit()

    async def cleanup_expired(self) -> int:
        """Revoke all expired sessions. Returns count of revoked sessions."""
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            update(UserSession)
            .where(
                UserSession.expires_at <= now,
                UserSession.is_revoked == False,  # noqa: E712
            )
            .values(is_revoked=True)
        )
        await self.db.commit()
        return result.rowcount  # type: ignore[return-value]
