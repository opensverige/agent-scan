# Behövs AI-synlighetskollen? Eval, 6 november 2026

> Fråga från Gustaf: "Gör en eval om det ens behövs ett sådant här verktyg, senaste 30 dagarna." Underlag: research på webben, Reddit och YouTube för 7 okt till 6 nov 2026, plus vår egen produktionsdata. Bygger vidare på [00-BESLUT.md](00-BESLUT.md), som inte visste det som står här.

## Kort svar

**Nej, Sverige behöver inte ett till verktyg av den här sorten.** Frågan är verklig och het just nu. Men samma verktyg finns redan gratis på svenska. Det som saknas är inte en koll. Det som får uppmärksamhet är **data**: en studie av hur svenska företag syns.

Rekommendation: hoppa över 14-dagarstestet som leadmagnet. Kör istället indexet en gång och publicera det. Får det ingen respons på två veckor, lägg ner agent.opensverige.se enligt planen i 00-BESLUT.

## 1. Efterfrågan finns, men den ägs redan

**Frågan är het i Sverige just nu:**
- Ehandel.se skrev om AI-synlighet minst fem gånger på 30 dagar. Nets, Topdog, Jorge Castro och Dansk Erhverv säger alla åt handlare att testa sig själva.
- ChatGPT-sök är nu ungefär en femtedel av Googles volym (Computer Sweden, 4 nov).
- 50,5 % av svenskarna använde AI för att handla senaste 28 dagarna. Det är Nets egen undersökning.

**Men verktyget finns redan, gratis och på svenska:**

| Verktyg | Vad det gör | Krav |
|---|---|---|
| Klota | ChatGPT + Claude, 3 köpfrågor från Sverige, källor sparade, 17 AI-bottar | E-post |
| Atlas Media | ChatGPT, kundfrågor | E-post |
| Adminor | Gemini, 5 frågor, konkurrenter och källor | E-post, svar inom 24 h |
| Hasty SEO | ChatGPT, 10 frågor i veckan | Konto |
| Dennis GEO | Bara tekniska kontroller | Inget |
| SAIO | Betaltjänst 590–2 990 kr/mån, gratisverktyg utan konto | Inget |

Klota gör nästan exakt det vi gör, och mot två motorer. Vi testar bara en. Internationellt lanseras nya gratiskollar varje vecka: AlchemyLeads 14 okt, AEOFast 4 nov, Prompted Brand 5 nov. Bing och Cloudflare bygger egen förstapartsdata.

**Vem frågar efter det?** Mest byråerna, att döma av det vi hittade. Underlaget är tunt: en tråd i r/smallbusiness (14 okt). Den startades av en byråägare, och småföretagarna svarade skeptiskt. En hade sagt upp sitt betalverktyg som "complete waste of money". Rådet som återkom var att fråga kunden "hur hittade du oss?".

Även Klotas studie (avsnitt 4) kommer från en marknadsföringsbyrå. Kollen och studien är byråernas säljtratt.

## 2. Mätmetoden är svagare än vi trodde

- En användare i r/DoSEO (29 okt) körde 84 köpfrågor två gånger. Bara ungefär en fjärdedel av butikerna kom med i båda svaren. Butiken överst bytte plats i 60–68 % av omkörningarna.
- En kommentar: 20 frågor körda en gång ger ungefär ±20 procentenheters felmarginal.
- En annan i samma tråd hänvisar till en studie: det krävs 30–90 svar per ämne innan listan stabiliseras.
- Vi kör 5 frågor × 2 körningar = 10 svar. Det ligger djupt inne i bruset.
- Samtidigt efterfrågar tråden just det vi gör: "kör samma fråga 20 gånger, säg hur ofta jag kom med och hur mycket det varierade." Trådstartaren menar att ingen säljer det eftersom "6 av 20, plus minus 4" ser dåligt ut i en kundrapport. Ärligheten är vår enda verkliga skillnad, och den säljer inte. Den passar en studie bättre än en leadmagnet.
- Klotas studie av 189 svenska e-handlare (Ehandel.se, 6 nov) fann att llms.txt inte gav fler omnämnanden. Texten på startsidan och rubriker formulerade som kundfrågor spelade störst roll. Det stöder att vi tog bort llms.txt ur bedömningen.
- ChatGPT-klick kom utan referrer 8–15 oktober och gör det delvis fortfarande. En 30-dagarsmätning kan alltså inte lova att den visar trafik.

