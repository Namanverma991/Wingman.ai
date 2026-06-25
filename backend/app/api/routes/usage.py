"""
Usage & credits API routes.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.core.database import get_db
from app.schemas.usage import (
    CreditBalanceResponse,
    UsageHistoryResponse,
    UsageSummary,
)
from app.services.usage_service import UsageService

router = APIRouter(prefix="/usage", tags=["Usage"])


@router.get("/balance", response_model=CreditBalanceResponse)
async def get_credit_balance(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Return current credit balance and plan info."""
    svc = UsageService(db)
    return await svc.get_balance(user_id)


@router.get("/summary", response_model=UsageSummary)
async def get_usage_summary(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Return aggregated usage statistics."""
    svc = UsageService(db)
    return await svc.get_summary(user_id)


@router.get("/history", response_model=UsageHistoryResponse)
async def get_usage_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Return paginated credit usage history."""
    svc = UsageService(db)
    return await svc.get_history(user_id, page, page_size)
