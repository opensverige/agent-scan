# Beslut · agent.opensverige.se, 5 november 2026

> Skrivet under natten 4–5 november på uppdrag av Gustaf: "Evala brutalt, ta reda på om en agent-scanner ens är värd att bygga i Sverige idag, och lägg fram en pivot eller döda idén." Underlag: produktionsdatan, koden, och fem research-spår. Allt är länkat längst ner.

## Kort svar

**Nej, en agent-readiness-scanner är inte värd att bygga i Sverige idag.** Inte som produkt och inte som leadmagnet. Lägg ner den vinkeln.

**Gör istället ett billigt, tidsbegränsat test av "AI-synlighet":** "Rekommenderar AI ditt företag?" Sidan är byggd i natt (`/synlighet`). Ge den 14 dagar med riktig distribution och hårda stoppkriterier. Når den inte kriterierna, lägg ner hela agent.opensverige.se och lägg tiden någon annanstans.

Det här är inte en pivot för att den nya idén är briljant. Gratisverktyg för AI-synlighet finns redan från Ahrefs, Semrush och HubSpot. Det är en pivot för att den nya idén svarar på en fråga som svenska företagare faktiskt ställer, den är redan byggd, och ett 14-dagarstest kostar nästan ingenting jämfört med att fortsätta gissa.

## 1. Varför agent-scannern ska läggas ner

### Ingen använder den
- **39 scans på 90 dagar**, ~3 i veckan, 28 unika domäner. Sju av dem är samma builder som scannar sin egen sajt om och om igen.
- **0 API-anrop.** 2 utfärdade nycklar. **0** rader i `api_scores`. **0** djupscan-förfrågningar.
- Syskonprojektet med cookiefri sidräkning i samma databas har 80–400 sidvisningar i veckan. Det går alltså att få trafik från samma community. Scannern får det inte.
- Detaljer: [01-intern-utvardering.md](01-intern-utvardering.md).

### Den kan inte generera leads ens om trafiken kom
- Enda CTA:n är "gå med i Discord".
- `/api/notify` skriver till en tabell som inte finns och anropas inte från något UI. Den svarar alltid "ok".
- Ingen e-post, ingen bokning, ingen uppföljning.

### Den mäter saker köparen inte bryr sig om
- De som bryr sig om MCP server-cards, OpenAPI och markdown-negotiation är utvecklare. De behöver ingen scanner, de läser specen.
- De som skulle kunna betala (vd, marknadschef, e-handelsansvarig) bryr sig inte om MCP. De bryr sig om kunder.
- En målerifirma i Göteborg som scannar sig får rött för att den saknar sandbox-miljö och MCP-kort.
- Det fanns dessutom ett metodfel: scannern gav underkänt för att blockera *träningsbottar* (GPTBot, CCBot), vilket inte påverkar synlighet i AI-svar, och testade inte de *sökbottar* som faktiskt gör det. Fixat i natt, men det säger något om hur långt produkten låg från köparens verklighet.

### "Agent-handel" är inte här än i Sverige
- ChatGPT Instant Checkout, Google UCP-checkout, Perplexity Instant Buy, Copilot Checkout: **alla USA-only**. OpenAI har dessutom backat från sin egen checkout.
- Inget svenskt företag är live med agent-checkout. Zalando siktar på 2027.
- 44–55 % av svenskarna är negativa till att en AI-agent slutför köp åt dem.
- Realistisk horisont: 12–24 månader. En scanner som ger underkänt för något kunderna inte kan använda är en produkt utan efterfrågan.
- Detaljer: [research/agenthandel-sverige.md](research/agenthandel-sverige.md).

### Bevisen för att checkarna spelar roll saknas
- llms.txt, markdown-negotiation, schema-märkning: **inga kontrollerade bevis** för att de påverkar vad AI rekommenderar. Ett kontrollerat test på 1 885 sidor fann ingen effekt av schema.
- Det som *är* dokumenterat: att blockera OAI-SearchBot tar bort dig ur ChatGPT-sökets svar, och att Googles AI-svar kräver en indexerbar sida.
- Detaljer: [research/matbarhet-ai-synlighet.md](research/matbarhet-ai-synlighet.md).

