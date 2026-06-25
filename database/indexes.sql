-- Wingman AI Database Indexes

-- Foreign keys and relationships
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_histories_user_id ON reply_histories(user_id);

-- Time-based queries and analytics
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON usage_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reply_histories_created_at ON reply_histories(created_at DESC);

-- Conditional performance indexes
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE is_active = TRUE;
