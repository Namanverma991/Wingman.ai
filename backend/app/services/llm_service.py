"""
LLM integration service.

Calls OpenAI's chat completion API and parses the response into a list of
reply strings.
"""

from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass
from typing import List

import httpx
from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)

OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"


@dataclass
class LLMResult:
    """Structured result from the LLM call."""
    replies: List[str]
    model: str
    prompt_tokens: int
    completion_tokens: int
    latency_ms: float


class LLMService:
    """Async OpenAI chat completion wrapper."""

    def __init__(self) -> None:
        if not settings.OPENAI_API_KEY:
            logger.warning("OPENAI_API_KEY is not set — LLM calls will fail")

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> LLMResult:
        """
        Send a chat completion request and return parsed replies.

        The system prompt instructs the model to respond with a JSON array
        of strings.
        """
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": settings.OPENAI_MAX_TOKENS,
            "temperature": settings.OPENAI_TEMPERATURE,
        }

        # Enforce JSON mode format only on OpenAI GPT models to support third-party models
        if settings.OPENAI_MODEL.startswith("gpt-"):
            payload["response_format"] = {"type": "json_object"}

        chat_url = f"{settings.OPENAI_BASE_URL.rstrip('/')}/chat/completions"
        start = time.perf_counter()

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(settings.OPENAI_TIMEOUT_SECONDS)
            ) as client:
                response = await client.post(
                    chat_url, json=payload, headers=headers
                )
        except httpx.TimeoutException:
            logger.error("LLM request timed out")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="LLM request timed out",
            )
        except httpx.RequestError as exc:
            logger.error("LLM request error: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to reach LLM provider",
            )

        latency_ms = (time.perf_counter() - start) * 1000

        if response.status_code != 200:
            logger.error(
                "LLM provider returned %d: %s", response.status_code, response.text
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"LLM provider error: {response.status_code}",
            )

        body = response.json()
        usage = body.get("usage", {})
        content = body["choices"][0]["message"]["content"]

        # Strip DeepSeek reasoning blocks (<think>...</think>) if present
        import re
        content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()

        replies = self._parse_replies(content)

        return LLMResult(
            replies=replies,
            model=body.get("model", settings.OPENAI_MODEL),
            prompt_tokens=usage.get("prompt_tokens", 0),
            completion_tokens=usage.get("completion_tokens", 0),
            latency_ms=round(latency_ms, 2),
        )

    @staticmethod
    def _parse_replies(content: str) -> List[str]:
        """
        Parse the LLM response content into a list of reply strings.

        Expected format: a JSON object with a "replies" key or a plain JSON array.
        """
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            logger.warning("Failed to parse LLM response as JSON, using raw text")
            # Fall back to splitting by newlines
            lines = [
                line.strip().lstrip("0123456789.-) ")
                for line in content.strip().split("\n")
                if line.strip()
            ]
            return lines if lines else [content.strip()]

        # Handle {"replies": [...]} or {"options": [...]} or plain array
        if isinstance(parsed, list):
            return [str(r) for r in parsed]
        if isinstance(parsed, dict):
            for key in ("replies", "options", "suggestions", "messages"):
                if key in parsed and isinstance(parsed[key], list):
                    return [str(r) for r in parsed[key]]
            # If dict has no recognized key, return values
            return [str(v) for v in parsed.values() if isinstance(v, str)]

        return [str(parsed)]
