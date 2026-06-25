# Wingman AI — Database Schema Reference

This document maps all database schemas, table models, types, relationships, and index configurations.

## Database Diagram

```mermaid
erDiagram
    users ||--o{ user_sessions : contains
    users ||--o{ usage_records : owns
    users ||--o{ reply_histories : has

    users {
        UUID id PK
        VARCHAR email UNIQUE
        VARCHAR username UNIQUE
        TEXT hashed_password
        VARCHAR full_name
        VARCHAR plan
        INTEGER credits_remaining
        TIMESTAMP credits_reset_at
        BOOLEAN is_active
        BOOLEAN is_verified
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    user_sessions {
        UUID id PK
        UUID user_id FK
        TEXT refresh_token_hash
        VARCHAR device_info
        VARCHAR ip_address
        BOOLEAN is_revoked
        TIMESTAMP created_at
        TIMESTAMP expires_at
    }

    usage_records {
        UUID id PK
        UUID user_id FK
        VARCHAR action
        INTEGER credits_used
        VARCHAR platform
        TEXT metadata_json
        TIMESTAMP created_at
    }

    reply_histories {
        UUID id PK
        UUID user_id FK
        VARCHAR platform
        VARCHAR tone
        TEXT conversation_snippet
        VARCHAR contact_name
        JSONB replies
        INTEGER selected_reply_index
        VARCHAR model_used
        INTEGER prompt_tokens
        INTEGER completion_tokens
        DOUBLE_PRECISION latency_ms
        TIMESTAMP created_at
    }
```

## Tables & Keys

### 1. `users`
- **Primary Key**: `id` (UUID)
- **Indexes**:
  - `idx_users_email` (implicitly generated UNIQUE index)
  - `idx_users_username` (implicitly generated UNIQUE index)
  - `idx_users_is_active` (partial index filtering `is_active = TRUE`)

### 2. `user_sessions`
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` -> `users.id` (ON DELETE CASCADE)
- **Indexes**:
  - `idx_user_sessions_user_id`

### 3. `usage_records`
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` -> `users.id` (ON DELETE CASCADE)
- **Indexes**:
  - `idx_usage_records_user_id`
  - `idx_usage_records_created_at` (sort DESC)

### 4. `reply_histories`
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` -> `users.id` (ON DELETE CASCADE)
- **Indexes**:
  - `idx_reply_histories_user_id`
  - `idx_reply_histories_created_at` (sort DESC)
