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
 * Whether the /methodology hub is live in this build. Defaults ON now
 * that the hub route exists — set NEXT_PUBLIC_METHODOLOGY_LIVE=false
 * to hide the helpdesk link from scan results (e.g. for a preview
 * deploy that hasn't shipped any articles yet).
 *
 * `process.env.NEXT_PUBLIC_*` is inlined at build time, so flipping
 * this in Vercel env vars + redeploying is the only switch needed.
 */
export function isMethodologyLive(): boolean {
  return process.env.NEXT_PUBLIC_METHODOLOGY_LIVE !== "false";
}
