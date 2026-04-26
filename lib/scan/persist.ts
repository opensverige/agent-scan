// lib/scan/persist.ts
//
// Persistence layer for scan results. Writes to Supabase scan_submissions
// table with backwards-compatible payload fallback for older schemas.
// Returns the inserted row's UUID, or null when Supabase isn't configured /
// the write fails (caller falls back to local-scan-store).

import type { AllChecks } from "@/lib/checks";

const REQUEST_TIMEOUT_MS = 5_000;

export interface PersistArgs {
  domain: string;
  checks: AllChecks;
  badge: string;
  score: number;
  total: number;
  summary: string;
  recommendations: string[];
  ipHash: string;
}

export async function saveToSupabase(args: PersistArgs): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const { domain, checks, badge, score, total, summary, recommendations, ipHash } = args;

  const discovery = [checks.robots_ok, checks.sitemap_exists, checks.llms_txt];
  const compliance = [checks.privacy_automation, checks.cookie_bot_handling, checks.ai_content_marking];
  const builder = [checks.api_exists, checks.openapi_spec, checks.api_docs, checks.mcp_server, checks.sandbox_available];

  const baseHeaders = {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: "return=representation",
  };

  const modernPayload = {
    domain, badge,
    checks_passed: score, checks_total: total,
    discovery_passed: discovery.filter(c => c.pass).length,
    compliance_passed: compliance.filter(c => c.pass).length,
    builder_passed: builder.filter(c => c.pass).length,
    has_robots: checks.robots_ok.pass, has_sitemap: checks.sitemap_exists.pass,
    has_llms_txt: checks.llms_txt.pass, has_api: checks.api_exists.pass,
    has_openapi_spec: checks.openapi_spec.pass, has_api_docs: checks.api_docs.pass,
    checks_json: checks, claude_summary: summary, recommendations, ip_hash: ipHash,
  };

  // Backward-compatible payload for older scan_submissions schemas.
  const legacyPayload = {
    domain,
    badge,
    checks_passed: score,
    checks_json: checks,
    has_robots: checks.robots_ok.pass,
    has_sitemap: checks.sitemap_exists.pass,
    has_llms_txt: checks.llms_txt.pass,
    wants_deep_scan: false,
    ip_hash: ipHash,
  };

  try {
    const res = await fetch(`${url}/rest/v1/scan_submissions`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(modernPayload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (res.ok) {
      const rows = await res.json() as Array<{ id: string }>;
      return rows[0]?.id ?? null;
    }

    const errText = await res.text().catch(() => "");
    console.warn(`[scan] modern insert failed status=${res.status} body=${errText.slice(0, 220)}`);

    const fallbackRes = await fetch(`${url}/rest/v1/scan_submissions`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(legacyPayload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!fallbackRes.ok) {
      const fallbackErr = await fallbackRes.text().catch(() => "");
      console.warn(`[scan] legacy insert failed status=${fallbackRes.status} body=${fallbackErr.slice(0, 220)}`);
      return null;
    }
    const rows = await fallbackRes.json() as Array<{ id: string }>;
    return rows[0]?.id ?? null;
  } catch (error) {
    console.warn("[scan] saveToSupabase error", error);
    return null;
  }
}
