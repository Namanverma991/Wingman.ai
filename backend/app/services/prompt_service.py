"""
Prompt engineering service.

Builds system + user prompts for the LLM based on conversation context and
selected tone.
"""

from __future__ import annotations

from app.schemas.conversation import ConversationPayload
from app.schemas.reply import Tone

# ── Tone descriptions ────────────────────────────────────────────────────

TONE_INSTRUCTIONS: dict[Tone, str] = {
    Tone.FLIRTY: (
        "Be playfully flirtatious. Use charm, light teasing, and subtle compliments. "
        "Keep it tasteful and engaging — never creepy or over-the-top."
    ),
    Tone.CONFIDENT: (
        "Be self-assured and direct. Use clear, decisive language that shows "
        "confidence without arrogance."
    ),
    Tone.FUNNY: (
        "Be genuinely humorous. Use wit, wordplay, or situational comedy. "
        "Make the other person laugh or smile."
    ),
    Tone.CASUAL: (
        "Be relaxed and easy-going. Use informal language, contractions, and a "
        "laid-back vibe — like texting a close friend."
    ),
    Tone.FORMAL: (
        "Be polite and professional. Use proper grammar and respectful language "
        "suitable for business or formal contexts."
    ),
    Tone.WITTY: (
        "Be clever and intellectually playful. Use sharp observations, puns, or "
        "unexpected angles that showcase intelligence."
    ),
    Tone.SARCASTIC: (
        "Use light sarcasm and irony. Be cheeky but not mean-spirited. "
        "The humour should land as clever, not hurtful."
    ),
    Tone.ROMANTIC: (
        "Be warm, sincere, and emotionally expressive. Use heartfelt language "
        "that conveys genuine affection and care."
    ),
    Tone.FRIENDLY: (
        "Be warm, supportive, and approachable. Use encouraging language and show "
        "genuine interest in the other person."
    ),
}


SYSTEM_PROMPT_TEMPLATE = """\
You are Wingman AI, an expert conversation assistant. Your job is to generate \
smart, context-aware reply suggestions for the user's messaging conversations.

RULES:
1. Read the conversation carefully and understand the context, relationship \
dynamic, and current topic.
2. Generate exactly {num_replies} distinct reply options.
3. Each reply must match the requested tone: {tone_name}.
4. Tone instructions: {tone_instructions}
5. Keep replies concise and natural — they should feel like real text messages, \
not essays.
6. Match the language and style of the conversation (e.g., if they use slang, \
mirror that naturally).
7. Never generate harmful, discriminatory, or explicit content.
8. Do NOT include any prefixes like "Option 1:" — just the raw message text.
{length_instruction}

Respond with a JSON array of strings, each being one reply option. Example:
["reply one", "reply two", "reply three"]
"""

USER_PROMPT_TEMPLATE = """\
Platform: {platform}
Contact: {contact_name}

--- Conversation ---
{transcript}
--- End ---

Generate {num_replies} reply suggestions in the "{tone_name}" tone.
"""


class PromptService:
    """Builds structured prompts for the LLM."""

    @staticmethod
    def build_system_prompt(
        tone: Tone,
        num_replies: int = 3,
        max_length: int | None = None,
    ) -> str:
        tone_instructions = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS[Tone.CONFIDENT])
        length_instruction = ""
        if max_length:
            length_instruction = f"9. Each reply must be at most {max_length} characters."

        return SYSTEM_PROMPT_TEMPLATE.format(
            num_replies=num_replies,
            tone_name=tone.value,
            tone_instructions=tone_instructions,
            length_instruction=length_instruction,
        )

    @staticmethod
    def build_user_prompt(
        conversation: ConversationPayload,
        tone: Tone,
        num_replies: int = 3,
    ) -> str:
        return USER_PROMPT_TEMPLATE.format(
            platform=conversation.platform.value,
            contact_name=conversation.contact_name,
            transcript=conversation.formatted_transcript,
            num_replies=num_replies,
            tone_name=tone.value,
        )
