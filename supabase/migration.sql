-- Emotion Tracker: mood_entries table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS mood_entries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  emoji varchar(10) NOT NULL,
  label varchar(50) NOT NULL,
  intensity integer NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for querying recent entries efficiently
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries (created_at DESC);

-- Allow anonymous access (no RLS, single user)
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON mood_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);
