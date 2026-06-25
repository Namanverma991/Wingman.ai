"""
Pydantic schemas for reply generation endpoints.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.conversation import ConversationPayload


class Tone(str, Enum):
    FLIRTY = "flirty"
    CONFIDENT = "confident"
    FUNNY = "funny"
    CASUAL = "casual"
    FORMAL = "formal"
    WITTY = "witty"
    SARCASTIC = "sarcastic"
    ROMANTIC = "romantic"
    FRIENDLY = "friendly"


class GenerateReplyRequest(BaseModel):
    """Request body for reply generation."""
    conversation: ConversationPayload
    tone: Tone = Tone.CONFIDENT
    num_replies: int = Field(default=3, ge=1, le=5)
    max_length: Optional[int] = Field(default=None, ge=10, le=500)


class SingleReply(BaseModel):
    """One generated reply suggestion."""
    index: int
    text: str
    tone: str


class GenerateReplyResponse(BaseModel):
    """Response containing multiple reply suggestions."""
    replies: List[SingleReply]
    credits_used: int
    credits_remaining: int
    model: str
    latency_ms: float


class ReplyHistoryItem(BaseModel):
    """A past reply generation stored in history."""
    id: uuid.UUID
    platform: str
    tone: str
    contact_name: Optional[str]
    conversation_snippet: str
    replies: Optional[list]
    selected_reply_index: Optional[int]
    model_used: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReplyHistoryListResponse(BaseModel):
    """Paginated list of reply history items."""
    items: List[ReplyHistoryItem]
    total: int
    page: int
    page_size: int
