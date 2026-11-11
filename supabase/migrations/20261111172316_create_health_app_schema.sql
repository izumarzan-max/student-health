/*
# Student Health App — Initial Schema

## Overview
Creates the full multi-user schema for the Student Health wellness platform:
profiles, sleep_records, water_records, activity_records, mood_records,
nutrition_items, health_articles, and ai_chat_history. All user-owned tables
are owner-scoped with RLS so each student only sees their own records.

## New Tables
1. profiles — extends auth.users with display name, avatar url, language preference.
2. sleep_records — sleep start/end times and computed duration per night per user.
3. water_records — water intake amount (ml) logged at a given time per user.
4. activity_records — activity type, duration minutes, date per user.
5. mood_records — five-level mood (1-5) with optional note per day per user.
6. nutrition_items — shared (read-only to all signed-in users) food reference data.
7. health_articles — shared (read-only to all signed-in users) health library content.
8. ai_chat_history — per-user AI assistant conversation messages.

## Security
- RLS enabled on every table.
- Owner-scoped CRUD policies on profiles + the four tracking tables + ai_chat_history.
- Shared SELECT-only policy on nutrition_items and health_articles (read-only reference).
- GRANTs match policy roles: authenticated on all; service_role added where needed.
- user_id columns default to auth.uid() so inserts that omit user_id still pass WITH CHECK.

## Notes
- Email confirmation stays OFF (Supabase default for this project).
- No PII beyond name/email (already in auth.users); profiles store only display name + prefs.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  language text NOT NULL DEFAULT 'kk',
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- SLEEP RECORDS
CREATE TABLE IF NOT EXISTS sleep_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  quality smallint DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON sleep_records TO authenticated;

DROP POLICY IF EXISTS "select_own_sleep" ON sleep_records;
CREATE POLICY "select_own_sleep" ON sleep_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sleep" ON sleep_records;
CREATE POLICY "insert_own_sleep" ON sleep_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sleep" ON sleep_records;
CREATE POLICY "update_own_sleep" ON sleep_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sleep" ON sleep_records;
CREATE POLICY "delete_own_sleep" ON sleep_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sleep_user_date ON sleep_records(user_id, sleep_date);

-- WATER RECORDS
CREATE TABLE IF NOT EXISTS water_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  amount_ml integer NOT NULL CHECK (amount_ml > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE water_records ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON water_records TO authenticated;

DROP POLICY IF EXISTS "select_own_water" ON water_records;
CREATE POLICY "select_own_water" ON water_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_water" ON water_records;
CREATE POLICY "insert_own_water" ON water_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_water" ON water_records;
CREATE POLICY "update_own_water" ON water_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_water" ON water_records;
CREATE POLICY "delete_own_water" ON water_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_water_user_date ON water_records(user_id, log_date);

-- ACTIVITY RECORDS
CREATE TABLE IF NOT EXISTS activity_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date date NOT NULL,
  activity_type text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  intensity text DEFAULT 'moderate',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_records ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON activity_records TO authenticated;

DROP POLICY IF EXISTS "select_own_activity" ON activity_records;
CREATE POLICY "select_own_activity" ON activity_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_activity" ON activity_records;
CREATE POLICY "insert_own_activity" ON activity_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_activity" ON activity_records;
CREATE POLICY "update_own_activity" ON activity_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_activity" ON activity_records;
CREATE POLICY "delete_own_activity" ON activity_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_records(user_id, activity_date);

-- MOOD RECORDS
CREATE TABLE IF NOT EXISTS mood_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_date date NOT NULL,
  mood_level smallint NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON mood_records TO authenticated;

DROP POLICY IF EXISTS "select_own_mood" ON mood_records;
CREATE POLICY "select_own_mood" ON mood_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_mood" ON mood_records;
CREATE POLICY "insert_own_mood" ON mood_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_mood" ON mood_records;
CREATE POLICY "update_own_mood" ON mood_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_mood" ON mood_records;
CREATE POLICY "delete_own_mood" ON mood_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mood_user_date ON mood_records(user_id, mood_date);

-- NUTRITION ITEMS (shared read-only reference)
CREATE TABLE IF NOT EXISTS nutrition_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  calories_per_100g integer NOT NULL,
  protein_g numeric(5,1),
  carbs_g numeric(5,1),
  fat_g numeric(5,1),
  fiber_g numeric(5,1),
  benefits text,
  serving_size text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nutrition_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON nutrition_items TO authenticated;

DROP POLICY IF EXISTS "read_nutrition_items" ON nutrition_items;
CREATE POLICY "read_nutrition_items" ON nutrition_items FOR SELECT
  TO authenticated USING (true);

-- HEALTH ARTICLES (shared read-only reference)
CREATE TABLE IF NOT EXISTS health_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  read_time_minutes integer DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE health_articles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON health_articles TO authenticated;

DROP POLICY IF EXISTS "read_health_articles" ON health_articles;
CREATE POLICY "read_health_articles" ON health_articles FOR SELECT
  TO authenticated USING (true);

-- AI CHAT HISTORY
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON ai_chat_history TO authenticated;

DROP POLICY IF EXISTS "select_own_chat" ON ai_chat_history;
CREATE POLICY "select_own_chat" ON ai_chat_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chat" ON ai_chat_history;
CREATE POLICY "insert_own_chat" ON ai_chat_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chat" ON ai_chat_history;
CREATE POLICY "delete_own_chat" ON ai_chat_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_user_created ON ai_chat_history(user_id, created_at);
