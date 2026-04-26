# Master Plan — agent.opensverige.se → Public API

> Källa: [research/](research/) (6 dokument, ~217 KB) + nuvarande kodläge april 2026.
> Status-fil: [CHECKLIST.md](CHECKLIST.md). Beslut: [DECISIONS.md](DECISIONS.md).

---

## North Star

**Sveriges öppna AI-readiness scanner. Publik API. EU-jurisdiktion. Honest by design.**

Cloudflare's isitagentready.com (lanserad 17 april 2026) är vår referens, inte vår mål. Deras produkt är top-of-funnel mot betald bot management. Vår är produkten själv — open source, EU-compliant, byggd för svenska builders och byråer.

---

## Hard deadlines

| Datum | Krav | Konsekvens |
|---|---|---|
| **2 augusti 2026** | EU AI Act Art. 50 tillämpas. AI-genererat innehåll måste märkas maskinläsbart + perceptibelt. | Böter upp till 15M EUR / 3% global omsättning. Måste ha disclosure live före datumet. |
| **~30 dagar från Cloudflares launch** | Reputation window för "Swedish alternative"-narrativ är öppet ~3 månader. | Efter det är det "yet another scanner". |

Allt nedan är sekvenserat så vi når Aug 2 med margin för iteration.

---

## Hela bygget som dependency-graf

```
                        [FOUNDATION]
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        [CHECK PARITY]   [API ALPHA]   [DOC + LEGAL]
              │              │              │
              └──────┬───────┘              │
                     │                      │
              [PRO-TIER + LAUNCH] ──────────┘
                     │
              [POST-LAUNCH HARDENING]
```

**Strikt sekventiella beroenden:**
- Foundation → allt annat (pepper IP, splitta kodbas, retention)
- API auth → API alpha (no auth, no third-party access)
- Stripe Tax → publika priser (svensk B2B kräver moms-hantering)
- Bedrock-Frankfurt → Aug 2 (eliminerar Schrems-risk)

**Kan köras parallellt:**
- Dokumentation skrivs medan kod skrivs (olika filer)
- Research-syntes är fristående
- Frontend-feature kan ligga parallellt med backend om olika filer

---

## Stage 0 — Foundation (måste göras innan något annat)

**Mål:** Solid grund. Inga nya features. Allt som blockerar Stage 1.

| Item | Status | Beroende av | Fil |
|---|---|---|---|
| Pepper IP-hashen (HMAC-SHA256 + IP_HASH_PEPPER env) | ⏳ | Beslut #1 | `lib/ip-hash.ts`, `app/api/scan/route.ts` |
| Splitta `route.ts` → `lib/scan/{discovery,compliance,builder,scoring,claude,persist}.ts` | ⏳ | — | `lib/scan/` |
| Splitta `ResultsPage.tsx` → `_components/{ScoreRing,AISummary,FindingRow,PlanCard,BuilderAvatarStack}.tsx` | ⏳ | — | `app/scan/[domain]/_components/` |
| Standardiserat check-interface (`lib/checks/Check.ts`) | ⏳ | route.ts split | `lib/checks/` |
| Migrera 11 nuvarande checks till nytt interface | ⏳ | check-interface | `lib/checks/{robots,sitemap,llms,...}.ts` |
| Hantera 33 seed-scans (radera eller re-scanna riktigt) | ⏳ | Beslut #2 | DB cleanup |
| Cleanup av Klarna-duplikat (en seed + en real) | ⏳ | — | DB |
| Ta bort `BUILDER_AVATAR_URLS` randomuser-bilder | ⏳ | — | `_components/BuilderAvatarStack.tsx` |
| Ta bort död i18n (`catalogTitle`, `catalogDesc`, `discordBtn` i results, `builderAvatarLabel`) | ⏳ | — | `lib/i18n.ts` |
| `"ai_generated": true` i alla API-responses som innehåller Claude-text | ⏳ | — | `app/api/scan/route.ts` (output shape) |
| Publicera `/legal/subprocessors` (Anthropic, Vercel, Supabase, Cloudflare, AWS om Bedrock) | ⏳ | — | `app/legal/subprocessors/` |
| `/.well-known/security.txt` (RFC 9116) | ⏳ | — | `public/.well-known/security.txt` |
| Uppdatera privacy-policy: PTS för AI Act, IMY för GDPR | ⏳ | — | `lib/i18n.ts` privacy-section |
| Sätt 90-dagars retention + Inngest cron för auto-radering | ⏳ | Inngest setup (Stage 2) | `inngest/cron-retention.ts` |
| Open source-beslut + (om ja) publicera GitHub-repo med MIT + README | ⏳ | Beslut #3 | repo-root |

