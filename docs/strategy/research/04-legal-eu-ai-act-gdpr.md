# 4. EU AI Act Art. 50 + GDPR — Juridisk Checklista för agent.opensverige.se

> **OBS:** Detta dokument är inte juridisk rådgivning. Det är ett välciterat underlag avsett att ligga till grund för samtal med en dataskyddsjurist eller som internt compliance-stöd. Juridiska bedömningar varierar beroende på faktiska omständigheter.

---

## 4.1 EU AI Act Art. 50 (tillämplig från 2 augusti 2026)

### Exakt lydelse — nyckelmeningar

Art. 50 ingår i Regulation (EU) 2024/1689 ([EUR-Lex CELEX:32024R1689](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689)), publicerad i Official Journal den 12 juli 2024.

**Art. 50(1) — interaktion med naturliga personer:**
> "Providers shall ensure that AI systems intended to interact directly with natural persons are designed and developed in such a way that the natural persons concerned are informed that they are interacting with an AI system, unless this is obvious from the point of view of a natural person who is reasonably well-informed, observant and circumspect, taking into account the circumstances and the context of use."

**Art. 50(2) — maskiningenererat innehåll (gäller providers):**
> "Providers of AI systems, including general-purpose AI systems, generating synthetic audio, image, video or text content, shall ensure that the outputs of the AI system are marked in a machine-readable format and detectable as artificially generated or manipulated."

**Art. 50(4) — text publicerad i allmänt intresse (gäller deployers):**
> "Deployers of an AI system that generates or manipulates text which is published with the purpose of informing the public on matters of public interest shall disclose that the text has been artificially generated or manipulated. This obligation shall not apply where ... the AI-generated content has undergone a process of human review or editorial control and where a natural or legal person holds editorial responsibility for the publication of the content."

**Art. 50(5) — format och timing:**
> "The information referred to in paragraphs 1 to 4 shall be provided to the natural persons concerned in a clear and distinguishable manner at the latest at the time of the first interaction or exposure. The information shall conform to the applicable accessibility requirements."

**Ikraftträdande:** Majoriteten av AI Act — inklusive Chapter IV (Art. 50) — tillämpas från **2 augusti 2026** ([EUR-Lex Art. 113](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689)). Notera: Recital 132–137 ger tolkningskontext.

---

### Tekniska OCH organisatoriska krav (Art. 50)

| Krav | Typ | Vem |
|---|---|---|
| Informera användare om AI-interaktion | Org + teknisk | Provider (design) / Deployer (exponering) |
| Maskinläsbar markering av AI-genererat innehåll | Teknisk | Provider |
| Märkning av deepfakes | Org | Deployer |
| Upplysning om AI-genererad text i allmänt intresse | Org | Deployer |
| Tillgänglighetsanpassning (ETSI EN 301 549) | Teknisk + org | Deployer |
| Intern process för att identifiera AI-text publikationer | Org | Deployer |
| Dokumentation som styrker human review-undantag | Org | Deployer |

---

### Aktörer: deployer vs. provider

- **Provider** = den som sätter ett AI-system på marknaden (Anthropic vad gäller Claude API). Provider har skyldighet att tekniskt märka output i maskinläsbart format (Art. 50(2)).
- **Deployer** = den som tar ett AI-system i bruk för eget ändamål (agent.opensverige.se vad gäller Claude-summaries). Deployer har skyldighet att informera slutanvändare och, om text publiceras i allmänt intresse, att märka innehållet (Art. 50(4)).

**För agent.opensverige.se:** Ni är **deployer**. Anthropic är provider och har det tekniska märkningsansvaret (Art. 50(2)). Ni har ansvaret för Art. 50(4) om era sammanfattningar anses vara publicerade "i allmänt intresse" — se nedan.

---

### Är Implementing Acts / Delegated Acts publicerade?