### EU-jurisdiktion var en lösning på ett problem ingen hade
Ingen väljer en gratis webbscanner efter var scannerns databas står. Positioneringen mot Cloudflare ("16 checks, vi har 17, och vi är i EU") övertygar ingen som inte redan bryr sig om checkarna.

### Konkurrensen gör det redan gratis
- Cloudflares isitagentready.com (april 2026) gör samma sak gratis, med Cloudflares varumärke och distribution. Den är byggd som toppen av en tratt mot deras betalda bot management, inte som produkt.
- Vi har inte hittat någon som byggt en lönsam verksamhet på agent-readiness-scanning. Vi har heller inte letat uttömmande: research-spåret om den globala marknaden kom inte tillbaka i tid i natt (se Underlag).

## 2. Vad vi testar istället: AI-synlighetskollen

**Frågan den svarar på:** "När mina kunder frågar AI efter det jag säljer, nämns jag? Och om inte, vem nämns istället?"

Det är en fråga med känsla i. Den visar konkurrenternas namn. Den går att förstå utan att veta vad MCP är.

### Varför den har bättre odds än agent-scannern
- **Rätt köpare.** Frågan ställs av den som äger intäkten, inte av utvecklaren.
- **Trycket finns i Sverige nu.** 62 % av svenskarna använder AI-tjänster. AI står för 0,24 % av trafiken till svenska e-handlare men har dubblats på ett år och konverterar ~46 % bättre än sök. Google tog bort gratis produktlistningar i EES i september. ChatGPT-annonser är live i Sverige sedan augusti. OpenAI öppnar kontor i Stockholm. Branschpressen (Ehandel.se, Svensk Handel) skriver om det.
- **Den återanvänder det som var bra:** probe-motorn, crawler-testerna, rate limiting, GDPR-hygienen, designen.

### Varför den ändå kan floppa (läs det här innan ni blir för glada)
- **Verktyget i sig är en handelsvara.** Ahrefs, Semrush, HubSpot och Mangools har gratis AI-synlighetskollar, flera utan inloggning, mot fler motorer än vi. Vår fördel är svenska frågor från Sverige, ärlig metod, och att det finns en människa bakom. Det räcker för en leadmagnet. Det räcker inte för en produkt.
- **AI-svar är brus i enskilda körningar.** Samma fråga ger samma varumärkeslista i färre än 1 av 100 körningar (SparkToro). Därför visar sidan "nämnd i k av n svar" med osäkerhetsintervall och aldrig ett betyg. Det är ärligt men mindre säljigt än "Din AI-score: 34/100".
- **Vi testar bara Claude.** ChatGPT är det svenskarna använder mest. API-svar och app-svar delar dessutom bara 6–24 % av varumärkena. Sidan säger det rakt ut. Att lägga till ChatGPT via OpenAIs API är nästa steg om testet går bra.
- **En lead är bara värd något om det finns något att sälja.** Se öppna frågor nedan. Det här är den största risken.

### Hur sidan fungerar
1. Användaren skriver sin domän. Ingen inloggning, inget e-postkrav för att se resultatet.
2. Vi läser startsidan och låter Claude formulera fem frågor som en kund som *inte* känner till företaget skulle ställa, plus en fråga om vad AI vet om företaget.
3. Varje kundfråga ställs två gånger till Claude med webbsök och plats i Sverige. Svaren dyker upp ett i taget.
4. Vi räknar hur ofta företaget nämns (strängmatchning, inte AI som bedömer sig själv), vilka konkurrenter som nämns istället, och vilka källor AI läste.
5. Tekniska förutsättningar med dokumenterad mekanism: sökbottar i robots.txt, blockering i CDN/brandvägg, noindex/nosnippet, innehåll som kräver JavaScript. Träningsbottar redovisas som information, aldrig som fel.
6. **Leadfångst:** "En koll är en ögonblicksbild. Vill du veta på riktigt?" E-post för en 30-dagarsmätning, plus kryssruta för att bli kontaktad. Variansen är ett ärligt skäl att be om e-posten.
7. Leads landar i Supabase (`visibility_leads`) och som Discord-notis direkt (`DISCORD_WEBHOOK_URL` finns redan i Vercel för cal-webhooken).

