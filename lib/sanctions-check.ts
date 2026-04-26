// lib/sanctions-check.ts
//
// Screen B2B onboarding candidates against the EU consolidated sanctions
// list. Required for paid-tier onboarding to satisfy financial-sanctions
// regulations (EU Regulation 2580/2001 + 833/2014; Swedish lag 1996:95).
//
// Uses OpenSanctions (https://www.opensanctions.org/) — open dataset of
// global sanctions lists with a free public API. We hit /match endpoint
// which scores name similarity rather than requiring exact match.
//
// API requires a token as of 2026 (returns 401 without). Register a free
// account at https://www.opensanctions.org/ — free tier covers our B2B
// onboarding volume. Set OPENSANCTIONS_API_KEY env var.
//
// If env var is missing the check returns clear=false (fail-closed) —
// the issue-key.ts script will then refuse to issue a Builder/Pro key,
// forcing a manual review. This is the right behaviour: better to slow
// down onboarding than let through a sanctioned entity silently.
//
// Sub-processor implications: OpenSanctions sees B2B candidate names
// + emails at issuance time. Add to subprocessor list before paid-tier
// launch. Until then alpha-only — invite list is small enough to screen
// manually.

const OPENSANCTIONS_URL = "https://api.opensanctions.org/match/sanctions";
const REQUEST_TIMEOUT_MS = 8_000;
// Score threshold above which we flag for manual review (0..1).
// 0.6 = "probably the same entity"; 0.8 = "almost certainly".
// We use 0.6 as conservative — false positives go to manual review,
// false negatives let bad actors through.
const FLAG_THRESHOLD = 0.6;

export interface SanctionsCandidate {
  name: string;
  email?: string;
  /** Country of incorporation / residence (ISO 3166-1 alpha-2). Optional. */
  country?: string;
}

export interface SanctionsCheckResult {
  /** True if candidate is clean, false if flagged for review or check failed. */
  clear: boolean;
  /** Highest match score across all results (0..1). */
  topScore: number;
  /** Human-readable reason for the verdict. */
  reason: string;
  /** Top match details (name + match details) when flagged. */
  matches?: Array<{
    name: string;
    score: number;
    schema: string;
    datasets: string[];
    sourceUrl?: string;
  }>;
}

interface OpenSanctionsMatchResponse {
  responses?: Record<string, {
    results?: Array<{
      caption?: string;
      score?: number;
      schema?: string;
      datasets?: string[];
      properties?: { sourceUrl?: string[] };
    }>;
  }>;
}

/**
 * Run a sanctions check. Returns clear=true if no concerning matches,
 * clear=false if anything ≥ FLAG_THRESHOLD or if the API errors (fail-closed
 * for B2B onboarding — better to manually review than let through silently).
 *
 * Run before issuing a Builder/Pro key. Document the result in api_keys.notes.
 */
export async function checkSanctions(candidate: SanctionsCandidate): Promise<SanctionsCheckResult> {
  const apiKey = process.env.OPENSANCTIONS_API_KEY;
  if (!apiKey) {
    return {
      clear: false,
      topScore: 0,
      reason: "OPENSANCTIONS_API_KEY not configured — fail-closed, manual review required. Register at opensanctions.org/.",
    };
  }

  const queries = {
    candidate: {
      schema: "Person",
      properties: {
        name: [candidate.name],
        ...(candidate.country ? { country: [candidate.country] } : {}),
      },
    },
  };

  try {
    const res = await fetch(OPENSANCTIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${apiKey}`,
      },
      body: JSON.stringify({ queries }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      return {
        clear: false,
        topScore: 0,
        reason: `OpenSanctions API returned ${res.status} — fail-closed, manual review required`,
      };
    }
    const data = (await res.json()) as OpenSanctionsMatchResponse;
    const results = data.responses?.candidate?.results ?? [];
    const topResult = results[0];
    const topScore = topResult?.score ?? 0;

    if (topScore >= FLAG_THRESHOLD) {
      return {
        clear: false,
        topScore,
        reason: `Possible match against sanctions list (score ${topScore.toFixed(2)}). Manual review required before key issuance.`,
        matches: results.slice(0, 5).map(r => ({
          name: r.caption ?? "(unknown)",
          score: r.score ?? 0,
          schema: r.schema ?? "Unknown",
          datasets: r.datasets ?? [],
          sourceUrl: r.properties?.sourceUrl?.[0],
        })),
      };
    }

    return {
      clear: true,
      topScore,
      reason: topScore > 0
        ? `Best match score ${topScore.toFixed(2)} (below threshold ${FLAG_THRESHOLD}). Cleared.`
        : "No matches found. Cleared.",
    };
  } catch (err) {
    return {
      clear: false,
      topScore: 0,
      reason: `Sanctions check timed out or failed: ${err instanceof Error ? err.message : String(err)}. Manual review required.`,
    };
  }
}
