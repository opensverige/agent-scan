# 2. AI Agent-Readiness Scoring — 2026 Consensus & Gap-Analys

> Rapport för agent.opensverige.se — baserad på forskning april–maj 2026.
> Samtliga befintliga 11 checks identifieras, och ett 30-tal saknade checks prioriteras P0/P1/P2.

---

## 2.1 Befintliga ramverk & whitepapers (2025–2026)

### Akademiska papers

| Paper | Datum | Relevans |
|-------|-------|----------|
| *Open Agent Specification (Agent Spec) Technical Report* | Okt 2025 | Deklarativt konfigurationsspråk för AI-agenter, framework-agnostiskt, arxiv.org/abs/2510.04173 |
| Princeton GEO-forskning (Generative Engine Optimization) | 2025 | Sidor med auktoritativa citat fick 40 % fler AI-omnämnanden; statistik höjde citatfrekvens med 37 % |

### Industry whitepapers

| Källa | Dokument | Datum | URL |
|-------|----------|-------|-----|
| **Cloudflare** | *Introducing the Agent Readiness score* | 17 apr 2026 | https://blog.cloudflare.com/agent-readiness/ |
| **Cloudflare** | *Cloudflare Expands its Agent Cloud* | 13 apr 2026 | https://www.cloudflare.com/press/press-releases/2026/cloudflare-expands-its-agent-cloud-to-power-the-next-generation-of-agents/ |
| **Anthropic** | *Introducing the Model Context Protocol* | 25 nov 2024 | https://www.anthropic.com/news/model-context-protocol |
| **OpenAI** | *OpenAI for Developers in 2025* (år-slut-sammanfattning) | 30 dec 2025 | https://developers.openai.com/blog/openai-for-developers-2025 |
| **Google** | *Announcing the Agent2Agent Protocol (A2A)* | 9 apr 2025 | https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/ |
| **Vercel** | *Making agent-friendly pages with content negotiation* | 3 feb 2026 | https://vercel.com/blog/making-agent-friendly-pages-with-content-negotiation |
| **Vercel** | *AI SDK 6* | 22 dec 2025 | https://vercel.com/blog/ai-sdk-6 |
| **Mintlify** | *The value of llms.txt: Hype or real?* | 9 maj 2025 | https://www.mintlify.com/blog/the-value-of-llms-txt-hype-or-real |
| **Checkly** | *The Current State of Content Negotiation for AI Agents* | 19 feb 2026 | https://www.checklyhq.com/blog/state-of-ai-agent-content-negotation/ |

### W3C / IETF drafts

| Standard | Status | Beskrivning | URL |
|----------|--------|-------------|-----|
| **IETF AIPREF WG charter** | Chartered apr 2025 | Standardiserar hur publicister signalerar AI-preferenser för innehåll | https://datatracker.ietf.org/doc/charter-ietf-aipref/ |
| **draft-ietf-aipref-attach-04** | Standards Track, okt 2025 | Definierar `Content-Usage` HTTP-header + robots.txt-direktiv för AI-preferenser | https://datatracker.ietf.org/doc/draft-ietf-aipref-attach/ |
| **RFC 9727** (api-catalog) | RFC, jun 2025 | `/.well-known/api-catalog` — standardiserad API-discovery | https://datatracker.ietf.org/doc/rfc9727/ |
| **RFC 8615** | RFC (etablerad) | Ramverk för `/.well-known/`-URI:er som alla nya AI-standards nyttjar | https://www.rfc-editor.org/rfc/rfc8615 |
| **RFC 8288** | RFC (etablerad) | HTTP Link-headers för resurs-discovery | https://www.rfc-editor.org/rfc/rfc8288 |
| **Web Bot Auth IETF draft** | Aktiv draft | Kryptografiska signaturer för bot-autentisering; `/.well-known/http-message-signatures-directory` | https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/ |

### Branschorgan

| Organisation | Initiativ | Status |
|--------------|-----------|--------|
| **MCP / Agentic AI Foundation (AAIF)** | MCP donerades till Linux Foundation dec 2025; OpenAI, Google, MS, AWS adopterade | De-facto-standard för tool-anslutning |
| **Linux Foundation** | A2A Protocol Project — Google donerade A2A jun 2025 | Öppen governans av agent-to-agent-protokollet |
| **IAB / TCF v2.2** | Branschstandard för cookie consent signaling | Används i befintlig check 5 |
| **C2PA (Coalition for Content Provenance and Authenticity)** | Content Credentials-specifikationen | Durable Content Credentials i senaste spec, jan 2025 |
| **Spawning.ai** | `ai.txt` + Do-Not-Train-registry | Limiterad adoption (HuggingFace, Stability) |

---

## 2.2 De-facto-standarder under framväxt

### llms.txt och llms-full.txt

| Dimension | Värde |
|-----------|-------|
| **Ursprung** | Jeremy Howard (Answer.AI), förslag sep 2024 |
| **Officiell spec** | https://llmstxt.org — community-driven, ej IETF/W3C ännu |
| **Vem driver** | Mintlify (implementation), Anthropic (beställde Mintlify-versionen), Answer.AI |
| **Adoption** | 844 000+ webbplatser (BuiltWith, okt 2025); 5–15 % bland tech/doc-sajter |
| **Kända adoptörer** | Anthropic, Cloudflare, Stripe, Vercel, Cursor, Pinecone, Windsurf, NVIDIA |
| **llms.txt** | Nav-fil (<10 KB) med H1-rubrik, blockquote, H2-sektioner med länklista till Markdown-sidor |
| **llms-full.txt** | Komplett Markdown-konkatenering av hela sajten; Anthropics version = 481 349 tokens |
| **Format** | `text/plain; charset=utf-8`, UTF-8, CommonMark Markdown |
| **Visited-ratio** | llms-full.txt besöks dubbelt så ofta som llms.txt när båda finns |
| **Status** | Community de-facto-standard; IETF AIPREF WG har *inte* formellt adoptat den ännu |

### .well-known/mcp (och mcp.json)