Sidan säger också vad den *inte* mäter längre (llms.txt, MCP-kort, schema) och varför. Det är en del av trovärdigheten.

## 3. Stoppkriterier (bestäm er nu, inte om 14 dagar)

Testet startar den dag sidan är live **och** distributionen nedan är gjord. Utvärdera dag 14.

| Signal | Fortsätt | Lägg ner |
|---|---|---|
| Kollar körda (från `visibility_checks`) | ≥ 150 | < 50 |
| E-postleads | ≥ 10 | < 3 |
| Samtal bokade eller "kontakta mig" | ≥ 2 | 0 |
| Någon frågar vad det kostar att fixa | ≥ 1 | 0 |

Mellanläge (t.ex. 80 kollar, 5 leads): kör 14 dagar till med en ändring, inte fler. Inget "vi bygger lite till och ser".

**Om testet faller:** arkivera repot, peka agent.opensverige.se till opensverige.se, behåll Q1-rapporten som innehåll. Inga fler timmar.

**Kostnadstak:** `VISIBILITY_DAILY_LIMIT` (standard 40 kollar/dygn). En koll är ungefär 11 svarsanrop med webbsök plus 7 korta anrop för plan och analys. Med `claude-opus-5-5` på låg effort: grovt 0,5–1,5 USD per koll, alltså max ~60 USD/dygn om taket nås. Vill ni sänka kostnaden, sätt `VISIBILITY_MODEL=claude-sonnet-5-5` eller `VISIBILITY_RUNS=1`. Det är ert beslut, inte mitt.

## 4. Handlingsplan

### Idag (torsdag 5 nov), ~1 timme
1. **Fixa GitHub-åtkomsten** så att natten kan pushas: installera Claude GitHub-appen på `opensverige` eller koppla om kontot på https://claude.ai/connect-github. Commitsen ligger lokalt på `claude/ecstatic-euler-j6b7du` och skickades som git-bundle i chatten.
2. **Applicera migrationen** `supabase/migrations/009_visibility.sql` (Supabase SQL editor eller CLI). Utan den fungerar sidan ändå, men rate limiting blir per instans och leads går bara till Discord.
3. **Sätt env i Vercel** (preview först): inget nytt krävs. Valfritt: `VISIBILITY_MODEL`, `VISIBILITY_RUNS`, `VISIBILITY_DAILY_LIMIT`, `LEAD_WEBHOOK_URL`, `VISIBILITY_SIGNING_SECRET` (annars används `IP_HASH_PEPPER`).
4. **Röktesta lokalt mot riktiga API:et**, det kunde jag inte göra i natt eftersom containern saknade nätverk och nyckel:
   ```bash
   npx tsx --env-file=.env.local scripts/visibility-monitor.ts --domain opensverige.se --runs 1
   ```
   Fungerar det: öppna preview-deployen, kör 3–4 riktiga domäner (en målerifirma, en e-handel, en SaaS, er egen).
5. **Slå på Vercel Web Analytics** för projektet `agent-scan`. Det är avstängt idag, så ni har ingen sidvisningsstatistik alls. Utan den kan ni inte utvärdera dag 14.
6. **Läs svaren med kritiska ögon.** Är frågorna rimliga? Stämmer "nämnd"-räkningen? Om frågorna känns konstiga är det `lib/visibility/plan.ts` som ska justeras.

