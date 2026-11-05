# 01 · Intern utvärdering av agent.opensverige.se

Datum: 2026-11-05. Källa: produktionsdatabasen (Supabase `agent-opensverige`), repot, och koden som den ser ut på `main` (`bc17d05`).

Syftet med den här filen är att vara ärlig om var produkten står, innan vi pratar om marknaden. Inga antaganden, bara det vi kan mäta.

## 1. Användning: det finns ingen

Retention-jobbet raderar scans äldre än 90 dagar, så tabellen visar exakt de senaste 90 dagarna.

| Mått (8 aug – 5 nov 2026) | Värde |
|---|---|
| Scans totalt | **39** |
| Unika domäner | 28 |
| Scans per vecka (snitt) | ~3 |
| Scans via publika API:t | **0** |
| Utfärdade API-nycklar | 2 |
| "Vill ha djupscan"-förfrågningar | **0** |
| Rader i `api_scores` | 0 |
| Fångade e-postadresser | 0 (det finns ingen fungerande capture, se nedan) |

Vilka scannar? Små svenska sajter och builders som testar sina egna projekt: en målerifirma, en lounge, några AI-startups, ett par myndigheter och SAS. Sju av 39 scans är samma domän (`afekenst.am`) som scannas om och om igen, alltså en builder som itererar på sin egen sajt. Det är den enda tydliga användningssignalen vi har, och den kommer från någon som redan kan det här.

Jämförelse: syskonprojektet med cookiefri sidräkning i samma databas (`infra_pageviews`) har haft 80–400 sidvisningar i veckan senaste tio veckorna, mest från Sverige. Scannern har tre scans i veckan.

## 2. Som leadmagnet fångar den noll leads

En leadmagnet måste göra två saker: dra in rätt person och fånga kontaktuppgifter. Scannern gör ingen av dem.

- Enda CTA:n på resultatsidan är "gå med i Discord". `booking-cta.ts` väljer rubrik efter poäng, men knappen går alltid till Discord.
- `app/api/notify/route.ts` skriver till tabellen `notify_signups`, som **inte finns** i databasen. Endpointen anropas inte heller från något UI. Den svarar alltid `ok: true`, så ingen har märkt det.
- Det finns ingen bokningslänk, inget e-postfält, ingen rapport att få mejlad, ingen uppföljning.

Även om trafiken tiodubblades skulle vi inte få en enda kontakt.

## 3. Det vi mäter är fel saker för den som borde bry sig

Andel av de 27 senast scannade domänerna som klarar varje check (N/A exkluderat):

| Check | Klarar | Kommentar |
|---|---|---|
| `mcp_well_known` | 1 av 27 | Irrelevant för 99 % av svenska företag |
| `mcp_server_card` | 2 av 27 | Samma |
| `mcp_server` | 3 av 27 | Samma |
| `sandbox_available` | 1 av 5 | N/A för 22 av 27 |
| `markdown_negotiation` | 5 av 27 | Ingen stor AI-aktör har sagt att de använder det |
| `ai_content_marking` | 1 av 15 | Art. 50 kräver inte detta av vanliga sajter (se 03) |
| `llms_txt` | 17 av 27 | Urvalsfel: de som scannar är AI-builders. Topp-500: 3,2 % |

En målerifirma i Göteborg som scannar sin sajt får "rött" för att den saknar MCP server-card, OpenAPI-spec och sandbox. Det är inte ett problem hon har. Det är ett problem vi har hittat på åt henne.

### Metodfel som måste fixas oavsett vad vi beslutar

`lib/scan/robots.ts` räknar sajten som blockerande om den stänger ute `gptbot`, `claudebot`, `anthropic-ai`, `ccbot`, `google-extended` eller `omgilibot`. Det är **träningsbottar**. Att blockera dem påverkar inte om du syns när någon frågar ChatGPT, Claude eller Perplexity, det styrs av söknings- och användarbottarna (`OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`). `checkCrawlerAccess` testar ClaudeBot och GPTBot, alltså också träningsbottar.

Konsekvens: vi ger DN och Expressen underkänt för ett legitimt affärsval (att inte låta sitt innehåll tränas på), och vi missar sajter som av misstag blockerar de bottar som faktiskt skickar kunder. Det är det enda vi borde vara bäst på, och vi mäter det fel.

## 4. Vi har byggt för en skala som aldrig kom

| Byggt | Används |
|---|---|
| Publikt REST-API med Bearer-auth, rate limits, ETag, OpenAPI 3.1, Scalar-docs | 0 anrop |
| API-score med 9 axlar (`lib/api-score/`, 14 filer) | 0 rader i `api_scores` |
| DSAR-endpoint med state machine | 0 förfrågningar |
| Sanktionsscreening via OpenSanctions för B2B-onboarding | 0 betalkunder |
| FSL-licens, CLA, COMMERCIAL.md med licenspriser | 0 förfrågningar |
| Juridiska sidor: terms, AUP, AI-disclosure, subprocessors, integritetspolicy | Bra hygien, men ingen trafik att skydda |
| 217 KB research, 6 dokument, 8-personas-review av Q1-rapporten | En rapport som publicerats en gång |

Ungefär 15 800 rader TypeScript. 52 commits sedan april, varav de flesta på tre dagar i slutet av april. Sista funktionella commit 15 juli.

Det här är inte en kritik av kvaliteten. Koden är prydlig och mycket av det juridiska är genomtänkt. Det är en kritik av ordningen: vi byggde infrastrukturen för en betald API-produkt innan någon hade bett om att få betala.

## 5. Vad som faktiskt har värde och går att återanvända

- **Probe-motorn** (`lib/scan/probe.ts`, `fetch.ts`, `robots.ts`): snabba parallella HTTP-probes, SSR-check, crawler-UA-tester. Bra grund för vilken scanner som helst.
- **Q1-rapporten om Sveriges 500 största sajter.** Det är det enda vi gjort som har en nyhetsvinkel ("Skatteverket har ingen AI-vägledning"). Rapporter blir citerade, scanners blir inte det.
- **Resultatsidans design och delningsflöde** (`/r/[scanId]`, sticky share). Fungerar.
- **Domänen och varumärket OpenSverige** och Discord-communityn på 300+ builders.
- **Rate limiting, IP-hashing, retention**: färdig GDPR-hygien som en ny produkt kan ärva direkt.

## 6. Delslutsats

Scannern i nuvarande form är en lösning som letar efter ett problem. Den mäter tekniska signaler som nästan ingen svensk beslutsfattare bryr sig om, den har ingen användning att tala om, och den fångar inga leads även när någon använder den. Att förbättra checkarna ändrar inget av det. Frågan är inte "hur gör vi scannern bättre", utan "finns det en scanning-vinkel där någon i Sverige faktiskt känner smärta idag". Det besvaras i 02 och 03.