---

## Stage 1 — Check parity (Cloudflare-jämförbar)

**Mål:** 17 checks. När någon kör båda scanners ska vi inte missa något uppenbart.

Ny check-arkitektur från Stage 0 gör varje ny check till en isolerad fil med samma interface. Schema-migration i Supabase för att utöka `checks_total` från 11 till 17.

| Check | Källa | Status | Fil |
|---|---|---|---|
| **G-01** llms-full.txt finns + giltigt innehåll | research § 2.6 | ⏳ | `lib/checks/llms-full.ts` |
| **G-02** Markdown content negotiation (`Accept: text/markdown`) | § 2.6 | ⏳ | `lib/checks/markdown-negotiation.ts` |
| **G-03** SSR-check (innehåll i HTML utan JS-exekvering) | § 2.6 | ⏳ | `lib/checks/ssr.ts` |
| **G-04** Faktisk crawler-åtkomst (UA: ClaudeBot, GPTBot, PerplexityBot) | § 2.6 | ⏳ | `lib/checks/crawler-access.ts` |
| **G-05** `/.well-known/mcp` (SEP-1960 Discovery Manifest) | § 2.6 | ⏳ | `lib/checks/mcp-discovery.ts` |
| **G-06** `/.well-known/mcp/server-card.json` (SEP-1649) | § 2.6 | ⏳ | `lib/checks/mcp-server-card.ts` |
| Uppdatera scoring-modell (Discoverability 20%, Content 30%, Bot Access 20%, Capabilities 30%) | § 2.7 | ⏳ | `lib/scan/scoring.ts` |
| Skriv `docs/SCANNER-METHODOLOGY.md` med transparens på alla 17 checks (Art. 22 + GEO-vinst) | § 2.7 | ⏳ | `docs/SCANNER-METHODOLOGY.md` |
| Migration: utöka `scan_submissions.checks_total` default till 17 | — | ⏳ | Supabase migration |

---

## Stage 2 — API alpha (privat för 10 builders)

**Mål:** Riktig REST API med auth, rate limit, webhooks, async-mönster. Inbjudan-only.

Forskningen § 5 ger arkitekturen. Inngest som kömotor + Upstash Redis för rate limit + Stripe-mönster för idempotency och webhook-signering.

| Item | Källa | Status | Fil |
|---|---|---|---|
| Inngest setup (account + signing key) | § 5 | ⏳ Beslut #4 | `inngest/client.ts` |
| Migrera scan-pipeline till Inngest workflow (probe → Firecrawl → Claude → score → persist → webhook) | § 5.6 | ⏳ | `inngest/scan-pipeline.ts` |
| Domain verification via DNS TXT eller HTML meta | § 0.4 | ⏳ | `app/api/verify-domain/` |
| API key-utfärdande (Stripe-stil `osv_test_` / `osv_live_`) | § 5.7 | ⏳ | `app/api/keys/` + DB tabell |
| Per-key rate limiting (Upstash Redis) | § 5.7 | ⏳ Beslut #4 | `lib/rate-limit.ts` |
| `POST /v1/scan` → 202 + Location-header | § 5.4 | ⏳ | `app/api/v1/scan/route.ts` |
| `GET /v1/scan/{id}` med ETag + polling | § 5.4 | ⏳ | `app/api/v1/scan/[id]/route.ts` |
| Idempotency-Key header (24h fönster, Stripe-mönster) | § 5.5 | ⏳ | `lib/idempotency.ts` |
| HMAC-SHA256 webhook-signering (Stripe-format) | § 5.5 | ⏳ | `lib/webhook-sign.ts` |
| Webhook 7-stegs retry + replay-skydd 5 min | § 5.5 | ⏳ | `inngest/webhook-deliver.ts` |
| OpenAPI 3.1-spec för vår egen API | — | ⏳ | `public/openapi.yaml` |
| Publicera `/api-docs` med Swagger/Scalar UI | — | ⏳ | `app/api-docs/` |
| Skriv `docs/API.md` + `docs/QUICKSTART.md` | — | ⏳ | `docs/` |
| Bjud in 10 builders från Discord till stängd alpha | — | ⏳ | manuell |

