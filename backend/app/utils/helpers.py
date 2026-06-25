"""
General utility helper functions for the backend.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any


def get_utc_now() -> datetime:
    """Return the current time in UTC with timezone info."""
    return datetime.now(timezone.utc)


def format_iso_datetime(dt: datetime) -> str:
    """Format a datetime object into an ISO 8601 string representation."""
    return dt.isoformat()


def generate_uuid_str() -> str:
    """Generate a random UUID v4 string."""
    return str(uuid.uuid4())


def mask_email(email: str) -> str:
    """
    Mask an email address for logs or display.
    Example: user@example.com -> u**r@example.com
    """
    if "@" not in email:
        return email
    name, domain = email.split("@", 1)
    if len(name) <= 2:
        masked_name = name[0] + "*" * len(name[1:])
    else:
        masked_name = name[0] + "*" * (len(name) - 2) + name[-1]
    return f"{masked_name}@{domain}"


def safe_json_loads(json_str: str | None) -> Any | None:
    """Safely decode a JSON string, returning None if parsing fails or input is None."""
    if not json_str:
        return None
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return None


def safe_json_dumps(data: Any) -> str | None:
    """Safely encode data as a JSON string, returning None if serializing fails."""
    try:
        return json.dumps(data)
    except (TypeError, ValueError):
        return None
