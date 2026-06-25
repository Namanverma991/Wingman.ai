# Wingman AI — Prompt Architecture

Wingman AI manages prompt engineering by isolating prompts into raw text files under `backend/app/prompts/`. These files are dynamically compiled at runtime to assemble instructions for the LLM.

---

## 1. System Prompt

The system prompt ([system_prompt.txt](file:///e:/CPF/wingman-ai/backend/app/prompts/system_prompt.txt)) defines:
- **Role & Persona**: Witty, socially intelligent, charming texting expert.
- **Payload Input**: Explains structural conversation arrays and metadata context.
- **Constraints**: Enforces output of only three responses in clean JSON format, avoiding code blocks (no markdown fences).

---

## 2. Style Guides (Tones)

Each tone sheet supplies detailed instructions describing the vibe, texting style, and vocabulary:

### Confident
- **Vibe**: Bold, direct, assured.
- **Pattern**: No validation-seeking queries, short declarations, cool status.
- **Example**: *"i'm in. tell me what to wear."*

### Flirty
- **Vibe**: Warm, teasing, banter-filled.
- **Pattern**: Playful compliments, suggestive teasing, warm indicators.
- **Example**: *"you must be exhausted from running through my mind all day. details?"*

### Funny
- **Vibe**: Observational, witty, sarcasm-friendly.
- **Pattern**: Light sarcasm, jokes, ice breakers.
- **Example**: *"let's do coffee, but only if you promise not to judge my order."*

### Romantic
- **Vibe**: Sweet, sincere, warm connection.
- **Pattern**: Thoughtful questions, meaningful compliments, emotional intelligence.
- **Example**: *"i really loved hearing about your day. let's catch up properly soon."*

### Smooth
- **Vibe**: Effortless, laid-back, magnetic.
- **Pattern**: Calm transitions, relaxed, intriguing questions.
- **Example**: *"let's change that. are you around this weekend?"*

---

## 3. Dynamic Compilation

The `app/services/prompt_service.py` is responsible for building prompt instances:
1. Loads the contents of `system_prompt.txt`.
2. Appends the contents of the chosen tone template (e.g. `flirty.txt`).
3. Interpolates the context:
   - Contact Name
   - Message Logs
4. Passes the combined instruction array to the OpenAI Client.