**Status per april 2026:** Kommissionen publicerade ett **First Draft Code of Practice on Transparency for AI-Generated Content** i december 2025. ([Kirkland & Ellis, februari 2026](https://www.kirkland.com/publications/kirkland-alert/2026/02/illuminating-ai-the-eus-first-draft-code-of-practice-on-transparency-for-ai)). Koden är inte juridiskt bindande förrän den antas som Implementing Act av Kommissionen (Art. 50(7), 56(6)). Plan: andra utkast mars 2026, slutlig version juni 2026. **Inga bindande implementing acts har publicerats per april 2026 — öppen fråga.**

---

### AI Office's 2026-vägledning om disclosure

AI Office driver processen för Code of Practice. Koden innehåller ([Kirkland & Ellis](https://www.kirkland.com/publications/kirkland-alert/2026/02/illuminating-ai-the-eus-first-draft-code-of-practice-on-transparency-for-ai)):

**För deployers av AI-genererad text:**
- Gemensam taxonomi: "Fully AI-generated content" (helt AI-genererat, inga mänskliga inlägg) vs. "AI-assisted content" (mix av människa och AI).
- Krav på synlig, fast disclosure vid första exponering.
- Common icon (gemensam ikon) för deepfakes och textpublikationer.
- Interna processer för att identifiera vilka publikationer som faller in under Art. 50(4).
- Dokumentation om man hävdar undantaget om "human review/editorial control".

---

### Hur appliceras Art. 50 på AI-genererade SAMMANFATTNINGAR (er use case)?

**Frågeställning:** AI-readiness-scannern skapar domän-summaries via Claude. Dessa publiceras via publik API.

**Analys Art. 50(4):**

Art. 50(4) stycke 2 träffar text som (a) genereras av AI, (b) publiceras, (c) *i syfte att informera allmänheten om frågor av allmänintresse*. "Allmänt intresse" är ett högt tröskelbegrepp — normalt nyhetsmedier, offentlig debatt, politisk information.

En teknisk domänscanning-rapport är troligtvis **inte** primärt i "allmänt intresse" i lagens mening — men om ert API används av tredje parter som publicerar findings som konsumentinformation, nyheter eller råd till allmänheten kan gränsen bli otydlig.

**Undantaget för human review:** Om en människa granskar och tar redaktionellt ansvar för varje AI-sammanfattning behöver ni inte märka texten som AI-genererad enligt Art. 50(4). Dokumentera processen. Utan human review är disclosure obligatorisk från 2 aug 2026.

**Praktisk rekommendation:** Lägg in standarddisclosure ("Sammanfattning genererad av AI") på alla API-svar. Kostnaden är låg, risken för böter om ni inte gör det är potentiellt hög.

---

### Maskinläsbar markup — vad räknas?

Enligt Recital 133 och Code of Practice-utkastet gäller ([EUR-Lex Recital 133](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689), [Kirkland & Ellis](https://www.kirkland.com/publications/kirkland-alert/2026/02/illuminating-ai-the-eus-first-draft-code-of-practice-on-transparency-for-ai)):

- **Vattenstämplar** i bild/ljud/video (provider-ansvar)
- **Metadata-inbäddning** — kryptografisk provenance
- **Fingerprints, logging**
- **C2PA** (Coalition for Content Provenance and Authenticity) — nämns inte explicit i lagtext men är den ledande industristandarden; förväntas räknas
- **HTTP-header `x-ai-generated`** — ingen officiell standard ännu; kan komplettera men inte ensamt uppfylla krav
- **`schema.org/CreativeWork.creditText`** — ingen officiell status; kan vara del av en multilager-lösning

**Vem ansvarar för teknisk märkning?** Provider (Anthropic) per Art. 50(2). Som deployer måste ni säkerställa att märkningarna inte tas bort och att ni vidarebefordrar dem i API-svaren. Komplettera med perceptibel mänskligt läsbar märkning i UI/API-dokumentation.

**Öppen fråga:** Exakt vilka tekniska standarder som "räknas" fastställs i den Code of Practice som inte är klar per april 2026.

---

### Sanktioner och tillsynsmyndighet i Sverige

**Tillsynsmyndighet:**
- Enligt SOU 2025:101 (oktober 2025) föreslås **PTS (Post- och telestyrelsen)** som övergripande koordinerande marknadskontrollmyndighet och nationell kontaktpunkt under AI Act. ([Setterwalls, november 2025](https://setterwalls.se/artikel/a-brief-update-on-swedens-adaptations-to-the-ai-act-sou-2025101/))
- **IMY** (Integritetsskyddsmyndigheten) får utökat anslag 2026 för AI Act-uppgifter, inklusive tillsyn av AI-system i brottsbekämpning. ([IMY, februari 2026](https://www.imy.se/en/news/imys-prioriteringar-2026--ai-barn-och-brottsbekampning/); [The Legal Wire, april 2026](https://thelegalwire.ai/swedens-privacy-watchdog-to-receive-budget-increase-for-ai-act-duties/))
- Kompletterande svensk lag föreslås träda i kraft 2 aug 2026. Formellt beslut ej fattat per april 2026 — **öppen fråga**.
- **AI Office** (EU-nivå) har direkt tillsynsbehörighet för GPAI-modeller (t.ex. Claude) men inte för deployers som er.

**Sanktioner (Art. 99 AI Act):**
- Brott mot Art. 50: upp till **15 miljoner EUR** eller **3 % av global omsättning** (det högre beloppet).
- Vilseledande myndigheter: upp till 7,5 milj EUR / 1 %.

---

## 4.2 GDPR — Controller/processor-kedja för API

### När API-konsumenten hämtar scan-resultat — controller eller joint controller?

**Utgångspunkt:** Ni (agent.opensverige.se) är **controller** för den initiala scanningen och lagringen av scan-resultat (domän + findings + AI-sammanfattning).

**Scenario: API-konsument hämtar data via publik API:**

| Scenario | Bedömning |
|---|---|
| API-konsumenten tar emot data och processar den för egna ändamål (t.ex. aggregerar till egna tjänster) | API-konsumenten är separat, **självständig controller** (Art. 4(7) GDPR). Ingen joint controllership förutsatt att ni inte gemensamt bestämmer ändamål. |
| Ni och API-konsumenten gemensamt definierar ändamål och medel (t.ex. gemensam produkt) | **Joint controllers** (Art. 26 GDPR). Kräver skriftlig arrangement som klargör respektive ansvar. |
| API-konsumenten processar data *enbart på ert uppdrag* och ni styr ändamål och medel | API-konsumenten som **processor** (Art. 4(8)); kräver DPA (Art. 28). |

**Sannolikt för en publik API:** API-konsumenter är normalt separata controllers. De väljer fritt hur de använder data. Ni styr ej ändamålet för deras bearbetning. Ni behöver **inte** DPA med dem, men ert API bör ha tydliga **Terms of Service och Acceptable Use Policy** som klargör vad data får användas till. ([GDPR Art. 26](https://gdpr-info.eu/art-26-gdpr/))

---

### Laglig grund: Art. 6.1.f (LI) vs. Art. 6.1.b (avtal)

| Grund | När den är tillämplig | För er use case |
|---|---|---|
| **Art. 6.1.b** — avtal | Behandling nödvändig för att fullgöra avtal med den registrerade | Inte tillämplig — ni har inget avtal med domänägare vars IP-adress ni loggar |
| **Art. 6.1.f** — legitimt intresse | Er behandling baseras på ert eller tredje parts legitima intresse, förutsatt att det inte åsidosätts av den registrerades intressen | **Mest tillämplig** — säkerhetssyfte, teknisk analys, API-tjänst |

**Legitimt intresse-analys (LIA):** Ni behöver dokumentera en trestegsanalys ([ICO, 2026](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/legitimate-interests/how-do-we-apply-legitimate-interests-in-practice/)):
1. **Syftetest:** Är ert intresse legitimt? (Säkerhetsskanning av offentliga webbplatser — sannolikt ja)
2. **Nödvändighetstest:** Är behandlingen nödvändig? (Hashning av IP reducerar, men ersätter inte nödvändighetsprövningen)
3. **Balanseringstest:** Väger era intressen tyngre än den registrerades? (Offentliga domäner — lägre förväntan på integritet; men enskild frilanser med portfolio — högre risk)

EDPB (Guidelines 01/2025) bekräftar att pseudonymisering kan stärka LI-grunden men inte automatiskt uppfylla den. ([EDPB, januari 2025](https://www.edpb.europa.eu/news/news/2025/edpb-adopts-pseudonymisation-guidelines-and-paves-way-improve-cooperation_en))

---

### Art. 13/14 — kan vi luta oss på "indirect collection"?

Scan av offentliga webbplatser innebär **indirekt insamling** — personuppgifter hämtas inte från den registrerade. Art. 14 GDPR gäller.

**Art. 14(5)(b)-undantaget:** Informationsskyldigheten gäller inte om den "visar sig vara omöjlig eller skulle kräva en oproportionerlig ansträngning". Tröskeln är **hög** — myndigheter och domstolar tolkar den restriktivt. ([EDPB SME guide](https://www.edpb.europa.eu/sme-data-protection-guide/respect-individuals-rights_en))

**Praktisk lösning:** Publik privacy policy som:
- Listar ändamål med scanning
- Anger Art. 6.1.f som rättslig grund
- Anger lagringsprinciper (hashad IP, retentionstid)
- Anger kontaktväg för rättighetsutövning

Detta uppfyller informationsskyldigheten enligt Art. 14 utan att ni måste kontakta varje domänägare individuellt.

---

### Skyldigheter när API-konsument processar vidare

Om API-konsumenten är separat controller har **ni** fullgjort ert ansvar när ni (a) lämnat privacy-information, (b) dokumenterat LI-grunden, (c) infört lämpliga ToS/AUP. API-konsumenten är ansvarig för sin egen compliance. Ni bör ändå:

- Förbjuda vidarebehandling för ändamål oförenliga med ursprungsändamålet (ToS-klausul)
- Förbjuda re-identifiering av hashade IP-adresser
- Informera API-konsumenter om att data kan innehålla personuppgifter (om hashad IP är personuppgift — se 4.3)

---

## 4.3 Hashad IP & pseudonymisering — Breyer-doktrinen

### Breyer-domens essens (CJEU C-582/14, 19 oktober 2016)

CJEU fastslog att **dynamiska IP-adresser utgör personuppgifter** för en webboperatör om denne har *rättsliga medel* att hos ISP kunna identifiera besökaren — även om ISP är en separat part. Nyckelkriterium: "alla medel som rimligen sannolikt används" för identifiering. ([CCDCOE analys av C-582/14](https://ccdcoe.org/incyder-articles/cjeu-determines-dynamic-ip-addresses-can-be-personal-data-but-can-also-be-processed-for-operability-purposes/))

### Senare praxis — SRB v EDPS (T-557/20 och C-413/23, 2023/2025)

**T-557/20 (General Court, april 2023):** General Court ogiltigförklarade EDPS beslut och argumenterade att pseudonymiserade data inte nödvändigtvis är personuppgifter *hos mottagaren* om mottagaren saknar identifieringsnyckel.

**C-413/23 P (CJEU, 4 september 2025):** CJEU upphävde General Court och fastslog:
- Pseudonymiserade data är **inte i alla fall** personuppgifter (avvisade EDPS absolutistiska position)
- Men: huruvida pseudonymiserade data är personuppgifter beror på *omständigheterna i det enskilda fallet* — särskilt om mottagaren rimligen kan identifiera individen
- **Avgörande insikt:** SRBs informationsplikt gällde *oavsett* om datan i mottagarens händer var personuppgifter — skyldigheten bedöms från controllerens perspektiv *vid insamlingstillfället*
([Inside Privacy, september 2025](https://www.insideprivacy.com/eu-data-protection/eu-court-of-justice-clarifies-the-concept-of-personal-data-in-the-context-of-a-transfer-of-pseudonymized-data-to-third-parties/); [pdpEcho, december 2025](https://pdpecho.com/2025/12/08/a-deep-dive-into-the-consequential-srb-judgments-between-personal-impersonal-anonymous-and-pseudonymous-data/))

---

### Är hashad IP fortfarande personuppgift **hos er**?

**Svar: Ja, sannolikt.**

Ni lagrar *hashen* och ni *har* den ursprungliga IP-adressen (eller kan reproducera hashen). Ni äger "additional information" (hashfunktionen, eventuellt salt). Enligt EDPB Guidelines 01/2025 är pseudonymiserade data personuppgifter hos den part som håller den kompletterande informationen. ([EDPB, januari 2025](https://www.edpb.europa.eu/news/news/2025/edpb-adopts-pseudonymisation-guidelines-and-paves-way-improve-cooperation_en))

Artikel 29-arbetsgruppens Opinion 05/2014 bekräftar: hashning pseudonymiserar men anonymiserar inte. ([TermsFeed, 2026](https://www.termsfeed.com/blog/privacy-data-hashing/))

---

### Är samma data personuppgift hos API-konsumenten?

**Beror på.** Enligt SRB II (C-413/23) är det en omständighetsbaserad bedömning. En API-konsument som:
- Inte har tillgång till saltet/hashfunktionen — lägre risk att datan är personuppgift *för dem*
- Men som kombinerar hashad IP med egna loggar, sessionscookies eller annan identifieringsdata — kan ha "means reasonably likely to be used" och datan blir personuppgift även för dem

Ni kan inte garantera vad API-konsumenten gör med datan. Ur riskperspektiv: **behandla hashad IP som personuppgift i all kommunikation om er API**.

---

### Vad rekommenderas för "near-anonymization"?

| Teknik | Effekt | Anmärkning |
|---|---|---|
| **Enkel hashing (SHA-256)** | Pseudonymisering, ej anonymisering | Rainbow tables möjliga utan salt |
| **Salted hashing** | Bättre — förhindrar rainbow tables | Saltet måste skyddas |
| **Peppered hashing (salt + pepper)** | Ännu starkare — pepper lagras separat | Bäst praxis för IP-lagring |
| **k-anonymitet** | Garanterar att data inte kan kopplas till < k individer | Kräver datamodellering; komplex för IP |
| **Rate-throttling på API** | Hindrar re-identifiering genom mönsterinsamling | Komplement, ej ersättning för anonymisering |
| **IP-trunkering** (sista oktetten nollad) | Partiell pseudonymisering | Inte tillräckligt ensamt |
| **Differential privacy** | Statistisk garanti för anonymitet | Komplex implementation |

**Praktisk rekommendation:** Använd HMAC-SHA256 med dedikerat pepper (hårdkodad nyckel utanför databas) + unikt salt per request. Lagra aldrig klar-text IP. Implementera automatisk radering efter definierad retentionstid (t.ex. 90 dagar).

---

### Praktisk slutsats: behandla som personuppgift i alla fall

**Rekommendation: Ja.** Kostnaden för att behandla hashad IP som personuppgift är marginell. Risken för att fel på att inte göra det är böter upp till 4 % av global omsättning (GDPR Art. 83(4)). Förhåll er till principerna i Art. 5 GDPR — ändamålsbegränsning, lagringsminimering, integritet och konfidentialitet.

---

## 4.4 Sub-processor-disclosure & DPA

### Behövs DPA med API-konsumenter?

**Nej, som regel inte** — om API-konsumenter är separata, självständiga controllers (se 4.2). DPA krävs enbart om de processar data *på ert uppdrag* och ni styr ändamålet. För publik API: API-konsumenter agerar för egna ändamål → ej processor → ej DPA. Reglera relationen i **ToS + AUP** istället.

---

### Standardklausuler: SCC EU 2021/914

För era egna processorrelationer (med Anthropic, Vercel, Supabase, Cloudflare) används EU-kommissionens standardavtalsklausuler (SCC) i beslut 2021/914 ([EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021D0914)). SCC 2021 ersätter 2001- och 2010-versionerna. Relevanta moduler:

- **Modul 1:** Controller-to-controller (t.ex. om Anthropic är medcontroller)
- **Modul 2:** Controller-to-processor (er→Anthropic/Vercel/Supabase för API-processing)
- **Modul 3:** Processor-to-subprocessor (Anthropic→sina underleverantörer)

---

### Subprocessor-listan

| Subprocessor | Tjänst | Dataplacering | DPF-certifierad | DPA |
|---|---|---|---|---|
| **Anthropic** | Claude API (AI-text) | USA (Microsoft Azure) | Okänt per april 2026* | Ja — DPA tillgänglig på trust.anthropic.com ([Anthropic Trust Center](https://trust.anthropic.com)) |
| **Vercel** | Hosting/edge | USA (+ EU-edge) | **Ja** ([Vercel DPF](https://vercel.com/kb/guide/is-vercel-certified-under-dpf)) | Ja — i ToS |
| **Supabase** | Databas | AWS eu-west-1 möjligt | Ej explicit DPF; erbjuder DPA + TIA ([Supabase DPA](https://supabase.com/legal/dpa)) | Ja — dashboard |
| **Cloudflare** | CDN/WAF | Globalt, EU-noder | **Ja** — DPF certifierad t.o.m. 23 sep 2026 ([Cloudflare DPF](https://www.dataprivacyframework.gov/participant/5666)) | Ja — standardavtal |
| **Microsoft Azure** | Anthropics molninfrastruktur | USA | **Ja** ([AWS/Azure DPF](https://aws.amazon.com/compliance/eu-us-data-privacy-framework/)) | Ja |

*Anthropic nämner SCC för EU-transfers men DPF-certifiering är inte bekräftad på trust.anthropic.com per april 2026. Verifiera direkt på [dataprivacyframework.gov](https://www.dataprivacyframework.gov/list). Om ej certifierat: SCC modul 2 + TIA krävs.

---

### Notification-krav vid byte av subprocessor

Ni måste klausula er DPA med Anthropic (Art. 28(2) GDPR) om att Anthropic ska meddela er innan nya subprocessorer engageras. Ni ska i sin tur meddela era API-konsumenter om ni ändrar er subprocessorlista (om de är processorer till er — men det är de normalt inte).

**Rekommendation:** Publicera en publik subprocessorlista på er webbplats. Notifiera API-konsumenter (via e-post eller changelog) vid ändringar, med minst 30 dagars förhandsvarsel.

---

## 4.5 Schrems III / Data Privacy Framework — status 2026

### DPF-status per april 2026

EU-US Data Privacy Framework (DPF) antogs av EU-kommissionen 10 juli 2023 ([EU-US DPF](https://www.data-privacy-framework.com)). Den juridiska statusen är:

- **3 september 2025:** EU General Court avslog Philippe Latombe's ogiltighetstalan mot DPF-adekvansbeslut. Domen fastslår att USA ger en "väsentligt likvärdig" skyddsnivå. ([Baker Botts, september 2025](https://www.bakerbotts.com/thought-leadership/publications/2025/september/european-general-court-confirms-validity-of-the-eu-us-data-privacy-framework); [Jones Day](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework))
- Latombe hade möjlighet att överklaga till CJEU (frist ca mitten november 2025). Inget offentligt bekräftat överklagande per april 2026.
- NOYB (Max Schrems) har signalerat att de *planerar* en bredare utmaning ("Schrems III") med fokus på Trump-administrationens verkställighetsordrar och DOGE-åtkomst. ([Freshfields, september 2025](https://www.freshfields.com/en-us/our-thinking/blogs/technology-quotient/eu-us-data-privacy-framework-survives-its-first-judicial-challenge-but-more-are-102l4m1))
- **DPF är gällande april 2026** men med osäker juridisk framtid. Räkna med turbulens 2026–2027.

---

### Vad innebär det för Anthropic API-anrop från Sverige?

Anthropic processar data i USA (Microsoft Azure). Transfermekanism:

1. **Om Anthropic är DPF-certifierat:** Transferen är laglig utan ytterligare åtgärder.
2. **Om Anthropic ej är DPF-certifierat (troligast per april 2026):** Transfer måste ske via **SCC Modul 2** (controller-to-processor, er→Anthropic).
3. Oavsett: ni bör genomföra en **Transfer Impact Assessment (TIA)** för att dokumentera riskbedömningen per EDPB Recommendations 01/2020.

---

### Riskhantering: TIA och supplementary measures

En TIA ska besvara: kan US-myndigheter få åtkomst till Anthropic-processad data som skadar EU-registrerades rättigheter?

Relevanta supplementary measures ([EDPB Rec. 01/2020](https://www.edpb.europa.eu/our-work-tools/our-documents/recommendations/recommendations-012020-measures-supplement-transfer_en)):
- Kryptering där ni håller nycklar (server-side kryptering, end-to-end)
- Pseudonymisering innan data skickas till Anthropic (er hashade IP skickas aldrig till Anthropic om ni designar rätt)
- Minimera mängden personuppgifter i API-prompts — skicka *domändata*, inte IP

---

### EU-baserad inferens — alternativ till Anthropic direkt?

| Alternativ | EU-hosting | Anmärkning |
|---|---|---|
| **AWS Bedrock i Frankfurt (Claude)** | Ja — EU-region | Data stannar i EU; AWS DPF-certifierat; separat DPA |
| **Mistral AI (Le Chat / API)** | Ja — Frankrike | EU-bolag, ingen US-transfer risk |
| **Anthropic direkt** | Nej — USA | Kräver SCC + TIA; DPF-osäkerhet |
| **Azure OpenAI EU** | Ja — EU-region | Microsoft har EU Data Boundary |

**Praktisk rekommendation:** För lägsta juridisk risk, använd Claude via Amazon Bedrock i eu-central-1 (Frankfurt) eller Mistral. Noteras: Anthropic via Microsoft 365/Azure är explicit **exkluderat från EU Data Boundary** per april 2026 ([Microsoft Learn, april 2026](https://learn.microsoft.com/en-us/microsoft-365/copilot/connect-to-ai-subprocessor)).

---

## 4.6 GDPR Art. 22 — Automated decision-making

### När triggas Art. 22?

Art. 22(1) GDPR förbjuder beslut som (a) grundar sig **enbart på automatiserad behandling**, (b) **producerar rättsliga eller liknande väsentliga effekter** för den registrerade. ([GDPR Art. 22](https://gdpr-text.com/read/article-22/))

Tre kumulativa villkor måste alla vara uppfyllda:
1. Beslut
2. Enbart automatiserat (ingen meningsfull mänsklig granskning)
3. Rättsliga effekter eller liknande väsentliga effekter

---

### Är scan av offentlig webbplats utan persondata triggat alls?

**Vanligtvis nej**, om ni scannar *domänen* och inte *personen bakom domänen*. Om scanning producerar:
- Tekniska findings om webbplatsens säkerhetsstatus → **inte ADM** (effekten drabbar inte en fysisk person direkt)
- En "säkerhetspoäng" om en juridisk persons webbplats → **inte ADM** (juridiska personer skyddas inte av Art. 22)

---

### Vad gäller om "röd badge" sätts på en frilansar's portfolio (fysisk person)?

**Här triggas Art. 22 potentiellt.** En röd badge/låg poäng som:
- Publiceras offentligt
- Kan påverka frilansarens affärsmöjligheter (kunder ser och väljer bort)
- Baseras enbart på automatiserad scanning

...kan anses ha en "liknande väsentlig effekt" som påverkar den fysiska personens ekonomiska intressen. EDPB:s riktlinjer är tydliga: effekten behöver inte vara rättslig, men måste vara mer än trivial. ([GDPR Local ADM-analys, 2025](https://gdprlocal.com/automated-decision-making-gdpr/))

**Riskhantering:**
- Lägg till möjlighet för domänägare att begära mänsklig granskning av badge-bedömning
- Ange scoring-logiken öppet (vad triggar röd/grön/gul)
- Inkludera kontaktväg för att bestrida poäng
- Lägg till disclaimer att poäng är automatiserad analys av teknisk tillgänglighet, inte omdöme om person

---

### Krav: meaningful information, rätt till mänsklig granskning, transparens om logic

Om Art. 22 triggas gäller (Art. 22(3), Recital 71):
- Rätt att **involvera en människa** i beslutet
- Rätt att **framföra sin ståndpunkt**
- Rätt att **bestrida beslutet**
- Tillgång till **meningsfull information om logiken** bakom beslutet

---

### Hur exponera scoring-logik för transparenskrav

Konkret: Publicera en "How We Score"-sida som förklarar:
- Vilka tekniska parametrar som mäts (HTTP-headers, SSL, robots.txt, cookie-consent, accessibility)
- Hur poängen viktas
- Vad röd/gul/grön innebär
- Hur man begär omprövning (kontaktformulär eller API-endpoint `/challenge/{domain}`)

---

## 4.7 Övriga svenska/EU-aspekter

### LEK / EECC — e-privacy

Lagen om elektronisk kommunikation (LEK, 2022:482, implementerar EECC) reglerar traditionella kommunikationstjänster. Gäller troligtvis **inte direkt** för en API-tjänst som scannar domäner. Om ni däremot lagrar cookies hos besökare eller skickar marknadsföring via e-post tillkommer ePrivacy-skyldigheter. **Ej kritisk för initial launch.**

ePrivacy-förordningen (EPR) är fortfarande under förhandling per 2026 och har inte antagits.

---

### IMY's senaste uttalanden om AI

- **September 2025:** IMY medverkade i gemensamt uttalande från 20 dataskyddsmyndigheter om integritetsvänlig AI-utveckling. Betonade: klarläggande av rättsliga förutsättningar, regulatoriska sandlådor, samarbete med konsument- och konkurrensrättsmyndigheter. ([IMY, september 2025](https://www.imy.se/nyheter/gemensamt-uttalande-fran-20-dataskyddsmyndigheter-om-utvecklingen-av-integritetsvanlig-ai/))
- **Prioriteringar 2026:** IMY fokuserar på AI i offentlig sektor, barn/unga och brottsbekämpning. Privata AI-tjänster är inte primärt fokus 2026 — men det kan ändras. ([IMY, februari 2026](https://www.imy.se/en/news/imys-prioriteringar-2026--ai-barn-och-brottsbekampning/))
- IMY tar emot klagomål och utövar tillsyn — ha privacy-kontaktväg tydlig.

---

### DSA (Digital Services Act) — gäller oss?

DSA (Regulation (EU) 2022/2065) tillämpas sedan 17 februari 2024. Den reglerar **förmedlingstjänster** — hosting, onlineplattformar, sökmotorer. ([Mediemyndigheten](https://mediemyndigheten.se/europeiska-regleringar/dsa-eus-forordning-om-en-inre-marknad-for-digitala-tjanster/))

- **En publik API som exponerar scan-data** är en hosting service / intermediary i vid mening.
- **Grundläggande skyldigheter (alla storlekar):** kontaktpunkt, samarbete med myndigheter, transparensrapport om innehållsmoderation.
- **Betungande DSA-skyldigheter (VLOP/VLOSE):** gäller bara om ni har >45 miljoner månadsaktiva EU-användare. Ej relevant för er i initial launch.
- **PTS är Digital Service Coordinator (DSC) i Sverige.** ([PTS DSA](https://pts.se/internet-och-telefoni/dsa-forordningen---regler-om-digitala-tjanster-for-en-sakrare-onlinemiljo/))
- **Rekommendation:** Publicera kontaktinformation till PTS-krav, ha enkel mekanism för att rapportera olagligt innehåll (om ni tillåter användarinnehåll). Om ni bara exponerar scan-data utan UGC: minimal DSA-exponering.

---

### NIS2 — kritisk infrastruktur?

Sverige implementerade NIS2 via **Cybersäkerhetslagen** (11 december 2025, i kraft 15 januari 2026). ([Eversheds Sutherland, 2025](https://ezine.eversheds-sutherland.com/eu-nis2-directive/sweden))

**Gäller NIS2 er?** NIS2 gäller generellt bolag med minst 50 anställda eller omsättning >10 miljoner EUR i sektorer som digital infrastruktur, hälsa, energi, etc. Undantag för mikroföretag (< 10 anst, < 2 milj EUR).

- En startup AI-scanner kvalificerar troligen **inte** som "essential entity" eller "important entity" under NIS2 initialt.
- Om ni klassificeras som **DNS-resolving provider, TLD-registrar eller cloud-leverantör** kan NIS2 bli aktuellt — men det är inte er situation.
- **Rekommendation:** Dokumentera er NIS2-scoping-analys. Troligtvis ej tillämplig men håll koll om ni skalerar.

---

### Bolagsform & ansvar

| Form | Böter | Personligt ansvar |
|---|---|---|
| **Enskild firma** | GDPR-böter träffar ägaren personligt | Fullt personligt ansvar |
| **Aktiebolag (AB)** | Böter åläggs bolaget; personligt ansvar begränsat | VD/styrelse kan hållas ansvariga för bristande compliance-åtgärder |

**Rekommendation:** Driva via AB. Separerar personlig ekonomi från GDPR-böter (upp till 20 milj EUR för smaller violations) och AI Act-böter.

---

### Försäkring (cyber, professionell ansvar)

- **Cyberförsäkring:** Täcker dataintrång, ansvarskrav relaterade till personuppgiftsincidenter, kostnader för myndighetskontakt. Relevant för GDPR-exponering.
- **Professionell ansvarsförsäkring (PI):** Täcker skadeståndskrav från API-konsumenter som lider skada av felaktiga scan-resultat.
- **Rekommendation:** Teckna cyber + PI-försäkring innan publik launch. Klargör med försäkringsbolaget att AI-genererat innehåll täcks.

---

## 4.8 CHECKLISTA — must-haves före publik API-launch

### Tekniska kontroller

- [ ] Hashad IP implementeras med HMAC-SHA256 + pepper (pepper lagras separat från databas)
- [ ] Klar-text IP lagras aldrig i databas
- [ ] Automatisk radering av scan-data efter definierad retentionstid (max 90 dagar rekommenderas)
- [ ] TLS 1.2+ på alla API-endpoints (transit-säkerhet)
- [ ] AES-256 kryptering at rest (Supabase-inställning)
- [ ] AI-genererade sammanfattningar märks maskinläsbart i API-response (header eller JSON-fält: `"ai_generated": true`)
- [ ] Perceptibel disclosure i API-dokumentation och UI: "Sammanfattning genererad av Claude (Anthropic)"
- [ ] Rate-limiting på API för att förhindra bulk re-identifiering
- [ ] Loggning av API-åtkomst (vem anropar, vilken domän) med begränsad retentionsperiod
- [ ] Intrångsdetektering / alerting vid anomala åtkomstmönster

### Avtalsmallar

- [ ] **Terms of Service (ToS)** — inkl. förbud mot re-identifiering, ADM-restriktioner, tillåtna ändamål
- [ ] **Acceptable Use Policy (AUP)** — vad API-konsumenter inte får göra (bulk-skanning i konkurrenssyfte, profilbygge av individer)
- [ ] **DPA med Anthropic** — verifiera att Anthropic DPA (https://trust.anthropic.com) är signerat/inkorporerat
- [ ] **DPA med Vercel** — inkorporerat i deras ToS; verifiera aktuell version
- [ ] **DPA med Supabase** — signera via Supabase dashboard
- [ ] **DPA med Cloudflare** — inkorporerat i standardavtal; verifiera

### Policy-sidor (publika)

- [ ] **Privacy Policy** — Art. 13/14 GDPR-information, controller-identitet, ändamål, laglig grund (LI), retentionstid, rättigheter
- [ ] **AI Disclosure** — "Denna tjänst använder Claude (Anthropic) för att generera sammanfattningar. All AI-genererad text är märkt."
- [ ] **Cookie Policy** — om ni sätter cookies (även analytics)
- [ ] **Subprocessor-lista** — publik lista med Anthropic, Vercel, Supabase, Cloudflare (uppdateras vid ändringar)
- [ ] **"How We Score" / Scoring-transparens** — förklaring av badge-logik (Art. 22-krav)

### Subprocessor-lista publik

- [ ] Publicerad på webbplatsen (t.ex. `/legal/subprocessors`)
- [ ] Versionshanterad med datum för senaste uppdatering
- [ ] Notifieringsprocess dokumenterad (vad händer när subprocessor byts)

### Loggning & audit

- [ ] Logg över alla DSAR (Data Subject Access Requests) och svar
- [ ] Logg över API-nyckel-utfärdande och återkallelse
- [ ] Audit trail av scan-körningar (domän + tidstämpel; ej IP i klar text)
- [ ] Logg över subprocessor-ändringar
- [ ] GDPR Art. 30: Register of Processing Activities (RoPA) dokumenterat internt

### Rättigheter (rätt till radering, opt-out av scanning)

- [ ] Kontaktformulär eller API-endpoint för DSAR (access, rättelse, radering, invändning)
- [ ] Process för att hantera radering av hashad IP (kräver att ni kan söka på hash)
- [ ] **Opt-out av scanning:** Respektera `robots.txt` (`User-agent: *; Disallow: /`) som signal — dokumentera er policy
- [ ] `/.well-known/security.txt` (RFC 9116) — kontaktinfo för säkerhetsrapporter
- [ ] Svarstid för DSAR: max 30 dagar (Art. 12(3) GDPR), förlängning möjlig till 90 dagar med motivering

### Incident response-plan

- [ ] Skriftlig incident response-plan som identifierar roller och eskaleringsvägar
- [ ] 72-timmarsregel: IMY måste notifieras vid personuppgiftsincident inom 72 timmar (Art. 33 GDPR)
- [ ] Mall för notifiering av registrerade (Art. 34 GDPR) om incidenten är allvarlig
- [ ] Kontaktinfo till IMY ([imy.se](https://www.imy.se)) och till Anthropic/Vercel/Supabase/Cloudflare DPA-kontakter
- [ ] Cybersäkerhetsförsäkring — verifiera att policy täcker AI-incident

### Sanktionslista-screening (om B2B)

- [ ] Om ni erbjuder betalda API-nycklar till företag: screeningprocess mot EU-sanktionslistor (EU Consolidated Sanctions List via [sanctionsmap.eu](https://www.sanctionsmap.eu))
- [ ] KYC-process för API-nyckel-ansökan om B2B (namn, org.nr, use case)
- [ ] Klausul i ToS som ger er rätt att avsluta konton vid sanktionsträff

---

## 4.9 Öppna frågor (per april 2026)

| Fråga | Status |
|---|---|
| AI Act Art. 50 Implementing Act / Code of Practice | Utkast publicerat dec 2025; slutlig version förväntad juni 2026 |
| Sveriges nationella AI Act-kompletteringslagstiftning | SOU 2025:101 publicerad; proposition ej beslutad |
| PTS formellt utsedd till AI Act MSA | Föreslagen, ej beslutad |
| Anthropic DPF-certifiering | Ej bekräftad på dataprivacyframework.gov per april 2026 — **verifiera** |
| NOYB Schrems III-talan | Planerad men ej inledd per april 2026 |
| EDPB Guidelines 01/2025 pseudonymisering — slutversion | Konsultation avslutad feb 2025; slutlig version ej publicerad |

---

## 4.10 Källor

| Dokument | URL | Datum |
|---|---|---|
| EU AI Act (Regulation 2024/1689) | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689 | 2024-07-12 |
| EU AI Act Art. 50 kommentar (aiactblog.nl) | https://www.aiactblog.nl/en/ai-act/artikel/50 | – |
| First Draft Code of Practice on Transparency for AI (Kirkland) | https://www.kirkland.com/publications/kirkland-alert/2026/02/illuminating-ai-the-eus-first-draft-code-of-practice-on-transparency-for-ai | 2026-02-17 |
| EDPB Guidelines 01/2025 Pseudonymisation | https://www.edpb.europa.eu/news/news/2025/edpb-adopts-pseudonymisation-guidelines-and-paves-way-improve-cooperation_en | 2025-01-17 |
| CJEU Breyer C-582/14 | https://ccdcoe.org/incyder-articles/cjeu-determines-dynamic-ip-addresses-can-be-personal-data-but-can-also-be-processed-for-operability-purposes/ | 2016-10-19 |
| CJEU SRB II C-413/23 (Inside Privacy) | https://www.insideprivacy.com/eu-data-protection/eu-court-of-justice-clarifies-the-concept-of-personal-data-in-the-context-of-a-transfer-of-pseudonymized-data-to-third-parties/ | 2025-09-04 |
| SRB analys pdpEcho | https://pdpecho.com/2025/12/08/a-deep-dive-into-the-consequential-srb-judgments-between-personal-impersonal-anonymous-and-pseudonymous-data/ | 2025-12-08 |
| EU-US DPF General Court dom (Baker Botts) | https://www.bakerbotts.com/thought-leadership/publications/2025/september/european-general-court-confirms-validity-of-the-eu-us-data-privacy-framework | 2025-09-23 |
| DPF Freshfields analys | https://www.freshfields.com/en-us/our-thinking/blogs/technology-quotient/eu-us-data-privacy-framework-survives-its-first-judicial-challenge-but-more-are-102l4m1 | 2025-09-11 |
| IMY prioriteringar 2026 | https://www.imy.se/en/news/imys-prioriteringar-2026--ai-barn-och-brottsbekampning/ | 2026-02-23 |
| IMY gemensamt AI-uttalande | https://www.imy.se/nyheter/gemensamt-uttalande-fran-20-dataskyddsmyndigheter-om-utvecklingen-av-integritetsvanlig-ai/ | 2025-09-24 |
| SOU 2025:101 AI Act Sverige (Setterwalls) | https://setterwalls.se/artikel/a-brief-update-on-swedens-adaptations-to-the-ai-act-sou-2025101/ | 2025-11-24 |
| IMY budget AI Act (The Legal Wire) | https://thelegalwire.ai/swedens-privacy-watchdog-to-receive-budget-increase-for-ai-act-duties/ | 2026-04-13 |
| Anthropic Trust Center | https://trust.anthropic.com | 2026-04 |
| Anthropic som Microsoft-subprocessor (EU exclusion) | https://learn.microsoft.com/en-us/microsoft-365/copilot/connect-to-ai-subprocessor | 2026-04-22 |
| Vercel DPF-certifiering | https://vercel.com/kb/guide/is-vercel-certified-under-dpf | 2025-11-10 |
| Supabase DPA | https://supabase.com/legal/dpa | – |
| Cloudflare DPF (dataprivacyframework.gov) | https://www.dataprivacyframework.gov/participant/5666 | – |
| Cloudflare GDPR Trust Hub | https://www.cloudflare.com/trust-hub/gdpr/ | – |
| Sverige NIS2 / Cybersäkerhetslagen (Eversheds) | https://ezine.eversheds-sutherland.com/eu-nis2-directive/sweden | 2025-12-11 |
| Sverige DSA (Mediemyndigheten) | https://mediemyndigheten.se/europeiska-regleringar/dsa-eus-forordning-om-en-inre-marknad-for-digitala-tjanster/ | – |
| PTS DSA | https://pts.se/internet-och-telefoni/dsa-forordningen---regler-om-digitala-tjanster-for-en-sakrare-onlinemiljo/ | 2025-02-14 |
| GDPR Art. 22 (gdpr-text.com) | https://gdpr-text.com/read/article-22/ | – |
| GDPR Art. 26 joint controllers | https://gdpr-info.eu/art-26-gdpr/ | – |
| EU SCC 2021/914 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021D0914 | 2021 |
| ICO LIA-guide | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/legitimate-interests/how-do-we-apply-legitimate-interests-in-practice/ | 2026-01-08 |
| Hashing och personuppgifter (TermsFeed) | https://www.termsfeed.com/blog/privacy-data-hashing/ | 2026-04-21 |
| EDPB pseudonymisation advice (Hunton) | https://www.hunton.com/insights/publications/edpb-advises-on-pseudonymisation-for-gdpr-compliance | 2025-06-05 |
