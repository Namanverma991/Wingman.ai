"""
Input validation helpers used across the application.
"""

from __future__ import annotations

import re

EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
)
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_]{3,64}$")


def is_valid_email(email: str) -> bool:
    """Return True if the email matches a basic email pattern."""
    return bool(EMAIL_REGEX.match(email))


def is_valid_username(username: str) -> bool:
    """Return True if the username is 3-64 chars, alphanumeric + underscore."""
    return bool(USERNAME_REGEX.match(username))


def is_strong_password(password: str) -> bool:
    """
    Return True if the password meets minimum strength requirements:
    - At least 8 characters
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    """
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True


def sanitize_string(value: str, max_length: int = 256) -> str:
    """Strip and truncate a string."""
    return value.strip()[:max_length]
