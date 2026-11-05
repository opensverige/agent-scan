// lib/visibility/store.ts
//
// Rate limits, replay protection and lead capture for the AI-visibility
// check. Tables come from supabase/migrations/009_visibility.sql.
//
// Spend safety: every AI call costs money, and Vercel runs many instances
// with separate memory. So the check row is written *before* anything runs
// and counted afterwards (concurrent requests see each other), and every
// (token, question, run) is claimed through a unique key in Postgres before
// the model is called. If the database is unavailable in production the AI
// part is switched off rather than left unprotected. Set
// VISIBILITY_ALLOW_WITHOUT_DB=1 to override (local dev does this by default).

const REQUEST_TIMEOUT_MS = 4_000;
const PER_IP_WINDOW_MS = 10 * 60_000;
const PER_IP_MAX = 3;

/** Shown next to the form and stored with every lead as proof of consent. */
export const CONSENT_TEXT =
  "Jag vill att OpenSverige sparar min e-postadress för att skicka resultatet och, om jag kryssat i det, köra om mätningen under 30 dagar eller kontakta mig. Jag kan när som helst be er radera den.";

function supabase(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

function headers(key: string): Record<string, string> {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

/** May the AI part run when the database is unavailable? */
export function allowWithoutDb(): boolean {
  return process.env.VISIBILITY_ALLOW_WITHOUT_DB === "1" || process.env.NODE_ENV !== "production";
}

// ── In-memory fallback (per instance, dev and degraded mode only) ──────────
const memoryChecks = new Map<string, number[]>();
const memoryClaims = new Set<string>();

function memoryCheck(ipHash: string): LimitResult {
  const now = Date.now();
  const recent = (memoryChecks.get(ipHash) ?? []).filter(t => now - t < PER_IP_WINDOW_MS);
  recent.push(now);
  memoryChecks.set(ipHash, recent);
  return recent.length > PER_IP_MAX ? { ok: false, reason: "per_ip", dbBacked: false } : { ok: true, dbBacked: false };
}

export interface LimitResult {
  ok: boolean;
  reason?: "per_ip" | "daily";
  /** True when the decision is backed by Postgres (safe across instances). */
  dbBacked: boolean;
}

/**
 * Record a check and decide whether it may run. Insert first, count after:
 * concurrent requests each see the others' rows, so the caps hold.
 */
export async function admitCheck(domain: string, ipHash: string): Promise<LimitResult> {
  const sb = supabase();
  if (!sb) return memoryCheck(ipHash);

  const dailyLimit = parseInt(process.env.VISIBILITY_DAILY_LIMIT ?? "40", 10) || 40;
  const since = new Date(Date.now() - PER_IP_WINDOW_MS).toISOString();
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  try {
    const insert = await fetch(`${sb.url}/rest/v1/visibility_checks`, {
      method: "POST",
      headers: { ...headers(sb.key), Prefer: "return=minimal" },
      body: JSON.stringify({ domain, ip_hash: ipHash }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!insert.ok) return memoryCheck(ipHash);

    const [ipRes, dayRes] = await Promise.all([
      fetch(`${sb.url}/rest/v1/visibility_checks?select=id&ip_hash=eq.${ipHash}&created_at=gte.${since}&limit=${PER_IP_MAX + 1}`, {
        headers: headers(sb.key),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }),
      fetch(`${sb.url}/rest/v1/visibility_checks?select=id&created_at=gte.${dayStart.toISOString()}&limit=${dailyLimit + 1}`, {
        headers: headers(sb.key),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }),
    ]);
    if (!ipRes.ok || !dayRes.ok) return memoryCheck(ipHash);
    const ipRows = (await ipRes.json()) as unknown[];
    const dayRows = (await dayRes.json()) as unknown[];
    if (ipRows.length > PER_IP_MAX) return { ok: false, reason: "per_ip", dbBacked: true };
    if (dayRows.length > dailyLimit) return { ok: false, reason: "daily", dbBacked: true };
    return { ok: true, dbBacked: true };
  } catch {
    return memoryCheck(ipHash);
  }
}

export type ClaimResult = "ok" | "duplicate" | "unavailable";

/**
 * Claim a one-time key (token signature + question + run). A unique primary
 * key in Postgres makes replays fail across all instances.
 */
export async function claimOnce(key: string): Promise<ClaimResult> {
  const sb = supabase();
  if (!sb) {
    if (memoryClaims.has(key)) return "duplicate";
    memoryClaims.add(key);
    if (memoryClaims.size > 10_000) memoryClaims.clear();
    return "unavailable";
  }
  try {
    const res = await fetch(`${sb.url}/rest/v1/visibility_claims`, {
      method: "POST",
      headers: { ...headers(sb.key), Prefer: "return=minimal" },
      body: JSON.stringify({ key }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (res.ok) return "ok";
    if (res.status === 409) return "duplicate";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

export interface LeadInput {
  email: string;
  domain: string;
  company: string;
  wantsMonitoring: boolean;
  wantsCall: boolean;
  /** Short plain-text result line for the notification. */
  resultLine: string;
  ipHash: string;
}

function plain(s: string, max: number): string {
  // Strip markdown/mention syntax from text that came from the browser or a model.
  return s.replace(/[`*_~|>@<]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

async function notifyWebhook(lead: LeadInput): Promise<boolean> {
  const url = process.env.LEAD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
  if (!url) return false;
  const wants = [lead.wantsMonitoring && "30-dagarsmätning", lead.wantsCall && "vill bli kontaktad"]
    .filter(Boolean)
    .join(", ");
  const content = [
    "**Ny lead från AI-synlighetskollen**",
    `${plain(lead.company, 80)} (${lead.domain})`,
    `E-post: ${plain(lead.email, 254)}`,
    wants && `Vill ha: ${wants}`,
    `Resultat: ${plain(lead.resultLine, 300)}`,
  ]
    .filter(Boolean)
    .join("\n");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // No pings, whatever the text contains.
      body: JSON.stringify({ content: content.slice(0, 1_900), allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Store a lead and notify. True when at least one channel accepted it. */
export async function saveLead(lead: LeadInput): Promise<boolean> {
  const sb = supabase();
  let stored = false;
  if (sb) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/visibility_leads`, {
        method: "POST",
        headers: { ...headers(sb.key), Prefer: "return=minimal" },
        body: JSON.stringify({
          email: lead.email,
          domain: lead.domain,
          company: lead.company,
          wants_monitoring: lead.wantsMonitoring,
          wants_call: lead.wantsCall,
          result_line: lead.resultLine,
          ip_hash: lead.ipHash,
          consent_text: CONSENT_TEXT,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      stored = res.ok;
      if (!res.ok) console.error(`[visibility] lead insert ${res.status}: ${(await res.text()).slice(0, 200)}`);
    } catch (err) {
      console.error("[visibility] lead insert failed:", err instanceof Error ? err.message : String(err));
    }
  }
  const notified = await notifyWebhook(lead);
  return stored || notified;
}
