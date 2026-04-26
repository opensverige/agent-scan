# Scanner Methodology

**Hur agent.opensverige.se mäter en sajts AI-agent-readiness.** Senast uppdaterad 26 april 2026.

> Detta dokument finns för transparens. Om vi sätter en röd badge på din domän har du rätt enligt GDPR Art. 22 att förstå exakt varför. Här är varför.

---

## Översikt

Scannern kör 17 individuella HTTP-checks mot din domän, fördelade på tre kategorier. Varje check ger ett pass/fail-resultat med en severity-nivå. Den sammanlagda andelen godkända checks bestämmer en av tre badges: **röd**, **gul** eller **grön**.

| Kategori | Antal checks | Vad mäts |
|---|---|---|
| **Discovery** | 7 | Kan AI-agenter hitta och läsa sajten? |
| **Compliance** | 3 | Uppfyller sajten EU-regelverk för AI och data? |
| **Builder** | 7 | Kan utvecklare och agenter bygga mot sajten? |

Källor och vägledande forskning finns i [docs/strategy/research/02-agent-readiness-scoring-2026.md](strategy/research/02-agent-readiness-scoring-2026.md).

---

## Badge-logik

```
score = antal pass-checks (exkluderar N/A och recommendation-only)
total = antal scorade checks (samma exkludering)
pct   = score / total

green:  pct ≥ 8/11 (≈ 73 %)
yellow: pct ≥ 4/11 (≈ 36 %)
red:    pct < 4/11
```

Tröskelvärdena är proportionella, så de fungerar oavsett om en sajt har 11 eller 17 scorade checks. Vi flyttade från fasta tröskelvärden till proportionella i Stage 1 (april 2026) just för att stödja utbyggnaden från 11 till 17 checks utan att invalidera historiska scans.

**Vad räknas inte?**
- **N/A-checks** — t.ex. sandbox-checken markeras N/A om sajten inte har ett API alls (sandbox är meningslöst utan API). Räknas inte i nämnaren.
- **Recommendation-only-checks** — mjuka förslag (t.ex. MCP-server-rekommendation om OpenAPI redan finns). Räknas inte i nämnaren.

**Rätten att invända.** Om du tycker att en check är felaktig på din domän, maila info@opensverige.se. Vi granskar manuellt och uppdaterar antingen vår heuristik eller markerar din domäns specifika resultat.

---

## Discovery-checks (7)

### `robots_ok` — Tillåter robots.txt AI-agenter?
- **Vad mäts:** robots.txt parsas. Om en `User-agent: *`- eller specifik AI-bot-grupp har `Disallow: /` flaggas det som blockering.
- **Severity:** important
- **Pass:** Ingen blockerande Disallow-regel för AI-agenter eller wildcard.
- **Fail:** robots.txt blockerar AI-agenter explicit.

### `crawler_access` (G-04) — Når AI-crawlers faktiskt sajten?
- **Vad mäts:** Vi gör tre HTTP-anrop till sajtroten med User-Agents: `ClaudeBot`, `GPTBot`, `PerplexityBot`. Verifierar att alla tre får 200 (inte 403/429 från WAF).
- **Severity:** critical
- **Varför:** Vanligaste produktionsfelet 2026 är att robots.txt säger Allow men Cloudflare/Akamai/Fastly-regel blockerar AI User-Agent på edge.
- **Källa:** [TechnologyChecker.io, Q1 2026](https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report)

### `sitemap_exists` — Finns en sitemap?
- **Vad mäts:** GET mot `/sitemap.xml`, `/sitemap_index.xml`, `/wp-sitemap.xml`, `/sitemap.php` plus eventuell sitemap-URL deklarerad i robots.txt.
- **Severity:** info
- **Pass:** Minst en av paths returnerar HTTP 200.

### `llms_txt` — Finns llms.txt?
- **Vad mäts:** GET mot `/llms.txt` och `/.well-known/llms.txt`. Innehållet valideras — får inte vara HTML (vanlig falskpositiv från CMS-catch-alls).
- **Severity:** important
- **Pass:** Minst en path returnerar 200 + text/plain eller text/markdown med innehåll som börjar med `#` eller `>`.

