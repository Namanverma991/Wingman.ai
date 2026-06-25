"""
Unit tests for reply generation.
"""

from __future__ import annotations

import pytest

from app.schemas.conversation import ConversationPayload, Message, MessageDirection, Platform
from app.schemas.reply import GenerateReplyRequest, Tone
from app.services.prompt_service import PromptService


def test_prompt_service_system_prompt():
    """System prompt should contain the tone name and instructions."""
    prompt = PromptService.build_system_prompt(Tone.FLIRTY, num_replies=3)
    assert "flirty" in prompt.lower()
    assert "3" in prompt
    assert "JSON" in prompt


def test_prompt_service_user_prompt():
    """User prompt should contain the conversation transcript."""
    conversation = ConversationPayload(
        platform=Platform.WHATSAPP,
        contact_name="Alice",
        messages=[
            Message(
                sender="Alice",
                content="Hey, how are you?",
                direction=MessageDirection.INCOMING,
            ),
            Message(
                sender="Me",
                content="I'm good, thanks!",
                direction=MessageDirection.OUTGOING,
            ),
        ],
    )
    prompt = PromptService.build_user_prompt(conversation, Tone.CONFIDENT, 3)
    assert "Alice" in prompt
    assert "whatsapp" in prompt.lower()
    assert "Hey, how are you?" in prompt
    assert "confident" in prompt.lower()


def test_prompt_service_with_max_length():
    """System prompt should include max length instruction when specified."""
    prompt = PromptService.build_system_prompt(Tone.FUNNY, num_replies=2, max_length=100)
    assert "100" in prompt


def test_conversation_formatted_transcript():
    """Formatted transcript should label directions correctly."""
    conv = ConversationPayload(
        platform=Platform.INSTAGRAM,
        contact_name="Bob",
        messages=[
            Message(sender="Bob", content="Hi!", direction=MessageDirection.INCOMING),
            Message(sender="Me", content="Hello!", direction=MessageDirection.OUTGOING),
        ],
    )
    transcript = conv.formatted_transcript
    assert "Bob: Hi!" in transcript
    assert "You: Hello!" in transcript


def test_generate_reply_request_validation():
    """Request schema should validate tone and num_replies."""
    conv = ConversationPayload(
        platform=Platform.WHATSAPP,
        contact_name="Test",
        messages=[
            Message(sender="Test", content="Hi", direction=MessageDirection.INCOMING),
        ],
    )
    req = GenerateReplyRequest(conversation=conv, tone=Tone.WITTY, num_replies=5)
    assert req.tone == Tone.WITTY
    assert req.num_replies == 5


def test_all_tones_have_instructions():
    """Every Tone enum member should produce a valid system prompt."""
    for tone in Tone:
        prompt = PromptService.build_system_prompt(tone, num_replies=3)
        assert len(prompt) > 100  # Should be a substantial prompt
        assert tone.value in prompt
