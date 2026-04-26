// lib/ip-hash.ts
//
// HMAC-SHA256(ip, IP_HASH_PEPPER) — stronger than plain SHA-256 because
// IPv4 has only ~4 billion addresses (trivially brute-forceable on a GPU).
// The pepper is a server-side secret that makes hashes irreversible without
// access to the secret.
//
// Per CJEU Breyer (C-582/14) + EDPB Guidelines 01/2025, hashed IP is still
// pseudonymised personal data while we hold the pepper. We treat it as
// personal data in our GDPR flows. See research/04-legal-eu-ai-act-gdpr.md § 4.3.
//
// If IP_HASH_PEPPER is missing in production we throw — fail-closed, since
// rate limiting depends on a stable hash and a missing pepper would silently
// break per-IP correlation across requests.

import { createHmac } from "crypto";
import type { NextRequest } from "next/server";

const PEPPER = process.env.IP_HASH_PEPPER;

if (!PEPPER && process.env.NODE_ENV === "production") {
  throw new Error(
    "IP_HASH_PEPPER missing in production. Set a 32+ byte hex value in Vercel env vars.",
  );
}

// Dev-only fallback so local development doesn't crash if .env.local is
// missing the pepper. Never hits production thanks to the throw above.
const EFFECTIVE_PEPPER = PEPPER ?? "dev-only-pepper-do-not-use-in-production";

/** HMAC-SHA256 hex of `ip` with the server-side pepper. Stable across requests. */
export function hashIp(ip: string): string {
  return createHmac("sha256", EFFECTIVE_PEPPER).update(ip).digest("hex");
}

/** Extract client IP from request headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
  return forwarded.split(",")[0].trim() || "unknown";
}

/** Convenience: extract IP and hash it in one call. */
export function getIpHash(req: NextRequest): string {
  return hashIp(getClientIp(req));
}
