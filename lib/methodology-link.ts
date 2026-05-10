// lib/methodology-link.ts
//
// Helpdesk-pattern: every failing scan check links to a per-check
// methodology article at /methodology/<slug>. This wires the entry
// point. The article hub itself ships in a follow-up PR — until then
// the link stays hidden behind NEXT_PUBLIC_METHODOLOGY_LIVE so users
// don't 404.
//
// CheckId in lib/checks.ts uses snake_case (matches the canonical ID
// the API returns). URLs use kebab-case because that's the AEO + web
// standard and what we already advertise in llms.txt + sitemaps.

import type { CheckId } from "./checks";

/** Map a CheckId (snake_case) to its public methodology URL. */
export function methodologyUrl(checkId: CheckId): string {
  return `/methodology/${checkId.replace(/_/g, "-")}`;
}

/**
 * Whether the /methodology hub is live in this build. Defaults to off
 * so the link is invisible until the article hub ships.
 *
 * `process.env.NEXT_PUBLIC_*` is inlined at build time, so flipping
 * this in Vercel env vars + redeploying is the activation switch —
 * no code change required when the hub goes live.
 */
export function isMethodologyLive(): boolean {
  return process.env.NEXT_PUBLIC_METHODOLOGY_LIVE === "true";
}
