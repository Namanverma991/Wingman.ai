"""
Request logging middleware.

Logs method, path, status code, and latency for every request.
"""

from __future__ import annotations

import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("wingman.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id

        start = time.perf_counter()
        response: Response | None = None
        try:
            response = await call_next(request)
            return response
        finally:
            elapsed_ms = (time.perf_counter() - start) * 1000
            status_code = response.status_code if response else 500
            user_id = getattr(request.state, "user_id", None) or "anon"

            logger.info(
                "[%s] %s %s → %d (%.1fms) user=%s",
                request_id,
                request.method,
                request.url.path,
                status_code,
                elapsed_ms,
                user_id,
            )
