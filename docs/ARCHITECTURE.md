# Architecture

High-level overview for contributors. For roadmap + decisions, see [strategy/PLAN.md](strategy/PLAN.md). For the per-check methodology, see [SCANNER-METHODOLOGY.md](SCANNER-METHODOLOGY.md).

## Request flow

```
                                        ┌──────────────────────┐
USER ─► Browser ─► /scan (Next.js page) │ POST /api/scan       │
                                        │ (Node runtime, 60s   │
                                        │  maxDuration)        │
                                        └──────────┬───────────┘
                                                   │
                              ┌────────────────────┴───────────────────┐
                              ▼                                        ▼
                  ┌──────────────────────┐                  ┌─────────────────────┐
                  │ POST /api/v1/scan    │                  │  lib/scan/pipeline   │
                  │ (auth, rate-limit,   │                  │  orchestrator        │
                  │  per-key quota)      │                  │                      │
                  └──────────┬───────────┘                  └──────────┬──────────┘
                             │                                          │
                             └──────────────────────────────────────────┘
                                                  │
                  ┌───────────────────┬───────────┼───────────┬───────────────────┐
                  ▼                   ▼           ▼           ▼                   ▼
              probe.ts          firecrawl.ts   exa.ts    discovery.ts        claude.ts
              (parallel)        (JS render)   (search)   (npm/GH/llms)       (LLM)
              ~30 HTTP probes
                  │                   │           │           │                   │
                  └───────────────────┴───────────┴───────────┴───────────────────┘
                                                  │
                                                  ▼
                                          ┌────────────────┐
                                          │ derive.ts      │
                                          │ (post-check    │
                                          │  derivation)   │
                                          └────────┬───────┘
                                                   │
                                                   ▼
                                          ┌────────────────┐
                                          │ scoring +      │
                                          │ recommendations│
                                          └────────┬───────┘
                                                   │
                                                   ▼
                                          ┌────────────────┐
                                          │ persist.ts     │
                                          │ (Supabase      │
                                          │  eu-west-2)    │
                                          └────────────────┘
```

## Module structure

```
agent-opensverige/
├── app/
│   ├── scan/                       Web UI for the scanner
│   │   └── [domain]/_components/   Result-page sub-components (split by render concern)
│   ├── legal/                      ToS, AUP, AI Disclosure, sub-processors
│   ├── integritetspolicy/          Privacy policy (sv root, en via i18n)
│   ├── api-docs/                   Scalar UI rendering /openapi.yaml
│   └── api/
│       ├── scan/                   Internal endpoint used by web UI (no auth)
│       ├── v1/scan/                Public REST API (Bearer auth)
│       ├── v1/scan/[id]/           Lookup by UUID with ETag
│       ├── stats/                  Live counter (cached 60s)
│       ├── dsar/                   GDPR Data Subject Access Request submission
│       └── ...
├── lib/
│   ├── scan/                       Scan pipeline modules
│   │   ├── pipeline.ts             Composes phases — entry point for both /api/scan + /api/v1/scan
│   │   ├── probe.ts                Phase 1+1.5 parallel HTTP probes
│   │   ├── fetch.ts                Timeout-aware fetcher with body windowing
│   │   ├── robots.ts               RFC 9309 parser
│   │   ├── discovery.ts            apis.guru + GitHub MCP search + multi-signal portal race
│   │   ├── firecrawl.ts            JS-rendered scraping
│   │   ├── exa.ts                  Semantic search
│   │   ├── openapi-extractor.ts    Spec extraction from inline __redoc_state JSON
│   │   ├── derive.ts               Pure post-check derivation rules
│   │   ├── persist.ts              Supabase write with backwards-compat fallback
│   │   ├── rate-limit.ts           Per-IP + global daily limits
│   │   └── claude.ts               Anthropic LLM integration
│   ├── checks.ts                   17 check functions + interfaces
│   ├── check-context.ts            Stat + source + action per check (for UI + transparency)
│   ├── api-keys.ts                 Stripe-style key generation + tier quotas
│   ├── api-auth.ts                 Bearer token validation + per-key rate limit
│   ├── ip-hash.ts                  HMAC-SHA256 + pepper
│   ├── sanctions-check.ts          OpenSanctions screening for B2B onboarding
│   └── i18n.ts                     SV + EN translations
├── docs/
│   ├── ARCHITECTURE.md             This file
│   ├── API.md                      API reference + quickstart
│   ├── SCANNER-METHODOLOGY.md      Per-check methodology + sources
│   ├── DPA-STATUS.md               Sub-processor DPA tracking
│   ├── TIA.md                      Transfer Impact Assessment
│   ├── RoPA.md                     Register of Processing Activities
│   ├── INCIDENT-RESPONSE.md        Incident runbook
│   └── strategy/
│       ├── PLAN.md                 Roadmap by stages
│       ├── CHECKLIST.md            Concrete TODOs per stage
│       ├── DECISIONS.md            Decision log
│       └── research/               Source research documents (Apr 2026)
├── public/
│   ├── openapi.yaml                Public API spec
│   ├── llms.txt                    AI-agent context summary (root)
│   ├── llms-full.txt               Full AI-agent context
│   └── .well-known/
│       └── security.txt            RFC 9116
├── supabase/
│   └── migrations/                 8 migrations: scan_submissions, api_scores, system_votes,
│                                   retention_cron, api_keys, dsar_requests
├── scripts/
│   ├── issue-key.ts                Issue alpha API keys (with sanctions screening)
│   └── rescan-seeds.sh             One-off seed-domain rescan script
└── middleware.ts                   Markdown content negotiation (G-02 dogfood)
```

