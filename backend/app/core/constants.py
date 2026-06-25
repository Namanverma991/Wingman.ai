"""
Application-wide constant values for Wingman AI.
"""

from enum import Enum


class UserPlan(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class PlatformType(str, Enum):
    WHATSAPP = "whatsapp"
    INSTAGRAM = "instagram"


class ReplyTone(str, Enum):
    CONFIDENT = "confident"
    FLIRTY = "flirty"
    FUNNY = "funny"
    ROMANTIC = "romantic"
    SMOOTH = "smooth"


# Credit Usage Policies
CREDITS_PER_REPLY = 1
DEFAULT_FREE_DAILY_CREDITS = 10
DEFAULT_PRO_DAILY_CREDITS = 200

# LLM Defaults
DEFAULT_LLM_MODEL = "gpt-4o-mini"
MAX_LLM_TOKENS = 1024
DEFAULT_LLM_TEMPERATURE = 0.8
DEFAULT_LLM_TIMEOUT = 30