## 3. Vår egen data

- **Trafik på `/synlighet`: okänd.** Sidan har varit live sedan 5 nov kl. 22 svensk tid. Vercel Web Analytics är inte påslaget, och Vercel sparar bara ett dygns loggar. Loggarna visar inte heller förfrågningar som inte skriver ut något. Vi kan alltså inte mäta första dygnet alls. Det är ett fynd i sig: utan Analytics går inget test att utvärdera.
- **Migration 009 är inte körd.** Tabellerna `visibility_checks` och `visibility_leads` finns inte. Enligt koden (`app/api/synlighet/plan/route.ts`, `lib/visibility/store.ts`) pausas då AI-delen i produktion. Användaren får bara de tekniska kontrollerna och texten "AI-delen av kollen är pausad just nu". Undantaget är om `VISIBILITY_ALLOW_WITHOUT_DB=1` är satt i Vercel.
- **`ANTHROPIC_API_KEY` i Vercel: ej verifierat.** Jag fick inte läsa projektets miljövariabler. 00-BESLUT antar att inget nytt behövs.
- **Gamla scannern:** 14 körningar på 11 domäner senaste 30 dagarna. Det är samma låga nivå som i 00-BESLUT.
- **Syskonprojektet infra.opensverige.se:** 885 sidvisningar på 30 dagar. Communityn kan dra trafik till saker den bryr sig om.

## 4. Det enda som faktiskt fick genomslag

Klotas verktyg fick inte rubriken. Det var deras **studie** som fick den: "Var fjärde mindre e-handlare är osynlig i ChatGPT". Topdogs studie av de 50 största e-handlarna fick också en artikel. Branschpressen skriver om data, inte om verktyg.

Vi har redan en motor för det: `scripts/visibility-index.ts`, och Q1-rapporten visar att vi kan göra rapporter. En studie som Klotas kostar några dollar i API-anrop. Förbehåll: skriptet har aldrig körts mot det riktiga API:et, och det kräver en `ANTHROPIC_API_KEY` lokalt. Räkna med en kväll till för att få det att fungera.

**Om ni gör en studie, välj en vinkel som Klota inte har:**
- Tjänsteföretag istället för e-handel, till exempel redovisningsbyråer, tandläkare, hantverkare, eller svenska SaaS-bolag.
- Visa hur mycket svaren varierar mellan körningarna. Det har ingen svensk aktör gjort, och det är ärligt.
- Publicera alla frågor, svar och källor öppet. Det passar en open source-community och gör studien citerbar.

## 5. Om ni ändå vill behålla kollen

Den har en smal plats: **ingen e-post, ingen byrå bakom, resultatet direkt på skärmen**. De svenska alternativ vi hittade som ställer riktiga frågor till en AI kräver alla e-post eller konto: Klota, Atlas Media, Adminor, Hasty SEO och SAIO:s gratisanalys. Dennis GEO kräver inget men gör bara tekniska kontroller. SAIO har också gratisverktyg utan konto. Vi har inte kunnat se om något av dem ställer AI-frågor. Gör något av dem det, försvinner även den här nischen. Det räcker som ett komplement till studien ("kör samma test på din egen sajt"), inte som en produkt.

Då krävs, i den här ordningen:
1. Kör migration 009 och kontrollera att `ANTHROPIC_API_KEY` finns i Vercel. Utan migrationen är AI-delen pausad. Slå på Web Analytics.
2. Visa källorna först. Det var den stabilaste signalen enligt praktikerna.
3. Ta bort löftet om att 30-dagarsmätningen visar trafik. Lova omnämnanden och källor.
4. Svara på öppen fråga 1 i 00-BESLUT: vad säljer ni till den som lämnar sin e-post? Är svaret "inget", ta bort leadformuläret.

