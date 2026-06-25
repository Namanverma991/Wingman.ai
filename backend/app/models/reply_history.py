"""
ReplyHistory ORM model.

Stores every AI-generated reply for history / favourites / analytics.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ReplyHistory(Base):
    __tablename__ = "reply_histories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Request context
    platform: Mapped[str] = mapped_column(String(30), nullable=False)  # whatsapp | instagram
    tone: Mapped[str] = mapped_column(String(30), nullable=False)  # flirty | confident | funny | ...
    conversation_snippet: Mapped[str] = mapped_column(Text, nullable=False)
    contact_name: Mapped[str | None] = mapped_column(String(128), nullable=True)

    # Generated replies (stored as JSON array)
    replies: Mapped[dict | None] = mapped_column(JSONB().with_variant(JSON, "sqlite"), nullable=True)
    selected_reply_index: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # LLM metadata
    model_used: Mapped[str] = mapped_column(String(50), nullable=False, default="gpt-4o-mini")
    prompt_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    # Relationship
    user = relationship("User", back_populates="reply_histories")

    def __repr__(self) -> str:
        return (
            f"<ReplyHistory id={self.id} user={self.user_id} "
            f"platform={self.platform} tone={self.tone}>"
        )
