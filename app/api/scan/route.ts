// app/api/scan/route.ts
//
// Thin HTTP handler for the scan endpoint. All scanning logic lives in
// `lib/scan/`. This file is deliberately small so it's easy to:
//   - swap out for an Inngest workflow when we move to async/public API
//   - reason about HTTP-level concerns (validation, rate limiting, response
//     shape) without scrolling through fetcher code
//
// Vercel: maxDuration=60 covers Claude (15 s) + Firecrawl × 2 + checks.

export const maxDuration = 60;

import { NextRequest } from "next/server";
import { getIpHash } from "@/lib/ip-hash";
import { checkRateLimits } from "@/lib/scan/rate-limit";
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

export async function POST(req: NextRequest) {
  let domain: string;
  try {
    const body = await req.json();
    domain = normalizeDomain(body.domain);
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isValidDomain(domain)) {
    return Response.json({ error: "Ogiltig domän" }, { status: 400 });
  }

  const ipHash = getIpHash(req);

  const { perIpOk, globalOk } = await checkRateLimits(ipHash);
  if (!perIpOk) {
    return Response.json({ error: "För många scanningar. Vänta en minut." }, { status: 429 });
  }
  if (!globalOk) {
    return Response.json({ error: "Daglig scanlimit nådd. Försök igen imorgon." }, { status: 429 });
  }

  const result = await runScanPipeline(domain, ipHash);

  // Backwards-compatible response shape — frontend depends on swedish_check
  // being present even though the gate is no longer applied.
  return Response.json({
    ...result,
    swedish_check: { bypassed: true, reason: "bypass_env" },
  });
}
