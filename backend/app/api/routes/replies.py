"""
Reply generation and history API routes.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.core.database import get_db
from app.schemas.reply import (
    GenerateReplyRequest,
    GenerateReplyResponse,
    ReplyHistoryItem,
    ReplyHistoryListResponse,
)
from app.services.reply_service import ReplyService

router = APIRouter(prefix="/replies", tags=["Replies"])


@router.post("/generate", response_model=GenerateReplyResponse)
async def generate_replies(
    data: GenerateReplyRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Generate AI reply suggestions for a conversation."""
    svc = ReplyService(db)
    return await svc.generate(user_id, data)


@router.get("/history", response_model=ReplyHistoryListResponse)
async def get_reply_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    platform: str | None = Query(default=None),
    tone: str | None = Query(default=None),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Return paginated reply generation history."""
    svc = ReplyService(db)
    return await svc.get_history(user_id, page, page_size, platform, tone)


@router.patch("/history/{history_id}/select", response_model=ReplyHistoryItem)
async def select_reply(
    history_id: uuid.UUID,
    selected_index: int = Query(..., ge=0, le=4),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Mark a reply as selected (for analytics)."""
    svc = ReplyService(db)
    result = await svc.select_reply(user_id, history_id, selected_index)
    if not result:
        raise HTTPException(status_code=404, detail="History record not found")
    return result