---

## Stage 3 — Public launch + Pro-tier

**Mål:** Public launch via HN/AI Sweden + betalkund-tier öppen.

| Item | Källa | Status | Fil |
|---|---|---|---|
| Stripe-konto verifierat + Stripe Tax aktiverat | § 3.6 | ⏳ Beslut #5 | manuell |
| Stripe Checkout för Hobby/Builder/Pro | § 3.5 | ⏳ | `app/api/stripe/` |
| Pricing-sida `/pricing` med 3 tiers | § 3.5 | ⏳ | `app/pricing/` |
| `scan_events`-tabell för time-series | § 0.4 | ⏳ | Supabase migration |
| Time-series view på resultatsidan ("score över tid") | § 0.4 | ⏳ | `_components/ScoreHistory.tsx` |
| Public roadmap `/roadmap` | § 3.6 | ⏳ | `app/roadmap/` |
| Multi-domän bulk scan (Pro killer) | § 0.4 | ⏳ | `app/api/v1/scan/bulk/` |
| White-label rapporter (egen domän + branding) | § 0.4 | ⏳ | feature flag på Pro |
| OSS-program signup (gratis Pro för open-source-projekt) | § 3.6 | ⏳ | `app/oss-program/` |
| Schemalagda re-scans (cron) | § 0.4 | ⏳ | `inngest/scheduled-scan.ts` |
| Blog-post: "Swedish Agent-Readiness Report 2026" (citerbart för GEO) | § 0.4 | ⏳ | `app/blog/` |
| `docs/ARCHITECTURE.md` (för OSS-contributors) | — | ⏳ | `docs/ARCHITECTURE.md` |
| HN Show-post + AI Sweden Discord + Twitter/X | — | ⏳ | manuell |

---

## Stage 4 — AI Act hardening (Aug 2-deadline)

**Mål:** Juridiskt redo. Inget i denna stage får skjutas till efter 2 aug 2026.

| Item | Källa | Status | Fil |
|---|---|---|---|
| Migrera Claude → AWS Bedrock i Frankfurt (eu-central-1) | § 4.5 | ⏳ Beslut #6 | `lib/claude/bedrock.ts` |
| ToS publicerad | § 4.8 | ⏳ | `app/legal/terms/` |
| AUP publicerad | § 4.8 | ⏳ | `app/legal/aup/` |
| AI Disclosure-sida publicerad | § 4.8 | ⏳ | `app/legal/ai-disclosure/` |
| DPA-kedjan verifierad (AWS, Vercel, Supabase, Cloudflare) | § 4.4 | ⏳ | `docs/DPA-STATUS.md` |
| Transfer Impact Assessment dokumenterad | § 4.5 | ⏳ | `docs/TIA.md` |
| `/api/dsar`-endpoint för Data Subject Access Requests | § 4.8 | ⏳ | `app/api/dsar/` |
| Sanktionslista-screening för B2B-onboarding | § 4.8 | ⏳ | `lib/sanctions-check.ts` |
| Cyber + Professional Indemnity-försäkring | § 4.7 | ⏳ | manuell |
| Aktiebolagsregistrering (om inte gjort) | § 4.7 | ⏳ | manuell |
| `docs/RoPA.md` (Register of Processing Activities, GDPR Art. 30) | § 4.8 | ⏳ | `docs/RoPA.md` |
| Incident response-plan (72h IMY-notifieringsregel) | § 4.8 | ⏳ | `docs/INCIDENT-RESPONSE.md` |

---

## Stage 5 — Post-launch iteration (löpande)

**Mål:** Det som forskningen kallar P1/P2 + first-customer-feedback.

P1-checks från forskningen (G-07 till G-19) — JSON-LD, RFC 9727 API Catalog, CORS, RateLimit-headers, HSTS/TLS, canonical URLs, .md-versioner, llms.txt-innehållsvalidering, Content-Usage, A2A agent-card.json, OAuth discovery, RFC 8288 Link headers.

