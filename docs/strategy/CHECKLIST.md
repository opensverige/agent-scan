# Execution Checklist

> Bockas av i samma commit som löser respektive item. Source of truth för vad som faktiskt är gjort.
> Format: `- [ ] item — fil/PR — research-ref — beroende av X`

---

## ✅ Klart innan denna plan skrevs (april 2026)

- [x] Sitemap-detection fix (WP, robots-deklarerade) — `app/api/scan/route.ts` — commit `d2c0d74`
- [x] Säkerhetspatchar (next 15.5.15, axios+follow-redirects) — `package.json` — commit `e084abe`
- [x] Privacy policy SV+EN (`/integritetspolicy`) — commit `17af6f4`
- [x] Footer "Integritet"-länk på scan-sidor — commit `17af6f4`
- [x] Privacy micro-copy under scan-input — commit `17af6f4`
- [x] AI summary-badge på resultatsidan — commit `17af6f4`
- [x] Live counter (`/api/stats` + `LiveCounter.tsx`) — commit `fc0d48c`
- [x] AISummary expandable + gradient fade — commit `fc0d48c`
- [x] Removed Agent-katalogen card + share-knapp dubblering + Discord-knapp i share — commit `fc0d48c`
- [x] Supabase-projekt aktivt (`gfvyixqttmupmhqvmios`, eu-west-2) + migrations applicerade
- [x] Vercel env vars satta (efter publishable→service_role swap)
- [x] 33 seed-scans i DB (markerade `ip_hash='seed-historical-2026-04-26'`)
- [x] Research-syntes i `docs/strategy/`

---

## 🚧 Stage 0 — Foundation

### Säkerhet & GDPR

- [x] **Generera 32-byte IP_HASH_PEPPER** — `lib/ip-hash.ts` — § 4.3
- [x] **Migrera till HMAC-SHA256(ip, pepper)** i `route.ts` + `analyze/route.ts` — commit pending
- [x] **Sätt IP_HASH_PEPPER i `.env.local`** — done
- [ ] **Sätt IP_HASH_PEPPER i Vercel** — manuell — pepper-värde i chatt
- [x] **Bestäm hantering av befintliga 35 ip_hash-rader** — DECISIONS #1 = oåterställbara accepterade. Gamla rader fortsätter fungera, men kan inte kopplas mot nya scans (acceptabelt).

### Refaktorering (blockerare för Stage 1)

- [x] **Skapa `lib/scan/`-katalog** med `fetch.ts`, `robots.ts`, `discovery.ts`, `firecrawl.ts`, `openapi-extractor.ts`, `probe.ts`, `derive.ts`, `rate-limit.ts`, `persist.ts`, `pipeline.ts`
- [x] **Refaktorera `route.ts`** till tunn handler (~70 rader, var 902) som anropar `lib/scan/pipeline.ts`
- [x] **Extract derive logic** till egen modul (per arkitekt-council feedback) — eliminerar post-mutation av checks
- [x] **Type-check + lint + build grön** efter refactor — verifierat med real prod scan av hexagon.com (UUID `d3282d97...`)
- [ ] **Per-check filer i `lib/checks/`** med standardiserat interface — *deferred* till Stage 1 när vi lägger till G-01..G-06 (då måste vi ändå röra UI)
- [ ] **CheckResult som discriminated union** — *deferred* till Stage 1, samma anledning
- [x] **Splitta `ResultsPage.tsx`** till `_components/`-katalog — `ScoreRing`, `AISummary`, `SeverityIcon`, `FindingRow`, `PlanCard`, `BuilderAvatarStack` + `constants.ts` + `booking-cta.ts`. ResultsPage 1185→907 rader.

### Cleanup

