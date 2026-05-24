-- Run these SQL statements in your Supabase SQL Editor
-- This will create a single robust table to sync all user states

CREATE TABLE IF NOT EXISTS app_sync_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE app_sync_state ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own state
CREATE POLICY "Users can view own state" ON app_sync_state FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert/update their own state
CREATE POLICY "Users can update own state" ON app_sync_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
