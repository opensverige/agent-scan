# Changelog

All notable changes to this project. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) + [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `.github/` infrastructure: CI workflow, issue + PR templates, dependabot, CODEOWNERS, FUNDING
- `COMMERCIAL.md` — commercial licensing path for FSL non-compete waiver
- `SECURITY.md` — vulnerability disclosure policy + scope
- `CHANGELOG.md` — this file
- `public/llms-full.txt` — full agent context document
- `middleware.ts` — markdown content negotiation per Cloudflare's agent-readiness pattern (G-02)

### Changed

- Repo root cleaned up: screenshots moved to `docs/screenshots/`, `.DS_Store` files removed, stale `GEO-AUDIT-REPORT.md` moved to `docs/historical-geo-audit.md`

## [0.4.0] — 2026-04-26 — Stage 4 (legal hardening)

### Added

- 4 public legal pages: `/legal/terms`, `/legal/aup`, `/legal/ai-disclosure`, `/legal/subprocessors`
- `/api/dsar` endpoint with 30-day SLA per GDPR Art. 12(3)
- `dsar_requests` table with state machine (received → in_progress → resolved/rejected)
- `lib/sanctions-check.ts` — OpenSanctions screening for B2B onboarding
- Internal compliance docs: `docs/DPA-STATUS.md`, `docs/TIA.md`, `docs/RoPA.md`, `docs/INCIDENT-RESPONSE.md`
- `LegalDocument` shared component (DRY across 5 legal pages)

### Changed

- `scripts/issue-key.ts` now refuses Builder/Pro keys without sanctions clearance

## [0.3.0] — 2026-04-26 — Stage 2A (public API)

### Added

- `POST /api/v1/scan` (synchronous, max 60s) with Bearer auth + per-key rate limiting
- `GET /api/v1/scan/{id}` with ETag/304 support
- `api_keys` table with Stripe-style `osv_(test|live)_*` format
- `lib/api-keys.ts` + `lib/api-auth.ts` — key generation, hashing, validation
- `public/openapi.yaml` — OpenAPI 3.1 spec
- `/api-docs` page with Scalar UI
- `docs/API.md` — quickstart + error codes + EU AI Act disclosure pattern
- `scripts/issue-key.ts` for alpha key issuance
- EU AI Act Art. 50 `ai_disclosure` field on every API response
- CORS preflight on all `/v1/*` routes

## [0.2.0] — 2026-04-26 — Stage 1 (Cloudflare feature parity)

### Added

- 6 new P0 checks (G-01 to G-06): `llms_full_txt`, `markdown_negotiation`, `ssr_content`, `crawler_access`, `mcp_well_known`, `mcp_server_card`
- `docs/SCANNER-METHODOLOGY.md` — full transparency on all 17 checks (GDPR Art. 22 + GEO-citability)
- Defensive UI rendering for legacy DB rows pre-Stage-1
- Dynamic `checks_total` in metadata + share text (was hardcoded `/11`)

### Changed

- Bumped from 11 to 17 checks; CHECK_DISPLAY_ORDER reorganised by category

## [0.1.0] — 2026-04-26 — Stage 0 (foundation)

### Added

- HMAC-SHA256 + pepper IP hashing per CJEU Breyer + EDPB 01/2025
- pg_cron-based 90-day retention enforcement (replaces Inngest, EU-native)
- `/integritetspolicy` privacy page (sv + en)
- Live counter (`/api/stats` + `LiveCounter` component)
- Modular scan pipeline: `lib/scan/{fetch,robots,discovery,firecrawl,probe,derive,persist,pipeline,rate-limit}.ts`
- Per-component split of ResultsPage into `_components/`
- 33 historical seed scans backfilled with real data, then cleaned

### Changed

- License: MIT → **FSL-1.1-MIT** (commercial-licensing path opens)
- Removed `BUILDER_AVATAR_URLS` randomuser.me photos (misleading social proof)
- Removed Agent-katalogen card (premature feature)
- Headline: "Hur agent-redo är ditt företag?" → "Hur agent-redo är din sajt?"

### Security

- Bumped `next` 15.5.14 → 15.5.15 (DoS fix)
- Added overrides for `axios` ≥ 1.15.0 and `follow-redirects` ≥ 1.16.0
- Bumped `postcss` 8.5.5 → 8.5.11 (XSS fix in CSS stringify, Dependabot #10)

[Unreleased]: https://github.com/opensverige/agent-scan/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/opensverige/agent-scan/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/opensverige/agent-scan/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/opensverige/agent-scan/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/opensverige/agent-scan/releases/tag/v0.1.0