## Key design decisions

### Why Postgres as queue (no Redis)

We do per-key rate limiting by counting rows in `scan_submissions` filtered by `api_key_id`. No Redis dependency. Stays in EU. Stage 2B will add a proper queue (Trigger.dev EU likely) for async webhook delivery — not for rate limiting.

### Why pg_cron for retention (not Inngest)

Retention is `DELETE WHERE scanned_at < now() - 90d`. That's a SQL operation on data already in Postgres. Inngest would have added a US-based scheduler for a job that doesn't need network. pg_cron runs in the same Supabase instance.

### Why FSL not AGPL

AGPL doesn't actually stop AWS/Cloudflare from wrapping the code as a managed service — it just requires they publish their changes, which they tolerate. FSL contractually prohibits the competing-use scenario for 2 years, then auto-converts to MIT. Acquirer-friendlier, dual-license-ready. Sentry, MariaDB, Keygen pattern.

### Why the modular `lib/scan/` split (not one big route)

The previous 902-line `route.ts` mixed HTTP fetching, parsing, scoring, persistence. After the architecture-strategist agent review (Stage 0), we split into per-concern modules. Stage 2B will move the orchestration into Trigger.dev step functions — the modular split makes that swap trivial.

### Why `derive.ts` is a separate module

In the old code, checks were retroactively mutated after orchestration (sandbox upgrade, MCP downgrade, N/A marking). That made testing hard and orchestration brittle. `derive.ts` is now a pure function: `(checks, ctx) => derivedChecks`. No mutation, no surprises.

## Privacy + compliance posture

- Hashed IP via HMAC-SHA256 with server-held pepper (`lib/ip-hash.ts`). Per CJEU Breyer + EDPB Guidelines 01/2025.
- 90-day retention enforced via `pg_cron` (`supabase/migrations/006_retention_cron.sql`).
- DSAR endpoint at `/api/dsar` with 30-day SLA (`docs/RoPA.md` Activity 4).
- Every API response includes `ai_disclosure` per EU AI Act Art. 50.
- See [docs/TIA.md](TIA.md) for full Transfer Impact Assessment.

## Testing

- `npm run type-check` — strict TypeScript across the repo
- `npm run lint` — ESLint (Next.js config)
- `npm run build` — full Next.js production build
- CI runs all three on every PR (.github/workflows/ci.yml)

Manual verification of `/v1/*` endpoints uses `scripts/issue-key.ts` to mint a test key and curl directly. There's no formal test runner for scan logic yet — Stage 5 priority.

## Where to look when

| Question | Where to look |
|---|---|
| How does a check work? | `lib/checks.ts` + `docs/SCANNER-METHODOLOGY.md` |
| How does the API authenticate? | `lib/api-auth.ts` + `docs/API.md` |
| How is data retained? | `supabase/migrations/006_retention_cron.sql` + `docs/RoPA.md` |
| What's the roadmap? | `docs/strategy/PLAN.md` + `CHANGELOG.md` |
| Why was X built this way? | `docs/strategy/DECISIONS.md` |
| How do I add a new check? | `CONTRIBUTING.md` "Lägg till en ny check" + open a check-proposal issue |
