"""
Pydantic schemas for user profile endpoints.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserProfile(BaseModel):
    id: uuid.UUID
    email: EmailStr
    username: str
    full_name: str | None = None
    plan: str
    credits_remaining: int
    credits_reset_at: datetime
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    full_name: str | None = Field(None, max_length=128)
    username: str | None = Field(None, min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9_]+$")


class UserListResponse(BaseModel):
    users: list[UserProfile]
    total: int
    page: int
    page_size: int
