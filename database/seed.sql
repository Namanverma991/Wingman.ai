-- Wingman AI Database Seed Data

-- Mock users (password hashes generated for 'password123')
INSERT INTO users (
    id, email, username, hashed_password, full_name, plan, credits_remaining, credits_reset_at, is_active, is_verified, created_at, updated_at
) VALUES (
    'a2b9d0e2-63b7-4aef-ba6a-e64e528a4ad0',
    'john.doe@example.com',
    'johndoe',
    '$2b$12$Z0wT4X1K7Y1kP4n4K8H.OeLh2rL2G6yG5S5S5S5S5S5S5S5S5S5S', -- dummy bcrypt-like hash
    'John Doe',
    'free',
    10,
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    CURRENT_TIMESTAMP
), (
    'b3c8e1f3-74c8-5bf0-cb7b-f75f639b5be1',
    'jane.smith@example.com',
    'janesmith',
    '$2b$12$Z0wT4X1K7Y1kP4n4K8H.OeLh2rL2G6yG5S5S5S5S5S5S5S5S5S5S', -- dummy bcrypt-like hash
    'Jane Smith',
    'pro',
    200,
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Mock usage records for John Doe
INSERT INTO usage_records (
    id, user_id, action, credits_used, platform, metadata_json, created_at
) VALUES (
    'c4d9f2a4-85d9-6c01-dc8c-086074ac6cf2',
    'a2b9d0e2-63b7-4aef-ba6a-e64e528a4ad0',
    'reply_generation',
    1,
    'whatsapp',
    '{"tone": "confident", "model": "gpt-4o-mini"}',
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
), (
    'd5e0a3b5-96ea-7d12-ed9d-197185bd7df3',
    'a2b9d0e2-63b7-4aef-ba6a-e64e528a4ad0',
    'reply_generation',
    1,
    'instagram',
    '{"tone": "flirty", "model": "gpt-4o-mini"}',
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
);

-- Mock reply histories for Jane Smith
INSERT INTO reply_histories (
    id, user_id, platform, tone, conversation_snippet, contact_name, replies, selected_reply_index, model_used, prompt_tokens, completion_tokens, latency_ms, created_at
) VALUES (
    'e6f1b4c6-07fb-8e23-fead-2a8296ce8ee4',
    'b3c8e1f3-74c8-5bf0-cb7b-f75f639b5be1',
    'whatsapp',
    'smooth',
    'Hey, are you free this weekend? Let''s grab coffee.',
    'Alice Watson',
    '["hey! i would love to. what time were you thinking?", "hey alice, yeah i''m around! let''s do that coffee", "absolutely, coffee sounds great. let''s align on a time"]',
    0,
    'gpt-4o-mini',
    120,
    45,
    320.5,
    CURRENT_TIMESTAMP - INTERVAL '5 minutes'
);