- [x] **Ta bort `BUILDER_AVATAR_URLS`** — ersatt med deterministiska SVG-avatars i `BuilderAvatarStack.tsx`. Inga fler randomuser-foton.
- [x] **Ta bort död i18n** (`catalogTitle`, `catalogDesc` SV+EN) — `lib/i18n.ts`
- [x] **Ta bort `t.results.discordBtn`** (Discord-knappen är borttagen) — `lib/i18n.ts`
- [x] **Använd `t.results.builderAvatarLabel`** i `BuilderAvatarStack.tsx` (löst i Chunk 3)
- [x] **DELETE Klarna-duplikat** — done via SQL, returned `c3477b2a-324d-4e51-b684-12eee0f1a976`
- [ ] **Hantera 33 seed-scansen** — re-scanna riktigt (per Beslut #2). Bakgrundsjobb.

### Compliance prep

- [x] **`ai_disclosure` field** med `ai_generated`, `model`, `fields` per EU AI Act Art. 50 — `lib/scan-types.ts` + `lib/scan/pipeline.ts`. Maskinläsbart format, sätts på alla scans. Demo-mode = false, real Claude = true.
- [x] **Ny `app/legal/subprocessors/page.tsx`** — lista Vercel, Supabase, Anthropic, Firecrawl, Exa, Cloudflare, Cal.com med syfte + region + adekvansbeslut
- [x] **`public/.well-known/security.txt`** (RFC 9116) — kontaktinfo, expires 2027-04-26
- [ ] **`public/.well-known/security.txt.sig`** — PGP-signatur (kan vänta)
- [x] **Uppdatera privacy-policy: PTS för AI Act-frågor + IMY för GDPR** — `lib/i18n.ts` privacy-section
- [x] **Uppdatera privacy-policy: explicit retentionstid (90 dagar)** istället för "tills vidare" — `lib/i18n.ts`
- [x] **Lägg till Footer-länkar** till `/legal/subprocessors` — `app/scan/_components/Footer.tsx`

### Open source-beslut

- [ ] **Beslut #3 fattat** — DECISIONS.md
- [ ] **Om OSS:** lägg till `LICENSE` (MIT)
- [ ] **Om OSS:** skriv `README.md` på root med projekt-pitch, hur man kör lokalt, contribute-guide
- [ ] **Om OSS:** skriv `CONTRIBUTING.md`
- [ ] **Om OSS:** skriv `CODE_OF_CONDUCT.md`
- [ ] **Om OSS:** flytta repot till publik visibility på GitHub
- [ ] **Om OSS:** lägg till GitHub Issue templates
- [ ] **Om OSS:** lägg till GitHub Actions för CI (typecheck + lint på PR)

### Retention

- [x] ~~Inngest SDK~~ — **borttagen 2026-04-26**. Ersatt med pg_cron (EU, samma DB) — Inngest hade US-only data plane vilket inte passar "Sveriges öppna scanner".
- [x] **pg_cron `retention-cleanup`** — körs 03:00 UTC dagligen, deletar `scan_submissions` äldre än 90 dagar — `supabase/migrations/006_retention_cron.sql` (active=true, jobid 1)
- [x] **Verifierat aktivt:** `SELECT * FROM cron.job WHERE jobname='retention-cleanup'` returnerar active=true

---

## 🚧 Stage 1 — Check parity

### Schema-migration

- [ ] **Supabase migration:** uppdatera `checks_total` default från 11 till 17
- [ ] **Bakåtkompatibel**: gamla rader behåller `checks_total=11`, nya får 17

### De 6 P0-checksen

- [x] **G-01 llms-full.txt** — `checkLlmsFullTxt` i `lib/checks.ts` + probe i `lib/scan/probe.ts`
- [x] **G-02 Markdown content negotiation** — `checkMarkdownNegotiation` (probe sänder Accept: text/markdown till root)
- [x] **G-03 SSR-check** — `checkSsrContent` validerar <title> + <h1> + textinnehåll i raw HTML
- [x] **G-04 Faktisk crawler-åtkomst** (ClaudeBot, GPTBot, PerplexityBot) — 3 parallella User-Agent-probes
- [x] **G-05 `/.well-known/mcp`** (SEP-1960) — `checkMcpWellKnown` validerar mcp_version + endpoints
- [x] **G-06 `/.well-known/mcp/server-card.json`** (SEP-1649) — `checkMcpServerCard` validerar serverInfo.name + transport.type
- [x] **Context** (stat + source + action) tillagt för alla 6 i `lib/check-context.ts` med riktiga källor
- [x] **Defensiv UI** för legacy DB-rader som saknar nya check IDs — filter undefined i ResultsPage
- [x] **Hardcoded /11** ersatt med dynamic `data.checks_total` i metadata + share text
- [x] **Verifierat** end-to-end på vercel.com: 17 checks returneras, 10/14 yellow, alla nya checks fungerar
- [ ] **Per-check filer i `lib/checks/`** med standardiserat interface — *deferred*, nuvarande monolith fungerar
- [ ] **CheckResult som discriminated union** — *deferred*, lägger till komplexitet utan blockerande nytta nu

### Scoring-modell

- [ ] **Uppdatera scoring-vikter** enligt § 2.7: Discoverability 20%, Content 30%, Bot Access 20%, Capabilities 30%
- [ ] **Visa kategoriscores** på resultatsidan (inte bara total)
- [ ] **CHECK_DISPLAY_ORDER** uppdaterat till alla 17

### Dokumentation

- [ ] **Skriv `docs/SCANNER-METHODOLOGY.md`** — full transparens på alla 17 checks (Art. 22 + GEO-vinst)
- [ ] **Lägg till `/methodology`-sida** som renderar SCANNER-METHODOLOGY.md
- [ ] **Länk i Footer** till `/methodology`

---

## 🚧 Stage 2 — API alpha

### Inngest setup

- [ ] **Inngest-konto** — beroende: Beslut #4
- [ ] **`inngest/client.ts`** + Vercel-deploy-hook
- [ ] **Migrera scan-pipeline till Inngest workflow** — `inngest/scan-pipeline.ts` med steps: `probe → firecrawl → claude → score → persist → webhook`
- [ ] **Verifiera Vercel→Inngest-koppling** med test-event

### Domain verification

- [ ] **Endpoint `POST /api/verify-domain`** — kräv DNS TXT eller HTML meta — `app/api/verify-domain/route.ts`
- [ ] **DB-tabell `verified_domains`** — `domain`, `user_id`, `verified_at`, `method`
- [ ] **Verifiering inbäddad i scan-pipeline** för paid scans (krävs ej för Hobby)

### API key infrastructure

- [x] **DB-tabell `api_keys`** — `id`, `key_hash`, `key_prefix`, `tier`, `name`, `email`, `created_at`, `last_used_at`, `revoked_at`, `scan_count`, `notes` — `supabase/migrations/007_api_keys.sql`
- [x] **`scan_submissions.api_key_id`** FK för per-key-attribution + rate limiting
- [x] **Stripe-stil keys** (`osv_test_*`, `osv_live_*`, 24-byte base64url secret) — `lib/api-keys.ts`
- [x] **Issue-script** för alpha-keys — `scripts/issue-key.ts` (tsx + service role)
- [x] **Auth helper** — `lib/api-auth.ts` (`authenticate()` validates Bearer token + bumps last_used_at)
- [ ] ~~Public POST/DELETE /api/keys~~ — *deferred* till Stage 3 (user signup-flow). Alpha hanteras via script.

### Rate limiting

- [x] **DB-baserad rate limit** istället för Upstash — `lib/api-auth.ts` `enforceRateLimit()`. Räknar rader i `scan_submissions` per `api_key_id` per tidsfönster. Stays in EU (samma Postgres som datan).
- [x] **Tier-quotas** per `lib/api-keys.ts` `TIER_QUOTAS`: hobby 1/min+15/mo, builder 1/min+300/mo, pro 2/min+2000/mo
- [x] **`Retry-After` header** på 429 + `retry_after_seconds` i error body
- [ ] **`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (RFC 9331) headers** — kommer i Stage 5 P1-checks (G-10)

### Public API endpoints

- [x] **`POST /api/v1/scan`** — synkron (returnerar 200 med full result, max 60s). Verifierat e2e med trustly.com → 4/11 yellow + Claude summary.
- [x] **`GET /api/v1/scan/{id}`** med ETag + 304-stöd — verifierat e2e: ETag `"8a8f5bae21b9a23e"`, `If-None-Match` returnerar 304.
- [x] **CORS preflight** (OPTIONS) — public APIs supports cross-origin
- [ ] **`POST /api/v1/scan` async (202 + Location)** — *Stage 2B* när vi behöver det
- [ ] **`POST /api/v1/scan/bulk`** för Pro — *Stage 3*
- [ ] **`GET /api/v1/account/usage`** — *Stage 3*

### Idempotency + Webhooks

- [ ] **Idempotency-Key header**, 24h fönster — `lib/idempotency.ts`
- [ ] **DB-tabell `idempotency_keys`** — `key`, `request_hash`, `response`, `expires_at`
- [ ] **DB-tabell `webhook_endpoints`** — `id`, `user_id`, `url`, `secret`, `events`, `created_at`
- [ ] **HMAC-SHA256 webhook-signering** (Stripe-format) — `lib/webhook-sign.ts`
- [ ] **Webhook 7-stegs retry** med exponential backoff — `inngest/webhook-deliver.ts`
- [ ] **Replay-skydd 5 min** via timestamp + nonce
- [ ] **DB-tabell `webhook_deliveries`** för audit + retry-state

### OpenAPI spec

- [x] **`public/openapi.yaml`** — OpenAPI 3.1, fullständiga schemas för ScanRequest, ScanResult, CheckResult, AIDisclosure, Error
- [x] **`/api-docs`-sida** med Scalar UI (CDN-loaded, dark theme) — `app/api-docs/_components/ScalarReference.tsx`. Live i prod.
- [ ] **Spec valideras i CI** med Spectral — *deferred* tills GitHub Actions landar

### Docs

- [x] **`docs/API.md`** — quickstart, alla endpoints, error-koder, EU AI Act-disclosure-mönster, versionspolicy
- [ ] **`docs/QUICKSTART.md`** — *deferred*; quickstart finns redan i API.md + Scalar UI
- [ ] **Code samples i 4 språk** (curl, Node, Python, Go) — Scalar UI auto-genererar curl/Node/PHP/Python/Ruby snippets från specet

### Alpha-bjudningar

- [ ] **Lista 10 builders** från Discord — manuell
- [ ] **Skicka invitations** med första API-key + onboarding-doc
- [ ] **Feedback-kanal** (privat Discord-kanal eller GitHub Discussions)

---

## 🚧 Stage 3 — Public launch + Pro

### Stripe-integration

- [ ] **Stripe-konto + Stripe Tax aktiverat** — beroende: Beslut #5
- [ ] **`/api/stripe/webhook`** för subscription events
- [ ] **Stripe Checkout Session** för Hobby/Builder/Pro upgrades
- [ ] **Customer portal** för byte av tier + cancel
- [ ] **DB-tabell `subscriptions`** med Stripe-ID, tier, status, current_period_end
- [ ] **DB-tabell `usage`** — month, scans_count, per user
- [ ] **Quota enforcement** — hard cap på Hobby, soft cap + overage på Pro

### Pricing-sida

- [ ] **`app/pricing/page.tsx`** — 3-kolumns Hobby/Builder/Pro
- [ ] **Pricing-data i `lib/pricing.ts`** — single source of truth
- [ ] **Feature-comparison-tabell**
- [ ] **FAQ-sektion** (svenska B2B förväntar sig FAQ)
- [ ] **Annual toggle** (17% rabatt)

### Time-series + retention

- [ ] **DB-tabell `scan_events`** för time-series — § 0.4
- [ ] **`_components/ScoreHistory.tsx`** — graf av score över tid
- [ ] **Visa trend** på resultatsidan (sista 90 dagar)

### Pro-features

- [ ] **Multi-domän bulk scan** — `app/api/v1/scan/bulk/route.ts` (paid)
- [ ] **White-label rapporter** — feature flag på Pro, custom logo + domain
- [ ] **Schemalagda re-scans** — `inngest/scheduled-scan.ts` med cron-pattern per user
- [ ] **5 webhook endpoints** (Pro) vs 1 (Builder)
- [ ] **24-månaders historik** (Pro) vs 12 (Builder)

### OSS-program

- [ ] **`app/oss-program/page.tsx`** — beskrivning + signup-formulär
- [ ] **DB-tabell `oss_applications`** — github_url, license, contact, status
- [ ] **Manuell granskning** av ansökningar

### Marknadsföring

- [ ] **`app/roadmap/page.tsx`** — public roadmap
- [ ] **Blog-post 1: "Swedish Agent-Readiness Report 2026"** — använd top 100 svenska bolags-data
- [ ] **`docs/ARCHITECTURE.md`** för OSS-contributors
- [ ] **Demo video** (45s) för pricing-sida
- [ ] **HN Show-post** (du klickar)
- [ ] **AI Sweden Discord-post** (du klickar)
- [ ] **LinkedIn-launch** (du klickar)

---

## 🚧 Stage 4 — AI Act hardening

### Bedrock-migration

- [ ] **AWS-konto + IAM-user med Bedrock-permissions** — beroende: Beslut #6
- [ ] **Aktivera Anthropic-modeller i Bedrock console** (eu-central-1)
- [ ] **`lib/claude/bedrock.ts`** — Bedrock-klient
- [ ] **Feature-flag `USE_BEDROCK=true`** för gradvis rollout
- [ ] **Verifiera output-paritet** med Anthropic-direkt på 10 testscan
- [ ] **Cutover** — sätt USE_BEDROCK=true på production
- [ ] **Uppdatera privacy + subprocessors** — Anthropic→AWS

### Legal docs

- [ ] **`app/legal/terms/page.tsx`** — ToS
- [ ] **`app/legal/aup/page.tsx`** — Acceptable Use Policy (förbud mot re-identifiering, etc.)
- [ ] **`app/legal/ai-disclosure/page.tsx`** — AI Disclosure
- [ ] **Standalone i18n för legal docs** (kan inte vara inline i `lib/i18n.ts` — för långt)
- [ ] **`docs/DPA-STATUS.md`** — internt dokument med DPA-länkar för alla subprocessors
- [ ] **`docs/TIA.md`** — Transfer Impact Assessment
- [ ] **`docs/RoPA.md`** — Register of Processing Activities (GDPR Art. 30)
- [ ] **`docs/INCIDENT-RESPONSE.md`** — 72h IMY-procedur

### DSAR + Incident response

- [ ] **`app/api/dsar/route.ts`** — endpoint för Data Subject Access Requests
- [ ] **DB-tabell `dsar_requests`** — request_type (access/rectification/erasure/etc.), domain, contact, status
- [ ] **Email-notifiering** vid DSAR (info@opensverige.se)
- [ ] **30-dagars SLA** på svar

### Sanktionslista

- [ ] **`lib/sanctions-check.ts`** med EU Consolidated Sanctions List API
- [ ] **Triggas vid Pro-onboarding** för B2B-kunder

### Försäkring + bolagsform

- [ ] **Bolagsform-status** klargjord — beroende: dialog
- [ ] **Cyber + PI-försäkring** tecknad — manuell

---

## 🚧 Stage 5 — Post-launch (P1/P2 checks + iteration)

### P1 (G-07 till G-19)

- [ ] **G-07 JSON-LD/schema.org parse**
- [ ] **G-08 RFC 9727 API Catalog**
- [ ] **G-09 CORS på MCP/API-endpoints**
- [ ] **G-10 RateLimit-headers (RFC 9331)**
- [ ] **G-11 HSTS + modern TLS**
- [ ] **G-12 Canonical URLs**
- [ ] **G-13 .md-versioner**
- [ ] **G-14 llms.txt-innehållsvalidering**
- [ ] **G-15 Pay-per-crawl detection**
- [ ] **G-16 IETF Content-Usage**
- [ ] **G-17 A2A agent-card.json**
- [ ] **G-18 OAuth discovery (RFC 8414/9728)**
- [ ] **G-19 RFC 8288 Link-headers**

### P2 (G-20 till G-30)

- [ ] **G-20 hreflang**
- [ ] **G-21 RSS/Atom**
- [ ] **G-22 Pagination rel=next/prev**
- [ ] **G-23 Content-Type/language**
- [ ] **G-24 TTFB/latency**
- [ ] **G-25 Open Graph + oEmbed**
- [ ] **G-26 Agent Skills index.json**
- [ ] **G-27 Web Bot Auth**
- [ ] **G-28 ai.txt**
- [ ] **G-29 AGENTS.md**
- [ ] **G-30 Sitemap-innehållsvalidering**

### Differentiering & retention

- [ ] **Comparative benchmarking** (jämför mot branschsnittet)
- [ ] **Custom scan profiles** (Pro)
- [ ] **BYOK Anthropic-nyckel** (Pro)
- [ ] **Slack/Teams-integration**
- [ ] **MCP-server för agent.opensverige.se själv** (`scan_site`-tool för Claude/Cursor/ChatGPT)
- [ ] **Public Radar-stil dataset** ("Sweden's Agent Readiness Index")

---

## 🎯 Definition of Done per Stage

### Stage 0 — DoD
- All Foundation-checkboxes ovan ✅
- Build/lint/type-check grön
- Privacy-policy & subprocessors-sida live i prod
- IP-hash peppered i prod
- Inga ai-slop-mönster kvar (BUILDER_AVATAR borttaget, död i18n borta)
- README.md publicerad om OSS

### Stage 1 — DoD
- Alla 6 P0-checks live i prod
- Resultatsidan visar 17 checks
- `docs/SCANNER-METHODOLOGY.md` publicerad
- En oberoende user kan jämföra med Cloudflare och hitta inga uppenbara hål

### Stage 2 — DoD
- 10 alpha-builders har giltiga API-keys
- 5 lyckade scans via API från externa konton
- Webhook deliveries fungerar med signering
- OpenAPI-spec validerar med Spectral

### Stage 3 — DoD
- Stripe Checkout fungerar för Hobby→Builder→Pro
- Första betalkund onboarded
- Public launch-post live (HN, AI Sweden)
- `docs/ARCHITECTURE.md` publicerad

### Stage 4 — DoD
- Aug 2 deadline: ToS/AUP/AI Disclosure live
- Bedrock i Frankfurt aktiv (eller TIA godkänt om Anthropic-direkt)
- DSAR-endpoint testad
- Försäkring tecknad
