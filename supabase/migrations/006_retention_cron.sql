-- supabase/migrations/006_retention_cron.sql
--
-- Daily retention enforcement via pg_cron. Deletes scan_submissions rows
-- older than 90 days. Required to back the privacy-policy promise (GDPR
-- Art. 5(1)(e) data minimisation): without an automated job that promise
-- drifts — Postgres does not expire rows on its own.
--
-- Why pg_cron instead of an external scheduler:
--   - Stays entirely inside the EU (eu-west-2 London) Supabase database
--     where the scan_submissions table already lives — no transit, no
--     additional sub-processor, no DPA expansion
--   - Zero network round-trip — the DELETE runs in the same Postgres
--     instance
--   - Free, included in every Supabase plan
--   - Atomic with the database it operates on (no consistency window)
--
-- The earlier Inngest implementation (commit b0b4b27) is removed. Inngest
-- runs in AWS us-east-* and would have introduced a US sub-processor for
-- a job that doesn't even need network egress.

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Idempotent: drop existing job before re-creating so this migration can
-- be re-applied without conflict.
DO $$
BEGIN
  PERFORM cron.unschedule('retention-cleanup');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Run daily at 03:00 UTC (low-traffic window for European users).
-- Deletes any scan_submissions row older than 90 days.
SELECT cron.schedule(
  'retention-cleanup',
  '0 3 * * *',
  $$
    DELETE FROM scan_submissions
    WHERE scanned_at < NOW() - INTERVAL '90 days';
  $$
);

-- Verify the job exists. Run this manually after migration:
--   SELECT * FROM cron.job WHERE jobname = 'retention-cleanup';
