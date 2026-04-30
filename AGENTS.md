# AGENTS.md — agent.opensverige.se

Quick context before you (or your agent) touch this repo. Read once. Nothing here is a hard rule, it's where we already paid the cost of figuring out what works. If a decision doesn't match what you're trying to do, push back, we adjust together. The goal of this file is to stop us from re-deciding the same things every week, not to slow you down.

## What this is

Sveriges öppna AI-readiness scanner. Next.js 15 + TypeScript strict + Tailwind 3 + shadcn. Supabase Postgres in eu-west-2 London. Anthropic Claude for the AI summary field. Vercel deploys.

Owners: Gustaf Garnow + Felipe Otarola. License: FSL-1.1-MIT.

## Decisions you'll bump into (and why)

**`/r/[scanId]` URLs are pinned, not live.** When someone DM-s a scan link, they're sharing a specific moment in time. The receiver should see exactly that. Don't add "show latest scan if newer" logic, we already tried and reverted it (commit `5530328`). It also costs Claude tokens on every fetch.

**Compliance paths are an explicit allowlist, never sitemap-walked.** `lib/scan/probe.ts:COMPLIANCE_PATH_SUFFIXES`. 30 paths covering bare-root (`/privacy`), `/legal/*` (SaaS convention), `/policies/*` (Stripe pattern), `/about/*` (legacy). False positives from broad content matching are worse than N/A. If a real site has its policy somewhere we don't probe, add the path; don't switch to discovery.

**Cookie-bot regex must be word-boundary anchored.** `lib/checks.ts` around line 159. The bare word `agent` matches AI-product copy ("AI agent", "agentic", "useragent") and false-positives the cookie check on AI-tool sites. Keep the `\b...\b` boundaries with case-insensitive flag.

**License is FSL-1.1-MIT, not MIT or AGPL.** Source-available with 2-year non-compete, then converts to MIT. Sentry's pattern. AGPL doesn't actually stop hosted competitors; pure MIT lets anyone re-host commercially day one. See `LICENSE` + `COMMERCIAL.md` before proposing a change.

**Language detection runs server-side in root layout.** `lib/detect-lang.ts` reads cookie, then Accept-Language, then IP country (with UA bot bypass). Manual toggle persists via cookie. Don't move detection client-side, you'll lose the SSR `<html lang>` and get a flicker.

**Em-dashes (—) are AI-slop in user-facing copy.** Use `:` for lists, `,` for clauses, `.` for separation. Code comments are fine. Page titles use `·` for visual rhythm.

**Demo-mode AI summary doesn't leak dev framing.** `lib/claude.ts:buildDemoAnalysis`. No "ANTHROPIC_API_KEY missing" or similar in user-facing text. Stay on the user's side of the curtain.

**Score-zone glow is persistent and color-matched.** `ResultsPage.tsx:scoreLanded` fades in once, then stays. Color tracks `cfg.ringColor` so DELVIS REDO gets dark amber, not primary red. Don't add a fade-out timer.

## Things that look off but are intentional

- `/api/og` returns 0 bytes today. Aware. We swapped to `/assets/og-default.png` everywhere. Don't delete the route, we'll fix it when per-scan OG cards land.
- `LanguageProvider` lives in root layout, not `/scan/layout.tsx`. `/r/*` and other routes need it too.
- `pb-20` on the result wrapper leaves space for `StickyShareButton`'s fixed pill.
- Some files use `cn(...)` helpers and others raw template strings. Consistent within a file. Either is fine.
- Existing scans in DB still show old labels (em-dashes etc.) because `checks_json` is frozen at scan time. Only new scans inherit current labels. We chose not to migrate (commit `4901b5d`).

## Conventions

- TypeScript strict, no `any`, no `// TODO`, no unused imports.
- Named exports over default.
- Swedish in user-facing copy, English in code + commits.
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`. Body explains "why" not "what".
- `npm run lint && npm run type-check && npm run build` should pass before push.
- Branch names: `feature/<short>`, `fix/<short>`, `chore/<short>`.
- New deps: confirm first.

## Workflow

1. Skim this file.
2. If your change touches the **Decisions you'll bump into** section, flag it before reverting it. DM Gustaf or Felipe.
3. Code. Lint. Build. Push.
4. Watch the Vercel deploy. Verify behavior in prod against a real scan, not just locally.
5. If something here is wrong or stale, edit this file in the same PR.

## When in doubt

DM. Strategic reversals waste cycles and Claude tokens. Better to ask than rebuild a week later.