| Dimension | Värde |
|-----------|-------|
| **Ursprung** | MCP GitHub-diskussion dec 2024; SEP-1649 (okt 2025) och SEP-1960 |
| **Vem driver** | Anthropic + MCP GitHub community |
| **Paths** | `/.well-known/mcp/server-card.json` (SEP-1649) och `/.well-known/mcp` (SEP-1960) |
| **Status** | Aktiva förslag (ej finaliserade spec); Cloudflare implementerade i isitagentready.com apr 2026 |
| **Adoption** | Färre än 15 sajter av Cloudflares top-200 000 (apr 2026) — extremt tidig |

### .well-known/agent-card.json (Google A2A)

| Dimension | Värde |
|-----------|-------|
| **Ursprung** | Google A2A-protokollet, apr 2025 |
| **Vem driver** | Linux Foundation A2A Protocol Project (donerades jun 2025) |
| **Path** | `/.well-known/agent-card.json` |
| **Format** | JSON med capabilities, authentication, endpoint, skills |
| **Status** | V1.0 med Signed Agent Cards; 150+ partnerorganisationer apr 2026 |
| **Komplement** | MCP = vertikal (agent↔verktyg); A2A = horisontell (agent↔agent) |

### .well-known/api-catalog (RFC 9727)

| Dimension | Värde |
|-----------|-------|
| **Standard** | RFC 9727, jun 2025 — Proposed Standard |
| **Path** | `/.well-known/api-catalog` |
| **Syfte** | Enda platsen att lista alla publicerade API:er med specs, docs, status |
| **Status** | RFC (formell IETF-standard), men <15 sajter hade implementerat apr 2026 |

### .well-known/agent-skills/index.json

| Dimension | Värde |
|-----------|-------|
| **Ursprung** | Cloudflare-förslag, jan 2026 (cloudflare/agent-skills-discovery-rfc) |
| **Path** | `/.well-known/agent-skills/index.json` |
| **Syfte** | Listar tillgängliga "skills" (uppgiftsbeskrivningar för agenter) |
| **Status** | Experimentell; implementeras av Cloudflare-docs och isitagentready.com |

### IETF AI Preferences (AIPREF) — draft-ietf-aipref-attach

| Dimension | Värde |
|-----------|-------|
| **Status** | Standards Track draft, version -04, okt 2025 |
| **Levererar** | `Content-Usage` HTTP-header (t.ex. `Content-Usage: train-ai=n`) |
| **Uppdaterar** | RFC 9309 (robots.txt) med `Content-Usage`-direktiv |
| **Signatur** | Illyes (Google) & Thomson (Mozilla) |
| **Expires** | 1 maj 2026 (kräver förnyelse/publicering) |

### robots.txt-extensions för AI

Utöver traditionell `Allow/Disallow` finns nu tre lager:

1. **Per-crawler User-Agent** — GPTBot, OAI-SearchBot, ClaudeBot, Claude-User, PerplexityBot, Google-Extended, Applebot-Extended etc.
2. **Content-Signal direktiv** (Cloudflare-spec): `Content-Signal: ai-train=no, search=yes, ai-input=yes`
3. **Content-Usage direktiv** (IETF AIPREF draft): `Content-Usage: train-ai=n`

> **Viktigt**: GPTBot = träning + sökning. OAI-SearchBot = enbart ChatGPT-sökning. Att blockera GPTBot men tillåta OAI-SearchBot är numera best practice för publicister som vill synlighet i ChatGPT utan att donera träningsdata. ([TechnologyChecker.io](https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report))

### schema.org markup för AI-konsumtion

| Dimension | Värde |
|-----------|-------|
| **Format** | JSON-LD (rekommenderat av Google), Microdata, RDFa |
| **Status** | Etablerad standard; JSON-LD prefereras för AI-agenter |
| **AI-relevans** | Google AI Overviews, ChatGPT och Perplexity använder strukturerad data för entity resolution |
| **Kritiska typer** | `Organization`, `Product`, `Article`, `LocalBusiness`, `Person`, `FAQPage` |

### ai.txt (Spawning)

| Dimension | Värde |
|-----------|-------|
| **Ursprung** | Spawning.ai — Do-Not-Train-registry |
| **Adoption** | HuggingFace och Stability.ai hedrar registret; begränsad adoption i övrigt |
| **Format** | Textfil i rooten, liknar robots.txt |
| **Status** | Experimentell; ersätts delvis av IETF AIPREF |

### C2PA / Content Credentials

| Dimension | Värde |
|-----------|-------|
| **Vem driver** | C2PA (Adobe, Microsoft, Google, Arm m.fl.) |
| **Standard** | Öppen spec; Durable Content Credentials i senaste versionen (jan 2025) |
| **Syfte** | Kryptografisk provenance-data för media — ursprung, redigeringshistorik |
| **AI-relevans** | Verifierar att innehåll ej är AI-genererat; trustworthiness-signal |
| **Status** | Adopteras av kameratillverkare, Adobe, sociala plattformar |

### Pay-per-crawl-signaler

| Dimension | Värde |
|-----------|-------|
| **Cloudflare Pay Per Crawl** | Lanserat jul 2025; HTTP 402 Payment Required, HTTP Signatures för betalningsintent |
| **x402.org** | Open source-alternativ av Coinbase; baserat på befintlig HTTP 402-spec |
| **Tollbit** | Kommersiell pay-per-crawl-tjänst |
| **Status** | Cloudflare "Commerce"-dimensionen checkas men räknas ej in i score ännu (apr 2026) |

### Cookie/consent: CMP-detection, IAB TCF v2.2

Befintlig check (nr 5). IAB TCF v2.2 är branschstandard; CMP-detection handlar om att verifiera att en Consent Management Platform faktiskt är korrekt konfigurerad (inte bara cosmetically present).

---

## 2.3 Vad publicerade Cloudflare, Anthropic, OpenAI, Vercel senaste 18 månaderna

### Cloudflare