Plus P2 (G-20 till G-30) — hreflang, RSS/Atom, pagination, Open Graph, agent-skills, Web Bot Auth, ai.txt, AGENTS.md, sitemap-innehållsvalidering.

Prioriteras baserat på vad alpha-builders frågar efter, inte forskningens ordning.

---

## Vad jag behöver från dig — uppdelat efter när det blockerar

### NU (blockar Stage 0)

1. **Svara på beslut #1-3** i [DECISIONS.md](DECISIONS.md) — IP pepper, seed scans, OSS.
2. **Generera + ge mig en stark IP_HASH_PEPPER** (eller säg till mig att generera och du klistrar in i Vercel + .env.local). Förslag: 32 bytes random hex.

### SNART (blockar Stage 2)

3. **Beslut #4: Inngest** — skapa konto på [inngest.com](https://inngest.com), free tier räcker. Ge mig signing key.
4. **Upstash Redis** — skapa konto på [upstash.com](https://upstash.com), free tier räcker. Ge mig REST URL + token.
5. **Verifiera att vår domän opensverige.se är konfigurerbar för DNS TXT-records** (för domain verification-feature).

### SENARE (blockar Stage 3)

6. **Beslut #5: Stripe-konto** — registrera Stripe på opensverige.se, aktivera Stripe Tax, ge mig test+live keys.
7. **Cal.com OK för Pro-tier-möten?** — verifiera att vår nuvarande Cal.com fungerar för betalkundernas onboarding.
8. **Identifiera 10 alpha-builders** från Discord (eller säg till mig att gå i Discord och fråga).
9. **AI Sweden-kontakt** om du har — annars lägger jag det som outreach-task.

### KRITISKT (blockar Stage 4 / Aug 2-deadline)

10. **Beslut #6: AWS-konto för Bedrock** — registrera AWS, skapa IAM-user med endast Bedrock-permissions, ge mig credentials.
11. **Bolagsform-status** — driver vi via aktiebolag eller enskild firma? Påverkar GDPR-bötesexponering. Forskningen rekommenderar AB.
12. **Försäkring** — kontakta försäkringsmäklare för cyber + PI-försäkring. Inte mitt arbete.
13. **Final review av ToS/AUP/Privacy** — jag skriver utkast, du läser och godkänner.

### NICE-TO-HAVE (gör när du orkar)

14. **Sentry-konto** för error monitoring (free tier).
15. **GitHub-org** för opensverige om vi går OSS (kanske finns redan).
16. **Vinnova/DIGG/PTS-relationer** — om du har kontakter där, säg till. Annars outreach-task.

---

## Vad jag GÖR autonomt (du behöver inte godkänna)

- All kod, refaktorering, test, build, lint
- Supabase-migrations via MCP
- Git commits
- Push till `feat/*` branches utan extra auth
- Skriva alla docs
- Designa API-shape och OpenAPI-spec
- Implementera alla 6 P0-checks
- Migrera till Inngest när du gett signing key
- Bygga Stripe-integration när du gett keys

## Vad jag GÖR med auth-prompt (du säger "kör" en gång)

- Push till `main`
- Vercel-redeploys via vercel CLI
- Stripe live-mode (test-mode autonomt)
- Migrationer som droppar tabeller (jag prompter alltid innan DROP)

## Vad jag ALDRIG gör utan dig

- Public launch-tweet/HN-post (du skriver text, du klickar)
- Skicka mail till verkliga personer
- Fakturera kunder
- Tala för OpenSverige juridiskt mot myndighet
- Ändra terms-of-service efter att första betalkund prenumererat

---

## Hur vi använder den här mappen löpande

- [PLAN.md](PLAN.md) — denna fil. Uppdateras när vi avgör att en stage är klar eller när nya items dyker upp.
- [CHECKLIST.md](CHECKLIST.md) — detaljerad checkbox-lista per item. Bockas av i realtid.
- [DECISIONS.md](DECISIONS.md) — frågor + dina svar + datum. Historiskt arkiv.
- [research/](research/) — orörda forskningsdokument. Refereras med `§ X.Y`-notation i hela planen.

Vid varje commit som löser ett checklist-item: bocka i CHECKLIST.md i samma commit. Vid varje stage-completion: uppdatera PLAN.md status.
