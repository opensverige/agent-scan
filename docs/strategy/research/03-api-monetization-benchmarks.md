# 3. API Monetization Benchmarks + 2026-Pricing för OpenSverige

> **Datainsamling:** April–maj 2026. Alla priser i USD om inget annat anges. SEK-kurser baserade på 1 USD ≈ 10,35 SEK (maj 2026). Notera att SaaS-prissättning ändras ofta — verifiera alltid mot officiell källsida inför beslut.

---

## 3.1 Sammanställd jämförelsetabell

| Tjänst | Free tier | Paid entry | Paid mid | Paid top | Per-call eller subscription | Auth | Sync/Async | SLA |
|---|---|---|---|---|---|---|---|---|
| **Algolia** | 10k sök/mån, 1M records | Grow: $0.50/1k sök (PAYG) | Premium: volymrabatt (annual) | Elevate: NeuralSearch + AI | Hybrid (PAYG + annual sub) | API key | Sync (REST) | Ej publicerat (Enterprise SLA) |
| **Mapbox Geocoding** | 100k req/mån | $0.75/1k (100k–500k) | $0.60/1k (500k–1M) | $0.45/1k (1M+) | Per-call (PAYG) | API key (URL param) | Sync (REST) | Ej publicerat |
| **Cloudflare Radar** | Gratis, alla planer | — | — | — | Gratis (CC BY-NC 4.0) | API token | Sync (REST) | Ej publicerat |
| **Cloudflare URL Scanner** | Ingår i CF-konto | — | — | — | Gratis med CF-konto | Custom API token | Sync (REST) | Beroende av CF-plan |
| **Stripe Radar** | Ingår i standard-pricing | $0.02/transaktion (Fraud Teams) | $0.07/transaktion (custom pricing) | Enterprise | Per-transaktion | API key (Stripe SDK) | Sync | Stripe Enterprise SLA |
| **WebPageTest API** | 150 test/mån (Starter) | $18.75/mån (1 000 test) | ~$75/mån (est. 5 000 test) | $999/mån (Expert, 30k test + RUM) | Subscription (monthly/annual) | API key (upp till 30 nycklar) | Sync (polling + webhook) | Ej publicerat |
| **PageSpeed Insights API** | 25 000 req/dag, 240/4 min | — | — | — | Gratis (Google API-kvot) | API key (Google Cloud) | Sync (REST, ~10–30s) | Ej publicerat |
| **BuiltWith API** | Fri enskild-lookup | $295/mån (Basic) | $495/mån (Pro) | $995/mån (Team) | Subscription | Ej dokumenterat | Sync | Ej publicerat |
| **Wappalyzer API** | 50 lookups/mån | $99/mån (Starter, 5k credits) | $249/mån (Team, 5 seats) | $449/mån (Business, 15 seats) | Credit-based subscription | API key (`x-api-key` header) | Sync (cached + live) | Ej publicerat |
| **Mozilla Observatory** | Helt gratis | — | — | — | Gratis, öppen källkod | Ingen (publik REST API) | Sync (REST) | Ingen formell SLA |
| **Have I Been Pwned** | Pwned Passwords gratis | $4.39/mån (Core 1, 10 RPM) | $36.99/mån (Core 3, 100 RPM) | $4 599/mån (Pro 5, 16k RPM) | Subscription (RPM-baserad) | API key (`hibp-api-key` header) | Sync (REST) | Ej publicerat |
| **URLScan.io** | 5 000 pub. scan/dag, 50 privata | $416/mån (Automate, annual) | $1 042/mån (Pro, annual) | $4 167/mån (Ultimate, annual) | Subscription | API key | Sync + Async (polling) | SAML/SSO på Pro+ |
| **VirusTotal** | 500 req/dag, 4 RPM | Kontakta sales (Premium) | Kontakta sales | Enterprise | Gratis publik / Premium custom | API key | Sync (REST) | SLA på Premium |
| **Security Headers** | Tjänsten avvecklad (ej nya subs) | — | — | — | N/A | API key (befintliga kunder) | — | — |
| **Pa11y** | Open-source CLI, gratis | Ej SaaS-API | — | — | Self-hosted | — | Sync | — |
| **Sucuri SiteCheck** | Fri webscanner | API: kontakta sales | — | — | Per-scan (kontakt) | API key (dashboard) | Sync | — |

---

## 3.2 Per tjänst — detaljerad sektion

