-- Migration V2: Switch from 10-emoji intensity system to 5-point mood score scale
-- Run this in the Supabase SQL Editor

-- 1. Add score column (-2 to +2)
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS score integer;

-- 2. Make intensity nullable (keep old data, stop using it)
ALTER TABLE mood_entries ALTER COLUMN intensity DROP NOT NULL;

-- 3. Backfill score for existing rows based on old labels
UPDATE mood_entries SET score = CASE
  WHEN label IN ('Happy', 'Loved', 'Excited') THEN 2
  WHEN label IN ('Calm') THEN 1
  WHEN label IN ('Neutral') THEN 0
  WHEN label IN ('Tired', 'Frustrated') THEN -1
  WHEN label IN ('Sad', 'Anxious', 'Overwhelmed') THEN -2
  ELSE 0
END
WHERE score IS NULL;

-- 4. Add check constraint for score range
ALTER TABLE mood_entries ADD CONSTRAINT score_range CHECK (score >= -2 AND score <= 2);