## 6. Beslut

| Alternativ | Kostnad | Bedömning |
|---|---|---|
| Kör 14-dagarstestet som det står i 00-BESLUT | Distribution 2 h/vecka + API | **Avråds.** Klota med flera tar redan leadmagnet-platsen, och ni har inget att sälja än |
| Gör en svensk AI-synlighetsstudie och låt kollen vara ett komplement | 1–2 kvällar + några dollar, kräver API-nyckel lokalt | **Rekommenderas.** Det enda formatet som fick press senaste 30 dagarna |
| Lägg ner agent.opensverige.se nu | Ingen | Rimligt om ingen har tid för studien. Flytta `/verktyg` till opensverige.se först, den har ett eget värde |

**Stoppkriterium för studien:** publicera den inom två veckor. Om den inte ger någon artikel, inga delningar utanför communityn och inga inkommande frågor, lägg ner sajten.

## Källor (alla inom 7 okt till 6 nov 2026 om inget annat sägs)

- Klota-studien, 189 e-handlare: https://www.ehandel.se/var-fjarde-mindre-e-handlare-ar-osynlig-i-chatgpt (6 nov)
- Klotas gratiskoll: https://www.klota.se/analyser/ai-synlighet/ (sidan daterad 2025-11, äldre)
- Topdog, 45 av 50 e-handelsjättar tappar i AI Overviews: https://www.ehandel.se/plotsliga-tvarvandningen-i-google-45-av-50-svenska-e-handelsjattar-tappar (3 nov)
- Nets om AI i köpbeslut: https://www.ehandel.se/insight/nya-siffrorna-ai-tar-plats-i-svenskarnas-kopbeslut (3 nov)
- Castro om sökmarknaden: https://www.ehandel.se/insight/google-svarar-nu-pa-fragorna-om-ditt-varumarke-det-och-tre-andra-skiften-i-sokmarknaden-senaste-manaden (11 okt)
- Computer Sweden om ChatGPT-sök: https://computersweden.se/article/4244501/allt-fler-sokningar-gors-via-chat-gpt-narmar-sig-google.html (4 nov)
- Topdogs jämförelse av GEO-verktyg: https://topdog.nu/sokmotoroptimering/geo-verktyg/ (28 okt)
- Adminor: https://adminor.net/guides/ai-synlighet-chatgpt-test/ (äldre, maj)
- SAIO: https://www.saio.se/
- r/DoSEO om mätmetod: https://www.reddit.com/r/DoSEO/comments/1xisff2/ (29 okt)
- r/smallbusiness: https://www.reddit.com/r/smallbusiness/comments/1x5r1zv/ (14 okt)
- Bing Topics Portfolio: https://www.searchenginejournal.com/bing-webmaster-tools-topics-portfolio-ai-performance/592874/ (14 okt)
- ChatGPT-klick utan referrer: https://www.wislr.com/articles/chatgpt-shop-at-buttons-big-box/ (14–16 okt)
- AEOFast: https://markets.businessinsider.com/news/stocks/aeofast-launches-free-ai-visibility-checker-to-help-businesses-measure-their-presence-in-ai-answers-1036713740 (4 nov)

**Kontrollerat direkt mot källan:** Klota-studien på Ehandel.se, Klotas verktygssida (rapporten mejlas, e-post krävs), r/DoSEO-tråden och SAIO:s startsida. Övriga källor kommer från två research-agenter och är inte lästa en gång till.

**Begränsningar:** X och Reddit-sökningen i 30-dagarsverktyget fungerade inte (saknade nycklar), så Reddit-trådarna kommer från vanlig webbsökning. Google Trends gick inte att nå. Topdogs artikel ligger bakom betalvägg; bara rubrik och ingress lästes. Ingen svensk småföretagardiskussion hittades på Flashback eller r/sweden, vilket kan betyda låg efterfrågan eller att den förs någon annanstans.
