-- Migration: 003_create_scan_submissions
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/lenelhluvepajmuueard/sql/new

CREATE TABLE IF NOT EXISTS scan_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  badge TEXT NOT NULL CHECK (badge IN ('green','yellow','red')),
  checks_passed INTEGER NOT NULL,
  checks_total INTEGER NOT NULL DEFAULT 11,
  discovery_passed INTEGER NOT NULL DEFAULT 0,
  compliance_passed INTEGER NOT NULL DEFAULT 0,
  builder_passed INTEGER NOT NULL DEFAULT 0,
  has_robots BOOLEAN,
  has_sitemap BOOLEAN,
  has_llms_txt BOOLEAN,
  has_api BOOLEAN,
  has_openapi_spec BOOLEAN,
  has_api_docs BOOLEAN,
  checks_json JSONB NOT NULL DEFAULT '{}',
  claude_summary TEXT,
  recommendations TEXT[],
  wants_deep_scan BOOLEAN DEFAULT false,
  ip_hash TEXT,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_domain ON scan_submissions (domain, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_deep ON scan_submissions (wants_deep_scan) WHERE wants_deep_scan = true;
CREATE INDEX IF NOT EXISTS idx_scan_ip_rate ON scan_submissions (ip_hash, scanned_at DESC);

ALTER TABLE scan_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='scan_submissions' AND policyname='Anyone can insert scans'
  ) THEN
    CREATE POLICY "Anyone can insert scans" ON scan_submissions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='scan_submissions' AND policyname='Service role reads scans'
  ) THEN
    CREATE POLICY "Service role reads scans" ON scan_submissions FOR SELECT USING (auth.role() = 'service_role');
  END IF;
END $$;
