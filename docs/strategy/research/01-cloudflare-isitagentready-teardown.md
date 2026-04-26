# 1. Cloudflare isitagentready.com — Full Teardown

> Reverse-engineering-rapport för agent.opensverige.se — April 2026  
> Alla HTTP-detaljer, checks, scoring och konkurrensgap dokumenterade nedan.

---

## 1.1 Vad är det och vad gör det

**isitagentready.com** är ett gratis, offentligt tillgängligt webbverktyg från Cloudflare som ger webbplatsägare ett "Agent Readiness Score" — ett numeriskt mått på hur väl sajten följer framväxande standarder för AI-agenter. Verktyget analyserar tekniska protokolllager (discoverability, content negotiation, access control, protocol discovery) och presenterar pass/fail per check tillsammans med åtgärdsförslag i form av promptar man kan skicka direkt till en coding agent.

**Launch-datum:** 17 april 2026, som en del av Cloudflare's "Agents Week 2026" (13–20 april), ett innovationsvecka med 28 produktlanseringar på fem dagar. Enligt [Cloudflare blog-posten](https://blog.cloudflare.com/agent-readiness/) av ingenjören André Jesus är syftet att göra för agenter vad Google Lighthouse gjort för web performance.

**Nuvarande status (april 2026):** Aktiv, gratis, inga kända rate limits för standard-scanning. Domänen isitagentready.com är registrerad men kan inte resolvas via vanlig DNS från externa nätverk — sannolikt löser Cloudflare's eget nätverk domänen internt. Screenshot-försök returnerade en vit sida och DNS-lookup misslyckades i testmiljön.

**Primär URL:** `https://isitagentready.com` (alias till `https://www.isitagentready.com`)

