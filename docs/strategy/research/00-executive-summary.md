# 0. Executive Summary — agent.opensverige.se

> Forskningspaket för att bygga agent.opensverige.se till en seriös konkurrent till Cloudflares isitagentready.com med publik API.
> Levererat april 2026. Alla detaljer finns i de fem detaljerade rapporterna i samma mapp.

---

## 0.1 Bottom line — vad du behöver veta på 60 sekunder

1. **Cloudflares isitagentready.com lanserades 17 april 2026** under "Agents Week 2026" — ni är inte sena, ni är jämte. De har 16 checks, scoring 0–100, MCP-server på `/.well-known/mcp.json`, men **ingen publik API**, ingen GDPR/EU AI Act-täckning, ingen lokalisering, ingen semantisk innehållsanalys. Det är top-of-funnel mot deras Bot Management/AI Crawl Control/Pay Per Crawl-stack — inte en standalone produkt. Källa: [Cloudflare Agent Readiness blog](https://blog.cloudflare.com/agent-readiness/).
2. **Era 11 checks är en bra start men missar 6 P0-checks** som idag är de-facto bransch-baseline: llms-full.txt, Markdown content negotiation (`Accept: text/markdown`), SSR-check, faktisk crawler-åtkomst (inte bara robots.txt-Allow), `/.well-known/mcp` (SEP-1960) och `/.well-known/mcp/server-card.json` (SEP-1649). Detaljer i `02-agent-readiness-scoring-2026.md`.
3. **EU AI Act Art. 50 träder ikraft 2 augusti 2026** — ni har ~3 månader på er innan publik API måste märka AI-genererat innehåll maskinläsbart. Ni är *deployer*, inte provider. Konkret: lägg in `"ai_generated": true` i alla API-svar som innehåller Claude-genererad text. Detaljer i `04-legal-eu-ai-act-gdpr.md`.
4. **Hashad IP är personuppgift hos er** enligt Breyer + EDPB Guidelines 01/2025 + CJEU SRB II (sept 2025). Behandla som personuppgift i alla GDPR-flöden. HMAC-SHA256 med pepper är minimum. API-konsumenter blir sannolikt **separata controllers**, inte processor — ni behöver ToS/AUP, inte DPA, men ni måste förbjuda re-identifiering kontraktuellt.
5. **Föreslagen pricing 2026 launch:** Hobby gratis (15 scans/mån, watermark, ingen API) → Builder 290 SEK/mån (300 scans, API + webhook) → Pro 1 490 SEK/mån (2 000 scans, white-label, SLA, priority queue). Vid ~$0,05 COGS/scan ger det ~46 % marginal på Builder, ~29 % på Pro. Detaljer i `03-api-monetization-benchmarks.md`.
6. **Arkitektur:** Next.js 15 på Vercel + Supabase (Postgres) + **Inngest** som kömotor. 1 000 scans/dag = 6/min peak — 17× headroom. Vercel Fluid Compute har 300 s default-timeout 2026 så ni klarar 30 s p99 med marginal, men flytta scan-arbetet till Inngest av reliability-skäl. Detaljer i `05-async-api-architecture.md`.

---

## 0.2 Vad Cloudflare INTE gör — er differentieringsplan

| Cloudflare gör inte | Ni kan vinna här |
|---|---|
| GDPR / EU AI Act-compliance-checks | Bygg dedikerade EU-checks: cookie-consent CMP-detection, Art. 50-markup, IETF Content-Usage-direktiv, RoPA/DPA-discoverability |
| Semantisk innehållsanalys av llms.txt | Validera att H1+blockquote+H2 finns, att länkade `.md`-filer faktiskt returnerar 200, kvalitetsbedömning av Markdown-innehåll |
| Faktisk AI-crawler-åtkomst | Skicka request med rätt User-Agent (ClaudeBot, GPTBot) och verifiera 200, inte bara läsa robots.txt — vanligaste produktionsfelet 2026 ([TechnologyChecker](https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report)) |
| Svensk/nordisk lokalisering | UI på svenska, hreflang-checks, integrering med svenska myndighetsdata, OSS-program för svenska open-source-projekt |
| Publik REST API | Ni gör det till hjärtat av produkten — det är där SaaS-marginalen finns |
| Action-rapporter med kontext | Cloudflare ger generiska "kopiera prompt"-fixar; ni kan ge sajt-specifik åtgärdsplan via Claude med faktisk innehållskontext |
| Historik / time-series | Visa förbättring över tid — viktigaste retention-mekanismen för betalkunder |
| Multi-domän bulk-scan | Byråer med 10–50 kunder vill scanna hela portföljen, inte en sajt åt gången |
| White-label rapporter | Pro-tier-killer-feature: byrå tar ut $10–50/mån/slutkund i sin egen branding |
| BYOK (Bring Your Own Key) | Pro-kunder kopplar egen Anthropic-nyckel, ni tar plattformsavgift, marginalen blir 60 %+ |

---

## 0.3 Prioriterad backlog för Claude Code (P0/P1/P2)

### Sprint 1 (vecka 1–2): Stäng compliance-gapen
- [ ] **G-01** Implementera `llms-full.txt`-check: GET → 200 + `text/plain` + >1 KB + H1/H2-närvaro
- [ ] **G-02** Markdown content negotiation: GET `/` med `Accept: text/markdown`, verifiera Content-Type
- [ ] **G-03** SSR-check: GET utan JS-exekvering, verifiera `<title>`, primär `<h1>`, ≥1 stycken text i rå HTML
- [ ] **G-04** Faktisk crawler-åtkomst: GET `/` med `User-Agent: Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)` + GPTBot, verifiera 200
- [ ] **G-05** `/.well-known/mcp` (SEP-1960): GET → 200 + JSON med `mcp_version` + `endpoints[]`
- [ ] **G-06** `/.well-known/mcp/server-card.json` (SEP-1649): GET → 200 + validera `serverInfo`+`transport`+`capabilities`
- [ ] Lägg in `"ai_generated": true` i alla API-svar med Claude-text (förbered Art. 50)
- [ ] Publicera subprocessor-lista på `/legal/subprocessors` (Anthropic, Vercel, Supabase, Cloudflare)

### Sprint 2 (vecka 3–4): Bygg API:et
- [ ] DB-schema enligt `05-async-api-architecture.md` § 5.7 (8 tabeller)
- [ ] `POST /api/scan` → 202 + Location-header, Idempotency-Key (24h fönster, Stripe-mönster)
- [ ] `GET /api/scan/{id}` med polling-best-practice + ETag
- [ ] Inngest-pipeline: probe → Firecrawl → Anthropic summarize → score → persist → webhook
- [ ] HMAC-SHA256 webhook-signering (Stripe-format), 7-stegs retry, replay-skydd 5 min
- [ ] Upstash Redis-baserad rate limiting per API-key
- [ ] Stripe Tax + Stripe Checkout för Hobby/Builder/Pro

### Sprint 3 (vecka 5–6): Differentiering & legal hardening
- [ ] **G-07** JSON-LD/schema.org strukturerad data parse
- [ ] **G-08** RFC 9727 `/.well-known/api-catalog`
- [ ] **G-09** CORS-validering på MCP/API-endpoints (OPTIONS preflight)
- [ ] **G-10** RateLimit-headers (RFC 9331) på API-checks
- [ ] **G-11** HSTS + modern TLS-validering
- [ ] **G-14** llms.txt **kvalitets**-validering (inte bara existens)
- [ ] **G-16** IETF Content-Usage-direktiv i robots.txt (`draft-ietf-aipref-attach`)
- [ ] **G-18** OAuth discovery (RFC 8414 + RFC 9728)
- [ ] ToS, AUP, Privacy Policy, AI Disclosure publicerade
- [ ] Domain verification innan scan tillåts (DNS TXT-record eller HTML meta)
- [ ] DSAR-endpoint + `/.well-known/security.txt` (RFC 9116)

### Sprint 4 (vecka 7–8): Polering & launch
- [ ] **G-12** Canonical URLs, **G-13** `.md`-versioner, **G-15** pay-per-crawl-detektion, **G-17** A2A `agent-card.json`, **G-19** RFC 8288 Link-headers
- [ ] White-label-stöd (egen domän + branding för Pro-tier)
- [ ] Public roadmap-sida som upsell-trigger
- [ ] Inngest dashboard-monitoring + Sentry
- [ ] OSS-program (gratis Pro för open-source-projekt) — Vercel/Sentry-modell
- [ ] Soft launch via Hacker News + svenska AI-communities (AI Sweden, Discord-servrar)

---

## 0.4 Vad ni kanske glömt att fråga — fynd ni inte uttryckligen efterfrågat

1. **Ni har ingen "domain verification"-mekanism nämnd.** Utan den kan vem som helst scanna vem som helst → abuse-risk + GDPR-implikation. Lägg in DNS TXT-record eller HTML meta-tag-verifiering innan scans tillåts på betalda tiers. Detaljer i `04-legal-eu-ai-act-gdpr.md`.
2. **Time-series / "förbättring över tid"-vyn är retention-killer.** Cloudflare har ingen historik-funktion idag. Att visa "Er score gick från 67 → 84 senaste månaden" är den starkaste retention-mekanismen för Builder/Pro-tier. Lägg till `scan_events`-tabell från dag ett (finns i schema-skissen i § 5.7).
3. **Cloudflare AI Audit + AI Crawl Control är nu del av Free-tier på Cloudflare.** Det betyder att deras "AI Audit"-data kan läsas gratis av alla som har sin sajt på Cloudflare — vilket täcker ~20 % av webben. Er differentiering måste vara att fungera **för alla sajter, oavsett CDN**.
4. **MCP-server för agent.opensverige.se själv.** Cloudflare har en MCP-server på sin egen sajt (`scan_site`-tool). Bygg en likadan: AI-agenter ska kunna anropa er scanner via MCP utan att gå via REST. Det är gratis distribution till Claude Desktop / ChatGPT / Cursor.
5. **Schemalagda re-scans (cron) är Builder-tier-feature, inte Pro.** Det driver dagligt engagement och konverterar Free → Builder. Cloudflare gör det inte alls. Lättimplementerat med Inngest cron-funktioner.
6. **Konkurrent ni inte nämnt: nohacks.co.** De har redan publicerat en detaljerad teardown av Cloudflares scanner ([nohacks.co/blog/cloudflare-agent-readiness-score](https://nohacks.co/blog/cloudflare-agent-readiness-score)). Värt att läsa för att förstå vinklingen från en "alternativ"-aktör.
7. **Stripe Tax från dag ett.** Många founders missar att svenska B2C-försäljning > 10 000 EUR/år i EU kräver OSS-registrering. Stripe Tax löser det automatiskt — aktivera direkt, inte "när vi växer".
8. **PTS, inte IMY, föreslås som AI Act-tillsynsmyndighet** (SOU 2025:101). Bygg relationer mot PTS, inte IMY, för AI Act-frågor. IMY hanterar GDPR.
9. **Cloudflares User-Agent för isitagentready-scanning är inte publik** — ni borde respektera er egen scanner via robots.txt om ni vill spegla beteendet ("vi följer reglerna vi mäter"). Publicera er scanner-UA tydligt.
10. **AI Act Art. 50 Code of Practice är fortfarande draft (förväntad slutversion juni 2026).** Bygg conservative — antag stricta krav, lättnader kommer kanske men du vill inte rebygga allt två veckor före launch.

---

## 0.5 Filöversikt

| Fil | Innehåll | Storlek |
|---|---|---|
| `00-executive-summary.md` (denna fil) | Sammanfattning, prioriterad backlog, blinda fläckar | ~10 KB |
| `01-cloudflare-isitagentready-teardown.md` | Reverse engineering av alla 16 Cloudflare-checks, scoring, API, positionering, svagheter | ~31 KB |
| `02-agent-readiness-scoring-2026.md` | Standards-landskap, MCP discoverability, anti-patterns, gap-analys (30 saknade checks P0/P1/P2), viktningsmodell | ~42 KB |
| `03-api-monetization-benchmarks.md` | 16 jämförande tjänster, prismodells-analys, enhetsekonomi, 3 konkreta tier-förslag | ~37 KB |
| `04-legal-eu-ai-act-gdpr.md` | AI Act Art. 50, GDPR-kedja, Breyer/SRB II/hashad IP, Schrems III/DPF 2026, Art. 22, full launch-checklista | ~39 KB |
| `05-async-api-architecture.md` | 9 mönsterjämförelser, kontraktsstandard, idempotency, HMAC-webhooks, Vercel Fluid Compute, kömotor-jämförelse, byggbar plan med Mermaid-diagram + TypeScript + SQL | ~58 KB |

**Totalt: ~217 KB, 3 800 rader strukturerad markdown.** Allt formaterat så det går rakt in i Claude Code som kontextfiler.

---

## 0.6 Föreslagen 30-dagarsplan

| Vecka | Fokus | Konkret deliverable |
|---|---|---|
| **1** | Compliance-gap: P0-checks G-01 till G-06 | 6 nya checks deployade, totalt 17 checks |
| **2** | API-skelett | Next.js 15 + Inngest + Supabase + DB-schema + POST/GET/scan-endpoints |
| **3** | Webhooks + idempotency + rate-limit + Stripe Tax/Checkout | Komplett Builder-tier-flöde end-to-end |
| **4** | Legal hardening: ToS, AUP, Privacy, subprocessor-lista, AI-disclosure, Art. 50-markup | Public-launch-redo juridiskt skin |

**Launch-mål:** 24 maj 2026 (privat beta för 20 svenska devs), public launch via Show HN i juni, 100 % Art. 50-compliance senast 1 augusti.

---

*Forskning genererad 26 april 2026. Verifiera priser och DPF-status mot officiella källor inför go-live-beslut.*
