"""
UsageRecord ORM model.

Logs every credit-consuming action (reply generation, etc.) for auditing
and analytics.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UsageRecord(Base):
    __tablename__ = "usage_records"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    action: Mapped[str] = mapped_column(
        String(50), nullable=False, default="reply_generation"
    )  # reply_generation | tone_change | ...
    credits_used: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1
    )
    platform: Mapped[str | None] = mapped_column(
        String(30), nullable=True
    )  # whatsapp | instagram
    metadata_json: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # JSON blob for extra context (tone, model, etc.)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    # Relationship
    user = relationship("User", back_populates="usage_records")

    def __repr__(self) -> str:
        return (
            f"<UsageRecord id={self.id} user={self.user_id} "
            f"action={self.action} credits={self.credits_used}>"
        )