**UI-beskrivning (baserad på [nohacks.co teardown](https://nohacks.co/blog/cloudflare-agent-readiness-score) och [Cloudflare-blogg](https://blog.cloudflare.com/agent-readiness/)):**
- Minimalistiskt gränssnitt: ett URL-inputfält + "Scan"-knapp
- Dropdown "Customize" med preset för scan-typ: **All Checks** (default), **Content Site**, **API/Application**
- Resultatvyn: totalscore + nivåetikett (t.ex. "Level 2 Bot-Aware"), kategorivis breakdown med pass/fail per check
- "Copy all instructions"-knapp: genererar en komplett Markdown-prompt med alla fixar för failing checks, redo att klistras in i en coding agent (Claude Code, Cursor, etc.)

---

## 1.2 Exakt metodik & checks

Verktyget gör HTTP-requests direkt mot den scannade sajten och kontrollerar ett antal standarder. Baserat på [Cloudflare blog](https://blog.cloudflare.com/agent-readiness/) och [nohacks.co's detaljerade analys](https://nohacks.co/blog/cloudflare-agent-readiness-score) — totalt **16 checks** fördelade på **5 kategorier** (varav 3 Commerce-checks är informationella och inte scorade på icke-commerce-sajter).

---

### Kategori 1: Discoverability (3 checks, scorade)

#### 1. `robots.txt` existerar
- **Vad:** Kontrollerar om filen finns och kan parsas
- **HTTP-request:** `GET /robots.txt` (standard User-Agent, troligen Cloudflare's egna scanner-UA)
- **Signaler:** HTTP 200 + parsebar robots.txt-syntax
- **Bakgrund:** robots.txt har funnits sedan 1994. Cloudflare noterar att 78 % av de 200 000 toppdomäner de skannat har robots.txt, men att de flesta är skrivna för traditionella sökcrawlers, inte AI-agenter ([Cloudflare blog](https://blog.cloudflare.com/agent-readiness/))
- **llms.txt-notering:** llms.txt ingår **inte** i default-scan. Det är ett valfritt check som kan aktiveras i "Customize"-menyn. Verktyget kontrollerar däremot specifika AI-botregel i robots.txt (se check 5 nedan)

#### 2. `sitemap.xml` existerar
- **Vad:** Kontrollerar om en sitemap finns, antingen via `Sitemap:`-direktiv i robots.txt eller på standardstigen
- **HTTP-request:** `GET /sitemap.xml` (fallback om robots.txt saknar Sitemap-direktiv)
- **Signaler:** HTTP 200 + giltig XML-sitemap

#### 3. Link Headers (RFC 8288)
- **Vad:** Kontrollerar om HTTP-svarshuvudet `Link:` innehåller pekare till viktiga resurser
- **HTTP-request:** `GET /` — granskar response headers
- **Signaler:** Närvaro av `Link:`-header med `rel`-attribut som t.ex.:
  ```
  Link: </.well-known/api-catalog>; rel="api-catalog"
  ```
- **Källa:** [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288), standard sedan 2017

---

### Kategori 2: Content Accessibility (1 check, scorad)

#### 4. Markdown för agenter (Content Negotiation)
- **Vad:** Kontrollerar om servern returnerar Markdown istället för HTML när `Accept: text/markdown` skickas
- **HTTP-request:** `GET /` med header `Accept: text/markdown`
- **Signaler:** Response med `Content-Type: text/markdown` och faktiskt Markdown-innehåll
- **Heuristik:** Cloudflare mätte upp till 80 % token-reduktion i vissa fall. Av 7 testade agenter (februari 2026) var det bara Claude Code, OpenCode och Cursor som skickade `Accept: text/markdown` per default ([Cloudflare blog](https://blog.cloudflare.com/agent-readiness/))
- **Status:** Cloudflare's eget förslag, inte en IETF-spec. Mekanismen (HTTP content negotiation) är standard; formatet är Cloudflare-drivet
- **Adoption:** 3,9 % av 200 000 toppdomäner passerar ([Cloudflare blog](https://blog.cloudflare.com/agent-readiness/))

---

### Kategori 3: Bot Access Control (3 checks, varav 2 scorade + 1 informationell)

#### 5. AI Bot Rules i robots.txt (RFC 9309)
- **Vad:** Kontrollerar om robots.txt innehåller explicit direktiv för AI-specifika User-Agents
- **HTTP-request:** `GET /robots.txt` — parsas för AI-specifika user-agent-strängar
- **Vilka crawlers de testar mot (kända):**
  - `GPTBot` (OpenAI)
  - `ClaudeBot` (Anthropic)
  - `Claude-Web` (Anthropic, äldre UA)
  - `anthropic-ai` (Anthropic)
  - `PerplexityBot` (Perplexity)
  - `Google-Extended` (Google, AI-träning)
  - `CCBot` (Common Crawl)
  - `Bytespider` (ByteDance/TikTok)
  - `Meta-ExternalAgent` / `facebookexternalhit` (Meta)
  - `OAI-SearchBot` (OpenAI search)
  - `ChatGPT-User` (OpenAI in-chat browsing)
  - `Amazonbot` (Amazon)
- **Signaler:** Minst ett känt AI-agent User-Agent-namn i en `User-agent:`-rad i robots.txt
- **Källa:** [Cloudflare blog](https://blog.cloudflare.com/agent-readiness/), [technologychecker.io robots.txt-analys](https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report)

#### 6. Content Signals i robots.txt
- **Vad:** Cloudflare's eget förslag (September 2025, CC0-licens) för att deklarera AI-användningspreferenser
- **HTTP-request:** `GET /robots.txt` — granskas för `Content-Signal:`-direktiv
- **Syntax:**
  ```
  User-agent: *
  Content-Signal: ai-train=no, search=yes, ai-input=yes
  ```
- **Tre signaler:**
  - `ai-train` — om innehållet får användas för modellträning
  - `ai-input` — om det får användas som live inference/RAG-input
  - `search` — om det får indexeras i AI-sökning
- **Adoption:** 4 % av 200 000 toppdomäner ([Cloudflare blog](https://blog.cloudflare.com/agent-readiness/)). Cloudflare tillämpar `ai-train=no` som default på sina 3,8 miljoner managed-robots.txt-domäner ([Content Signals Policy blog](https://blog.cloudflare.com/content-signals-policy/))
- **Källa:** [Cloudflare Content Signals Policy, sept 2025](https://blog.cloudflare.com/content-signals-policy/)

#### 7. Web Bot Auth (informationell, ej scorad i basscanning)
- **Vad:** IETF draft-standard för kryptografisk bot-identifiering via HTTP Message Signatures
- **HTTP-request:** `GET /.well-known/http-message-signatures-directory`
- **Signaler:** HTTP 200 + JSON-directory med Ed25519-nycklar
- **Teknisk detalj:** Boten signerar varje request med headers `Signature-Agent`, `Signature-Input`, `Signature`; mottagaren verifierar mot publicerade public keys
- **Adoption:** Nästan noll utanför Cloudflare's egna properties ([nohacks.co](https://nohacks.co/blog/cloudflare-agent-readiness-score))
- **Koppling till Pay Per Crawl:** Web Bot Auth är grunden för Cloudflare's [pay-per-crawl system](https://blog.cloudflare.com/introducing-pay-per-crawl/) (se sektion 1.6)

---

### Kategori 4: Protocol Discovery / Capabilities (6 checks, alla scorade)

#### 8. API Catalog (RFC 9727)
- **Vad:** Machine-readable index av sajtens API-endpoints
- **HTTP-request:** `GET /.well-known/api-catalog`
- **Signaler:** HTTP 200 + giltig JSON med API-lista
- **Källa:** [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727), ratificerad IETF-standard
- **Adoption:** Färre än 15 sajter av 200 000 i Cloudflare's bulk-scan ([Cloudflare blog](https://blog.cloudflare.com/agent-readiness/))

#### 9. OAuth Server Discovery (RFC 8414)
- **Vad:** Kontrollerar om OAuth 2.0/OIDC discovery-endpoints finns
- **HTTP-request:** `GET /.well-known/oauth-authorization-server` och/eller `GET /.well-known/openid-configuration`
- **Signaler:** HTTP 200 + giltig JSON med authorization_endpoint, token_endpoint etc.
- **Källa:** [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414)

#### 10. OAuth Protected Resource (RFC 9728)
- **Vad:** Sajten deklarerar vilka endpoints som är OAuth-skyddade och hur autentisering sker
- **HTTP-request:** `GET /.well-known/oauth-protected-resource` (eller via `Link`-header)
- **Signaler:** HTTP 200 + giltig JSON
- **Källa:** [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728); lanserades som del av Cloudflare Access under Agents Week 2026

#### 11. MCP Server Card (SEP-1649, draft)
- **Vad:** JSON-fil som beskriver en MCP-server för agenter som vill förstå kapabiliteter innan de ansluter
- **HTTP-request:** `GET /.well-known/mcp/server-card.json`
- **Signaler:** HTTP 200 + giltig JSON med `serverInfo`, `transport`, `tools`-fält
- **Exempelstruktur:**
  ```json
  {
    "$schema": "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
    "version": "1.0",
    "protocolVersion": "2025-06-18",
    "serverInfo": { "name": "search-mcp-server", "title": "Search MCP Server" },
    "transport": { "type": "streamable-http", "endpoint": "/mcp" },
    "authentication": { "required": false },
    "tools": [...]
  }
  ```
- **Källa:** MCP SEP-1649 draft, [Cloudflare blog](https://blog.cloudflare.com/agent-readiness/)
- **Adoption:** Extremt låg — under 15 sajter totalt i bulk-scan ([Cloudflare blog](https://blog.cloudflare.com/agent-readiness/))

#### 12. Agent Skills Index
- **Vad:** Lista med agent-anropsbara "skills" (Cloudflare-förslag)
- **HTTP-request:** `GET /.well-known/agent-skills/index.json`
- **Signaler:** HTTP 200 + giltig JSON med skills-lista
- **Notering:** isitagentready.com exponerar sin egen skills-index på denna endpoint, med skill-dokument för varje standard de kontrollerar ([Cloudflare blog](https://blog.cloudflare.com/agent-readiness/))

#### 13. WebMCP (experimentell)
- **Vad:** In-page JavaScript API (`navigator.modelContext`) för att exponera strukturerade verktyg till in-browser AI-agenter
- **HTTP-request:** Sajten renderas med headless browser; scanner kontrollerar om `navigator.modelContext.registerTool()` anropas vid sidladdning
- **Signaler:** DOM-inspektion / JavaScript-exekvering — detekterar registrerade tools
- **Standard:** W3C Community Group draft, Chrome 145+ DevTrial (februari 2026), [Chrome WebMCP guide](https://dev.to/czmilo/chrome-webmcp-the-complete-2026-guide-to-ai-agent-protocol-1ae9)
- **Imperativ API-syntax:**
  ```javascript
  navigator.modelContext.registerTool({
    name: "search_products",
    description: "...",
    inputSchema: { ... },
    execute: async (params) => { ... }
  });
  ```

---

### Kategori 5: Commerce (3 checks, informationella — ej scorade på icke-commerce-sajter)

#### 14. x402 Payment Protocol
- **Vad:** HTTP 402 Payment Required-infrastruktur för agent-native betalningar
- **HTTP-request:** Scanner gör en request och ser om servern returnerar `402 Payment Required` med `crawler-price:`-header
- **Koppling:** Cloudflare's pay-per-crawl, lanserat juli 2025 i private beta ([TechCrunch](https://techcrunch.com/2025/07/01/cloudflare-launches-a-marketplace-that-lets-websites-charge-ai-bots/))

#### 15. Universal Commerce Protocol (UCP)
- **Vad:** Googles merchant-metadata-standard
- **HTTP-request:** `GET /.well-known/ucp`
- **Signaler:** HTTP 200 + giltig UCP-profil

#### 16. Agentic Commerce Protocol (ACP)
- **Vad:** Ytterligare commerce-discovery-standard
- **HTTP-request:** `GET /.well-known/acp.json`
- **Signaler:** HTTP 200 + giltig ACP-discovery-dokument

---

### Vad verktyget INTE kontrollerar (per default)

| Standard | Finns check? | Kommentar |
|---|---|---|
| `llms.txt` | Valfri (ej default) | Kan aktiveras i Customize-menyn |
| `llms-full.txt` | Nej | Inget check |
| Strukturerad data (JSON-LD, schema.org) | Nej | Saknas helt |
| Meta-taggar för AI | Nej | Saknas helt |
| OpenAPI/Swagger-spec | Delvis | API Catalog kan länka till OpenAPI, men ingen separat OpenAPI-check |
| Core Web Vitals / sidprestanda | Nej | Ej relevant för agenter |
| GDPR-compliance | Nej | Totalt frånvarande |
| EU AI Act-compliance | Nej | Totalt frånvarande |
| Tillgänglighetsstandard (WCAG) | Nej | Ej relevant |
| Språkspecifika checks (svenska, nordiska) | Nej | Engelskspråkig plattform |
| Lokala AI-crawlers (nordiska) | Nej | Ingen awareness om regionala aktörer |

---

## 1.3 Scoring-system

### Poängsättning
- **Skala:** 0–100
- **System:** Pass/fail per check; varje kategori ger en procentandel baserat på antal godkända checks i kategorin; total score är viktad aggregering av kategoriscores
- **Viktning:** Inte publikt dokumenterad i detalj. Baserat på observerat beteende i [nohacks.co's analys](https://nohacks.co/blog/cloudflare-agent-readiness-score): en sajt med perfekt Discoverability och Bot Access Control men noll Capabilities kan landa på 33/100 (All Checks preset)

### Nivåer (Level-systemet)
Scorer kategoriseras i nivåer med namngivna etiketter. Kända nivåer (baserat på community-rapporter):
- **Level 1:** Okänd benämning (0–24?)
- **Level 2 "Bot-Aware":** ~25–50 poäng (vanligast rapporterat, t.ex. nohacks.co: 33/100)
- **Högre nivåer:** Ej fullständigt dokumenterade — [aeoengine.ai](https://aeoengine.ai/blog/cloudflare-ai-agent-readiness-guide) refererar till trösklar vid 60 och 80

### Preset-effekt på score
Viktigt: samma sajt kan få **radikalt olika scores** beroende på vald preset:
- **All Checks (default):** Inkluderar alla 16 checks. Missgynnar content-only-sajter som inte har API/MCP
- **Content Site:** Inkluderar bara 6 checks (Discoverability x3, Markdown, AI bot rules, Content Signals). Samma sajt som fick 33 på All Checks kan få 67 på Content Site
- **API/Application:** Fokus på Capabilities-kategorin
- **Problemet:** Default är "All Checks" och de flesta användare byter aldrig preset → composite-siffran som delas på sociala medier är systematiskt för låg för content-sajter ([nohacks.co](https://nohacks.co/blog/cloudflare-agent-readiness-score))

### Rekommendationer per check
Ja — för varje failing check genereras:
1. En förklaring av vad som saknas
2. En prompt i Markdown-format att skicka till en coding agent för att implementera fixen
3. Länk till relevant RFC eller dokumentation

"Copy all instructions"-knappen samlar alla sådana promptar i ett enda block.

### Färgkodning
Inte explicit dokumenterat i tillgängliga källor. Pass/fail används konsekvent; ingen rödgul-grön-gradering av individuella checks dokumenterades.

---

## 1.4 API & pricing

### Direktanvändning (isitagentready.com)
- **Publik API:** Nej — ingen direkt publik REST API för isitagentready.com-scanning
- **MCP Server:** Ja — `https://isitagentready.com/.well-known/mcp.json` exponerar ett stateless MCP-server med `scan_site`-tool via Streamable HTTP, tillgängligt för alla MCP-kompatibla agenter ([Cloudflare blog](https://blog.cloudflare.com/agent-readiness/))
- **Agent Skills Index:** `https://isitagentready.com/.well-known/agent-skills/index.json`

### Via Cloudflare URL Scanner API (programmatisk access)
Samma checks är integrerade i Cloudflare's URL Scanner API ([Cloudflare blog](https://blog.cloudflare.com/agent-readiness/)):

```bash
curl -X POST https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/urlscanner/v2/scan \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -d '{
          "url": "https://www.example.com",
          "options": {"agentReadiness": true}
        }'
```

- **Auth:** Cloudflare API token + Account ID (kräver Cloudflare-konto)
- **Rate limits:** Ej explicit dokumenterade för agentReadiness-alternativet; URL Scanner har generella Cloudflare API rate limits
- **Radar API:** `GET /radar/agent_readiness/summary/{dimension}` — aggregerad data över 200 000 toppdomäner ([Cloudflare API docs](https://developers.cloudflare.com/api/resources/radar/subresources/agent_readiness))

### Pricing för isitagentready.com
- **Gratis:** Ja, fullständigt gratis, ingen inloggning krävs för enskild scanning
- **Inga kända tier-begränsningar** på isitagentready.com-scanning
- **URL Scanner API** kräver Cloudflare-konto; ingår i befintliga Cloudflare-planer

### Cloudflare plan-tiers (relevant kontext)
| Plan | Pris | Relevans för agent-readiness |
|---|---|---|
| Free | $0/mån | AI Crawl Control ingår (alla planer) |
| Pro | $20/mån | Managed robots.txt, basic bot management |
| Business | $200/mån | Avancerad bot management (ML, beteendeanalys, fingerprinting) |
| Enterprise | ~$2 000–20 000+/mån | Full Bot Management, anpassade regler, SLA |

AI Crawl Control (inkl. Pay Per Crawl-beta) är tillgängligt på **alla planer** ([Cloudflare AI Crawl Control docs](https://developers.cloudflare.com/ai-crawl-control/)).

---

## 1.5 Positionering & marknadsföring

### Hur Cloudflare pitchar produkten

**Analogin de använder:** Google Lighthouse för agenter. "Scores and audits that provide actionable feedback have helped to drive adoption of new standards before." ([Cloudflare blog](https://blog.cloudflare.com/agent-readiness/))

**Narrativ i pitchen:**
1. Webben har lärt sig prata med browsers, sedan sökmotorer — nu måste den lära sig prata med AI-agenter
2. Agenter ser bara "a wall of HTML, CSS, and assets" ([Cloudflare Meetup Lisbon](https://rewiz.app/channels/@cloudflare-developers/how-to-make-your-website-agent-ready-cloudflare-engineering-meetup-lisbon))
3. isitagentready.com är startpunkten: "go to isitagentready.com, scan your website, takes 30 seconds, fix what makes sense"
4. Koppling till SEO-historiken: "vi är 2026 vad SEO var 2003"

**Verktyget är ett developer-tool / lead-magnet, inte ett SaaS-produkt.** Det är gratis med syfte att:
- Driva awareness om agent-standarder
- Ge Cloudflare topoffunnel-data (vilka sajter som scanas, av vem)
- Konvertera till Cloudflare DNS/CDN/Bot Management/AI Crawl Control

### Målkund
Primärt **developers och site owners** som bygger för den "agentic web". Sekundärt marketing-/SEO-team som börjar förstå "AEO" (Agent Engine Optimization). Cloudflare nämner explicit: publishers, e-handel, dokumentationssajter ([AI Crawl Control docs](https://developers.cloudflare.com/ai-crawl-control/)).

### Marketing funnel-placering

```
isitagentready.com (gratis, ingen inloggning)
          ↓
Cloudflare Radar (AI Insights-dashboard, data om bot-adoption)
          ↓
AI Crawl Control (gratis på alla planer, kräver Cloudflare-konto/DNS)
          ↓
Managed robots.txt (gratis add-on)
          ↓
Bot Management (Business/Enterprise, betald)
          ↓
Pay Per Crawl (private beta, kräver Cloudflare-konto)
```

isitagentready.com är explicit top-of-funnel. HackerNews-kommentarer noterade att verktyget sannolikt mappar IP-adress till webbplatsägare för Cloudflare's datainsamling ([HackerNews](https://news.ycombinator.com/item?id=47805998)).

---

## 1.6 Relaterade Cloudflare-produkter (koppling)

### Bot Management
- Enterprise/Business-produkt för att blockera, identifiera och poängsätta bot-trafik med ML, beteendeanalys och fingerprinting
- isitagentready.com är konceptuellt uppströms — "är din sajt redo för bra bots?" medan Bot Management hanterar de dåliga
- Koppling: samma checks för AI-crawler-identifiering används i båda
- Prissättning: Business-plan och uppåt; Enterprise från ~$2 000/mån+

### AI Crawl Control (tidigare "AI Audit")
- **Alla planer, gratis**
- Lanserat ursprungligen 2024 som "AI Audit", omdöpt till "AI Crawl Control" under AI Week 2025 ([Cloudflare AI Crawl Control docs](https://developers.cloudflare.com/ai-crawl-control/))
- Features:
  - Dashboard: vilka AI-tjänster accesar innehåll + request-mönster
  - Granulär access control per crawler
  - Robots.txt compliance monitoring: spårar vilka crawlers som ignorerar direktivet
  - Pay Per Crawl-integration (private beta)
- **Koppling till isitagentready.com:** Om din sajt missar Bot Access Control-checks, är AI Crawl Control den naturliga nästa produkten

### Managed robots.txt
- Cloudflare prepends agent-direktiv till ditt befintliga robots.txt (eller skapar ett nytt)
- Default: `ai-train=no` på 3,8 miljoner domäner
- Ingår i alla planer, aktiveras med ett toggle i dashboard
- Håller sig uppdaterad med nya AI-crawler User-Agents automatiskt

### Pay Per Crawl (x402-integration)
- **Private beta** sedan juli 2025 ([Cloudflare Pay Per Crawl blog](https://blog.cloudflare.com/introducing-pay-per-crawl/))
- Kräver att crawlers registreras hos Cloudflare och implementerar Web Bot Auth (Ed25519-signering)
- Flöde:
  1. Crawler request → `402 Payment Required` + `crawler-price: USD XX.XX`
  2. Crawler retry med `crawler-exact-price` eller `crawler-max-price`-header
  3. Om pris matchar → `200 OK` + `crawler-charged`-header; Cloudflare debiterar crawlern och betalar ut till publishern
- Cloudflare agerar Merchant of Record
- Signup: `cloudflare.com/paypercrawl-signup/`

### isitagentready.com som top-of-funnel
Verktyget fungerar som en "self-serve diagnostic" som:
1. Identifierar gapen → skapar behov för Cloudflare's produkter
2. Ger Cloudflare datapunkter om web-adoption av agent-standarder (uppdateras i Cloudflare Radar veckovis)
3. Konverterar developers till Cloudflare-ekosystemet via "lösa det direkt i Cloudflare Dashboard"

---

## 1.7 Svagheter & differentieringspunkter för svensk konkurrent

### Vad isitagentready.com INTE gör

| Gap | Beskrivning | Möjlighet för agent.opensverige.se |
|---|---|---|
| **GDPR/EU AI Act-compliance** | Noll checks för dataskydd, AI-transparens, samtycke, Art. 22 GDPR, EU AI Act-kategorisering | Lägg till GDPR-specifika checks: cookie consent-korrekthet, privacy policy-AI-klausuler, Art. 13/14-information |
| **Lokala AI-crawlers** | Känner inte till nordiska/svenska AI-crawlers eller söktjänster | Identifiera och inkludera svenska/nordiska crawlers och AI-tjänster |
| **Svenska myndigheter** | Inga checks för myndighetsstandarder (Myndigheten för digital förvaltning/DIGG, PTS, IMY) | Integration med DIGG:s riktlinjer, IMY:s AI-riktlinjer |
| **Flerspråksstöd** | Engelskspråkig plattform, UI på engelska, rekommendationer på engelska | Fullt svensk UI, svenska åtgärdsförslag, nordisk terminologi |
| **EU-fokuserade AI-crawlers** | Känner till GPTBot, ClaudeBot etc. men inga EU-specifika AI-bots | Inkludera europeiska AI-projekt (Aleph Alpha, Mistral, nordiska AI-initiativ) |
| **Faktisk innehållsanalys** | Analyserar enbart protokolllager; läser aldrig faktiskt innehåll | Granska om llms.txt är semantiskt korrekt, om sitemap täcker rätt sidor, innehållskvalitetsanalys |
| **Action-rapporter / PDF-export** | Ger text-promptar men ingen strukturerad rapport | Generera DOCX/PDF-rapport med prioriterad åtgärdslista, ansvarsperson, tidplan |
| **Historisk tracking** | Ingen möjlighet att spåra score-utveckling över tid | Konton med historik, regressionstester i CI/CD |
| **Competitor benchmarking** | Scannar bara en sajt åt gången | Jämför din score mot branschsnittet, mot konkurrenter |
| **llms.txt kvalitetsgranskning** | Om llms.txt finns: saknas check på semantisk korrekthet, länkvaliditet, täckning | Djupare llms.txt-analys: fungerar länkarna? Är beskrivningarna informativa? Passar de i context-window? |
| **MCP-djup** | Kontrollerar bara om MCP Server Card finns, ej om tools är funktionella | Testa faktiska MCP-tool-anrop, verifiera schema-korrekthet |
| **OpenAPI-validering** | API Catalog-check är passivt (finns filen?) | Ladda och validera OpenAPI-spec om den länkas från API Catalog |
| **Commerce ej scorad** | x402/UCP/ACP är informationella — inte scorade | Gör commerce-checks scorade, relevant för svensk e-handel |
| **Ingen schema.org-check** | Strukturerad data (JSON-LD, schema.org) testas inte | Kontrollera Organisation, Product, BreadcrumbList, Article-markup |
| **Ingen integritetsrapportering** | Ingen uppgift om hur scan-data används | Transparent policy om vad som loggas; GDPR-kompatibel data-hantering |
| **Cloudflare-ekosystem-bias** | Rekommendationerna leder naturligt till Cloudflare-produkter | Produktoberoende rekommendationer för alla hosting-plattformar |

### Differentiering — tre konkreta gap att fylla first

**1. EU/GDPR-compliance overlay**
Skapa ett eget "EU Readiness Score" som komplement: kontrollera om sajten har korrekt cookie-consent, om privacy policy nämner AI-träning, om IMY:s rekommendationer följs. Denna dimension saknas helt hos Cloudflare och är kritisk för svenska/europeiska företag.

**2. Semantisk innehållsanalys**
Cloudflare kollar om llms.txt *finns*, inte om den är *bra*. Kontrollera: Är länkarna levande? Täcker de faktiskt det viktigaste innehållet? Passar filen i ett context-window? Är AI-bot-regler i robots.txt faktiskt korrekt utformade?

**3. Norsk/Dansk/Finsk/Isländsk täckning + nordisk positionering**
Positionera som "Norden's agent readiness scanner". Inkludera nordiska publika myndigheters riktlinjer, nordiska e-handelsplattformar, lokala AI-aktörer. Bli den naturliga referenspunkten för Norden.

---

## 1.8 Konkreta URLs & källor

| Resurs | URL |
|---|---|
| isitagentready.com | `https://isitagentready.com` |
| Cloudflare launch blog | `https://blog.cloudflare.com/agent-readiness/` |
| AI Crawl Control docs | `https://developers.cloudflare.com/ai-crawl-control/` |
| Pay Per Crawl blog | `https://blog.cloudflare.com/introducing-pay-per-crawl/` |
| Content Signals Policy blog | `https://blog.cloudflare.com/content-signals-policy/` |
| Agents Week review | `https://blog.cloudflare.com/agents-week-in-review/` |
| Cloudflare Radar API (agent readiness) | `https://developers.cloudflare.com/api/resources/radar/subresources/agent_readiness` |
| URL Scanner API | `https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/urlscanner/v2/scan` |
| isitagentready MCP Server Card | `https://isitagentready.com/.well-known/mcp.json` |
| isitagentready Agent Skills | `https://isitagentready.com/.well-known/agent-skills/index.json` |
| Pay Per Crawl signup | `https://www.cloudflare.com/paypercrawl-signup/` |
| HackerNews-tråd | `https://news.ycombinator.com/item?id=47805998` |
| nohacks.co detaljerad teardown | `https://nohacks.co/blog/cloudflare-agent-readiness-score` |
| technologychecker.io robots.txt-analys | `https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report` |
| WebMCP (Chrome standard) | `https://dev.to/czmilo/chrome-webmcp-the-complete-2026-guide-to-ai-agent-protocol-1ae9` |
| llms.txt förslag (Jeremy Howard) | `https://github.com/answerdotai/llms-txt` |
| RFC 8288 Link Headers | `https://www.rfc-editor.org/rfc/rfc8288` |
| RFC 9309 robots.txt | `https://www.rfc-editor.org/rfc/rfc9309` |
| RFC 9727 API Catalog | `https://www.rfc-editor.org/rfc/rfc9727` |
| RFC 8414 OAuth discovery | `https://www.rfc-editor.org/rfc/rfc8414` |
| RFC 9728 OAuth Protected Resource | `https://www.rfc-editor.org/rfc/rfc9728` |
| Cloudflare Lisbon Meetup (video) | `https://rewiz.app/channels/@cloudflare-developers/how-to-make-your-website-agent-ready-cloudflare-engineering-meetup-lisbon` |
| ProductHunt-listning | `https://www.producthunt.com/products/is-your-site-agent-ready` |

---

## 1.9 Sammanfattning: 5 viktigaste insikterna för konkurrent

### 1. Verktyget är en lead magnet, inte en fristående produkt
isitagentready.com är gratis och designat för att driva trafik till Cloudflare's betalda produkter (Bot Management, AI Crawl Control, Pay Per Crawl). Det är Cloudflare's "Google Lighthouse moment" — ett prestige-verktyg för mindshare hos developers. agent.opensverige.se måste ha en liknande tydlig funnel: vad erbjuder plattformen utöver scanning?

### 2. Scoring-systemet är strukturellt missvisande för content-sajter
Default-presettet "All Checks" straffar content-sajter som inte behöver MCP-servers eller API Catalogs. En blogg med perfekt robots.txt och sitemap kan landa på 33/100. Scorer som delas på sociala medier är systematiskt för låga. agent.opensverige.se kan differentiera med ett adaptivt scoring-system som automatiskt anpassar sig till sajt-typ utan att kräva manuell preset-val.

### 3. 16 checks, men noll för GDPR/EU AI Act
Cloudflare's checks är 100% tekniska och 100% globala. Inget om GDPR-compliance, EU AI Act-kategorisering, IMY:s rekommendationer, eller svenska/nordiska myndighetsriktlinjer. Detta är det mest konkreta och svårast-att-kopiera differentierings-gap för en svensk konkurrent.

### 4. MCP och .well-known-endpoints dominerar "Capabilities"-kategorin
6 av 16 checks handlar om protokoll-discovery via `.well-known/`-endpoints. Adoption är extremt låg (under 15 sajter av 200 000 i bulk-scan). agent.opensverige.se kan ta ledarrollen i att utbilda svenska developers om dessa standarder innan de blir mainstream — samma position som tidiga SEO-verktyg hade 2003–2005.

### 5. Web Bot Auth + Pay Per Crawl är Cloudflare's monetizing-bet
Den kryptografiska bot-signerings-standarden (Web Bot Auth) är grunden för hela Pay Per Crawl-ekosystemet. Cloudflare satsar på att bli infrastrukturlager för AI-content-monetisering. agent.opensverige.se behöver ta ställning: ska vi integrera med detta, bygga en alternativ modell, eller ignorera commerce-aspekten och fokusera på compliance/discoverability?

---

*Rapport genererad april 2026. Baserad på: [Cloudflare blog](https://blog.cloudflare.com/agent-readiness/), [nohacks.co teardown](https://nohacks.co/blog/cloudflare-agent-readiness-score), [Cloudflare AI Crawl Control docs](https://developers.cloudflare.com/ai-crawl-control/), [HackerNews-diskussion](https://news.ycombinator.com/item?id=47805998), [Pay Per Crawl blog](https://blog.cloudflare.com/introducing-pay-per-crawl/), [Content Signals Policy](https://blog.cloudflare.com/content-signals-policy/), [technologychecker.io robots.txt-analys](https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report), och community-teardowns på [ProductHunt](https://www.producthunt.com/products/is-your-site-agent-ready) och [Reddit](https://www.reddit.com/r/ArtificialInteligence/comments/1sot1az/cloudflare_launched_tool_to_check_if_your_website/).*