### `llms_full_txt` (G-01) — Finns llms-full.txt?
- **Vad mäts:** GET mot `/llms-full.txt`. Validerar 200 + non-HTML + minst 1 KB innehåll + minst en H1 (`# `).
- **Severity:** important
- **Varför:** llms-full.txt besöks dubbelt så ofta som llms.txt när båda finns. Det är komplementet — komplett Markdown-konkatenering av sajten i en URL.
- **Källa:** [Mintlify, maj 2025](https://www.mintlify.com/blog/the-value-of-llms-txt-hype-or-real)

### `markdown_negotiation` (G-02) — Finns Markdown content negotiation?
- **Vad mäts:** GET mot sajtroten med `Accept: text/markdown`-header. Verifierar att svaret har `Content-Type: text/markdown` (inte text/html).
- **Severity:** important
- **Varför:** Cloudflare mätte upp till 80 % token-reduktion. Vercel såg 500 KB → 2 KB. Claude Code, Cursor och OpenCode skickar `Accept: text/markdown` per default 2026.
- **Källa:** [Checkly, februari 2026](https://www.checklyhq.com/blog/state-of-ai-agent-content-negotation/)

### `ssr_content` (G-03) — Renderas innehåll server-side?
- **Vad mäts:** GET mot sajtroten utan JavaScript-exekvering. Verifierar att rå HTML innehåller `<title>`, `<h1>` och minst 200 tecken textinnehåll i `<p>`/`<main>`/`<article>`/`<section>`.
- **Severity:** critical
- **Varför:** GPTBot, ClaudeBot och PerplexityBot kör inte JavaScript. En SPA som renderar allt client-side är osynlig för alla AI-crawlers.
- **Källa:** [getpassionfruit.com, mars 2026](https://www.getpassionfruit.com/blog/javascript-rendering-and-ai-crawlers-can-llms-read-your-spa)

---

## Compliance-checks (3)

### `privacy_automation` — Nämner integritetspolicyn automatiserat beslutsfattande?
- **Vad mäts:** Heuristisk textanalys av publik integritetspolicy (vi probar `/integritetspolicy`, `/privacy`, `/privacy-policy`, `/gdpr`). Söker efter signaler kopplade till GDPR Art. 22 (automatiserad behandling, profilering).
- **Severity:** critical
- **Pass:** Hittade explicita signaler om automatiserad behandling.
- **Fail:** Policy hittades men nämner inte automatiserat beslutsfattande.
- **N/A:** Ingen publik policy-sida hittades — kan inte bedömas.

### `cookie_bot_handling` — Adresserar cookielösningen icke-mänskliga klienter?
- **Vad mäts:** Heuristisk textanalys av cookie-/integritetspolicy. Söker efter signaler om bot-, crawler-, user-agent- eller maskinklienthantering.
- **Severity:** important
- **Pass:** Policyn nämner explicit hur icke-mänskliga klienter hanteras.

### `ai_content_marking` — Märks AI-genererat innehåll?
- **Vad mäts:** Heuristisk textanalys av publika policy-sidor. Söker efter signaler om AI-märkning, watermarks, syntetiskt innehåll eller direkt referens till EU AI Act Art. 50.
- **Severity:** important
- **Varför:** EU AI Act Art. 50 träder i kraft 2 augusti 2026. Krav på maskinläsbar märkning av AI-genererat innehåll. Böter upp till 15 M EUR / 3 % av global omsättning.
- **Källa:** [EUR-Lex CELEX:32024R1689](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689)

---

## Builder-checks (7)

### `api_exists` — Finns ett publikt API?
- **Vad mäts:** Probar 30+ vanliga API-sökvägar (`/api`, `/api/v1`, etc.) plus subdomäner (`api.*`, `developer.*`).
- **Severity:** critical
- **Pass:** Minst en path returnerar 200, 429 eller 401/403 med `application/json`.

### `openapi_spec` — Finns en OpenAPI-spec?
- **Vad mäts:** Probar både statiska spec-paths (`/openapi.json`, `/swagger.json`, etc.) och Redoc/Swagger UI-pages som inbäddar specet via `__redoc_state`-JS-variabel.
- **Severity:** important
- **Pass:** Spec hittas — antingen som direkt fil eller extraherad ur Redoc-state.

### `api_docs` — Finns API-dokumentation?
- **Vad mäts:** Probar dokumentations-paths (`/docs`, `/developer`, `/reference`) plus subdomäner. Verifierar text/html med relevanta nyckelord.
- **Severity:** info

### `mcp_server` — Finns en aktiv MCP-server?
- **Vad mäts:** Probar `/.well-known/mcp.json` och `/mcp.json`. Verifierar JSON-svar med MCP-relaterade fält (`mcpVersion`, `tools`).
- **Severity:** important (men *recommendation* om OpenAPI redan finns — se nedan).
- **Special:** Om sajten har OpenAPI eller API-docs degraderas MCP-checken till en rekommendation snarare än ett scorat blockerande krav. REST + OpenAPI är agent-redo utan MCP.

### `mcp_well_known` (G-05) — Finns /.well-known/mcp manifest?
- **Vad mäts:** GET mot `/.well-known/mcp`. Validerar JSON med `mcp_version` (string) + `endpoints` (array).
- **Severity:** info, recommendation-only
- **Varför:** SEP-1960 discovery manifest. Låter MCP-klienter (Claude Desktop, ChatGPT, Cursor) auto-konfigurera när de bara har domänen.
- **Källa:** [Ekamoira guide, februari 2026](https://www.ekamoira.com/blog/mcp-server-discovery-implement-well-known-mcp-json-2026-guide)

### `mcp_server_card` (G-06) — Finns MCP server-card?
- **Vad mäts:** GET mot `/.well-known/mcp/server-card.json`. Validerar JSON med `serverInfo.name` + `transport.type`.
- **Severity:** info, recommendation-only
- **Källa:** [SEP-1649 draft](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1649)

### `sandbox_available` — Finns sandbox/testmiljö?
- **Vad mäts:** Söker efter sandbox/test-environment-relaterade nyckelord i developer-portal-innehåll. Om Firecrawl-render finns används den.
- **Severity:** info
- **Special:** Om API:et tillåter publik åtkomst utan auth och inga betal-/prissignaler hittas markeras checken som N/A — sandbox är meningslöst när builders kan testa direkt mot produktionsproduktion.

---

## Begränsningar och försiktighetsåtgärder

### Vad scannern *inte* gör

- **Vi kör inte JavaScript.** Det är medvetet — AI-crawlers gör inte heller det. Men det innebär att SPA-baserade sajter kan se "tomma" ut även om innehåll laddas dynamiskt.
- **Vi läser bara publika ytor.** Saker bakom inloggning eller paywall är osynliga för oss. Om er sandbox finns men kräver registrering markeras den ofta som "saknas" eller "nämns i docs".
- **Vi gör inga djupa innehållsanalyser.** Compliance-checks är heuristiska textsökningar, inte juridiska bedömningar. Resultaten är tekniska observationer, inte juridisk rådgivning.
- **Vi sparar inte sidors innehåll.** Endast resultat (pass/fail per check) lagras. Råinnehåll visas i resultatet men persisteras inte.

### Möjliga falska positiva

- **WAF-blockering vid scan-tid.** Om er WAF tillfälligt blockerar vår scanner-IP visar checks felaktigt "fail". Vi kör scanner-UA `OpenSverige-Scanner/1.0 (https://opensverige.se/scan)` — whitelista vid behov.
- **CDN-cacheade fel.** Om ett spec-endpoint returnerar 404 från CDN-cache trots att origin har det, missar vi det.
- **Heuristik på compliance.** Om er policy-text använder ovanlig terminologi missar vår textmatch den. Påverkar bara compliance-kategorin (3 checks).

### Hur ofta uppdateras checks?

Vi kör en scan varje gång du klickar **Scanna**. Inga cachade resultat på det resultatpagen — den senaste scan visas alltid (queriad latest-by-timestamp). Resultaten lagras enligt 90-dagars retention (se [/integritetspolicy](https://agent.opensverige.se/integritetspolicy)).

---

## Bidra och ifrågasätt

Om du tycker att en check är felaktigt designad eller saknas — öppna ett issue på [GitHub](https://github.com/opensverige/agent-scan/issues) eller kom till vår [Discord](https://discord.gg/CSphbTk8En).

Förslag på nya checks följer prioriteringen i [research/02-agent-readiness-scoring-2026.md § 2.6](strategy/research/02-agent-readiness-scoring-2026.md). P1-checks (G-07 till G-19) ligger på roadmap för Stage 5.

---

## Källor

Hela metodologin baseras på publicerad forskning från april–maj 2026, samlad i [docs/strategy/research/](strategy/research/). Primärkällor:

- [Cloudflare Agent Readiness blog (apr 2026)](https://blog.cloudflare.com/agent-readiness/)
- [Mintlify, value of llms.txt (maj 2025)](https://www.mintlify.com/blog/the-value-of-llms-txt-hype-or-real)
- [Checkly, content negotiation state (feb 2026)](https://www.checklyhq.com/blog/state-of-ai-agent-content-negotation/)
- [TechnologyChecker.io, robots.txt AI crawlers Q1 2026](https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report)
- [Ekamoira, MCP discovery guide (feb 2026)](https://www.ekamoira.com/blog/mcp-server-discovery-implement-well-known-mcp-json-2026-guide)
- [SEP-1649 (MCP server cards)](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1649)
- [EU AI Act, Regulation 2024/1689](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689)
- [GDPR Art. 22 — automated decision-making](https://gdpr-text.com/read/article-22/)
