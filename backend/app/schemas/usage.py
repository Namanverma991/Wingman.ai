"""
Pydantic schemas for usage / credit tracking endpoints.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class UsageRecordOut(BaseModel):
    id: uuid.UUID
    action: str
    credits_used: int
    platform: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class UsageSummary(BaseModel):
    """Aggregated usage statistics for the current billing period."""
    user_id: uuid.UUID
    plan: str
    credits_remaining: int
    credits_used_today: int
    daily_limit: int
    credits_reset_at: datetime
    total_replies_generated: int
    total_credits_consumed: int


class UsageHistoryResponse(BaseModel):
    """Paginated usage history."""
    items: List[UsageRecordOut]
    total: int
    page: int
    page_size: int


class CreditBalanceResponse(BaseModel):
    credits_remaining: int
    daily_limit: int
    plan: str
    resets_at: datetime
