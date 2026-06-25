"""
Usage & credits service.

Handles credit checks, deductions, daily resets, and usage analytics.
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.repositories.usage_repository import UsageRepository
from app.repositories.user_repository import UserRepository
from app.schemas.usage import (
    CreditBalanceResponse,
    UsageHistoryResponse,
    UsageRecordOut,
    UsageSummary,
)

logger = logging.getLogger(__name__)


class UsageService:
    def __init__(self, db: AsyncSession) -> None:
        self.usage_repo = UsageRepository(db)
        self.user_repo = UserRepository(db)

    # ── Credit checks ────────────────────────────────────────────────────

    async def check_and_deduct_credits(
        self,
        user_id: uuid.UUID,
        credits: int = 1,
        action: str = "reply_generation",
        platform: str | None = None,
        metadata: dict | None = None,
    ) -> int:
        """
        Check if the user has enough credits, deduct them, and log the usage.

        Returns remaining credits after deduction.
        Raises 402 if insufficient credits.
        """
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if credits should be reset (daily reset)
        await self._maybe_reset_credits(user)

        # Re-fetch after potential reset
        user = await self.user_repo.get_by_id(user_id)
        if not user or user.credits_remaining < credits:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Insufficient credits. Please upgrade your plan.",
            )

        # Deduct
        updated_user = await self.user_repo.deduct_credits(user_id, credits)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Credit deduction failed — possible race condition",
            )

        # Log usage
        await self.usage_repo.create(
            user_id=user_id,
            action=action,
            credits_used=credits,
            platform=platform,
            metadata_json=json.dumps(metadata) if metadata else None,
        )

        logger.info(
            "Deducted %d credit(s) from user %s — remaining: %d",
            credits,
            user_id,
            updated_user.credits_remaining,
        )
        return updated_user.credits_remaining

    # ── Credit balance ───────────────────────────────────────────────────

    async def get_balance(self, user_id: uuid.UUID) -> CreditBalanceResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        await self._maybe_reset_credits(user)
        user = await self.user_repo.get_by_id(user_id)

        daily_limit = self._get_daily_limit(user.plan)
        return CreditBalanceResponse(
            credits_remaining=user.credits_remaining,
            daily_limit=daily_limit,
            plan=user.plan,
            resets_at=user.credits_reset_at + timedelta(days=1),
        )

    # ── Usage summary ────────────────────────────────────────────────────

    async def get_summary(self, user_id: uuid.UUID) -> UsageSummary:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        credits_used_today = await self.usage_repo.get_credits_used_today(user_id)
        total_credits = await self.usage_repo.get_total_credits_consumed(user_id)
        total_replies = await self.usage_repo.get_total_replies_generated(user_id)

        return UsageSummary(
            user_id=user.id,
            plan=user.plan,
            credits_remaining=user.credits_remaining,
            credits_used_today=credits_used_today,
            daily_limit=self._get_daily_limit(user.plan),
            credits_reset_at=user.credits_reset_at,
            total_replies_generated=total_replies,
            total_credits_consumed=total_credits,
        )

    # ── Usage history ────────────────────────────────────────────────────

    async def get_history(
        self, user_id: uuid.UUID, page: int = 1, page_size: int = 20
    ) -> UsageHistoryResponse:
        offset = (page - 1) * page_size
        records = await self.usage_repo.get_user_usage(user_id, offset, page_size)
        total = await self.usage_repo.count_user_usage(user_id)
        return UsageHistoryResponse(
            items=[UsageRecordOut.model_validate(r) for r in records],
            total=total,
            page=page,
            page_size=page_size,
        )

    # ── Helpers ──────────────────────────────────────────────────────────

    async def _maybe_reset_credits(self, user) -> None:
        """Reset credits if 24 hours have passed since last reset."""
        now = datetime.now(timezone.utc)
        if now - user.credits_reset_at >= timedelta(days=1):
            daily_limit = self._get_daily_limit(user.plan)
            await self.user_repo.reset_credits(user.id, daily_limit)
            logger.info("Credits reset for user %s to %d", user.id, daily_limit)

    @staticmethod
    def _get_daily_limit(plan: str) -> int:
        limits = {
            "free": settings.FREE_TIER_DAILY_CREDITS,
            "pro": settings.PRO_TIER_DAILY_CREDITS,
            "enterprise": 9999,
        }
        return limits.get(plan, settings.FREE_TIER_DAILY_CREDITS)
