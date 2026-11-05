-- supabase/migrations/009_visibility.sql
--
-- AI-visibility check (/synlighet): a log of started checks for rate
-- limiting and volume tracking, one-time claims that stop a signed plan
-- token from being replayed against the model, and the leads the page
-- captures.
--
-- Not applied automatically. Apply with the Supabase CLI or the SQL editor.
-- Until it is applied, production runs only the technical checks (the AI
-- part is switched off to protect spend, override with
-- VISIBILITY_ALLOW_WITHOUT_DB=1) and leads still reach LEAD_WEBHOOK_URL /
-- DISCORD_WEBHOOK_URL.
--
-- Retention (GDPR Art. 5(1)(e)):
--   visibility_checks: 90 days, same as scan_submissions.
--   visibility_claims: 2 days (tokens expire after 60 minutes).
--   visibility_leads:  12 months after capture unless the person becomes a
--                      customer (move them to the CRM before that) or asks
--                      for erasure earlier (/api/dsar).

CREATE TABLE IF NOT EXISTS visibility_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visibility_checks_ip ON visibility_checks (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visibility_checks_created ON visibility_checks (created_at DESC);

CREATE TABLE IF NOT EXISTS visibility_claims (
  key TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visibility_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  domain TEXT NOT NULL,
  company TEXT,
  wants_monitoring BOOLEAN NOT NULL DEFAULT false,
  wants_call BOOLEAN NOT NULL DEFAULT false,
  result_line TEXT,
  ip_hash TEXT,
  consent_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visibility_leads_created ON visibility_leads (created_at DESC);

-- Service role only. No anon policies: nothing here is readable from the browser.
ALTER TABLE visibility_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE visibility_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE visibility_leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  PERFORM cron.unschedule('visibility-retention');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'visibility-retention',
  '15 3 * * *',
  $$
    DELETE FROM visibility_checks WHERE created_at < NOW() - INTERVAL '90 days';
    DELETE FROM visibility_claims WHERE created_at < NOW() - INTERVAL '2 days';
    DELETE FROM visibility_leads WHERE created_at < NOW() - INTERVAL '12 months';
  $$
);
