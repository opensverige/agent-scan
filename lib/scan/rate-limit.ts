// lib/scan/rate-limit.ts
//
// Per-IP and global daily limits. Reads from Supabase scan_submissions table
// using the service role key (bypasses RLS for the SELECT). Returns
// `{ perIpOk: true, globalOk: true }` if Supabase isn't configured (fail-open
// — better than blocking all scans).
//
// `DAILY_SCAN_LIMIT` env var sets the global daily cap (default 200).

const PER_IP_WINDOW_MS = 60_000;
const REQUEST_TIMEOUT_MS = 3_000;

export interface RateLimitResult {
  perIpOk: boolean;
  globalOk: boolean;
}

export async function checkRateLimits(ipHash: string): Promise<RateLimitResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { perIpOk: true, globalOk: true };

  const dailyLimit = parseInt(process.env.DAILY_SCAN_LIMIT ?? "200", 10) || 200;
  const oneMinuteAgo = new Date(Date.now() - PER_IP_WINDOW_MS).toISOString();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  try {
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    const [perIpRes, globalRes] = await Promise.all([
      fetch(
        `${url}/rest/v1/scan_submissions?select=id&ip_hash=eq.${ipHash}&scanned_at=gte.${oneMinuteAgo}&limit=1`,
        { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
      ),
      fetch(
        `${url}/rest/v1/scan_submissions?select=id&scanned_at=gte.${dayStart.toISOString()}&limit=${dailyLimit + 1}`,
        { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
      ),
    ]);

    const perIpRows = perIpRes.ok ? await perIpRes.json() as unknown[] : [];
    const globalRows = globalRes.ok ? await globalRes.json() as unknown[] : [];

    return {
      perIpOk: perIpRows.length === 0,
      globalOk: globalRows.length < dailyLimit,
    };
  } catch {
    return { perIpOk: true, globalOk: true };
  }
}
