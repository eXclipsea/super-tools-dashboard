-- Super Tools Supabase Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/bpshmkunisvmvolnlzly/sql

-- User app data table (stores JSON data per app per user)
CREATE TABLE IF NOT EXISTS user_app_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_app_data ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can read own data" ON user_app_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON user_app_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_app_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON user_app_data
  FOR DELETE USING (auth.uid() = user_id);

-- User profiles table (optional extra profile info)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_app_data_user_app ON user_app_data(user_id, app_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_app_data_updated_at
  BEFORE UPDATE ON user_app_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
