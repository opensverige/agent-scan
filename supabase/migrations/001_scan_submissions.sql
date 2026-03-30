-- Migration: 001_scan_submissions
-- Run this in the Supabase SQL editor before launch.
-- Table: scan_submissions

CREATE TABLE IF NOT EXISTS scan_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain         TEXT NOT NULL,

  -- Aggregated result
  badge          TEXT NOT NULL CHECK (badge IN ('green', 'yellow', 'red')),
  checks_passed  INTEGER NOT NULL DEFAULT 0 CHECK (checks_passed BETWEEN 0 AND 7),
  checks_json    JSONB,

  -- Live check results
  has_robots     BOOLEAN NOT NULL DEFAULT false,
  has_sitemap    BOOLEAN NOT NULL DEFAULT false,
  has_llms_txt   BOOLEAN NOT NULL DEFAULT false,

  -- Interest signal
  wants_deep_scan BOOLEAN NOT NULL DEFAULT false,

  -- Privacy-safe meta
  ip_hash        TEXT,          -- SHA-256 of IP — never store raw IP
  user_agent     TEXT,

  scanned_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS scan_submissions_domain_idx        ON scan_submissions (domain);
CREATE INDEX IF NOT EXISTS scan_submissions_badge_idx         ON scan_submissions (badge);
CREATE INDEX IF NOT EXISTS scan_submissions_scanned_at_idx    ON scan_submissions (scanned_at DESC);
CREATE INDEX IF NOT EXISTS scan_submissions_ip_hash_idx       ON scan_submissions (ip_hash, scanned_at DESC);
CREATE INDEX IF NOT EXISTS scan_submissions_deep_scan_idx     ON scan_submissions (wants_deep_scan) WHERE wants_deep_scan = true;

-- Row-level security
ALTER TABLE scan_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public scanner)
CREATE POLICY "Public insert"
  ON scan_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service role can read
-- (No SELECT policy for anon/authenticated — use service role key server-side)

-- Useful queries:
--
-- Total scans:
--   SELECT COUNT(*) FROM scan_submissions;
--
-- Unique domains:
--   SELECT domain, COUNT(*) FROM scan_submissions GROUP BY domain ORDER BY COUNT(*) DESC;
--
-- Badge distribution:
--   SELECT badge, COUNT(*) FROM scan_submissions GROUP BY badge;
--
-- Deep scan interest:
--   SELECT COUNT(*) FROM scan_submissions WHERE wants_deep_scan = true;
--
-- Recent scans:
--   SELECT domain, badge, scanned_at FROM scan_submissions ORDER BY scanned_at DESC LIMIT 50;
