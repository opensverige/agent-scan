// lib/visibility/token.ts
//
// Stateless signed plan token. The plan endpoint returns it, the ask
// endpoint only runs questions carried in a valid, unexpired token. Without
// this, /api/synlighet/ask would be a free web-search-enabled Claude proxy
// for anyone who finds it.

import { createHmac, timingSafeEqual } from "crypto";
import type { VisibilityPlan } from "./plan";

const TTL_MS = 60 * 60_000;

function secret(): string {
  const s = process.env.VISIBILITY_SIGNING_SECRET || process.env.IP_HASH_PEPPER;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("VISIBILITY_SIGNING_SECRET or IP_HASH_PEPPER must be set in production.");
  }
  return "dev-only-visibility-secret";
}

interface TokenPayload {
  d: string;
  p: VisibilityPlan;
  iat: number;
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

/** Answer runs per question: 1 for the entity question, VISIBILITY_RUNS (1-4, default 2) otherwise. */
export function runsFor(index: number): number {
  if (index === 0) return 1;
  const n = parseInt(process.env.VISIBILITY_RUNS ?? "2", 10);
  return Number.isFinite(n) && n >= 1 && n <= 4 ? n : 2;
}

export function issuePlanToken(domain: string, plan: VisibilityPlan): { token: string; expiresAt: number } {
  const iat = Date.now();
  const payload: TokenPayload = { d: domain, p: plan, iat };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${data}.${sign(data)}`, expiresAt: iat + TTL_MS };
}

export interface VerifiedToken {
  domain: string;
  plan: VisibilityPlan;
  /** Signature, unique per issued plan. Used as the replay-claim prefix. */
  sig: string;
}

export function verifyPlanToken(token: unknown): VerifiedToken | null {
  if (typeof token !== "string" || token.length > 20_000) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = Buffer.from(sign(data));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as TokenPayload;
    if (typeof payload.iat !== "number" || Date.now() - payload.iat > TTL_MS) return null;
    if (typeof payload.d !== "string" || !payload.p) return null;
    return { domain: payload.d, plan: payload.p, sig };
  } catch {
    return null;
  }
}
