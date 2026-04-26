# agent.opensverige

Sveriges öppna AI-readiness scanner. Visar hur väl en webbplats är förberedd för AI-agenter — robots.txt, llms.txt, OpenAPI, MCP, GDPR, EU AI Act.

Live: [agent.opensverige.se](https://agent.opensverige.se)

## Vad är det?

Ett verktyg som scannar svenska företags webbplatser och returnerar en _agent-readiness score_ — hur väl AI-agenter (Claude, ChatGPT, Cursor, Perplexity) kan förstå, navigera och integrera med sajten. Resultaten är gratis, öppna och länkbara.

Bakgrunden: Cloudflares [isitagentready.com](https://isitagentready.com) gör samma sak globalt, men saknar EU-fokus och GDPR/EU AI Act-checks. Vi bygger den nordiska varianten — öppen källkod, EU-jurisdiktion, fokus på svenska kontextkrav.

## Snabbstart

```bash
git clone https://github.com/opensverige/agent-scan
cd agent-scan
npm install
cp .env.example .env.local
# Fyll i ANTHROPIC_API_KEY (krävs för AI-summary)
# Övriga nycklar är optional men förbättrar resultat
npm run dev
```

Öppna [http://localhost:3006/scan](http://localhost:3006/scan).

## Stack

- **Next.js 15** (app router) + TypeScript strict
- **Tailwind CSS 3** + shadcn/ui (Radix primitives)
- **Supabase Postgres** för scan-historik + rate limiting
- **Anthropic Claude** för AI-sammanfattning + dev-portal-extraktion
- **Firecrawl** för rendering av JS-tunga sajter
- **Exa** för semantisk dev-portal-discovery
- **Vercel** hosting + edge

Se [docs/strategy/PLAN.md](docs/strategy/PLAN.md) för full arkitektur och roadmap.

## Vad scannas?

11 checks i tre kategorier (utökas till 17 i kommande version per [docs/strategy/research/02-agent-readiness-scoring-2026.md](docs/strategy/research/02-agent-readiness-scoring-2026.md)):

**Discovery** — kan agenter hitta sajten?
- robots.txt tillåter AI-crawlers
- sitemap.xml finns
- llms.txt finns

**Compliance** — uppfyller sajten EU-krav?
- GDPR Art. 22 (automatiserat beslutsfattande) i privacy policy
- Cookiehantering för icke-mänskliga klienter
- EU AI Act Art. 50 maskinläsbar AI-märkning

**Builder** — kan utvecklare bygga mot sajten?
- Publikt API
- OpenAPI-spec
- API-dokumentation
- MCP-server
- Sandbox/testmiljö

Läs [docs/strategy/research/02-agent-readiness-scoring-2026.md](docs/strategy/research/02-agent-readiness-scoring-2026.md) för fördjupning + planerade tillägg (G-01 till G-30).

## API

REST API är på väg (Stage 2 i [PLAN.md](docs/strategy/PLAN.md)). Just nu kan du anropa scan-endpointet direkt:

```bash
curl -X POST https://agent.opensverige.se/api/scan \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'
```

Per EU AI Act Art. 50 (gäller från 2 augusti 2026) returneras `ai_disclosure`-fältet med info om vilka delar av svaret som är AI-genererade och vilken modell som användes.

## Bidra

Issues och PRs välkomnas. Vi tar gärna PRs på:
- Nya checks (se [docs/strategy/research/02-agent-readiness-scoring-2026.md](docs/strategy/research/02-agent-readiness-scoring-2026.md) för prioriterad lista)
- i18n (engelska + nordiska språk)
- Bugfixes och perf-förbättringar
- Dokumentation

För större förändringar — öppna ett issue först så vi kan diskutera approach.

## Community

300+ builders i [Discord](https://discord.gg/CSphbTk8En). Stockholm, Göteborg, Malmö.

## Licens

MIT — se [LICENSE](LICENSE).

Vi använder MIT istället för GPL för att maximera adoption. Om du forkar och hostar din egen version — det är okej. Vill du bidra tillbaka — ännu bättre.

## Säkerhet

Rapportera säkerhetsproblem till `info@opensverige.se`. Se [security.txt](public/.well-known/security.txt) (RFC 9116) för detaljer.

## Privacy

Se [agent.opensverige.se/integritetspolicy](https://agent.opensverige.se/integritetspolicy) och [agent.opensverige.se/legal/subprocessors](https://agent.opensverige.se/legal/subprocessors).
