// lib/api-auth.ts
//
// Authenticate a request to /v1/* using an API key in the Authorization
// header. Returns either the resolved key record or an Error response that
// the route handler returns directly.
//
// Why a helper instead of Next.js middleware: middleware runs on every
// request including static assets, and Next 15 middleware has narrow
// runtime constraints (Edge runtime, no Node Postgres clients). A
// helper invoked from each /v1/* route is simpler and keeps Postgres
// access in the Node runtime where it works.

import type { NextRequest } from "next/server";
import { hashApiKey, looksLikeApiKey, type ApiKeyTier, TIER_QUOTAS } from "./api-keys";

export interface AuthenticatedKey {
  id: string;
  tier: ApiKeyTier;
  prefix: string;
  name: string;
}

export type AuthResult =
  | { ok: true; key: AuthenticatedKey }
  | { ok: false; status: number; error: string; code: string };

/**
 * Validate Authorization header against api_keys table.
 *
 * Returns ok=true with the resolved key on success.
 * Returns ok=false with HTTP status + machine-readable code on failure:
 *   missing_auth   401  no Authorization header
 *   invalid_format 401  header doesn't match osv_(test|live)_*
 *   invalid_key    401  format OK but no matching row in DB (or revoked)
 *   server_error   500  Supabase unreachable / config missing
 *
 * Side effect: bumps last_used_at on success. We don't await the bump —
 * fire-and-forget — to keep auth latency minimal.
 */
export async function authenticate(req: NextRequest): Promise<AuthResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { ok: false, status: 500, error: "API not configured", code: "server_error" };
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return {
      ok: false,
      status: 401,
      code: "missing_auth",
      error: "Missing Authorization header. Send 'Authorization: Bearer osv_*'.",
    };
  }

  const bearer = /^Bearer\s+(.+)$/i.exec(authHeader)?.[1]?.trim();
  if (!bearer || !looksLikeApiKey(bearer)) {
    return {
      ok: false,
      status: 401,
      code: "invalid_format",
      error: "Authorization must be 'Bearer osv_(test|live)_<secret>'.",
    };
  }

  const keyHash = hashApiKey(bearer);
  try {
    const res = await fetch(
      `${url}/rest/v1/api_keys?key_hash=eq.${encodeURIComponent(keyHash)}&revoked_at=is.null&select=id,tier,key_prefix,name&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(3_000),
      },
    );
    if (!res.ok) {
      return { ok: false, status: 500, error: "Auth lookup failed", code: "server_error" };
    }
    const rows = await res.json() as Array<{ id: string; tier: ApiKeyTier; key_prefix: string; name: string }>;
    const row = rows[0];
    if (!row) {
      return { ok: false, status: 401, code: "invalid_key", error: "Unknown or revoked API key." };
    }

    // Fire-and-forget bump of last_used_at. If it fails we don't care — it's
    // observability data, not security-critical.
    void fetch(
      `${url}/rest/v1/api_keys?id=eq.${row.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ last_used_at: new Date().toISOString() }),
        signal: AbortSignal.timeout(2_000),
      },
    ).catch(() => {});

    return {
      ok: true,
      key: { id: row.id, tier: row.tier, prefix: row.key_prefix, name: row.name },
    };
  } catch {
    return { ok: false, status: 500, error: "Auth lookup timed out", code: "server_error" };
  }
}

/**
 * Per-key rate limit. Counts scans submitted in the last minute or month
 * by this key. Returns ok=true if within limits, otherwise an HTTP 429
 * response shape with Retry-After hint.
 */
export interface RateLimitOk { ok: true }
export interface RateLimitFail { ok: false; status: 429; code: string; error: string; retry_after_seconds: number }
export type RateLimitResult = RateLimitOk | RateLimitFail;

export async function enforceRateLimit(keyId: string, tier: ApiKeyTier): Promise<RateLimitResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !apiKey) return { ok: true };

  const quotas = TIER_QUOTAS[tier];
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  try {
    const headers = { apikey: apiKey, Authorization: `Bearer ${apiKey}` };
    const [perMinRes, perMonthRes] = await Promise.all([
      fetch(
        `${url}/rest/v1/scan_submissions?select=id&api_key_id=eq.${keyId}&scanned_at=gte.${oneMinuteAgo}&limit=${quotas.perMinute + 1}`,
        { headers, signal: AbortSignal.timeout(3_000) },
      ),
      fetch(
        `${url}/rest/v1/scan_submissions?select=id&api_key_id=eq.${keyId}&scanned_at=gte.${monthStart.toISOString()}&limit=${quotas.perMonth + 1}`,
        { headers, signal: AbortSignal.timeout(3_000) },
      ),
    ]);

    const perMinRows = perMinRes.ok ? await perMinRes.json() as unknown[] : [];
    const perMonthRows = perMonthRes.ok ? await perMonthRes.json() as unknown[] : [];

    if (perMinRows.length >= quotas.perMinute) {
      return {
        ok: false,
        status: 429,
        code: "rate_limit_per_minute",
        error: `Rate limit: max ${quotas.perMinute} scan/minute on tier '${tier}'. Wait 60s.`,
        retry_after_seconds: 60,
      };
    }
    if (perMonthRows.length >= quotas.perMonth) {
      return {
        ok: false,
        status: 429,
        code: "rate_limit_per_month",
        error: `Monthly quota of ${quotas.perMonth} scans reached on tier '${tier}'. Resets 1st of next month.`,
        retry_after_seconds: 60 * 60 * 24,
      };
    }
    return { ok: true };
  } catch {
    // Fail open — better than blocking all paid users on a Supabase blip.
    return { ok: true };
  }
}
