// inngest/cron-retention.ts
//
// Daily retention enforcer. Deletes scan_submissions rows older than 90 days.
//
// Why a cron job: GDPR Art. 5(1)(e) data minimisation requires we don't
// keep personal data (incl. hashed IP) longer than necessary. Our privacy
// policy commits to 90-day retention. Without an automated job that promise
// drifts — Supabase doesn't expire rows on its own.
//
// Why Inngest instead of pg_cron / Vercel cron: Inngest gives us
// observability (events, retries, dead-letter queue) for free, and
// scales to the long-running async workflows we'll need for the public
// API (Stage 2 in docs/strategy/PLAN.md).

import { inngest } from "./client";

const RETENTION_DAYS = 90;

/** Deletes scan rows older than RETENTION_DAYS. Returns count of deleted rows. */
async function deleteExpiredScans(): Promise<{ deleted: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[retention] Supabase not configured — skipping cleanup");
    return { deleted: 0 };
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Supabase REST: DELETE returns affected rows when Prefer: return=representation.
  const res = await fetch(
    `${url}/rest/v1/scan_submissions?scanned_at=lt.${cutoff}`,
    {
      method: "DELETE",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=representation",
      },
      signal: AbortSignal.timeout(30_000),
    },
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error(`[retention] DELETE failed status=${res.status} body=${errText.slice(0, 200)}`);
    throw new Error(`Retention cleanup failed: ${res.status}`);
  }

  const rows = await res.json() as Array<{ id: string }>;
  return { deleted: rows.length };
}

/**
 * Run daily at 03:00 UTC (low-traffic window for our European user base).
 * If a run fails, Inngest retries with exponential backoff before
 * dead-lettering. We'll alert on dead letters once we add monitoring.
 */
export const retentionCleanup = inngest.createFunction(
  {
    id: "retention-cleanup",
    name: "Daily retention cleanup (90 days)",
    triggers: [{ cron: "0 3 * * *" }],
  },
  async ({ step }) => {
    const { deleted } = await step.run("delete-expired-scans", deleteExpiredScans);
    return { deleted, retention_days: RETENTION_DAYS };
  },
);
