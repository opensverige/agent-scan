-- supabase/migrations/008_dsar_requests.sql
--
-- DSAR (Data Subject Access Request) tracking per GDPR Art. 12-22.
-- We must respond within 30 days. Status transitions:
--   received → in_progress → resolved (or rejected if invalid).
--
-- request_type maps to GDPR articles:
--   access (Art. 15)          — "what data do you have on me?"
--   rectification (Art. 16)   — "fix this incorrect data"
--   erasure (Art. 17)         — "delete my data"
--   restriction (Art. 18)     — "stop processing"
--   portability (Art. 20)     — "export my data"
--   objection (Art. 21)       — "stop using LI basis"
--   automated (Art. 22)       — "human review of automated decision"

CREATE TABLE IF NOT EXISTS dsar_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type TEXT NOT NULL CHECK (request_type IN (
    'access', 'rectification', 'erasure', 'restriction',
    'portability', 'objection', 'automated'
  )),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
    'received', 'in_progress', 'resolved', 'rejected'
  )),
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  domain TEXT,
  description TEXT NOT NULL,
  submitter_ip_hash TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  internal_notes TEXT,
  resolution_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_dsar_status ON dsar_requests (status, deadline_at);
CREATE INDEX IF NOT EXISTS idx_dsar_received_at ON dsar_requests (received_at DESC);

ALTER TABLE dsar_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='dsar_requests' AND policyname='Service role full access'
  ) THEN
    CREATE POLICY "Service role full access" ON dsar_requests FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
