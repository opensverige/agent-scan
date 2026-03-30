-- Migration: 004_create_system_votes
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/lenelhluvepajmuueard/sql/new

CREATE TABLE IF NOT EXISTS system_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(system_name, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_votes_system ON system_votes (system_name);

ALTER TABLE system_votes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='system_votes' AND policyname='Anyone can vote'
  ) THEN
    CREATE POLICY "Anyone can vote" ON system_votes FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='system_votes' AND policyname='Anyone can read votes'
  ) THEN
    CREATE POLICY "Anyone can read votes" ON system_votes FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='system_votes' AND policyname='Anyone can delete own vote'
  ) THEN
    CREATE POLICY "Anyone can delete own vote" ON system_votes FOR DELETE USING (true);
  END IF;
END $$;
