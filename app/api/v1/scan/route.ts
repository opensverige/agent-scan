// app/api/v1/scan/route.ts
//
// Public REST API entry point. Synchronous scan-and-return — caller waits
// up to 60s for the full result. Async + webhook flow lands in Stage 2B
// (POST returns 202 + Location, polling on /v1/scan/{id}). For now the
// alpha builders we're inviting are happy with a 30-second sync request.
//
// Auth: Authorization: Bearer osv_(test|live)_*
// Rate limit: per-key per-tier quotas (see lib/api-keys.ts TIER_QUOTAS)
//
// Response shape mirrors /api/scan exactly so /v1 consumers can re-use the
// same parser logic. The `ai_disclosure` field per EU AI Act Art. 50 is
// always populated.

export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { authenticate, enforceRateLimit } from "@/lib/api-auth";
import { getIpHash } from "@/lib/ip-hash";
import { runScanPipeline } from "@/lib/scan/pipeline";

const PRIVATE_TLDS = [".local", ".internal", ".localdomain", ".localhost"] as const;
const DOMAIN_REGEX = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/;

function normalizeDomain(input: unknown): string {
  return String(input ?? "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  if (!DOMAIN_REGEX.test(domain)) return false;
  if (PRIVATE_TLDS.some(tld => domain.endsWith(tld))) return false;
  return true;
}

function errorResponse(status: number, code: string, message: string, extras?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    { error: { code, message, ...extras } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  // ── 1. Auth ──
  const auth = await authenticate(req);
  if (!auth.ok) {
    return errorResponse(auth.status, auth.code, auth.error);
  }

  // ── 2. Validate body ──
  let domain: string;
  try {
    const body = await req.json();
    domain = normalizeDomain(body.domain);
  } catch {
    return errorResponse(400, "invalid_json", "Request body must be valid JSON.");
  }
  if (!isValidDomain(domain)) {
    return errorResponse(400, "invalid_domain", `'${domain}' is not a valid public domain.`);
  }

  // ── 3. Rate limit (per key) ──
  const limit = await enforceRateLimit(auth.key.id, auth.key.tier);
  if (!limit.ok) {
    return NextResponse.json(
      { error: { code: limit.code, message: limit.error, retry_after_seconds: limit.retry_after_seconds } },
      {
        status: limit.status,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(limit.retry_after_seconds),
        },
      },
    );
  }

  // ── 4. Run pipeline ──
  // Use the request IP-hash for analytics + abuse signals, AND tag the row
  // with api_key_id so per-key quota counting works in step 3 next request.
  const ipHash = getIpHash(req);
  const result = await runScanPipeline(domain, ipHash, { apiKeyId: auth.key.id });

  // ── 5. Respond ──
  return NextResponse.json(
    {
      ...result,
      // Deprecated field kept for shape parity with /api/scan v0 response.
      swedish_check: { bypassed: true, reason: "bypass_env" },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        // Echo the key prefix back so consumers can correlate logs.
        "X-API-Key-Prefix": auth.key.prefix,
      },
    },
  );
}

// CORS preflight — allow cross-origin API calls from any browser. Public APIs.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
