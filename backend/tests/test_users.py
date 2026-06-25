"""
Unit tests for user service and validation utilities.
"""

from __future__ import annotations

import pytest

from app.utils.validators import is_valid_email, is_valid_username, is_strong_password


def test_email_validation():
    assert is_valid_email("user@example.com") is True
    assert is_valid_email("user@sub.example.co.uk") is True
    assert is_valid_email("not-an-email") is False
    assert is_valid_email("@example.com") is False
    assert is_valid_email("user@") is False


def test_username_validation():
    assert is_valid_username("john_doe") is True
    assert is_valid_username("ab") is False  # too short
    assert is_valid_username("valid123") is True
    assert is_valid_username("has spaces") is False
    assert is_valid_username("special!chars") is False


def test_password_strength():
    assert is_strong_password("Abcdef1!") is True
    assert is_strong_password("short") is False
    assert is_strong_password("alllowercase1") is False
    assert is_strong_password("ALLUPPERCASE1") is False
    assert is_strong_password("NoDigitsHere") is False
