// lib/api-keys.ts
//
// API key utilities. Stripe-style format:
//   osv_test_<24 random base64url chars>
//   osv_live_<24 random base64url chars>
//
// We never store plaintext keys. Only SHA-256 hash + prefix (first 16 chars
// for display + log correlation). When a key is issued, the plaintext is
// returned ONCE — caller is responsible for delivering it to the user.
//
// Why SHA-256 instead of bcrypt? Performance: keys are validated on every
// /v1/* request (potentially many per second per user). SHA-256 is fast
// (~µs) and the key entropy (24 bytes random = 192 bits) makes brute-force
// infeasible regardless of hash algorithm. bcrypt's slow-by-design property
// only matters when the input has low entropy (passwords).

import { createHash, randomBytes } from "crypto";

export type ApiKeyTier = "hobby" | "builder" | "pro";

export interface IssuedApiKey {
  /** Plaintext — show ONCE at creation, never again. */
  plaintext: string;
  /** SHA-256 hex of plaintext — what we store. */
  hash: string;
  /** First 16 chars of plaintext — non-secret, used for display + logs. */
  prefix: string;
}

/** Generate a new key pair. plaintext returned once; only hash + prefix persisted. */
export function generateApiKey(env: "test" | "live"): IssuedApiKey {
  const secret = randomBytes(24).toString("base64url");
  const plaintext = `osv_${env}_${secret}`;
  const hash = createHash("sha256").update(plaintext).digest("hex");
  const prefix = plaintext.slice(0, 16);
  return { plaintext, hash, prefix };
}

/** Hash an incoming key for DB lookup. */
export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/** Quick format check — doesn't validate the key exists in DB. */
export function looksLikeApiKey(value: string): boolean {
  return /^osv_(test|live)_[A-Za-z0-9_-]{20,}$/.test(value);
}

/**
 * Per-tier monthly + per-minute scan quotas.
 * Free hobby cap is conservative — 15/month covers casual exploration.
 * Source: docs/strategy/research/03-api-monetization-benchmarks.md § 3.5.
 */
export const TIER_QUOTAS: Record<ApiKeyTier, { perMonth: number; perMinute: number }> = {
  hobby: { perMonth: 15, perMinute: 1 },
  builder: { perMonth: 300, perMinute: 1 },
  pro: { perMonth: 2000, perMinute: 2 },
};
