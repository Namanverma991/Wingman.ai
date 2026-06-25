"""
Rate limiting middleware using Redis sliding window.

Falls back to an in-memory store when Redis is unavailable.
"""

from __future__ import annotations

import logging
import time
from collections import defaultdict
from typing import Dict, List

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import settings

logger = logging.getLogger(__name__)

# In-memory fallback — a dict of IP/user → list of timestamps
_memory_store: Dict[str, List[float]] = defaultdict(list)

# Try to import redis
_redis_client = None
if settings.RATE_LIMIT_ENABLED:
    try:
        import redis.asyncio as aioredis  # type: ignore[import-untyped]

        _redis_client = aioredis.from_url(
            settings.REDIS_URL, decode_responses=True
        )
        logger.info("Rate limiter connected to Redis")
    except Exception as exc:
        logger.warning("Redis unavailable, using in-memory rate limiter: %s", exc)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window rate limiter.

    Keyed by user_id (if authenticated) or client IP.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if not settings.RATE_LIMIT_ENABLED:
            return await call_next(request)

        # Build rate-limit key
        user_id = getattr(request.state, "user_id", None)
        client_ip = request.client.host if request.client else "unknown"
        key = f"rl:{user_id or client_ip}"

        allowed = await self._is_allowed(key)
        if not allowed:
            logger.warning("Rate limit exceeded for %s", key)
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please slow down.",
                    "retry_after": settings.RATE_LIMIT_WINDOW_SECONDS,
                },
                headers={
                    "Retry-After": str(settings.RATE_LIMIT_WINDOW_SECONDS),
                },
            )

        response = await call_next(request)
        return response

    async def _is_allowed(self, key: str) -> bool:
        """Check if the key is within rate limits."""
        if _redis_client:
            return await self._check_redis(key)
        return self._check_memory(key)

    async def _check_redis(self, key: str) -> bool:
        """Redis-backed sliding window."""
        now = time.time()
        window = settings.RATE_LIMIT_WINDOW_SECONDS
        max_requests = settings.RATE_LIMIT_REQUESTS

        try:
            pipe = _redis_client.pipeline()
            # Remove entries outside the window
            pipe.zremrangebyscore(key, 0, now - window)
            # Count remaining
            pipe.zcard(key)
            # Add current request
            pipe.zadd(key, {str(now): now})
            # Set expiry on key
            pipe.expire(key, window)
            results = await pipe.execute()
            current_count = results[1]
            return current_count < max_requests
        except Exception as exc:
            logger.warning("Redis rate-limit error, falling back: %s", exc)
            return self._check_memory(key)

    def _check_memory(self, key: str) -> bool:
        """In-memory sliding window fallback."""
        now = time.time()
        window = settings.RATE_LIMIT_WINDOW_SECONDS
        max_requests = settings.RATE_LIMIT_REQUESTS

        # Purge old entries
        _memory_store[key] = [
            ts for ts in _memory_store[key] if ts > now - window
        ]
        if len(_memory_store[key]) >= max_requests:
            return False
        _memory_store[key].append(now)
        return True
