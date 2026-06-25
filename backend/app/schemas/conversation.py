"""
Pydantic schemas for structured conversation data coming from the extension.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class Platform(str, Enum):
    WHATSAPP = "whatsapp"
    INSTAGRAM = "instagram"


class MessageDirection(str, Enum):
    INCOMING = "incoming"
    OUTGOING = "outgoing"


class Message(BaseModel):
    """A single message extracted from the conversation."""
    sender: str = Field(..., max_length=128)
    content: str = Field(..., max_length=4096)
    direction: MessageDirection
    timestamp: Optional[datetime] = None


class ConversationPayload(BaseModel):
    """
    Structured conversation sent from the Chrome extension to the backend.
    """
    platform: Platform
    contact_name: str = Field(..., min_length=1, max_length=128)
    messages: List[Message] = Field(..., min_length=1, max_length=50)
    current_user_name: Optional[str] = Field(None, max_length=128)

    @property
    def last_n_messages(self) -> List[Message]:
        """Return the last 20 messages for prompt building."""
        return self.messages[-20:]

    @property
    def formatted_transcript(self) -> str:
        """Format messages as a readable transcript for the LLM."""
        lines: List[str] = []
        for msg in self.last_n_messages:
            label = "You" if msg.direction == MessageDirection.OUTGOING else msg.sender
            lines.append(f"{label}: {msg.content}")
        return "\n".join(lines)