### Algolia
- **Free tier:** "Build"-plan: 10 000 sökförfrågningar/mån + 1 miljon records. "Grow"-plan: gratis upp till 10 000 sök/mån och 100 000 records. ([Algolia pricing](https://www.algolia.com/pricing))
- **Paid struktur:** Grow är pure PAYG efter gränsen: $0,50/1k extra sökförfrågningar, $0,40/1k extra records/mån. Premium och Elevate är annual-baserade volymrabatter med "kontakta sales"-prissättning. Inga publicerade listor för Premium/Elevate.
- **Auth:** API key (Application ID + API key i request-header eller URL).
- **Async/sync:** Synkron REST. Svarstider < 50 ms i normal drift.
- **SLA:** Ej publicerat på lägre tiers. Enterprise har dedikerad SLA (99,99% uptime rapporteras informellt).
- **Overage / hard caps:** Grow-planen fakturerar automatiskt vid överskott. Ingen hard cap nämns — billable overage.
- **Relevans för OpenSverige:** Algolias modell är ett bra referensmönster för ett "lågt entry, PAYG-eskalering"-API. Deras $0,50/1k req-overage är branschnorm för search-as-a-service.

### Mapbox (Geocoding API)
- **Free tier:** 100 000 geocoding-requests/mån gratis (Temporary Geocoding API). Permanent Geocoding API: ingen gratis tier. ([Mapbox pricing](https://www.mapbox.com/pricing))
- **Paid struktur:** Ren per-call PAYG. Temporary: $0,75/1k (100k–500k), $0,60/1k (500k–1M), $0,45/1k (1M+). Volume discounts via sales vid 5M+.
- **Auth:** API key (access token i URL-parameter eller Authorization-header).
- **Async/sync:** Synkron REST.
- **SLA:** Ej publicerat på standard self-serve. Enterprise SLA finns.
- **Overage / hard caps:** Automatisk fakturering. Inget hard cap — oändlig eskalering med volymrabatter.
- **Relevans för OpenSverige:** Mapbox illustrerar hur geo-APIer med hög request-volym prissätts i bråkdels-cent per call. OpenSveriges scans är tyngre (10–30s) vilket motiverar högre per-scan-pris.

### Cloudflare Radar
- **Free tier:** Helt gratis för alla Cloudflare-kontohavare. Inga publicerade kvoter för API-anrop. Data under CC BY-NC 4.0-licens (ej kommersiell vidaredistribution). ([Cloudflare Radar docs](https://developers.cloudflare.com/radar/))
- **Paid struktur:** Ingen betalnivå för Radar-data i sig. Indirekt kostnad: Cloudflare Workers Paid ($5/mån) krävs vid hög volym.
- **Auth:** API token via Cloudflare Dashboard.
- **Async/sync:** Synkron REST.
- **SLA:** Beroende av Cloudflare-abonnemang (Free/Pro/Business/Enterprise).
- **Overage / hard caps:** Workers-baserade rate limits. Free tier: 100k Workers-requests/dag.
- **Relevans för OpenSverige:** Cloudflare Radar är ett bra datakälla att *integrera i* en scanner, inte att jämföra prissättning mot.

### Cloudflare URL Scanner
- **Free tier:** Tillgänglig för alla med Cloudflare-konto. ([Cloudflare URL Scanner docs](https://developers.cloudflare.com/radar/investigate/url-scanner/))
- **Paid struktur:** Inga separata avgifter publicerade. Ingår i Cloudflare-planen.
- **Auth:** Custom API token med *Account > URL Scanner > Edit*-behörighet.
- **Async/sync:** Synkron POST till `https://api.cloudflare.com/client/v4/accounts/{account_id}/urlscanner/scan`, sedan GET för resultat.
- **SLA:** Beroende av CF-plan.
- **Overage / hard caps:** Ej publicerat.

### Stripe Radar
- **Free tier:** Basic fraud protection ingår kostnadsfritt för konton med Stripe standard-pricing. ([Stripe pricing page](https://stripe.com/pricing#radar))
- **Paid struktur:** Per-transaktion:
  - Basic: $0 (inkluderat) / $0,05 per screenad transaktion (custom pricing-konton)
  - Radar for Fraud Teams: $0,02/transaktion (standard) / $0,07/transaktion (custom pricing)
  - Dispute deflection: $15/Visa-resolution, $29/Mastercard-resolution
  - 30 dagars gratis trial för Fraud Teams
- **Auth:** Stripe API key (sk_live_…).
- **Async/sync:** Synkron (del av Stripe Charges/PaymentIntents-flödet).
- **SLA:** Enterprise SLA via Stripe Enterprise-avtal.
- **Overage / hard caps:** Ingen cap — faktureras per transaktion.
- **Relevans för OpenSverige:** Stripe Radar är ett *payment fraud*-API, inte en web-scanner. Inkluderat för jämförelse av per-call-prissättning i en annan "scanning"-kontext. $0,02–$0,07/call är referensnivå för bedrägeridetektering.

### WebPageTest API
- **Free tier (Starter):** 150 test/mån. Filmstrip, video, Google Lighthouse, 60 dagars testhistorik, custom scripts (upp till 3 steg), 3 körningar per test, ~30 globala locations. Ingen API-access. ([Catchpoint/WebPageTest pricing via G2](https://www.g2.com/products/catchpoint-webpagetest/pricing), [Catchpoint pricing](https://www.catchpoint.com/pricing))
- **Paid struktur:**
  - Pro Monthly: $18,75/mån → 1 000 test/mån. API-access, privata tester, bulk testing, priority queue, 35 locations, 13 månaders historik. Upp till 5 team-members, 30 API-nycklar.
  - Pro Annual: $180/år ($15/mån, ~20% rabatt) → 1 000 test/mån
  - Fler Pro-nivåer (antal tester skalar) upp till 20 000 test/mån (exakt priser: kontakta sales för > 20k)
  - Expert: $999/mån (billed $11 988/år) → 30k syntetiska körningar/mån + RUM, SSO, 3000+ globala agenter, 3 år datahistorik
- **Auth:** API key (upp till 30 nycklar per konto).
- **Async/sync:** Submit → polling (GET status) → GET resultat. Tester tar sekunder till minuter beroende på location och konfiguration.
- **SLA:** Ej publicerat för Pro. Enterprise SLA.
- **Overage / hard caps:** Hard cap vid månadskvot. Inga dagliga limits. Överskott: kontakta sales eller uppgradera.
- **Relevans för OpenSverige:** WebPageTest $18,75/mån för 1 000 test/mån = **$0,01875 per test**. Det är ett starkt referenspris för performance-scanning-as-a-service. OpenSveriges AI-scanning med $0,05 COGS justifierar en *markant* högre per-scan-prispunkt.

### PageSpeed Insights API / Lighthouse CI
- **Free tier:** 25 000 requests/dag, 240 requests per 4 minuter (= ~1 req/sekund effektivt). Ingen kostnad med Google-konto. ([Google PageSpeed Insights docs](https://developers.google.com/speed/docs/insights/v5/get-started), [Stack Overflow quota confirmation](https://stackoverflow.com/questions/37122041/pagespeed-insights-api-limits))
- **Paid struktur:** Ingen betalnivå existerar. PSI är gratis Google-tjänst. Hög-volym-kunder kan ansöka om utökad kvot via Google Cloud Console.
- **Auth:** API key (Google Cloud API key, läggs till som `?key=` i URL). Kan användas utan nyckel men med striktare rate limiting.
- **Async/sync:** Synkron HTTP-request. Svarstid 5–30 sekunder beroende på sidkomplexitet.
- **SLA:** Ingen formell SLA. Google-infrastruktur med hög tillgänglighet i praktiken.
- **Overage / hard caps:** 429 vid överskridande av kvot. Kvot återställs vid midnatt PST.
- **Relevans för OpenSverige:** PSI API är i praktiken gratis upp till ~800k req/mån (25k/dag × 30). Bra komponent att integrera i en scan-pipeline. Det *motiverar inte* hög prissättning i sig — värdet som OpenSverige skapar är sammanvägningen med Claude AI-analys.

### BuiltWith API
- **Free tier:** Obegränsad fri lookup av enskilda sidor på builtwith.com (webbgränssnitt). Ingen gratis API-åtkomst. ([BuiltWith plans](https://builtwith.com/plans))
- **Paid struktur:** Flat månadssubskription:
  - Basic: $295/mån (2 teknologier, 2 keywords, 2 retail reports, 1 login) / ~$2 950/år
  - Pro: $495/mån (obegränsat) / ~$4 950/år
  - Team: $995/mån (obegränsat + fler logins) / ~$9 950/år
  - API-åtkomst: ej explicit dokumenterat om det ingår i Basic eller kräver Pro+
- **Auth:** Ej publicerat (sannolikt API key).
- **Async/sync:** Synkron REST (baserat på BuiltWith API-dokumentation).
- **SLA:** Ej publicerat.
- **Overage / hard caps:** Ej publicerat.
- **Relevans för OpenSverige:** BuiltWith är en *technology intelligence*-databas, inte en realtids-scanner. $295/mån som entry motiveras av bulk-data, inte per-call. Visar att tech-stack-data kan prissättas högt vid affärsvärde.

### Wappalyzer API
- **Free tier:** 50 teknologi-lookups/mån + 50 e-postverifieringar/mån, 5 website-alerts, gratis sample lead lists. ([Wappalyzer pricing](https://www.wappalyzer.com/pricing/))
- **Paid struktur:** Credit-baserat:
  - Starter: $99/mån → 5 000 credits (typiskt 1 credit/webbplats). Credits upphör efter 60 dagar om ej köpta i bundles.
  - Team: $249/mån → 5 seats
  - Business: $449/mån → 15 seats
  - Credits kan köpas separat (bundles), upphör efter 365 dagar
- **Auth:** API key via `x-api-key`-header.
- **Async/sync:** Synkron REST. Kombinerar cachat data (snabbt) med live-analys vid behov.
- **SLA:** Ej publicerat.
- **Overage / hard caps:** Credits tar slut — köp mer eller byt plan. Inga automatiska overages.
- **Relevans för OpenSverige:** Wappalyzers $99/mån för 5 000 lookups = **$0,0198 per lookup**. Relevant benchmarkpris för tech-stack-identifiering som komponent i en större scan.

### Mozilla Observatory
- **Free tier:** Helt gratis. Öppen REST API utan autentisering eller publicerade kvotgränser. ([Mozilla Observatory](https://developer.mozilla.org/en-US/observatory))
- **Paid struktur:** Ingen — tjänsten är helt gratis och open-source. Mozilla äger och driftar infrastrukturen.
- **Auth:** Ingen krävs. Publik API.
- **Async/sync:** POST-anrop initierar scan, GET hämtar resultat (polling-mönster).
- **SLA:** Ingen formell SLA.
- **Overage / hard caps:** Inga publicerade kvoter. Rate limiting kan aktiveras vid missbruk.
- **Relevans för OpenSverige:** Observatory kan integreras gratis som security headers-komponent. Motiverar ej prissättning i sig — men adderar värde till skanningsrapporten.

### Have I Been Pwned API
- **Free tier:** Pwned Passwords API (k-anonymitet): helt gratis, ingen nyckel krävs. Alla andra endpoints kräver betald prenumeration. ([HIBP subscription page](https://haveibeenpwned.com/Subscription))
- **Paid struktur:** Prenumerationsbaserad, RPM-styrd:

| Plan | RPM | Månspris |Årspris |
|------|-----|----------|---------|
| Core 1 | 10 | $4,39 | $43,90 |
| Core 2 | 50 | $21,59 | $215,90 |
| Core 3 | 100 | $36,99 | $369,90 |
| Core 4 | 500 | $159 | $1 590 |
| Core 5 | 1 000 | $319 | $3 190 |
| Pro 1 | 1 000 + stealer logs | $379 | $3 790 |
| Pro 2 | 2 000 | $699 | $6 990 |
| High RPM 4000 | 4 000 | $1 150 | — |
| High RPM 8000 | 8 000 | $2 299 | — |

- **Auth:** `hibp-api-key`-header (32-teckens hex-sträng) + obligatorisk `user-agent`-header.
- **Async/sync:** Synkron REST. HTTP 429 med `retry-after`-header vid överskridande.
- **SLA:** Ej publicerat. Enterprise inkluderar dedicated support.
- **Overage / hard caps:** Hard cap vid RPM — returnerar 429, ingen automatisk uppgradering.
- **Relevans för OpenSverige:** HIBP är ett utmärkt exempel på *tiers baserade på throughput (RPM)* snarare än bulk-volym. Visar att även "enkla" lookup-API:er kan generera återkommande intäkter. OpenSverigesmodell bör inte försöka inkludera HIBP-data i sin gratis-tier utan möjlig kostnad.

### URLScan.io
- **Free tier:** 50 privata scans/dag, 1 000 unlistade/dag, 5 000 publika scans/dag, 1 000 sökförfrågningar/dag, 10 000 resultatförfrågningar/dag. ([URLScan.io pricing](https://urlscan.io/pricing/))
- **Paid struktur:**

| Plan | Månspris | Årspris | Privata scans/dag | Publika scans/dag |
|------|----------|---------|-------------------|-------------------|
| Free | $0 | $0 | 50 | 5 000 |
| Automate | — | $5 000 ($416/mån) | 2 500 | 10 000 |
| Professional | $1 250 | $12 500 ($1 042/mån) | 20 000 | 50 000 |
| Enterprise | $2 500 | $25 000 ($2 084/mån) | 100 000 | 150 000 |
| Ultimate | $5 000 | $50 000 ($4 167/mån) | 200 000 | 300 000 |

- **Auth:** API key (SOAR-integration), SAML 2.0 SSO på Pro+.
- **Async/sync:** Submit → poll → GET resultat.
- **SLA:** Enterprise: custom T&Cs, Enterprise Security, SAML, onboarding. Formell SLA ej publicerat.
- **Overage / hard caps:** Dagliga kvoter — efter cap väntar man till nästa dag. Ingen automatisk overage-fakturering.
- **Relevans för OpenSverige:** URLScan.io:s dagliga kvoter (inte månadsbaserade!) är ett ovanligt mönster. Deras pris på $1 042/mån för 20k privata scans/dag ≈ $0,0005/scan vid fullt utnyttjande — extrem volym-rabatt. Threat intelligence-fokus motiverar high price points.

### VirusTotal API
- **Free tier (Public API):** 500 requests/dag, max 4 requests/minut. Ej tillåtet i kommersiella produkter eller tjänster. ([VirusTotal Public vs Premium API](https://docs.virustotal.com/reference/public-vs-premium-api))
- **Paid struktur (Premium API):** Inga publicerade listor — kontakta VirusTotal/Google direkt. Ingår nu i Google Threat Intelligence-plattformen (fusion av VirusTotal + Mandiant). Premium har SLA och inga rate limits (styrs av "service step" i licensen).
- **Auth:** API key (registrering på virustotal.com). Premium: separat enterprise-licensnyckel.
- **Async/sync:** Synkron REST.
- **SLA:** Premium/Enterprise SLA garanterar datakvalitet och tillgänglighet.
- **Overage / hard caps:** Public API: hard cap 429. Premium: styrs av licensgrad.
- **Relevans för OpenSverige:** VirusTotal är ett bra exempel på att en gratis-tier kan vara ett effektivt lead-instrument men *explicit förbjuder* kommersiell användning — OpenSverige måste använda Premium om VirusTotal-data ingår i produkt-scans.

### Security Headers (securityheaders.com)
- **Status:** Tjänsten har avvecklat API-erbjudandet och accepterar inga nya prenumerationer eller förnyelser. ([Security Headers API](https://securityheaders.com/api/))
- **Befintliga kunder:** Kan hämta API key via dashboard, men tjänsten upphör.
- **Alternativ:** Mozilla Observatory (gratis), eller egen implementation av security header-analys.

### Pa11y
- **Status:** Open-source CLI-verktyg under MIT-licens. Inget officiellt SaaS API eller kommersiell erbjudande från Pa11y-projektet. ([Pa11y GitHub](https://github.com/pa11y/pa11y))
- **Self-hosted:** Kan köras i egna pipelines gratis. Node.js-bibliotek med Puppeteer/Chromium under.
- **Relevans för OpenSverige:** Pa11y kan användas som *intern komponent* i scan-pipeline utan licensavgift. Adderar WCAG-accessibilitetskontroll.

### Sucuri SiteCheck API
- **Free tier:** Webbgränssnittet på sitecheck.sucuri.net är gratis för manuella kontroller. ([Sucuri SiteCheck](https://sitecheck.sucuri.net/))
- **Paid API:** Kräver kontakt med sales@sucuri.net — inga publicerade priser. API-åtkomst är ett betalt tillägg. ([Sucuri Scanning API docs](https://docs.sucuri.net/website-monitoring/scanning-api/))
- **Platform-priser (för jämförelse):** $199,99/år (Basic), $299,99/år (Premium), $499,99/år (Business) — dessa är webbplats-skyddsplaner, inte rena API-priser.
- **Auth:** API key via dashboard.
- **Relevans för OpenSverige:** Sucuris "kontakta sales"-modell för API är vanligt för säkerhetsprodukter med hög affärsvärde. Indikerar att scanner-API:er i säkerhetssegmentet kan ta ut premium-priser.

---

## 3.3 Prismodells-mönster (analys)

### Vanligaste mönster för scanner-as-a-service

Baserat på ovanstående benchmark framträder fyra dominerande modeller:

**1. Subscription-med-kvot (dominerande)**
De flesta scanner-API:er (WebPageTest, URLScan.io, HIBP, Wappalyzer) säljer ett månadsabonnemang med inkluderad kvot. Fördelar: förutsägbara intäkter, enkelt för kunder att budgetera. Nackdel: kunder som underutnyttjar kvoten känner att de betalar för luft.

**2. Pure PAYG / per-call (skalbart men oförutsägbart)**
Mapbox och Algolia Grow-tier använder ren PAYG. Fungerar bäst för kunder med extremt variabel volym. Kräver robust metering-infrastruktur och riskerar "bill shock".

**3. Hybrid (subscription + overage)**
Algolia (Grow) och Vercel kombinerar gratis-tier, inkluderad kvot och automatisk overage. Branschens mest sofistikerade modell — ger förutsägbarhet *och* elasticitet.

**4. Gratis (open-source / community)**
Mozilla Observatory, PageSpeed Insights API, Cloudflare Radar: gratis med Google/Mozilla/Cloudflare som "sponsor". Konkurrensomöjligt att prissätta mot direkt — positionera OpenSverige på det *AI-sammansatta* värdet, inte rådata.

### Var ligger break-even för $0,05/scan-kostnad?

OpenSverigesCOGS (cost of goods sold) per scan:
- Anthropic Claude API: ~$0,02–$0,04 per scan (beroende av kontext-längd, modell)
- Firecrawl: ~$0,005–$0,01 per crawlad sida
- Exa search: ~$0,003–$0,01 per query
- **Total COGS: ~$0,035–$0,065/scan. Utgångspunkt: $0,05/scan.**

Break-even-analys per prisnivå (bruttomarginal):

| Pris/scan | Bruttomarginal | Kommentar |
|-----------|---------------|-----------|
| $0,05 | 0% | Break-even — ingen marginal |
| $0,10 | 50% | Miniminivå för hållbar drift |
| $0,15 | 67% | Typisk API-produktmarginal |
| $0,20 | 75% | Branschnorm för mjukvara-SaaS |
| $0,25 | 80% | Premium-nivå (jfr Wappalyzer $0,0198) |
| $0,50 | 90% | Möjligt vid starkt differentieringsvärd |

**Slutsats:** Minsta hållbara pris är ~$0,10–$0,15/scan. Allt under $0,10 täcker inte COGS + infrastruktur + support.

### Når man positivt LTV på en $19/mån-tier?

Antaganden för $19/mån Builder-tier med 500 scans/mån:
- Pris per scan: $19 ÷ 500 = **$0,038/scan**
- COGS per scan: $0,05
- **Bruttomarginal: -32% (negativt!)**

$19/mån är för lågt vid 500 scans. Alternativ:

| Tier | Pris | Scans | Pris/scan | Bruttomarginal |
|------|------|-------|-----------|---------------|
| Builder $19 | $19 | 150 scans | $0,127 | 60% ✓ |
| Builder $29 | $29 | 300 scans | $0,097 | 48% ✓ |
| Builder $49 | $49 | 500 scans | $0,098 | 49% ✓ |
| Pro $99 | $99 | 1 000 scans | $0,099 | 49% ✓ |
| Pro $199 | $199 | 2 500 scans | $0,080 | 40% ✓ |

**Rekommendation:** $29–$49/mån-tiers med 200–500 scans är mer hållbara. $19/mån fungerar bara med max ~150 scans.

### Hur hanterar konkurrenter cold-start?

| Strategi | Exempel | Lämplighet för OpenSverige |
|----------|---------|--------------------------|
| **Forever free** (begränsad) | Mozilla Observatory, PSI API | Bra lead-magnet, men täcker ej COGS |
| **Free trial** (tidsbegränsad) | Stripe Radar 30 dagar | Risk: gaming av trial-period |
| **Freemium med kredit** | Wappalyzer 50 credits/mån | ✓ Bäst för OpenSverige — naturlig uppgraderingslogik |
| **Hard paywall** | BuiltWith, Sucuri API | Fungerar när varumärket är starkt |
| **Open-source + hosted** | Pa11y | Ökar adoption men komplicerar monetisering |

**Rekommendation:** Forever-free med 10–25 scans/mån är rätt strategi för OpenSverige under 2026-launch. Skapar word-of-mouth och developer-goodwill utan att bränna pengar.

### Trial vs forever-free

Forever-free: bygger "top-of-funnel" och organisk distribution. 
Trial: konverterar snabbare men skapar anxiety. 

För ett API med $0,05 COGS är forever-free med 10 scans/mån en total månadskostnad på $0,50 per gratis-användare — acceptabelt om konverteringsrate är > 5%.

### Annual discount-mönster

Branschstandarden är "betala 10, få 12" = ~17% rabatt vid årsabonnemang. Verifierat hos: HIBP (annual = 10× månads-priset), WebPageTest ($180/år vs $18,75×12 = $225), Algolia Premium, URLScan.io ($1 042/mån vs $1 250/mån = 17% rabatt). OpenSverige bör erbjuda 2 månader gratis vid årsbetalning (17% rabatt).

### Bring-Your-Own-Key (BYOK) som modell

BYOK-modellen (kunden kopplar sin egen Anthropic-nyckel) är ett sofistikerat alternativ för Pro/Enterprise-tiers:

**Fördelar:**
- Eliminerar COGS ($0,05 → $0,005/scan) — dramatisk marginalförbättring
- Appellerar till privacy-medvetna enterprise-kunder
- Minskar OpenSveriges API-kostnad vid hög volym

**Nackdelar:**
- Komplicerar onboarding (kunden måste ha Anthropic-konto)
- Svårare att kontrollera scan-kvalitet (kunden kan använda billigare model)
- Ger inte OpenSverige insikter om AI-användningsmönster
- Kräver robust nyckelhantering och isolation

**Rekommendation:** Erbjud BYOK som ett opt-in för Enterprise-tier ($499+/mån), inte som standardmodell. Replicate.com har demonstrerat framgång med BYOK-hybrider.

---

## 3.4 Enhetsekonomi

### Bruttomarginal per scan vid olika prislägen

Antag COGS = $0,05/scan (Anthropic + Firecrawl + Exa) plus $0,003 infrastruktur per scan (Vercel Functions-exekvering, Supabase DB-writes):

**Total variabel kostnad per scan: ~$0,053**

| Scenarie | Pris/scan | Täckningsbidrag | Bruttomarginal |
|----------|-----------|-----------------|---------------|
| Gratis (10 scans) | $0 | -$0,053 | -100% |
| Builder minimal ($29/150 scans) | $0,193 | +$0,140 | 73% |
| Builder normal ($49/500 scans) | $0,098 | +$0,045 | 46% |
| Pro ($199/2 500 scans) | $0,080 | +$0,027 | 34% |
| Pro ($499/10 000 scans) | $0,050 | -$0,003 | -6% |

**Obs:** Vid 10 000 scans/mån på $499 är man nära break-even. Det motiverar antingen högre Pro-pris eller BYOK-modell.

### Infrastruktur-baselines (fasta kostnader)

| Komponent | Plan | Månadskostnad |
|-----------|------|--------------|
| Vercel Pro | 1 seat | $20/mån |
| Vercel bandwidth/functions overage | Estimat | ~$10–$50/mån |
| Supabase Pro | Per projekt | $25/mån |
| Domän + SSL | — | ~$2/mån |
| **Totalt fast infra** | | **~$60–$100/mån** |

Anthropic erbjuder volymrabatter vid hög API-spend (>$100k/mån), men för OpenSverige 2026 är rabattnivåerna sannolikt inte relevanta initialt.

### Hur många scans/mån krävs för att täcka infra?

Med $80/mån i fast infrakostnad och $0,045 täckningsbidrag per scan (Builder-nivå):
- Break-even: $80 ÷ $0,045 = **~1 780 scans/mån** eller ca **6 Builder-kunder á 300 scans/mån**

Med Pro-tier ($199/mån, 2 500 scans):
- Täckningsbidrag: 2 500 × $0,027 = $67,50
- Behöver ~2 Pro-kunder bara för att täcka infra

**Slutsats:** 5–10 betalande kunder täcker infrastrukturkostnaderna. Realistisk milstolpe för månad 3–6.

### Cap-strategi vid abuse

Kritiskt för ett API med icke-trivial COGS:

1. **Hard cap per tier** — scans stoppas när månadskvoten är slut (returnera HTTP 402 med tydligt meddelande)
2. **Rate limiting** — max X scans/minut per API-nyckel (föreslaget: 1 scan/10s på Builder, 1 scan/5s på Pro)
3. **Burst detection** — automatisk flag vid >10 scans på <5 minuter utan historik
4. **CAPTCHA för gratis-tier** — minskar bot-missbruk
5. **Domain verification** — verifiera att kunden äger (eller har rätt att skanna) måldomänen
6. **Credit card preauth** — kräv betalkort även för gratis-tier (reducerar missbruk dramatiskt)

---

## 3.5 Konkret tier-förslag för agent.opensverige.se (2026)

### Övergripande principer

Baserat på benchmark-analysen ovan rekommenderas:
- **Forever-free** med begränsad kvot (lead-magnet)
- **Builder-tier** med måttlig volym och 50–60% bruttomarginal
- **Pro-tier** med hög volym, white-label och SLA
- **17% årsrabatt** på alla betalda tiers
- **BYOK-option** på Pro (fas 2, Q3 2026)

---

### Tier 1: Hobby (Forever Free)

| Parameter | Värde |
|-----------|-------|
| **Pris** | 0 kr / 0 € |
| **Scans/mån** | 15 scans |
| **Rate limit** | 1 scan / 30 min (max 2/timme) |
| **Kvot-reset** | 1:a varje månad |
| **API-åtkomst** | Nej — endast webbgränssnitt |
| **Badge/embed** | Ja — med "Powered by OpenSverige"-watermark |
| **Scan-historik** | 30 dagar |
| **Webhooks** | Nej |
| **White-label** | Nej |
| **SLA** | Ingen |
| **Support** | Community (GitHub Discussions) |

**Målgrupp:** Enskilda webbutvecklare, curiosity-driven early adopters, open-source-projekt, studenter. Vill prova verktyget utan betalkortsfriktions.

**Resonemang:** 15 scans/mån = $0,75 COGS/mån/gratis-användare. Acceptabelt. Watermarked badge skapar organisk spridning ("scanned by agent.opensverige.se"). Ingen API-access håller nere abuse-risk. Krav: betalkort *inte* obligatoriskt (reducerar signup-friktion), men email-verifiering krävs.

**Jämförelse:** WebPageTest ger 150 test/mån gratis — de kan göra det för att infrastrukturkostnaden per test är minimal. OpenSverigesAI-COGS motiverar en lägre gratisgräns.

---

### Tier 2: Builder

| Parameter | Värde |
|-----------|-------|
| **Pris** | 290 SEK/mån (~28 EUR / ~$27) |
| **Pris annual** | 2 900 SEK/år (~280 EUR, 17% rabatt) |
| **Scans/mån** | 300 scans |
| **Pris per scan** | ~0,97 SEK (~$0,09) |
| **Bruttomarginal** | ~46% |
| **Rate limit** | 1 scan / 2 min (max 30/timme) |
| **API-åtkomst** | Ja — REST API + API key |
| **Badge/embed** | Ja — utan watermark |
| **Scan-historik** | 12 månader |
| **Webhooks** | Ja — 1 webhook endpoint |
| **White-label** | Nej |
| **SLA** | Ingen formell |
| **Support** | Email (48h svarstid) |
| **Betalning** | Stripe (kort, Klarna) |

**Målgrupp:** Frilansare, webbyråer (1–5 kunder), solo-founders med SaaS-produkter, WordPress-hostingbolag, tekniska webbkonsulter. Behöver kunna integrera scan-resultat i egna verktyg eller automatisera regelbundna kontroller.

**Resonemang:** $27/mån är i linje med "developer tool"-marknaden ($19–$49 är standardintervallet). 300 scans ger en scan per dag plus lite extra (10 kunder × 30 dagliga kontroller). API + webhook är nyckel-differentiator från Free. Prissatt för att ge 46% bruttomarginal — tillräckligt för att täcka support och infrakostnader. Jämfört med WebPageTest ($18,75 för 1 000 test) är OpenSverige dyrare per scan men har substantiellt högre AI-djup i analysen.

---

### Tier 3: Pro

| Parameter | Värde |
|-----------|-------|
| **Pris** | 1 490 SEK/mån (~144 EUR / ~$140) |
| **Pris annual** | 14 900 SEK/år (~1 440 EUR, 17% rabatt) |
| **Scans/mån** | 2 000 scans |
| **Pris per scan** | ~0,75 SEK (~$0,07) |
| **Bruttomarginal** | ~29% |
| **Rate limit** | 1 scan / 30 sek (max 120/timme) |
| **API-åtkomst** | Ja — REST API + upp till 5 API keys |
| **Badge/embed** | Ja — white-label (egen domän, egen branding) |
| **Scan-historik** | 24 månader |
| **Webhooks** | Ja — upp till 5 endpoints |
| **White-label** | Ja — eget logotyp, färg, domän i rapporter |
| **Prioritet** | Ja — Priority queue (ingen väntetid) |
| **SLA** | 99,5% uptime (månadsvis mätning) |
| **Support** | Email (24h) + Slack shared channel |
| **BYOK (Q3 2026)** | Valfritt — koppla egen Anthropic-nyckel |

**Målgrupp:** Digitala byråer (10–50 kunder), SEO-plattformar, hosting-bolag som vill white-label AI-readiness som tjänst, enterprise-webbteam, säkerhetsbyråer. Behöver skalbar API-åtkomst och möjlighet att presentera under eget varumärke.

**Resonemang:** 1 490 SEK/mån positionerar sig tydligt under $199-nivån (svenska marknaden är priskänslig, SEK-prissättning upplevs lägre än USD). 2 000 scans/mån = ~65 scans/dag — täcker en byrå med 20 kunder och dagliga re-checks. White-label är starkt upsell-argument: byrån kan ta ut $10–$50/mån per slutkund för en "AI Agent Readiness"-rapport. BYOK i fas 2 förbättrar marginalen till ~60%+ för de kunder som väljer det alternativet.

**Jämförelse:** URLScan.io tar $1 042/mån för liknande volym (men security-fokus). OpenSverige:s $140/mån är mer tillgängligt för SME-segment. Wappalyzer $99/mån för 5 000 tech-lookups — OpenSverige:s djupare AI-analys motiverar premiumprissättning.

---

### Prisjämförelse — sammanfattning

| Tier | SEK/mån | EUR/mån | Scans | kr/scan | Bruttomarginal |
|------|---------|---------|-------|---------|---------------|
| Hobby | 0 | 0 | 15 | — | -100% (lead cost) |
| Builder | 290 | 28 | 300 | 0,97 kr | ~46% |
| Pro | 1 490 | 144 | 2 000 | 0,75 kr | ~29% |

> **Not om marginaler:** Pro-tiers 29% marginal förutsätter att fasta infrastrukturkostnader täcks av Builder-tier-volymen. I praktiken är Pro-tierens bidrag till täckning av fasta kostnader sekundärt — primärfokusen är att sälja fler Builder-seats. Alternativt: höj Pro till 1 990 SEK/mån om marknadstest visar låg priskänslighet.

---

## 3.6 Annat att tänka på

### Säljmoms och VAT

**Svenska kunder (B2C och B2B i Sverige):**
- 25% moms tillkommer på alla priser. SEK-priserna ovan är exklusive moms.
- Kunder ser: 290 SEK → 362,50 SEK inkl. moms på Builder-tier.
- Supabase och andra moderna SaaS-bolag i Sverige hanterar detta via Stripe Tax.

**EU B2B-kunder (reverse charge):**
- EU-företag med giltigt VAT-nummer betalar noll moms (reverse charge-mekanismen, EU Directive 2006/112/EC).
- Kunden redovisar moms i sitt hemland.
- Kräver VAT-nummer-validering vid checkout (Stripe Tax hanterar detta automatiskt).

**EU B2C-kunder (konsumenter i EU):**
- Moms ska betalas i kundens hemland (OSS-systemet, One Stop Shop sedan 2021).
- Stripe Tax hanterar automatisk beräkning och rapportering till Skatteverket.
- Tröskel: obligatoriskt OSS-registrering vid >10 000 EUR/år i EU B2C-försäljning.

**Utanför EU:**
- USA, UK, etc.: ingen EU-moms. Lokala skatteregler kan gälla (t.ex. UK VAT vid > £85k/år i UK-försäljning).

**Praktisk implementation:** Aktivera Stripe Tax från dag ett. Kostnad: ingår i Stripe-avgiften (0% extra kostnad för Stripe-kunder). Kräver: registrering i Skatteregistret för momsredovisning (F-skattsedel + momsregistrering hos Skatteverket).

### Stripe Tax-uppsättning

Steg-för-steg:
1. Aktivera Stripe Tax i Dashboard → Tax → Settings
2. Lägg till produktens Tax Code: `txcd_10103000` (SaaS-tjänster)
3. Aktivera automatisk beräkning för alla fakturer
4. Konfigurera OSS-registrering om EU B2C-försäljning sker
5. Validera EU VAT-nummer via Stripe → `tax_id_required: true` i Checkout Session för B2B-flöde

### Open-source/free-for-OSS-scheman

Inspirerat av Vercel (gratis Pro för open-source), Sentry (gratis Business för OSS), och GitHub (gratis Teams för publik repos):

**Förslag:** "Open Source & Non-profit Program"
- Kriterium: publik GitHub/GitLab-repo med OSI-godkänd licens, eller registrerad ideell förening (ideell förening, stiftelse)
- Benefit: Pro-tier gratis (1 490 SEK/mån), begränsat till 500 scans/mån
- Application process: formulär + GitHub-URL-verifiering
- Marketing value: open-source-communities är starka multiplikatorer. Vercel, Netlify och Sentry har alla byggt stor brand awareness via OSS-program.
- Risk: missbruk (fake repos). Mitigeras med: minst 3 månaders aktiv repo-historik, >10 stars, manuell granskning.

### Pay-as-you-go topup för burst

Inspirerat av Replicate.com och Twilio:

**Förslag: "Scan Credits" topup**
- Hobby-kunder kan köpa engångskrediter: 50 scans för 99 SEK (~$9,50)
- Builder-kunder kan aktivera automatisk topup: "Fyll på med 100 scans för 149 SEK när kvoten tar slut"
- Pris per scan i topup: ~2 SEK (~$0,19) — premiumprissatt vs prenumeration för att driva uppgradering
- Teknisk implementation: Stripe Payment Links eller Stripe Checkout i one-time mode

**Kalkyl topup:**
- 50 scans × $0,05 COGS = $2,50 COGS
- 99 SEK ≈ $9,50 intäkt → bruttomarginal ~74%
- Topup-kunder är "engaged men inte klara att committa" — idealiska konverteringskandidater

### Public roadmap som upsell-trigger

Inspirerat av Linear, Posthog, Supabase:

**Rekommendation:** Publicera en publik roadmap på agent.opensverige.se/roadmap med features kopplade till tier:

| Feature | Status | Tier |
|---------|--------|------|
| AI Agent Readiness Score v1 | ✅ Live | All |
| Badge embed | ✅ Live | All |
| API access | ✅ Live | Builder+ |
| Webhooks | ✅ Live | Builder+ |
| White-label rapporter | ✅ Live | Pro |
| Scheduled re-scans | 🔜 Q2 2026 | Builder+ |
| Comparative benchmarking | 🔜 Q3 2026 | Pro |
| Custom scan profiles | 🔜 Q3 2026 | Pro |
| BYOK (Anthropic-nyckel) | 🔜 Q3 2026 | Pro |
| Multi-site bulk scan | 🔜 Q4 2026 | Pro |
| Team collaboration | 🔜 2027 | Enterprise |
| Slack/Teams-integration | 🔜 2027 | Pro+ |

Roadmap-publiceringen skapar upsell-triggers: "Vill du ha Scheduled re-scans? Uppgradera till Builder." Det är en beprövad SaaS-taktik för att konvertera free-tier-användare utan säljarbete.

---

## 3.7 Källor

| Tjänst | Källa | Datum |
|--------|-------|-------|
| Algolia | https://www.algolia.com/pricing | 2026 |
| Mapbox | https://www.mapbox.com/pricing | 2026 |
| Cloudflare Radar | https://developers.cloudflare.com/radar/ | April 2026 |
| Cloudflare URL Scanner | https://developers.cloudflare.com/radar/investigate/url-scanner/ | Sept 2025 |
| Stripe Radar | https://stripe.com/pricing#radar | 2026 |
| WebPageTest / G2 | https://www.g2.com/products/catchpoint-webpagetest/pricing | Nov 2024 |
| WebPageTest / Catchpoint | https://www.catchpoint.com/pricing | 2026 |
| PageSpeed Insights | https://developers.google.com/speed/docs/insights/v5/get-started | 2018 (API oförändrad) |
| PSI rate limits (SO) | https://stackoverflow.com/questions/37122041/pagespeed-insights-api-limits | 2024 |
| BuiltWith | https://builtwith.com/plans | 2026 |
| Wappalyzer | https://www.wappalyzer.com/pricing/ | 2026 |
| Wappalyzer / Crozdesk | https://crozdesk.com/software/wappalyzer/pricing | April 2026 |
| Mozilla Observatory | https://developer.mozilla.org/en-US/observatory | 2026 |
| Have I Been Pwned | https://haveibeenpwned.com/Subscription | 2026 |
| HIBP Support | https://support.haveibeenpwned.com/hc/en-au/articles/13868920521103 | Mars 2026 |
| URLScan.io | https://urlscan.io/pricing/ | April 2026 |
| VirusTotal | https://docs.virustotal.com/reference/public-vs-premium-api | Dec 2025 |
| Security Headers | https://securityheaders.com/api/ | 2026 |
| Sucuri SiteCheck | https://sitecheck.sucuri.net/ | 2026 |
| Sucuri API docs | https://docs.sucuri.net/website-monitoring/scanning-api/ | 2019 |
| Vercel Pro pricing | https://vercel.com/docs/plans/pro-plan | Feb 2026 |
| Supabase pricing | https://supabase.com/pricing | April 2026 |
| API monetization models | https://newsdata.io/blog/api-monetization/ | April 2026 |
| API tiered pricing guide | https://www.openledger.com/fintech-saas-monetization-with-accounting-apis/api-tiered-pricing-the-complete-guide-for-2025 | Maj 2025 |
| SaaS break-even analysis | https://www.getmonetizely.com/articles/the-break-even-analysis-understanding-pricing-thresholds-in-saas | Juni 2025 |

---

*Rapport genererad: maj 2026. Uppdatera priser mot officiella sidor inför go-live-beslut — SaaS-prissättning ändras ofta utan förvarning.*