### Vecka 1: distribution (det som saknades sist)
- **Kör indexet** och publicera det: `npx tsx --env-file=.env.local scripts/visibility-index.ts`. Åtta branscher, "vi frågade AI 48 gånger vilken bank svenskar ska välja". En LinkedIn-post per bransch, länk till `/synlighet`. Kostar några dollar.
- **50 riktade kollar.** Välj en vertikal (t.ex. redovisningsbyråer i Stockholm, tandläkare i Göteborg, svenska Shopify-butiker). Kör kollen på 50 företag, mejla var och en med deras egna konkurrentnamn: "När man frågar AI efter redovisningsbyrå på Södermalm nämns X och Y, inte ni." Det är den starkaste outbound-kroken ni har haft.
- **Discord (300+ builders):** be dem köra sina kunders sajter. Byråer är en multiplikator.
- **En post från er båda** om varför ni lade ner agent-scannern. Ärliga "vi hade fel"-poster presterar bra och bygger förtroende.

### Vecka 2: leverera det ni lovat
- Varje lead som bett om 30-dagarsmätning: kör `scripts/visibility-monitor.ts --domain <domän>` dagligen (cron lokalt eller GitHub Action), mejla `--report` efter 30 dagar. Manuellt med flit: automatisera först när det finns fler än ~10 att leverera till.
- Ring alla som kryssat "kontakta mig". Fråga vad de skulle betala för att lösa det. Skriv ner exakta ord.

### Dag 14: beslut enligt tabellen ovan.

## 5. Öppna frågor som bara ni kan svara på

1. **Vad säljer ni till den som fyller i formuläret?** Leads från AI-synlighet vill ha hjälp att synas: tekniska fixar (snabbt, passar er), men mest innehåll, recensioner, kataloger och PR (marknadsarbete). Tre ärliga alternativ:
   - Ni säljer ett fast åtgärdspaket (teknik + entitetsstädning + innehåll för de frågor där ni inte syns).
   - Ni säljer bara det tekniska och hänvisar resten till en GEO-byrå mot provision.
   - Ni säljer inget, då är det här ingen leadmagnet och testet ska inte köras.
2. **Vem gör distributionen?** Den saknades förra gången. Om ingen har två timmar i veckan för poster och outbound i 14 dagar, lägg ner nu istället.
3. **OpenSverige som varumärke:** en förening/community som säljer tjänster kan skava. Bestäm om leads går till föreningen eller till ert eget bolag, och skriv det i integritetstexten.

## 6. Andra vinklar vi värderade

Bedömning gjord i natt. **Regleringsvinklarna (EAA, NIS2, GDPR, AI Act) bygger på allmän kunskap, inte på nattens research.** Det spåret kom inte tillbaka i tid. Verifiera innan ni lutar er mot någon av dem.

| Vinkel | Smärta i Sverige nu | Gratis konkurrens | Vår fördel | Passar ett AI-community | Bedömning |
|---|---|---|---|---|---|
| Agent-readiness (nuvarande) | Låg | Cloudflare | Ingen | Ja | **Lägg ner** |
| Agenthandel för e-handel | Låg idag, 12–24 mån bort | Få | Medel: Klarna/PriceRunner, nordiska plattformar | Ja | **Parkera.** Lägg en butikssektion i synlighetskollen, ompröva när agent-checkout når EU |
| AI-synlighet | Medel–hög och växande | Hög: Ahrefs, Semrush, HubSpot | Svenska frågor, lokal kontext, ärlig metod, en människa bakom | Ja | **Testa 14 dagar** |
| Tillgänglighet (EAA, lag 2023:254) | Hög för e-handel, lagkrav sedan juni 2025 | Hög: axe, WAVE, Lighthouse, många byråer | Låg | Nej | Inte för er |
| NIS2 / cyberhygien | Medel för de som omfattas | Internetstiftelsens Internetkollen | Låg | Nej | Inte för er |
| GDPR-spårning / cookies | Medel | Webbkoll (dataskydd.net) | Låg | Nej | Inte för er |
| AI Act art. 50 (chattbot-märkning) | Låg–medel, oklart vad som krävs av vanliga sajter | Få | Medel | Ja | För smalt för en egen sida. Kan bli en rad i synlighetskollen |
| Index/rapport ("Sveriges AI-synlighetsindex") | Inte en produkt | Inte relevant | Q1-rapporten visar att ni kan det | Ja | **Gör, som distributionsmotor** för kollen (`scripts/visibility-index.ts`) |