| Datum | Vad | URL |
|-------|-----|-----|
| Jul 2025 | Pay Per Crawl — HTTP 402 för AI-crawlers | https://tech.slashdot.org/story/25/07/01/1745245/ |
| Nov 2025 | Web Bot Auth support i AWS WAF (partner-integrering) | https://aws.amazon.com/about-aws/whats-new/2025/11/aws-waf-web-bot-auth-support/ |
| Jan 2026 | Agent Skills Discovery RFC-förslag | https://github.com/cloudflare/agent-skills-discovery-rfc |
| Apr 2026 | **isitagentready.com + Agent Readiness score + Radar dataset** | https://blog.cloudflare.com/agent-readiness/ |
| Apr 2026 | Agent Cloud-expansion (Replicate-förvärv, GPT-5.4-katalog) | https://www.cloudflare.com/press/press-releases/2026/cloudflare-expands-its-agent-cloud/ |

**Cloudflares Agent Readiness-dimensioner** (från blog apr 2026):
- **Discoverability**: robots.txt, sitemap.xml, Link Headers (RFC 8288)
- **Content**: Markdown content negotiation (`Accept: text/markdown`)
- **Bot Access Control**: Content Signals, AI bot-regler, Web Bot Auth
- **Capabilities**: Agent Skills, API Catalog (RFC 9727), OAuth discovery (RFC 8414/9728), MCP Server Card, WebMCP
- **Commerce** (informational): x402, Universal Commerce Protocol, Agentic Commerce Protocol

### Anthropic

| Datum | Vad | URL |
|-------|-----|-----|
| Nov 2024 | **MCP (Model Context Protocol)** open-sourced | https://www.anthropic.com/news/model-context-protocol |
| Nov 2024 | llms.txt + llms-full.txt collaboration med Mintlify | https://www.mintlify.com/blog/the-value-of-llms-txt-hype-or-real |
| Dec 2025 | MCP donerades till Agentic AI Foundation (Linux Foundation) | https://en.wikipedia.org/wiki/Model_Context_Protocol |
| Jan 2026 | 97 miljoner månatliga SDK-nedladdningar; 10 000+ aktiva MCP-servrar | https://www.ekamoira.com/blog/mcp-server-discovery-implement-well-known-mcp-json-2026-guide |
| Jan 2026 | MCP Apps Extension (partnering med OpenAI) | https://www.ekamoira.com/blog/mcp-server-discovery-implement-well-known-mcp-json-2026-guide |

### OpenAI

| Datum | Vad | URL |
|-------|-----|-----|
| Mar 2025 | Officiell adoption av MCP | https://en.wikipedia.org/wiki/Model_Context_Protocol |
| Sep 2025 | MCP-stöd tillagt i ChatGPT apps | https://en.wikipedia.org/wiki/Model_Context_Protocol |
| Dec 2025 | Responses API, Agents SDK, AgentKit, Conversations API | https://developers.openai.com/blog/openai-for-developers-2025 |
| Dec 2025 | **AGENTS.md** spec, AAIF-deltagande | https://developers.openai.com/blog/openai-for-developers-2025 |
| Jan 2026 | MCP Apps Extension med Anthropic, Goose, VS Code | https://www.ekamoira.com/blog/mcp-server-discovery-implement-well-known-mcp-json-2026-guide |

### Vercel

| Datum | Vad | URL |
|-------|-----|-----|
| Jun 2025 | **Vercel Ship 2025** — Fluid-prissättning, AI Gateway, Observability | https://vercel.com/blog/vercel-ship-2025-recap |
| Sep 2025 | Vercel Agent (AI-assistent i dashboarden) public beta | https://community.vercel.com/t/vercel-agent-now-in-public-beta/22813 |
| Okt 2025 | Vercel-sajt: 10 % av signup-trafiken kom från ChatGPT | https://www.mintlify.com/blog/the-value-of-llms-txt-hype-or-real |
| Dec 2025 | **AI SDK 6** | https://vercel.com/blog/ai-sdk-6 |
| Feb 2026 | *Making agent-friendly pages with content negotiation* — 500 KB→2 KB | https://vercel.com/blog/making-agent-friendly-pages-with-content-negotiation |

### Google

| Datum | Vad | URL |
|-------|-----|-----|
| Apr 2025 | **A2A Protocol** (50+ tech-partners) | https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/ |
| Jun 2025 | A2A donerades till Linux Foundation | https://stellagent.ai/insights/a2a-protocol-google-agent-to-agent |
| Sep 2025 | AP2 (Agent Payments Protocol) som A2A-extension | https://stellagent.ai/insights/a2a-protocol-google-agent-to-agent |
| 2025 | llms.txt inkluderades i A2A-protokollets referensimplementering | https://www.mintlify.com/blog/the-value-of-llms-txt-hype-or-real |

---

## 2.4 MCP-server discoverability — best practice 2026

### Finns .well-known/mcp-konvention?

Ja, två konkurrerande förslag är aktiva (ej finaliserade):

| Förslag | Path | Focus |
|---------|------|-------|
| **SEP-1649** (Server Cards) | `/.well-known/mcp/server-card.json` | Rik server-metadata, capabilities |
| **SEP-1960** (Discovery Manifest) | `/.well-known/mcp` | Endpoint-enumeration och auth-discovery |

