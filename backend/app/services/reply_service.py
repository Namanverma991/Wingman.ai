"""
Reply generation orchestrator.

Coordinates prompt building, LLM calls, credit deduction, and history logging.
"""

from __future__ import annotations

import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.repositories.reply_history_repository import ReplyHistoryRepository
from app.schemas.reply import (
    GenerateReplyRequest,
    GenerateReplyResponse,
    ReplyHistoryItem,
    ReplyHistoryListResponse,
    SingleReply,
)
from app.services.llm_service import LLMService
from app.services.prompt_service import PromptService
from app.services.usage_service import UsageService

logger = logging.getLogger(__name__)


class ReplyService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.llm = LLMService()
        self.usage_svc = UsageService(db)
        self.history_repo = ReplyHistoryRepository(db)

    # ── Generate replies ─────────────────────────────────────────────────

    async def generate(
        self, user_id: uuid.UUID, request: GenerateReplyRequest
    ) -> GenerateReplyResponse:
        """
        Full reply-generation pipeline:
        1. Check & deduct credits
        2. Build prompts
        3. Call LLM
        4. Save history
        5. Return response
        """
        credits_cost = settings.CREDITS_PER_REPLY

        # 1. Check credits (raises 402 if insufficient)
        remaining = await self.usage_svc.check_and_deduct_credits(
            user_id=user_id,
            credits=credits_cost,
            action="reply_generation",
            platform=request.conversation.platform.value,
            metadata={
                "tone": request.tone.value,
                "num_replies": request.num_replies,
                "contact": request.conversation.contact_name,
            },
        )

        # 2. Build prompts
        system_prompt = PromptService.build_system_prompt(
            tone=request.tone,
            num_replies=request.num_replies,
            max_length=request.max_length,
        )
        user_prompt = PromptService.build_user_prompt(
            conversation=request.conversation,
            tone=request.tone,
            num_replies=request.num_replies,
        )

        # 3. Call LLM
        result = await self.llm.generate(system_prompt, user_prompt)

        # Ensure we have the requested number of replies
        replies = result.replies[: request.num_replies]

        # 4. Save to history
        snippet = request.conversation.formatted_transcript[-500:]
        await self.history_repo.create(
            user_id=user_id,
            platform=request.conversation.platform.value,
            tone=request.tone.value,
            conversation_snippet=snippet,
            contact_name=request.conversation.contact_name,
            replies={"items": replies},
            model_used=result.model,
            prompt_tokens=result.prompt_tokens,
            completion_tokens=result.completion_tokens,
            latency_ms=result.latency_ms,
        )

        # 5. Build response
        reply_objects = [
            SingleReply(index=i, text=text, tone=request.tone.value)
            for i, text in enumerate(replies)
        ]

        logger.info(
            "Generated %d replies for user %s (tone=%s, latency=%.0fms)",
            len(replies),
            user_id,
            request.tone.value,
            result.latency_ms,
        )

        return GenerateReplyResponse(
            replies=reply_objects,
            credits_used=credits_cost,
            credits_remaining=remaining,
            model=result.model,
            latency_ms=result.latency_ms,
        )

    # ── Reply history ────────────────────────────────────────────────────

    async def get_history(
        self,
        user_id: uuid.UUID,
        page: int = 1,
        page_size: int = 20,
        platform: str | None = None,
        tone: str | None = None,
    ) -> ReplyHistoryListResponse:
        offset = (page - 1) * page_size
        items = await self.history_repo.get_user_history(
            user_id, offset, page_size, platform, tone
        )
        total = await self.history_repo.count_user_history(user_id, platform, tone)
        return ReplyHistoryListResponse(
            items=[ReplyHistoryItem.model_validate(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def select_reply(
        self, user_id: uuid.UUID, history_id: uuid.UUID, selected_index: int
    ) -> ReplyHistoryItem | None:
        record = await self.history_repo.get_by_id(history_id)
        if not record or record.user_id != user_id:
            return None
        updated = await self.history_repo.update_selected_reply(
            history_id, selected_index
        )
        return ReplyHistoryItem.model_validate(updated) if updated else None