De regleringsdrivna vinklarna har verklig smärta men passar inte er: de har starka gratisalternativ, de handlar inte om AI, och de leder till leads som vill köpa juridik eller tillgänglighetskonsulter, inte det ni kan.

## 7. Vad som byggdes i natt

Allt ligger på branchen `claude/ecstatic-euler-j6b7du` (ej pushad, se 4.1). Den skickades som git-bundle i chatten.

| Commit | Vad |
|---|---|
| `docs(strategy): internal evaluation` | [01-intern-utvardering.md](01-intern-utvardering.md) |
| `feat(scan): AI bot taxonomy` | `lib/scan/ai-bots.ts`: tränings-, sök- och användarbottar med RFC 9309-tolkning av robots.txt, 11 tester |
| `feat(synlighet): engine and API` | `lib/visibility/*`, `/api/synlighet/{plan,ask,lead}`, migration 009 |
| `feat(synlighet): page` | `/synlighet`, `/` pekar hit, `scripts/visibility-monitor.ts` för 30-dagarsmätningen |
| `fix(scan): search bots, not training bots` | Den gamla scannern ger inte längre underkänt för att blockera GPTBot |
| `feat(synlighet): index script` | `scripts/visibility-index.ts` för distributionsdata |
| `fix(synlighet): review fixes` | Efter en oberoende kodgranskning: kostnadsskydd i Postgres (fail-closed), SSRF-skydd, en fråga per anrop, rätt `max_tokens` för Opus 5.5 |
| `docs(agents)` | AGENTS.md beskriver pivoten och besluten bakom |

**Känd brist utanför nattens scope:** den gamla scannern (`lib/scan/fetch.ts`, `lib/scan/probe.ts`) hämtar användarens domän utan att kontrollera vart den pekar (SSRF). Den nya koden använder `lib/visibility/safe-fetch.ts`; samma helper bör användas i `lib/scan/` om `/scan` ska leva kvar.

Verifierat: `npm run lint`, `tsc --noEmit`, 36 enhetstester, `npm run build`, och ett Playwright-test av hela flödet på desktop och mobil med mockade API-svar (ingen horisontell scroll). **Inte verifierat:** riktiga anrop mot Anthropics API och mot riktiga sajter, containern hade varken nyckel eller öppet nätverk. Därför röktestet i 4.4.

Medvetet *inte* gjort: raderat den gamla scannern, API:et eller juridiksidorna. De kostar inget att låta stå, och raderingen hör till dag 14-beslutet.

## Underlag

- [01-intern-utvardering.md](01-intern-utvardering.md): användningsdata, kodgranskning, vad som går att återanvända
- [research/agenthandel-sverige.md](research/agenthandel-sverige.md): agent-checkout och AI-shopping i Sverige
- [research/matbarhet-ai-synlighet.md](research/matbarhet-ai-synlighet.md): går AI-synlighet att mäta ärligt, gratisverktygen, bot-taxonomin
- **Saknas:** två research-spår startades men levererade inte före deadline: global marknad för agent-readiness och GEO-verktyg (finansiering, prissättning, adoption), och svenska regleringsvinklar (EAA, NIS2, GDPR, AI Act art. 50). Slutsatsen ovan står sig utan dem, eftersom den vilar på er egen användningsdata, agenthandelsläget och mätbarhetsforskningen. Men tabellen i avsnitt 6 är svagare än resten av dokumentet.