Rekommendation: **Implementera båda** — de är komplementära. ([Ekamoira guide, feb 2026](https://www.ekamoira.com/blog/mcp-server-discovery-implement-well-known-mcp-json-2026-guide))

### mcp.json manifest-format (SEP-1960)

```json
{
  "mcp_version": "2025-11-25",
  "endpoints": [
    {
      "url": "https://example.com/mcp",
      "transport": "streamable-http",
      "capabilities": ["tools", "resources"],
      "auth": {
        "type": "oauth2",
        "authorization_server": "https://example.com/.well-known/oauth-authorization-server"
      }
    }
  ]
}
```

### Server Card-format (SEP-1649)

```json
{
  "$schema": "https://modelcontextprotocol.io/schemas/server-card/v1.0",
  "version": "1.0",
  "protocolVersion": "2025-06-18",
  "serverInfo": {
    "name": "My MCP Server",
    "version": "2.1.0",
    "description": "Beskrivning av serverns funktioner",
    "homepage": "https://example.com"
  },
  "transport": {
    "type": "streamable-http",
    "url": "https://example.com/mcp"
  },
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": false
  }
}
```

### Hur klienter hittar MCP-servrar

| Klient | Discovery-metod |
|--------|----------------|
| **Claude Desktop / Claude Code** | Probar `/.well-known/mcp.json` och `/.well-known/mcp/server-card.json` automatiskt vid konfigurerad server-URL |
| **ChatGPT** (MCP-adoption mar 2025) | MCP Apps Extension (jan 2026) — standardiserat |
| **Cursor** | Begär `Accept: text/markdown`, respekterar `/.well-known/mcp` |
| **VS Code / Copilot** | Stöd via MCP Apps Extension jan 2026 |
| **Goose** | Del av MCP Apps Extension-ekosystemet |

### Transport-protokoll

| Transport | Status | Rekommendation |
|-----------|--------|----------------|
| **Streamable HTTP** | Nuvarande standard (MCP 2025-06-18) | Använd detta |
| **Server-Sent Events (SSE)** | Äldre version, deprecated i senaste spec | Undvik för nya implementationer |
| **WebSocket** | Ej del av MCP-spec | Ej applicabelt |
| **stdio** | Lokala MCP-servrar | Ej relevant för remote/web |

### Auth-patterns

| Pattern | Användning |
|---------|-----------|
| **OAuth 2.1** | Rekommenderas för remote MCP-servrar; discovery via `/.well-known/oauth-authorization-server` (RFC 8414) och `/.well-known/oauth-protected-resource` (RFC 9728) |
| **API key (Bearer)** | Enklare alternativ; specificeras i server card `auth`-fält |
| **Web Bot Auth** | Kryptografisk bot-identifiering (IETF draft); AWS WAF stöder sedan nov 2025 |

### Säkerhetsheaders för MCP discovery-endpoints

```
Content-Type: application/json
X-Content-Type-Options: nosniff
Cache-Control: public, max-age=3600
Access-Control-Allow-Origin: *
```

CORS måste vara aktivt för browser-baserade MCP-klienter.

---

## 2.5 Anti-patterns (vad användaren ska UNDVIKA i sin scanner)

### Lättgameade signaler

| Anti-pattern | Problem | Bättre approach |
|-------------|---------|-----------------|
| **Returnera HTTP 200 på /llms.txt utan innehåll** | Tom fil passerar check men ger agenter nollvärde | Validera att filen innehåller H1-rubrik + blockquote (llmstxt.org spec) |
| **robots.txt listar AI-User-Agents men WAF blockar dem** | robots.txt säger "Allow" men Cloudflare/WAF skickar 403 | Kör faktisk HTTP-request med rätt User-Agent (ClaudeBot, GPTBot) och verifiera 200-svar |
| **/llms.txt finns men pekade Markdown-filer returnerar 404** | Navigation-index som leder till döda ändar | Spot-testa ett urval av länkarna i llms.txt |
| **OpenAPI-spec finns men är tom/inaktuell** | Formell compliance utan tekniskt värde | Validera att spec innehåller minst ett endpoint och är syntaktiskt korrekt |
| **MCP-server returnerar 200 men inga tools** | MCP-instans utan capabilities | Kontrollera capabilities-fältet i server card |

### False positives

| Scenario | Risk |
|----------|------|
| **GPTBot listat som Allow i robots.txt, men IP-baserad WAF-regel blockar OpenAI:s ASN** | Scanner ser "OK" men faktisk crawler blockeras |
| **HTTPS-cert finns men är self-signed eller expired** | TLS-check passerar på 200 men agenter validerar cert-chain |
| **llms.txt serveras korrekt men med `Content-Type: text/html`** | Spec kräver `text/plain; charset=utf-8` |
| **sitemap.xml finns men är inte länkad i robots.txt** | Sitemaps-check passerar men discoverability är svag |
| **API-spec finns men kräver auth för att läsas** | OpenAPI-dokument bakom auth är inte tillgängligt för autonoma agenter |

### Checks som inte korrelerar med faktisk agent-användbarhet

| Check | Problem |
|-------|---------|
| **Enbart kolla User-Agent-strängar i robots.txt** | Skapar ingen faktisk åtkomst om WAF/CDN blockar innan |
| **Kontrollera om cookie banner finns** | Agenter interagerar inte med cookie banners; vad som spelar roll är om content är accessible *utan* att ha accepterat cookies |
| **Kolla om sidan har GDPR-policy-URL** | Ej relaterat till agent-teknisk readiness |
| **Räkna antal API-endpoints** | Volym ≠ agent-vänlighet; en välstrukturerad endpoint > hundra dåliga |

### "AI-washing"-checks

| Pattern | Bedömning |
|---------|-----------|
| **Bara kolla om llms.txt-filen *existerar*** utan att verifiera innehållet | Mäter närvaro, inte kvalitet |
| **Kolla om webbplatsen nämner "AI-ready" i text** | Marketing-signal, ej teknisk |
| **Certifikat från AI-readiness-tjänster** | Inga etablerade certifieringsorgan finns ännu |
| **Kontrollera om sociala medier listas** | Ingen relevans för agent-åtkomst |

---

## 2.6 GAP-ANALYS — vad användarens 11 checks MISSAR

Nedan ges **30 saknade checks** rangordnade P0 (kritiskt), P1 (viktigt) och P2 (nice-to-have). Checks som delvis täcks av de 11 befintliga markeras.

---

### P0 — Kritiska gaps (implementera nu)

#### G-01: llms-full.txt (inte bara llms.txt)
- **Vad testas**: Att `/llms-full.txt` existerar och innehåller komplett Markdown-innehåll
- **Varför viktigt 2026**: llms-full.txt besöks dubbelt så ofta som llms.txt; Anthropic och Cloudflare använder båda; agenter som Claude Code och Cursor behöver single-URL full context ([Mintlify, maj 2025](https://www.mintlify.com/blog/the-value-of-llms-txt-hype-or-real))
- **Implementation**: `GET /llms-full.txt` — kontrollera HTTP 200, `Content-Type: text/plain`, innehåll >1 KB, förekomst av H1 och H2

#### G-02: Markdown content negotiation (`Accept: text/markdown`)
- **Vad testas**: Att servern svarar med `Content-Type: text/markdown` när `Accept: text/markdown`-header skickas
- **Varför viktigt 2026**: Cloudflare mätte 80 % tokenreduktion; Vercel såg 500 KB→2 KB; detta är det viktigaste content-efficiency-steget; Claude Code, Cursor och OpenCode begär detta per default ([Checkly, feb 2026](https://www.checklyhq.com/blog/state-of-ai-agent-content-negotation/))
- **Implementation**: `GET / -H "Accept: text/markdown"` — verifiera att response Content-Type innehåller `text/markdown` och att response-body ej är HTML

#### G-03: Server-side rendering / JavaScript-oberoende content
- **Vad testas**: Att kritiskt innehåll finns i rå HTML (View Source) och inte kräver JavaScript-körning
- **Varför viktigt 2026**: GPTBot, ClaudeBot och PerplexityBot kör **inte** JavaScript; en SPA som renderar allt client-side är *osynlig* för alla AI-crawlers ([getpassionfruit.com, mar 2026](https://www.getpassionfruit.com/blog/javascript-rendering-and-ai-crawlers-can-llms-read-your-spa))
- **Implementation**: `GET /` utan JavaScript-exekvering — kontrollera att `<title>`, primär `<h1>` och minst ett par rader innehållstext finns i rå HTML-source

#### G-04: Faktisk AI-crawler-åtkomst (inte bara robots.txt)
- **Vad testas**: Att legitima AI-crawlers faktiskt får HTTP 200 (inte 403/429/503 från WAF)
- **Varför viktigt 2026**: Vanligaste problemet är att robots.txt säger Allow men WAF/Cloudflare-regler eller Fail2ban blockar AI User-Agent-strängar. ClaudeBot-blockning växte 0,5 pp per månad Q1 2026 ([TechnologyChecker.io, apr 2026](https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report))
- **Implementation**: `GET / -A "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"` och `GET / -A "GPTBot/1.0"` — verifiera HTTP 200 på båda

#### G-05: .well-known/mcp (SEP-1960 Discovery Manifest)
- **Vad testas**: Att `/.well-known/mcp` returnerar giltig JSON med `mcp_version` och `endpoints`
- **Varför viktigt 2026**: Befintlig check (nr 10) kollar om MCP-server *finns*, men inte om den är *discoverable via well-known*. Utan detta kan klienter (Claude Desktop, ChatGPT) inte auto-konfigurera. ([Ekamoira, feb 2026](https://www.ekamoira.com/blog/mcp-server-discovery-implement-well-known-mcp-json-2026-guide))
- **Implementation**: `GET /.well-known/mcp` — verifiera HTTP 200, `Content-Type: application/json`, fält `mcp_version` och `endpoints[]`

#### G-06: .well-known/mcp/server-card.json (SEP-1649)
- **Vad testas**: Att `/.well-known/mcp/server-card.json` returnerar giltig server card med `serverInfo`, `transport`, `capabilities`
- **Varför viktigt 2026**: Cloudflare checkar detta i isitagentready.com; detta är separata metadata från SEP-1960 ([GitHub SEP-1649, okt 2025](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1649))
- **Implementation**: `GET /.well-known/mcp/server-card.json` — validera JSON-schema inklusive `$schema`, `serverInfo.name`, `transport.url`, `capabilities`

---

### P1 — Viktiga gaps (implementera snart)

#### G-07: JSON-LD / schema.org strukturerad data
- **Vad testas**: Att sidorna innehåller JSON-LD med `@type` och `@context: "https://schema.org"` i `<head>`
- **Varför viktigt 2026**: Grundläggande för entity resolution i AI Overviews, ChatGPT och Perplexity; Princeton-forskning visar korrelation med 40 % fler AI-omnämnanden ([schema.org JSON-LD guide, Google](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data))
- **Implementation**: Parse HTML på startsida, extrahera `<script type="application/ld+json">`, validera att `@type` och `@context` finns

#### G-08: RFC 9727 API Catalog (`/.well-known/api-catalog`)
- **Vad testas**: Att `/.well-known/api-catalog` existerar och listar API:er med spec-länkar
- **Varför viktigt 2026**: RFC (Proposed Standard) jun 2025; Cloudflare checkar detta; ger agenter single-entry-point för API-discovery utan att läsa developer-portalen ([RFC 9727, IETF](https://datatracker.ietf.org/doc/rfc9727/))
- **Implementation**: `GET /.well-known/api-catalog` — verifiera HTTP 200, giltig JSON/Link-header

#### G-09: CORS-konfiguration för AI-agenter
- **Vad testas**: Att API:er och MCP-endpoints har korrekt `Access-Control-Allow-Origin: *` och stöder OPTIONS preflight
- **Varför viktigt 2026**: Browser-baserade MCP-klienter kan inte ansluta utan CORS; detta är ett av vanligaste produktionsfelen i MCP-implementationer ([Ekamoira, feb 2026](https://www.ekamoira.com/blog/mcp-server-discovery-implement-well-known-mcp-json-2026-guide))
- **Implementation**: `OPTIONS /.well-known/mcp/server-card.json -H "Origin: https://claude.ai"` — kontrollera att `Access-Control-Allow-Origin` finns i response

#### G-10: Rate limit-headers (RateLimit-*)
- **Vad testas**: Att API:er returnerar `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (eller `X-RateLimit-*`) på *varje* svar
- **Varför viktigt 2026**: Agenter kan inte checka dashboards — de måste läsa headers proaktivt för att undvika 429-stormar; detta är kritisk agent-first API-design ([Tianpan.co, apr 2026](https://tianpan.co/blog/2026-04-10-agent-friendly-apis-backend-design))
- **Implementation**: `GET /api/[endpoint]` — kontrollera förekomst av `RateLimit-Limit` eller `X-RateLimit-Limit` i response headers

#### G-11: HTTPS, HSTS och modern TLS
- **Vad testas**: Att sajten har giltigt TLS-cert, HSTS-header (`Strict-Transport-Security`), och inte serverar på HTTP
- **Varför viktigt 2026**: Agenter kräver säker transport; ogiltiga certs stoppar MCP-klienter; HSTS är del av Cloudflares agent-readiness-bedömning
- **Implementation**: `curl -I https://domain.com` — verifiera HTTP 200 (inte redirect-loop), förekomst av `Strict-Transport-Security: max-age=...`, TLS-certifikatets giltighet via `curl --head --max-time 10`

#### G-12: Kanoniska URL:er (`rel="canonical"`)
- **Vad testas**: Att sidorna har `<link rel="canonical" href="https://...">` i `<head>`
- **Varför viktigt 2026**: Förhindrar att agenter indexerar duplicate content; stärker signaler för crawl-budget-hantering; predicerar vilken URL som ska citeras
- **Implementation**: Parse HTML-source, extrahera `<link rel="canonical">`, verifiera att URL är absolut och HTTPS

#### G-13: Markdown-versioner av sidor (`/page.md`)
- **Vad testas**: Att viktiga sidor är tillgängliga som `.md`-URL:er (t.ex. `/about.md`) med Markdown-innehåll
- **Varför viktigt 2026**: llms.txt-specen rekommenderar detta; Mintlify genererar automatiskt `.md`-URL:er; kompletterar content negotiation för klienter som inte skickar `Accept: text/markdown` ([llmstxt.org](https://llmstxt.org))
- **Implementation**: Extrahera en länk från llms.txt, kontrollera att `.md`-versionen returnerar HTTP 200 med `text/plain` eller `text/markdown` och Markdown-innehåll

#### G-14: llms.txt-innehållsvalidering (inte bara existens)
- **Vad testas**: Att `/llms.txt` innehåller giltig struktur: exakt en H1, en blockquote, minst en H2-sektion med länklista
- **Varför viktigt 2026**: Befintlig check (nr 3) verifierar bara att filen *finns*. Tom fil = meningslös. Spec (llmstxt.org v1.1.1) kräver specifik struktur ([AI Visibility org](https://www.ai-visibility.org.uk/specifications/llms-txt/))
- **Implementation**: Hämta `/llms.txt`, parse Markdown, kontrollera: 1 st `#`-rubrik, 1 st `>` blockquote, minst 1 st `##`-sektion med minst 1 länk

#### G-15: Pay-per-crawl / HTTP 402-signaling
- **Vad testas**: Om sajten signalerar betalningskrav (Cloudflare Pay Per Crawl, x402) eller policy för kommersiell crawling
- **Varför viktigt 2026**: Cloudflare lanserade Pay Per Crawl jul 2025; HTTP 402 håller på att bli ett etablerat protocol-element för publicister; relevant för medieföretag och premium-innehåll ([Cloudflare via Slashdot, jul 2025](https://tech.slashdot.org/story/25/07/01/1745245/))
- **Implementation**: Kontrollera om `X-Payment-Required`, `x402`, eller Cloudflare Pay Per Crawl-headers förekommer; flagga som informational (ej score)

#### G-16: IETF Content-Usage direktiv i robots.txt
- **Vad testas**: Att robots.txt innehåller `Content-Usage: train-ai=n` eller liknande direktiv (draft-ietf-aipref-attach)
- **Varför viktigt 2026**: Nästa generations standardiserade AI-preferenssignalering; visar att sajten är *medveten om och hanterar* AI-data-rättigheter ([draft-ietf-aipref-attach-04](https://datatracker.ietf.org/doc/draft-ietf-aipref-attach/))
- **Implementation**: Parse robots.txt, extrahera `Content-Usage`-direktiv, validera att de har giltiga värden (`train-ai=y/n`, `ai-input=y/n`)

#### G-17: .well-known/agent-card.json (Google A2A)
- **Vad testas**: Att `/.well-known/agent-card.json` returnerar giltig A2A Agent Card
- **Varför viktigt 2026**: Google A2A protocol adopterat av 150+ organisationer; agent-card.json är discovery-mekanismen för A2A-kompatibla agenter ([Google A2A-blog, apr 2025](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/))
- **Implementation**: `GET /.well-known/agent-card.json` — verifiera HTTP 200, giltig JSON med `name`, `capabilities`, `endpoint`

#### G-18: OAuth server discovery (RFC 8414 / RFC 9728)
- **Vad testas**: Att `/.well-known/oauth-authorization-server` och/eller `/.well-known/oauth-protected-resource` returnerar giltig metadata
- **Varför viktigt 2026**: Cloudflare checkar detta i sin Capabilities-dimension; agenter som anropar OAuth-skyddade API:er *måste* kunna hitta authorization server automatiskt ([Cloudflare agent-readiness, apr 2026](https://blog.cloudflare.com/agent-readiness/))
- **Implementation**: `GET /.well-known/oauth-authorization-server` — verifiera HTTP 200, JSON med `issuer` och `authorization_endpoint`

#### G-19: RFC 8288 Link-headers för resurs-discovery
- **Vad testas**: Att HTTP-response-headers på startsidan innehåller `Link:`-headers som pekar på discovery-resurser
- **Varför viktigt 2026**: Cloudflare räknar detta under Discoverability; möjliggör att agenter hittar `api-catalog`, `llms.txt`, `mcp.json` utan att parsa HTML ([RFC 8288](https://www.rfc-editor.org/rfc/rfc8288))
- **Implementation**: `curl -I https://domain.com` — extrahera `Link:`-headers, kontrollera om de pekar på `api-catalog`, `llms.txt` eller liknande

---

### P2 — Nice-to-have (förbättringar och differentiering)

#### G-20: hreflang för flerspråkighet
- **Vad testas**: Att flerspråkiga sajter deklarerar `hreflang`-attribut i `<head>` eller sitemap
- **Varför viktigt**: Agenter som betjänar globala användare behöver förstå vilken språkversion som ska användas; viktigt för svenska sajter med engelsk content
- **Implementation**: Parse HTML `<link rel="alternate" hreflang="sv">` i head

#### G-21: RSS/Atom-feed
- **Vad testas**: Att `/feed`, `/rss.xml`, `/atom.xml`, eller liknande URL returnerar valid XML med RSS/Atom-schema
- **Varför viktigt**: Feeds är ett etablerat, standardiserat sätt för agenter och LLM-pipeline att prenumerera på innehållsuppdateringar; AI-verktyg som Feedly Leo och NewsBlur använder RSS som primär input
- **Implementation**: `GET /feed` och `GET /rss.xml` — verifiera HTTP 200, `Content-Type: application/rss+xml` eller `application/atom+xml`, giltig XML

#### G-22: Pagination-mönster för crawlers
- **Vad testas**: Att paginerade listor använder `rel="next"` / `rel="prev"` Link-headers eller liknande
- **Varför viktigt**: Agenter som ska läsa igenom allt innehåll behöver förstå pagination utan att gissa URL-mönster
- **Implementation**: `GET /blog` eller `/articles` — extrahera `rel="next"` i HTML `<head>` eller HTTP Link-header

#### G-23: Content-Type och language-deklaration
- **Vad testas**: Att HTML-sidor har `<html lang="sv">` och `Content-Language`-header, och att `Content-Type: text/html; charset=utf-8` är korrekt satt
- **Varför viktigt**: Agenter som väljer vilken källa att citera föredrar korrekt språk-deklarerade sidor; charset-fel kan bryta Markdown-parsing
- **Implementation**: Parse `<html lang>` och `Content-Language` response-header, verifiera att charset är utf-8

#### G-24: Time-to-first-byte och total latency
- **Vad testas**: TTFB < 500 ms och total response < 2 s
- **Varför viktigt**: Agenter som jobbar i tight loops (t.ex. ReAct-loops) är känsliga för latency; sajter med hög latency deprioriteras
- **Implementation**: Mät TTFB med `curl -w "%{time_starttransfer}"` och total tid

#### G-25: Open Graph och oEmbed
- **Vad testas**: Att sidor har `og:title`, `og:description`, `og:url`; att sajten exponerar `oEmbed`-endpoint via `<link type="application/json+oembed">`
- **Varför viktigt**: Open Graph används av AI-agenter som behöver snabb metadata utan full HTML-parsing; oEmbed möjliggör rik förhandsvisning
- **Implementation**: Parse HTML head för `<meta property="og:title">` och `<link type="application/json+oembed">`

#### G-26: .well-known/agent-skills/index.json
- **Vad testas**: Att `/.well-known/agent-skills/index.json` returnerar lista av agent-kompetenser
- **Varför viktigt 2026**: Cloudflare-förslag jan 2026; möjliggör att agenter vet *vilka uppgifter* de kan utföra utan att behöva läsa all dokumentation ([Cloudflare agent-skills-discovery-rfc](https://github.com/cloudflare/agent-skills-discovery-rfc))
- **Implementation**: `GET /.well-known/agent-skills/index.json` — verifiera HTTP 200, JSON med skills-array

#### G-27: Web Bot Auth-support (`/.well-known/http-message-signatures-directory`)
- **Vad testas**: Att sajten accepterar och validerar kryptografiskt signerade bot-requests (Web Bot Auth IETF draft)
- **Varför viktigt 2026**: AWS WAF stöder detta sedan nov 2025; förhindrar WAF-blockning av *verifierade* AI-crawlers; Cloudflare checkar detta
- **Implementation**: Kontrollera om `/.well-known/http-message-signatures-directory` returnerar giltigt JSON med publik nyckel-directory

#### G-28: ai.txt / Spawning Do-Not-Train
- **Vad testas**: Att `/ai.txt` returnerar giltig fil med opt-in/opt-out-direktiv
- **Varför viktigt**: Komplement till robots.txt för content-ownership-deklaration; adopterat av HuggingFace och Stability
- **Implementation**: `GET /ai.txt` — verifiera HTTP 200, innehållsvalidering

#### G-29: AGENTS.md
- **Vad testas**: Att `/AGENTS.md` exponeras med instruktioner för AI-agenter (OpenAI-konvention)
- **Varför viktigt 2026**: OpenAI refererar till AGENTS.md-spec i sin 2025 år-slut-sammanfattning; komplement till llms.txt för agentspecifika instruktioner
- **Implementation**: `GET /AGENTS.md` — verifiera HTTP 200, Markdown-innehåll

#### G-30: Sitemap-innehållsvalidering (inte bara existens)
- **Vad testas**: Att `sitemap.xml` är syntaktiskt giltig XML, innehåller HTTPS-URL:er, och har `<lastmod>` på minst några sidor
- **Varför viktigt**: Befintlig check (nr 2) verifierar existens. En sitemap med HTTP-URL:er eller ogiltiga datum hjälper inte agenter. ([Google Search Central](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls))
- **Implementation**: Hämta sitemap.xml, parse XML, kontrollera att URL:er är HTTPS och att filen är giltig

---

## 2.7 Föreslagen viktning

Nedan ett förslag på hur scoringen kan struktureras utifrån **must-have / should-have / nice-to-have** och Cloudflares fyra dimensioner:

### Scoringsmodell

| Kategori | Vikt | Rationale |
|----------|------|-----------|
| **Discoverability** | 20 % | Grundkrav; om agenter inte kan hitta sajten är resten irrelevant |
| **Content Accessibility** | 30 % | Viktigaste differentieringsfaktorn 2026; 80 % tokenreduktion med Markdown |
| **Bot Access Control** | 20 % | Signalerar intention; robots.txt + WAF-konsistens |
| **Protocol Capabilities** | 30 % | Framåtblickande; MCP, A2A, API Catalog = agentens arbetsyta |

### Must-have (P0, Tier 1)

Alla 11 befintliga plus:

| Check | Dimension |
|-------|-----------|
| llms-full.txt existerar och är giltig | Content |
| Markdown content negotiation fungerar | Content |
| SSR / JS-oberoende content | Content |
| Faktisk AI-crawler-åtkomst (200 på ClaudeBot) | Bot Access |
| `.well-known/mcp` discovery manifest | Capabilities |
| `.well-known/mcp/server-card.json` | Capabilities |

### Should-have (P1, Tier 2)

| Check | Dimension |
|-------|-----------|
| JSON-LD schema.org | Content |
| RFC 9727 API Catalog | Capabilities |
| CORS på API/MCP-endpoints | Capabilities |
| Rate limit-headers | Protocol |
| HTTPS + HSTS | Security |
| Kanoniska URL:er | Discoverability |
| Markdown-versioner (`.md`) | Content |
| llms.txt innehållsvalidering | Content |
| IETF Content-Usage i robots.txt | Bot Access |
| OAuth server discovery | Capabilities |
| RFC 8288 Link-headers | Discoverability |

### Nice-to-have (P2, Tier 3)

| Check | Dimension |
|-------|-----------|
| hreflang | Discoverability |
| RSS/Atom-feed | Content |
| Pagination rel=next/prev | Discoverability |
| Content-Type/language | Content |
| TTFB/latency | Performance |
| Open Graph + oEmbed | Content |
| Agent Skills index.json | Capabilities |
| Web Bot Auth | Bot Access |
| ai.txt | Bot Access |
| AGENTS.md | Content |
| Google A2A agent-card.json | Capabilities |
| Pay-per-crawl signaling | Commerce |
| Sitemap-innehållsvalidering | Discoverability |

---

## 2.8 Källor

| Källa | URL | Datum |
|-------|-----|-------|
| Cloudflare — Agent Readiness score | https://blog.cloudflare.com/agent-readiness/ | Apr 2026 |
| Cloudflare — isitagentready.com | https://isitagentready.com | Apr 2026 |
| Cloudflare — Agent Readiness, softprom.com summary | https://softprom.com/cloudflare-agent-readiness-score-is-your-site-ai-ready-in-2026 | Apr 2026 |
| Cloudflare — Pay Per Crawl (Slashdot) | https://tech.slashdot.org/story/25/07/01/1745245/ | Jul 2025 |
| Cloudflare — Web Bot Auth docs | https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/ | Apr 2026 |
| Cloudflare — Agent Skills RFC | https://github.com/cloudflare/agent-skills-discovery-rfc | Jan 2026 |
| Anthropic — MCP announcement | https://www.anthropic.com/news/model-context-protocol | Nov 2024 |
| MCP Wikipedia | https://en.wikipedia.org/wiki/Model_Context_Protocol | Apr 2025 |
| MCP well-known discussion (GitHub) | https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1147 | Dec 2024 |
| SEP-1649 MCP Server Cards | https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1649 | Okt 2025 |
| Ekamoira — MCP discovery guide 2026 | https://www.ekamoira.com/blog/mcp-server-discovery-implement-well-known-mcp-json-2026-guide | Feb 2026 |
| OpenAI — Developers 2025 recap | https://developers.openai.com/blog/openai-for-developers-2025 | Dec 2025 |
| Google — A2A Protocol announcement | https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/ | Apr 2025 |
| Stellagent — A2A protocol explained | https://stellagent.ai/insights/a2a-protocol-google-agent-to-agent | Apr 2026 |
| Vercel — Content negotiation blog | https://vercel.com/blog/making-agent-friendly-pages-with-content-negotiation | Feb 2026 |
| Vercel — AI SDK 6 | https://vercel.com/blog/ai-sdk-6 | Dec 2025 |
| Mintlify — Value of llms.txt | https://www.mintlify.com/blog/the-value-of-llms-txt-hype-or-real | Maj 2025 |
| Mintlify — What is llms.txt | https://www.mintlify.com/blog/what-is-llms-txt | Apr 2025 |
| llmstxt.org (officiell spec) | https://llmstxt.org | Sep 2024 |
| AI Visibility org — llms.txt spec v1.1.1 | https://www.ai-visibility.org.uk/specifications/llms-txt/ | Jan 2026 |
| Checkly — State of content negotiation | https://www.checklyhq.com/blog/state-of-ai-agent-content-negotation/ | Feb 2026 |
| IETF AIPREF WG charter | https://datatracker.ietf.org/doc/charter-ietf-aipref/ | Apr 2025 |
| IETF — draft-ietf-aipref-attach-04 | https://datatracker.ietf.org/doc/draft-ietf-aipref-attach/ | Okt 2025 |
| IETF — RFC 9727 api-catalog | https://datatracker.ietf.org/doc/rfc9727/ | Jun 2025 |
| IETF — AIPREF blog | https://www.ietf.org/blog/aipref-wg/ | 2025 |
| TechnologyChecker.io — robots.txt AI crawlers Q1 2026 | https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report | Apr 2026 |
| Momentic — AI User Agents 2025 | https://momenticmarketing.com/blog/ai-search-crawlers-bots | Feb 2025 |
| AWS WAF — Web Bot Auth support | https://aws.amazon.com/about-aws/whats-new/2025/11/aws-waf-web-bot-auth-support/ | Nov 2025 |
| getpassionfruit.com — SPA AI crawlers | https://www.getpassionfruit.com/blog/javascript-rendering-and-ai-crawlers-can-llms-read-your-spa | Mar 2026 |
| Hall.com — ChatGPT AI crawlers JS | https://usehall.com/guides/chatgpt-ai-crawlers-javascript-rendering | Jun 2025 |
| C2PA / Privacy Guides — Content Credentials | https://www.privacyguides.org/articles/2025/05/19/digital-provenance/ | Maj 2025 |
| DoD / NCSC — C2PA whitepaper | https://media.defense.gov/2025/Jan/29/2003634788/-1/-1/0/CSI-CONTENT-CREDENTIALS.PDF | Jan 2025 |
| Reddit r/mcp — AI agent readiness scan | https://www.reddit.com/r/mcp/comments/1s8t6t2/ | Apr 2026 |
| Nordic APIs — RFC 9727 | https://nordicapis.com/exploring-api-catalog-a-new-api-discovery-standard/ | Sep 2025 |
| Google — Structured data intro | https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data | 2024 |
| Tianpan.co — Agent-friendly APIs | https://tianpan.co/blog/2026-04-10-agent-friendly-apis-backend-design | Apr 2026 |

---

*Rapport sammanställd maj 2026 för agent.opensverige.se. Standarder är i snabb förändring — kontrollera IETF Datatracker och modelcontextprotocol.io för senaste RFC-status.*
