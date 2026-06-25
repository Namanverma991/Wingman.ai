"""
Authentication middleware.

Attaches the current user's ID to ``request.state`` for downstream handlers.
Skips auth for whitelisted public paths.
"""

from __future__ import annotations

import logging

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.security import decode_access_token

logger = logging.getLogger(__name__)

# Paths that do NOT require authentication
PUBLIC_PATHS: set[str] = {
    "/",
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/api/v1/auth/refresh",
}


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Lightweight middleware that extracts the JWT user ID into request.state.

    This does NOT block unauthenticated requests (that's the job of the
    Depends(get_current_user_id) dependency). It merely makes user info
    available for logging and rate-limiting middleware.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        request.state.user_id = None

        if request.url.path not in PUBLIC_PATHS:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]
                try:
                    payload = decode_access_token(token)
                    request.state.user_id = payload.get("sub")
                except Exception:
                    pass  # Let the route dependency handle the error

        response = await call_next(request)
        return response
