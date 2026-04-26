-- supabase/migrations/007_api_keys.sql
--
-- API keys table for the public /v1/* endpoints.
--
-- We never store plaintext keys. The full secret is shown to the issuer
-- once at creation; only its SHA-256 hash is persisted. key_prefix is
-- the first 16 chars (e.g. "osv_test_abc123") for display + log
-- correlation — non-secret because the entropy lives in the suffix.
--
-- Tiers map to pricing: hobby (free), builder (290 SEK/mo), pro
-- (1490 SEK/mo). Per-tier rate limits are applied in middleware.
--
-- alpha is invite-only — no users table yet, just name + email so we know
-- who issued each key to.

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'hobby' CHECK (tier IN ('hobby', 'builder', 'pro')),
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  scan_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys (key_hash) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_api_keys_tier ON api_keys (tier) WHERE revoked_at IS NULL;

ALTER TABLE scan_submissions
  ADD COLUMN IF NOT EXISTS api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_scan_submissions_api_key
  ON scan_submissions (api_key_id, scanned_at DESC)
  WHERE api_key_id IS NOT NULL;

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='api_keys' AND policyname='Service role full access'
  ) THEN
    CREATE POLICY "Service role full access" ON api_keys FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
