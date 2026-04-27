// lib/i18n.ts
export type Lang = "sv" | "en";

export const I18N = {
  sv: {
    langToggle: "EN",

    nav: {
      discord: "🇸🇪 300+ builders →",
    },

    scanner: {
      headline: "Hur agent-redo är din sajt?",
      subtext: "Vi visar vad AI-agenter ser — och vad som stoppar dem.",
      placeholder: "dittforetag.se",
      ariaLabel: "Domännamn att scanna",
      scanBtn: "Scanna →",
      whyHeading: "Agenter handlar redan. Syns du?",
      whyText:
        "ChatGPT och Claude handlar åt sina användare — bokar bord, jämför priser, hämtar data. De följer länkar och anropar API:er, men bara där grunderna finns. Utan dem försvinner du tyst ur svaren.",
      whyProof: "13 checks · 30 sekunder · öppet på GitHub",
      scanMessages: [
        "Kollar åtkomst — robots.txt, sitemap och llms.txt",
        "Kartlägger API-ytor — 40+ sökvägar och subdomäner",
        "Söker developer portal — npm, GitHub och semantisk sökning",
        "Hämtar och renderar dokumentation",
        "AI-analys — extraherar signaler och sätter betyg",
      ] as string[],
      scanningPrefix: "Kollar",
      notSwedishHeading: "Inte ett svenskt företag",
      notSwedishText:
        "Vi scannar bara svenska företag och internationella bolag grundade i Sverige — som Spotify, IKEA och Klarna.",
      tryAnother: "Prova en annan domän →",
      contactUs: "Är detta fel? Kontakta oss →",
      notSwedishFootnote:
        "Om ditt bolag är grundat i Sverige men inte känns igen — hör av dig på Discord så lägger vi till det.",
      privacyCopy: "Anonym · ingen registrering · hashad IP + resultat lagras · radering på begäran",
    },

    liveCounter: {
      totalLabel: "scans",
      last24hLabel: "senaste 24h",
      eyebrow: "uppdateras",
    },

    cta: {
      heading1: "300+ builders bygger redan.",
      heading2: "Häng med.",
      subtext: "Öppen källkod. Stockholm, Göteborg, Malmö.",
      discordBtn: "Gå med i Discord →",
      shareBtn: "Dela med någon som behöver det här →",
    },

    results: {
      // Scorecard header
      scanResultsBadge: "SCAN RESULTAT",
      headline: "Hur agent-redo är din sajt?",
      tabSite: "Sajt",
      tabApi: "API",
      comingSoon: "Kommer snart",

      // Badges
      badgeReady: "REDO",
      badgePartial: "DELVIS REDO",
      badgeNotReady: "INTE REDO",

      // Score breakdown
      criticalSingle: "brist",
      criticalPlural: "brister",
      warningSingle: "varning",
      warningPlural: "varningar",

      // Top findings
      topFindings: "TOPPHITTAR",
      moreFindings: (n: number) => `+${n} fler fynd i rapporten nedan`,

      // Recommendations
      recommendations: "REKOMMENDATIONER",

      // Plan
      planHeading: "DIN PLAN",
      planSubtext: "Viktigast först.",
      fixedRescan: "Fixat något? Scanna igen och se din nya score →",
      priorityCritical: "Kritisk",
      priorityImportant: "Viktig",

      // Full report
      viewFullReport: "Visa fullständig rapport",
      criticalSection: "Kritiska brister",
      warningsSection: "Varningar",
      missingSection: "Saknade delar",
      regulatorySection: "Regulatorisk spelplan",
      apiDetailsSection: "API-axlar (detaljer)",
      technicalSection: "Tekniska resultat",
      mcpSection: "MCP-readiness",
      passedSection: "Godkända",
      criticalBadge: "KRITISK",
      lastUpdated: "Senast uppdaterad:",

      // MCP
      mcpNote:
        "Kontrolleras via offentliga, oautentiserade anrop. Saker bakom inloggning kan finnas men syns inte här.",
      mcpGithubHint: "Möjlig MCP-server hittad på GitHub —",
      mcpGithubVerify: "Kan vara officiell eller community-skapad. Verifiera med leverantören.",

      // Technical data (builder view)
      techDataBtn: "Teknisk data (för builders)",
      apiFound: "Hittad",
      apiNotFound: "Ej hittad",
      found: "Finns",
      missing: "Saknas",
      allowsCrawlers: "Tillåter AI-crawlers",
      blocksCrawlers: "Blockerar AI-crawlers",

      // API tab
      openApiDetected: "Upptäckt",
      openApiPartial: (score: number) =>
        `Kunde inte laddas fullt automatiskt. Max möjlig poäng just nu: ${score}/100.`,
      openApiNoSpec: (score: number) =>
        `API hittades men ingen OpenAPI-spec. Max möjlig poäng: ${score}/100.`,

      // CTA variants
      ctaHighApiHeadline: "Ditt API pratar inte med agenter.",
      ctaHighApiSubtext: (domain: string) =>
        `En builder från communityn visar vad ${domain} behöver för att AI-agenter ska kunna koppla in sig.`,
      ctaMedApiHeadline: "Ditt API har potential — men brister kvar.",
      ctaMedApiSubtext: (domain: string) =>
        `Prata med en builder om hur ${domain} kan bli en plattform som agenter bygger mot.`,
      ctaHighSiteHeadline: "AI-agenter ser er knappt.",
      ctaHighSiteSubtext: (domain: string) =>
        `Builder från communityn hjälper ${domain} bli agent-redo.`,
      ctaMedSiteHeadline: "Grund finns — fler steg kvar.",
      ctaMedSiteSubtext: (domain: string) =>
        `En builder visar vad ${domain} behöver för agent-integration.`,
      ctaLowHeadline: "Du ligger före de flesta. Vad är nästa steg?",
      ctaLowSubtext: (domain: string) =>
        `Prata med en builder om vad agenter kan bygga mot ${domain}.`,
      ctaBookFree: "Boka 15 min gratis med en builder →",
      ctaBook: "Boka 15 min med en builder →",
      ctaBookCall: "Boka samtal →",
      bookingBullets: ["Personlig builder", "Samma data som din scan", "Konkreta nästa steg"],
      communityMatch: "Matchning med rätt builder i communityn.",
      builderAvatarLabel: "Exempel på builders i communityn",

      // Sharing
      shareResult: "Dela ditt resultat",
      sendToTeam: "Skicka till ditt team",
      copied: "Kopierat!",
      scanAnother: "← Scanna en annan sajt",
      shareSection: "Dela resultatet",
      shareNudge: "Visa nätverket att du tar AI-readiness på allvar — och sprid AI-vakenheten i Sverige.",
      shareCopyDmText: "Kopiera DM-text",
      shareLinkedin: "Dela på LinkedIn",
      shareX: "Dela på X",
      stickyShare: "Dela",
      stickyCopy: "Kopiera",
      shareApiText: (domain: string, score: number, blockers: number, url: string) =>
        `${score < 30 ? "🔴" : score < 70 ? "🟡" : "🟢"} ${domain} fick ${score}/100 i API agent-readiness.\n\n${blockers} blockerare hittade.\n\nHur redo är ditt API? → ${url}`,
      shareSiteText: (domain: string, score: number, total: number, critical: number, important: number, passed: number, url: string) =>
        `${score / total <= 0.3 ? "🔴" : score / total <= 0.6 ? "🟡" : "🟢"} ${domain} fick ${score}/${total} i AI-readiness.\n\n● ${critical} brister ● ${important} varningar ● ${passed} ok\n\nHur redo är din sajt? → ${url}`,
      teamShareText: (domain: string, score: number, total: number, url: string) =>
        `Jag scannade ${domain} med agent.opensverige.se — vi fick ${score}/${total}. Här är vad vi kan fixa: ${url}`,

      // Timestamps
      staleWarning: "Föråldrat resultat —",
      scannedAt: "Scannades",
      daysAgo: (n: number) => `(${n} dagar sedan)`,
      today: "(idag)",
      scanAgain: "Skanna igen →",

      // AI summary
      aiSummaryLabel: "Sammanfattad av AI (Claude)",
      aiSummaryShowMore: "Visa mer",
      aiSummaryShowLess: "Visa mindre",

      // Demo
      demoBadge: "DEMO",
      demoText:
        "Tekniska checks är riktiga. Analystexten är generisk tills ANTHROPIC_API_KEY läggs till.",

      // Not found
      notFoundText: "Ingen scan hittad för den här domänen.",
      scanDomain: (d: string) => `Scanna ${d} →`,

      // Disclaimer
      disclaimer:
        "Det här är en teknisk observation, inte juridisk rådgivning. Compliance-resultaten är generella och baseras inte på en granskning av era specifika policier.",
    },

    footer: {
      tagline: "opensverige.se — öppen källkod",
      privacy: "Integritet",
    },

    privacy: {
      title: "Integritet",
      lastUpdated: "Senast uppdaterad: 19 april 2026",
      intro:
        "Den här sidan förklarar vad vi samlar in när du scannar en domän på agent.opensverige.se och varför. Kort, ärligt och utan juristprosa.",
      sections: [
        {
          heading: "Vad vi samlar in",
          body:
            "När du scannar en domän sparar vi: domännamnet, resultatet av de tekniska checkarna, en hashad version av din IP-adress (SHA-256), tidpunkt samt AI-genererad sammanfattning. Vi sparar inga namn, e-post eller konton — scannern kräver ingen registrering.",
        },
        {
          heading: "Varför",
          body:
            "Domän och resultat lagras för att du ska kunna återvända till din rapport och dela den. Hashad IP används för rate-limiting (skydd mot missbruk) — vi kan inte återställa den till en riktig IP-adress, men eftersom den kan kopplas till dig räknas den juridiskt som pseudonymiserad persondata (EU-domstolen, Breyer-domen).",
        },
        {
          heading: "AI-sammanfattning",
          body:
            "Sammanfattningen ovanför checkresultaten är genererad av Anthropics Claude-modell utifrån de tekniska checkarna. Den är ingen juridisk rådgivning. Vi märker den tydligt som AI-genererad i enlighet med EU AI Act artikel 50 (tillämpas från 2 augusti 2026).",
        },
        {
          heading: "Underleverantörer",
          body:
            "Hosting: Vercel (USA/EU). Databas: Supabase (EU, Frankfurt). AI-analys: Anthropic (USA). Semantisk sökning: Exa (USA). Hämtning: Firecrawl (USA). Mötesbokning: Cal.com (EU). Överföringar till USA sker enligt EU-US Data Privacy Framework.",
        },
        {
          heading: "Webbanalys",
          body:
            "Vi använder Vercel Web Analytics som räknar sidvisningar utan cookies och utan att spåra dig mellan sajter. Ingen cookie-banner krävs eftersom vi inte använder cookies för spårning.",
        },
        {
          heading: "Cookies",
          body:
            "Vi sätter inga egna cookies. Om du bokar ett möte via Cal.com sätter deras embed cookies när du interagerar med kalendern — det är Cal.com som personuppgiftsansvarig för det.",
        },
        {
          heading: "Lagringstid",
          body:
            "Scanresultat och hashad IP raderas automatiskt efter 90 dagar (kan förlängas på Builder/Pro-tier). Du kan begära tidigare radering av en specifik domäns resultat — maila info@opensverige.se.",
        },
        {
          heading: "Automatiserad behandling och profilering",
          body:
            "Tjänsten gör automatiserade tekniska bedömningar (badge grön/gul/röd) av domäner — inte av personer direkt. För juridiska personer omfattas inte beslutet av GDPR Art. 22. För enskild firma eller frilansares portfolio (där domänen är kopplad till en fysisk person) kan badge-bedömningen kvalificeras som automatiserat beslut med rättsliga eller liknande väsentliga effekter (Art. 22). I sådana fall har du rätt att begära mänsklig granskning, framföra din ståndpunkt och bestrida resultatet — maila info@opensverige.se. Vi profilerar inte besökare och bygger inte beteendemönster över tid.",
        },
        {
          heading: "Dina rättigheter",
          body:
            "Enligt GDPR har du rätt till tillgång, rättelse, radering, begränsning, dataportabilitet och invändning. För automatiserade beslut (Art. 22) har du dessutom rätt till mänsklig granskning. Du kan klaga hos Integritetsskyddsmyndigheten (IMY) för GDPR-frågor och hos Post- och telestyrelsen (PTS) för AI Act-frågor (per SOU 2025:101).",
        },
        {
          heading: "Kontakt",
          body:
            "Personuppgiftsansvarig: OpenSverige. Kontakt: info@opensverige.se. Vi svarar så snart vi kan — vi är en community, inte en kundtjänst.",
        },
      ] as ReadonlyArray<{ heading: string; body: string }>,
      backLink: "← Tillbaka till scannern",
    },

    terms: {
      title: "Användarvillkor",
      lastUpdated: "Senast uppdaterad: 26 april 2026",
      intro:
        "Det här är de juridiska villkoren för agent.opensverige.se och dess publika API. Skrivna i klartext utan jurist-jargong.",
      sections: [
        {
          heading: "Vem vi är",
          body:
            "agent.opensverige.se drivs av Felipe och Gustaf Garnow (community-projekt, Sverige). Kontakt: info@opensverige.se. Tjänsten är open source under FSL-1.1-MIT — källkoden finns på github.com/opensverige/agent-scan.",
        },
        {
          heading: "Vad tjänsten är",
          body:
            "En teknisk scanner som mäter hur väl en webbplats är förberedd för AI-agenter. Vi gör HTTP-requests mot publika ytor av domäner och returnerar 17 strukturerade checks. Resultaten är tekniska observationer, inte juridisk rådgivning.",
        },
        {
          heading: "Vad du får göra",
          body:
            "Använda webb-UI:t gratis utan registrering. Använda /v1/* API:et med en utfärdad API-nyckel inom din tier-quota. Bygga vidare på resultat (screenshots, citera badges, integrera i dina egna verktyg). Kontakta oss i Discord eller via mail vid frågor.",
        },
        {
          heading: "Vad du inte får göra",
          body:
            "Bryta mot vår Acceptable Use Policy (se /legal/aup). Försöka kringgå rate-limits eller auth. Re-identifiera hashade IP-adresser. Resälja tjänsten som konkurrerande managed service (FSL-licens-villkor). Skanna domäner du inte har rätt att scanna när Pro-tier domain verification lanseras.",
        },
        {
          heading: "API-nycklar",
          body:
            "Du ansvarar för att hålla din nyckel hemlig. Misstänker du att den läckt — be oss revoka den och utfärda en ny. Vi loggar nyckel-prefix (16 tecken, ej hela nyckeln) för audit. Vi kan revoka nycklar som missbrukas.",
        },
        {
          heading: "AI-genererat innehåll",
          body:
            "Sammanfattningar genereras av Anthropic Claude. De märks maskinläsbart i API-svaret via ai_disclosure-fältet (EU AI Act Art. 50). Innehållet är ej granskat av människa — du ansvarar för att verifiera påståenden innan du använder dem för affärsbeslut.",
        },
        {
          heading: "Tillgänglighet och fel",
          body:
            "Vi gör vårt bästa men ger ingen formell SLA på Hobby-tier. Builder/Pro-tier får 99,5% uptime när de lanseras. Tjänsten kan vara nere för underhåll. Scan-kvalitet beror på externa faktorer (Anthropic, Firecrawl, Exa). Inga garantier för specifika resultat.",
        },
        {
          heading: "Ansvarsbegränsning",
          body:
            "Vi friskriver oss från ansvar för indirekta skador, missade affärsmöjligheter eller felaktiga beslut baserade på scan-resultat. Maximalt totalansvar = vad du betalat oss de senaste 12 månaderna. Konsumentskyddsregler i Sverige står över denna klausul där tillämpligt.",
        },
        {
          heading: "Uppsägning",
          body:
            "Du kan sluta använda tjänsten när du vill. Vi kan stänga av nycklar som bryter mot AUP eller dessa villkor. Vid uppsägning av betal-tier: ingen återbetalning av innevarande månad, men inga framtida debiteringar.",
        },
        {
          heading: "Lag och jurisdiktion",
          body:
            "Svensk lag tillämpas. Tvister avgörs i svensk allmän domstol. Konsumenter behåller rätten att stämma i sitt hemland enligt EU-konsumentregler.",
        },
        {
          heading: "Ändringar",
          body:
            "Vi kan uppdatera dessa villkor. Materiella ändringar meddelas via mail till nyckel-innehavare minst 30 dagar i förväg. Triviala ändringar (typos, klargöranden) görs utan notis.",
        },
      ] as ReadonlyArray<{ heading: string; body: string }>,
      backLink: "← Tillbaka till integritetspolicy",
    },

    aup: {
      title: "Acceptable Use Policy",
      lastUpdated: "Senast uppdaterad: 26 april 2026",
      intro:
        "Det här är reglerna för hur du får använda agent.opensverige.se och vårt API. Brott leder till avstängning av nyckel utan återbetalning.",
      sections: [
        {
          heading: "Vad som är förbjudet",
          body:
            "Skanna domäner du inte äger eller har explicit tillstånd att scanna i kommersiella syften (när Pro-tier lanseras kräver vi DNS-verifiering). Skanna i syfte att kartlägga konkurrenters infrastruktur för angreppsändamål. Använda resultat för att förtala eller skada tredje parts rykte. Generera fake-trafik mot tredjepartssajter via våra probes.",
        },
        {
          heading: "Re-identifiering",
          body:
            "Du får inte försöka re-identifiera personer från hashade IP-adresser eller andra pseudonymiserade fält i våra svar. Det är förbjudet enligt GDPR och bryter våra ToS.",
        },
        {
          heading: "Rate limiting och fair use",
          body:
            "Respektera per-tier-quota. Försök inte kringgå rate-limit via flera nycklar för samma användning — det räknas som missbruk. Hobby-tier är för individuell utforskning, inte produktion. Builder/Pro för team-användning.",
        },
        {
          heading: "Återförsäljning",
          body:
            "Återförsälj inte vår API som en konkurrerande managed service (förbjudet av FSL-licensen i 2 år). White-label-rapporter på Pro-tier är OK när de lanseras. Bygga ovanpå för dina egna kunder är OK. Kontakta oss för dual-license om du vill kringgå denna regel.",
        },
        {
          heading: "Crawler-etikett",
          body:
            "Vår scanner respekterar målets robots.txt och rate-limit-headers. Om du upptäcker att vi inte gör det — rapportera direkt. Om du forkar koden, behåll detta beteende.",
        },
        {
          heading: "Säkerhet",
          body:
            "Rapportera säkerhetsproblem privat till info@opensverige.se enligt vår security.txt. Försök inte exploit:a sårbarheter i produktion. Bug bounty kommer i Stage 5.",
        },
        {
          heading: "Konsekvenser",
          body:
            "Vi kan avstänga nycklar som bryter dessa regler. Allvarliga brott (re-identifiering, kartläggning för angrepp) rapporteras till Polisen och PTS. Vi förbehåller oss rätten att stämma för skadestånd vid kommersiell skada.",
        },
      ] as ReadonlyArray<{ heading: string; body: string }>,
      backLink: "← Tillbaka till integritetspolicy",
    },

    aiDisclosure: {
      title: "AI-disclosure",
      lastUpdated: "Senast uppdaterad: 26 april 2026",
      intro:
        "Tjänsten använder AI för att generera sammanfattningar och rekommendationer. Den här sidan beskriver hur, var och varför — i linje med EU AI Act Art. 50 (gäller från 2 augusti 2026).",
      sections: [
        {
          heading: "Vilken AI vi använder",
          body:
            "Anthropics Claude (modell claude-sonnet-4-5). Anropas server-side från Vercel-funktionen som kör en scan. Vi planerar migrera till AWS Bedrock i Frankfurt (eu-central-1) före 2 augusti 2026 för att hålla data i EU.",
        },
        {
          heading: "Vad AI:n genererar",
          body:
            "Tre fält i scan-svaret: summary (kortfattad text om sajtens AI-readiness), industry (branschklassificering), agent_suggestions (3 förslag på AI-agenter företaget kan bygga). Inga andra fält är AI-genererade — alla checks är deterministiska kodregler.",
        },
        {
          heading: "Maskinläsbar märkning",
          body:
            "Varje API-svar innehåller ett ai_disclosure-objekt: { ai_generated: bool, model: string, fields: string[] }. När AI-genererat innehåll finns sätts ai_generated: true med exakt vilka fält och vilken modell. Detta uppfyller Art. 50(2)-kravet på maskinläsbar märkning.",
        },
        {
          heading: "Mänsklig granskning",
          body:
            "AI-output granskas inte av människa innan den serveras. Du som använder summary i din UI eller affärsbeslut bör verifiera påståenden mot underliggande checks. Vill du ha mänsklig granskning av en specifik scan — maila info@opensverige.se.",
        },
        {
          heading: "Risk-klassificering enligt AI Act",
          body:
            "Vår tjänst räknas som minimal/limited risk-AI under Art. 50. Inga högriskscenarier (rekrytering, kreditbedömning, brottsbekämpning). Vi är deployer (artikel 3(4)), Anthropic är provider (artikel 3(3)) — Anthropic ansvarar för teknisk märkning, vi ansvarar för informationsskyldighet mot dig.",
        },
        {
          heading: "Dina rättigheter",
          body:
            "Du har rätt att få veta att text är AI-genererad (uppfyllt via ai_disclosure-fältet). Vid badge-bedömning av en frilansares portfolio (potentiellt automatiserat beslutsfattande, GDPR Art. 22) kan du begära mänsklig granskning via info@opensverige.se.",
        },
        {
          heading: "Träningsdata",
          body:
            "Vi tränar inga modeller på era scan-data. Anthropic enligt deras egna villkor (trust.anthropic.com): API-data används inte för modellträning by default på enterprise-tier.",
        },
      ] as ReadonlyArray<{ heading: string; body: string }>,
      backLink: "← Tillbaka till integritetspolicy",
    },

    subprocessors: {
      title: "Underleverantörer",
      lastUpdated: "Senast uppdaterad: 26 april 2026",
      intro:
        "Lista över alla tredje parter som behandlar data å OpenSveriges vägnar när du använder agent.opensverige.se. Vi notifierar minst 30 dagar innan vi lägger till nya underleverantörer.",
      tableHeaders: {
        provider: "Leverantör",
        purpose: "Ändamål",
        location: "Region",
        dpf: "Adekvansbeslut",
      },
      providers: [
        {
          name: "Vercel Inc.",
          purpose: "Hosting + edge-funktioner (Next.js)",
          location: "USA / EU",
          dpf: "EU-US DPF (certifierad)",
          link: "https://vercel.com/legal/privacy-policy",
        },
        {
          name: "Supabase Inc.",
          purpose: "Postgres-databas + autentisering",
          location: "EU (eu-west-2, London)",
          dpf: "DPA + SCC",
          link: "https://supabase.com/legal/dpa",
        },
        {
          name: "Anthropic PBC",
          purpose: "AI-sammanfattningar (Claude API)",
          location: "USA (Microsoft Azure)",
          dpf: "SCC + TIA — migrerar till AWS Bedrock Frankfurt",
          link: "https://trust.anthropic.com",
        },
        {
          name: "Mendable Labs (Firecrawl)",
          purpose: "Renderar JS-tunga sajter för innehållsanalys",
          location: "USA",
          dpf: "SCC",
          link: "https://www.firecrawl.dev/legal/privacy",
        },
        {
          name: "Exa Labs Inc.",
          purpose: "Semantisk sökning för dev portal-discovery",
          location: "USA",
          dpf: "SCC",
          link: "https://exa.ai/privacy-policy",
        },
        {
          name: "Cloudflare Inc.",
          purpose: "DNS + DDoS-skydd för opensverige.se",
          location: "Globalt (EU-noder)",
          dpf: "EU-US DPF (certifierad)",
          link: "https://www.cloudflare.com/trust-hub/gdpr/",
        },
        {
          name: "Cal.com Inc.",
          purpose: "Mötesbokningar för builder-samtal",
          location: "EU + USA",
          dpf: "SCC",
          link: "https://cal.com/privacy",
        },
      ] as ReadonlyArray<{ name: string; purpose: string; location: string; dpf: string; link: string }>,
      footnote:
        "Underleverantörer som hanterar persondata har alla DPA (Data Processing Agreement) signerade enligt GDPR Art. 28. Frågor om enskilda flöden? Maila info@opensverige.se.",
      backLink: "← Tillbaka till integritetspolicy",
    },
  },

  en: {
    langToggle: "SV",

    nav: {
      discord: "🇸🇪 300+ builders →",
    },

    scanner: {
      headline: "How agent-ready is your site?",
      subtext: "We show what AI agents see — and what's stopping them.",
      placeholder: "yourcompany.com",
      ariaLabel: "Domain name to scan",
      scanBtn: "Scan →",
      whyHeading: "Agents are already buying. Are you visible?",
      whyText:
        "ChatGPT and Claude already act on behalf of their users — booking tables, comparing prices, pulling data. They follow links and call APIs, but only where the basics exist. Without them, you quietly drop out of the answers.",
      whyProof: "13 checks · 30 seconds · open on GitHub",
      scanMessages: [
        "Checking access — robots.txt, sitemap and llms.txt",
        "Mapping API surfaces — 40+ paths and subdomains",
        "Searching developer portal — npm, GitHub and semantic search",
        "Fetching and rendering documentation",
        "AI analysis — extracting signals and scoring",
      ] as string[],
      scanningPrefix: "Scanning",
      notSwedishHeading: "Not a Swedish company",
      notSwedishText:
        "We only scan Swedish companies and international companies founded in Sweden — like Spotify, IKEA and Klarna.",
      tryAnother: "Try another domain →",
      contactUs: "Is this wrong? Contact us →",
      notSwedishFootnote:
        "If your company was founded in Sweden but isn't recognized — reach out on Discord and we'll add it.",
      privacyCopy: "Anonymous · no sign-up · hashed IP + results stored · deletion on request",
    },

    liveCounter: {
      totalLabel: "scans",
      last24hLabel: "last 24h",
      eyebrow: "live",
    },

    cta: {
      heading1: "300+ builders are already building.",
      heading2: "Join us.",
      subtext: "Open source. Stockholm, Gothenburg, Malmö.",
      discordBtn: "Join Discord →",
      shareBtn: "Share with someone who needs this →",
    },

    results: {
      scanResultsBadge: "SCAN RESULTS",
      headline: "How agent-ready is your site?",
      tabSite: "Site",
      tabApi: "API",
      comingSoon: "Coming soon",

      badgeReady: "READY",
      badgePartial: "PARTIALLY READY",
      badgeNotReady: "NOT READY",

      criticalSingle: "issue",
      criticalPlural: "issues",
      warningSingle: "warning",
      warningPlural: "warnings",

      topFindings: "TOP FINDINGS",
      moreFindings: (n: number) => `+${n} more findings in the report below`,

      recommendations: "RECOMMENDATIONS",

      planHeading: "YOUR PLAN",
      planSubtext: "Most important first.",
      fixedRescan: "Fixed something? Scan again and see your new score →",
      priorityCritical: "Critical",
      priorityImportant: "Important",

      viewFullReport: "View full report",
      criticalSection: "Critical issues",
      warningsSection: "Warnings",
      missingSection: "Missing parts",
      regulatorySection: "Regulatory landscape",
      apiDetailsSection: "API axes (details)",
      technicalSection: "Technical results",
      mcpSection: "MCP-readiness",
      passedSection: "Passed",
      criticalBadge: "CRITICAL",
      lastUpdated: "Last updated:",

      mcpNote:
        "Checked via public, unauthenticated requests. Things behind login may exist but aren't visible here.",
      mcpGithubHint: "Possible MCP server found on GitHub —",
      mcpGithubVerify: "May be official or community-created. Verify with the vendor.",

      techDataBtn: "Technical data (for builders)",
      apiFound: "Found",
      apiNotFound: "Not found",
      found: "Found",
      missing: "Missing",
      allowsCrawlers: "Allows AI crawlers",
      blocksCrawlers: "Blocks AI crawlers",

      openApiDetected: "Detected",
      openApiPartial: (score: number) =>
        `Could not be fully loaded automatically. Maximum possible score right now: ${score}/100.`,
      openApiNoSpec: (score: number) =>
        `API found but no OpenAPI spec. Maximum possible score: ${score}/100.`,

      ctaHighApiHeadline: "Your API doesn't talk to agents.",
      ctaHighApiSubtext: (domain: string) =>
        `A builder from the community shows what ${domain} needs for AI agents to connect.`,
      ctaMedApiHeadline: "Your API has potential — but gaps remain.",
      ctaMedApiSubtext: (domain: string) =>
        `Talk to a builder about how ${domain} can become a platform agents build against.`,
      ctaHighSiteHeadline: "AI agents can barely see you.",
      ctaHighSiteSubtext: (domain: string) =>
        `A builder from the community helps ${domain} become agent-ready.`,
      ctaMedSiteHeadline: "Foundation exists — more steps ahead.",
      ctaMedSiteSubtext: (domain: string) =>
        `A builder shows what ${domain} needs for agent integration.`,
      ctaLowHeadline: "You're ahead of most. What's the next step?",
      ctaLowSubtext: (domain: string) =>
        `Talk to a builder about what agents can build against ${domain}.`,
      ctaBookFree: "Book 15 min free with a builder →",
      ctaBook: "Book 15 min with a builder →",
      ctaBookCall: "Book a call →",
      bookingBullets: ["Personal builder", "Same data as your scan", "Concrete next steps"],
      communityMatch: "Matched with the right builder in the community.",
      builderAvatarLabel: "Example builders in the community",

      shareResult: "Share your result",
      sendToTeam: "Send to your team",
      copied: "Copied!",
      scanAnother: "← Scan another site",
      shareSection: "Share the result",
      shareNudge: "Show your network you take AI readiness seriously — and help spread AI awareness in Sweden.",
      shareCopyDmText: "Copy DM text",
      shareLinkedin: "Share on LinkedIn",
      shareX: "Share on X",
      stickyShare: "Share",
      stickyCopy: "Copy",
      shareApiText: (domain: string, score: number, blockers: number, url: string) =>
        `${score < 30 ? "🔴" : score < 70 ? "🟡" : "🟢"} ${domain} scored ${score}/100 in API agent-readiness.\n\n${blockers} blockers found.\n\nHow ready is your API? → ${url}`,
      shareSiteText: (domain: string, score: number, total: number, critical: number, important: number, passed: number, url: string) =>
        `${score / total <= 0.3 ? "🔴" : score / total <= 0.6 ? "🟡" : "🟢"} ${domain} scored ${score}/${total} in AI-readiness.\n\n● ${critical} issues ● ${important} warnings ● ${passed} ok\n\nHow ready is your site? → ${url}`,
      teamShareText: (domain: string, score: number, total: number, url: string) =>
        `I scanned ${domain} with agent.opensverige.se — we scored ${score}/${total}. Here's what we can fix: ${url}`,

      staleWarning: "Outdated result —",
      scannedAt: "Scanned",
      daysAgo: (n: number) => `(${n} days ago)`,
      today: "(today)",
      scanAgain: "Scan again →",

      aiSummaryLabel: "Summarized by AI (Claude)",
      aiSummaryShowMore: "Show more",
      aiSummaryShowLess: "Show less",

      demoBadge: "DEMO",
      demoText:
        "Technical checks are real. Analysis text is generic until ANTHROPIC_API_KEY is added.",

      notFoundText: "No scan found for this domain.",
      scanDomain: (d: string) => `Scan ${d} →`,

      disclaimer:
        "This is a technical observation, not legal advice. Compliance results are general and not based on a review of your specific policies.",
    },

    footer: {
      tagline: "opensverige.se — open source",
      privacy: "Privacy",
    },

    privacy: {
      title: "Privacy",
      lastUpdated: "Last updated: April 19, 2026",
      intro:
        "This page explains what we collect when you scan a domain on agent.opensverige.se and why. Short, honest, no legalese.",
      sections: [
        {
          heading: "What we collect",
          body:
            "When you scan a domain we store: the domain name, the results of the technical checks, a hashed version of your IP address (SHA-256), a timestamp, and the AI-generated summary. We don't store names, emails or accounts — the scanner requires no sign-up.",
        },
        {
          heading: "Why",
          body:
            "Domain and results are stored so you can return to your report and share it. Hashed IP is used for rate limiting (abuse protection) — we can't reverse it to a real IP, but because it can still be linked to you it legally counts as pseudonymised personal data (CJEU, Breyer ruling).",
        },
        {
          heading: "AI summary",
          body:
            "The summary above the check results is generated by Anthropic's Claude model based on the technical checks. It is not legal advice. We label it clearly as AI-generated, in line with EU AI Act article 50 (applies from August 2, 2026).",
        },
        {
          heading: "Sub-processors",
          body:
            "Hosting: Vercel (US/EU). Database: Supabase (EU, Frankfurt). AI analysis: Anthropic (US). Semantic search: Exa (US). Fetching: Firecrawl (US). Meeting bookings: Cal.com (EU). Transfers to the US rely on the EU-US Data Privacy Framework.",
        },
        {
          heading: "Web analytics",
          body:
            "We use Vercel Web Analytics, which counts page views without cookies and without tracking you across sites. No cookie banner is required because we don't use cookies for tracking.",
        },
        {
          heading: "Cookies",
          body:
            "We set no cookies of our own. If you book a meeting via Cal.com, their embed sets cookies when you interact with the calendar — Cal.com is the controller for that.",
        },
        {
          heading: "Retention",
          body:
            "Scan results and hashed IPs are deleted automatically after 90 days (can be extended on Builder/Pro tiers). You can request earlier deletion of a specific domain's results — email info@opensverige.se.",
        },
        {
          heading: "Automated decision-making and profiling",
          body:
            "The service makes automated technical assessments (green/yellow/red badge) of domains — not of individuals directly. For legal persons (companies), the decision is outside GDPR Art. 22 scope. For sole traders or a freelancer's portfolio (where the domain is linked to a natural person), the badge assessment may qualify as an automated decision producing legal or similarly significant effects (Art. 22). In such cases you have the right to request human review, express your point of view and contest the result — email info@opensverige.se. We do not profile visitors or build behavioural patterns over time.",
        },
        {
          heading: "Your rights",
          body:
            "Under GDPR you have the right to access, rectification, erasure, restriction, portability and objection. For automated decisions (Art. 22) you also have the right to human review. Complaints can be lodged with IMY for GDPR matters and with PTS (Swedish Post and Telecom Authority) for AI Act matters (per SOU 2025:101).",
        },
        {
          heading: "Contact",
          body:
            "Controller: OpenSverige. Contact: info@opensverige.se. We reply as soon as we can — we're a community, not a support desk.",
        },
      ] as ReadonlyArray<{ heading: string; body: string }>,
      backLink: "← Back to the scanner",
    },

    terms: {
      title: "Terms of Service",
      lastUpdated: "Last updated: April 26, 2026",
      intro:
        "Plain-English legal terms for agent.opensverige.se and its public API. No legalese.",
      sections: [
        {
          heading: "Who we are",
          body:
            "agent.opensverige.se is run by Felipe and Gustaf Garnow (community project, Sweden). Contact: info@opensverige.se. The service is open source under FSL-1.1-MIT — code at github.com/opensverige/agent-scan.",
        },
        {
          heading: "What the service does",
          body:
            "A technical scanner that measures how prepared a website is for AI agents. We make HTTP requests against public surfaces of domains and return 17 structured checks. Results are technical observations, not legal advice.",
        },
        {
          heading: "What you may do",
          body:
            "Use the web UI free, no signup. Use the /v1/* API with an issued key within your tier quota. Build on results (screenshots, citing badges, integrating into your tools). Reach out via Discord or email with questions.",
        },
        {
          heading: "What you may not do",
          body:
            "Violate our Acceptable Use Policy (see /legal/aup). Bypass rate limits or auth. Re-identify hashed IPs. Resell as a competing managed service (FSL license restriction). Scan domains you don't have authorisation to scan when Pro-tier domain verification launches.",
        },
        {
          heading: "API keys",
          body:
            "You're responsible for keeping your key secret. If you suspect a leak, ask us to revoke it and we'll issue a new one. We log key prefixes (16 chars, never the full key) for audit. We may revoke keys that abuse the service.",
        },
        {
          heading: "AI-generated content",
          body:
            "Summaries are generated by Anthropic Claude. They are marked machine-readably in API responses via the ai_disclosure field (EU AI Act Art. 50). Content is not human-reviewed — you are responsible for verifying claims before using them in business decisions.",
        },
        {
          heading: "Availability and errors",
          body:
            "We do our best but provide no formal SLA on Hobby tier. Builder/Pro tiers will get 99.5% uptime when launched. Service may be down for maintenance. Scan quality depends on external factors (Anthropic, Firecrawl, Exa). No guarantees on specific results.",
        },
        {
          heading: "Limitation of liability",
          body:
            "We disclaim liability for indirect damages, missed business opportunities, or wrong decisions based on scan results. Maximum total liability = what you paid us in the past 12 months. Swedish consumer protection laws override this clause where applicable.",
        },
        {
          heading: "Termination",
          body:
            "You can stop using the service any time. We may revoke keys that violate AUP or these terms. Termination of paid tier: no refund of current month, but no future charges.",
        },
        {
          heading: "Law and jurisdiction",
          body:
            "Swedish law applies. Disputes resolved in Swedish courts. Consumers retain the right to sue in their home country under EU consumer rules.",
        },
        {
          heading: "Changes",
          body:
            "We may update these terms. Material changes are emailed to key holders at least 30 days in advance. Trivial changes (typos, clarifications) ship without notice.",
        },
      ] as ReadonlyArray<{ heading: string; body: string }>,
      backLink: "← Back to the privacy policy",
    },

    aup: {
      title: "Acceptable Use Policy",
      lastUpdated: "Last updated: April 26, 2026",
      intro:
        "Rules for using agent.opensverige.se and our API. Violations result in key revocation without refund.",
      sections: [
        {
          heading: "What's prohibited",
          body:
            "Scanning domains you don't own or have explicit permission to scan in commercial contexts (Pro tier will require DNS verification at launch). Scanning to map competitor infrastructure for attack purposes. Using results to defame third parties. Generating fake traffic against third-party sites via our probes.",
        },
        {
          heading: "Re-identification",
          body:
            "You may not attempt to re-identify individuals from hashed IPs or other pseudonymised fields in our responses. Prohibited by GDPR and our ToS.",
        },
        {
          heading: "Rate limiting and fair use",
          body:
            "Respect per-tier quotas. Don't try to bypass rate limits via multiple keys for the same workload — counts as abuse. Hobby tier is for individual exploration, not production. Builder/Pro for team use.",
        },
        {
          heading: "Resale",
          body:
            "Don't resell our API as a competing managed service (forbidden by FSL license for 2 years). White-label reports on Pro tier are OK at launch. Building on top for your own customers is OK. Contact us for a dual license to bypass this rule.",
        },
        {
          heading: "Crawler etiquette",
          body:
            "Our scanner respects target robots.txt and rate-limit headers. If you find we don't, report it. If you fork the code, preserve this behaviour.",
        },
        {
          heading: "Security",
          body:
            "Report security issues privately to info@opensverige.se per our security.txt. Don't exploit vulnerabilities in production. Bug bounty coming in Stage 5.",
        },
        {
          heading: "Consequences",
          body:
            "We may revoke keys that violate these rules. Serious violations (re-identification, attack mapping) reported to Swedish Police and PTS. We reserve the right to sue for damages from commercial harm.",
        },
      ] as ReadonlyArray<{ heading: string; body: string }>,
      backLink: "← Back to the privacy policy",
    },

    aiDisclosure: {
      title: "AI Disclosure",
      lastUpdated: "Last updated: April 26, 2026",
      intro:
        "The service uses AI to generate summaries and recommendations. This page describes how, where and why — in line with EU AI Act Art. 50 (effective 2 August 2026).",
      sections: [
        {
          heading: "Which AI we use",
          body:
            "Anthropic Claude (model claude-sonnet-4-5). Called server-side from the Vercel function running a scan. We plan to migrate to AWS Bedrock in Frankfurt (eu-central-1) before 2 August 2026 to keep data in the EU.",
        },
        {
          heading: "What the AI generates",
          body:
            "Three fields in the scan response: summary (short text about the site's AI-readiness), industry (industry classification), agent_suggestions (3 AI-agent ideas for the company to build). No other fields are AI-generated — all checks are deterministic code rules.",
        },
        {
          heading: "Machine-readable disclosure",
          body:
            "Every API response includes an ai_disclosure object: { ai_generated: bool, model: string, fields: string[] }. When AI content is present, ai_generated: true with the exact fields and model. Satisfies Art. 50(2) machine-readable marking requirement.",
        },
        {
          heading: "Human review",
          body:
            "AI output is not human-reviewed before being served. If you use the summary in your UI or business decisions, verify claims against the underlying checks. To request human review of a specific scan, email info@opensverige.se.",
        },
        {
          heading: "AI Act risk classification",
          body:
            "Our service is minimal/limited risk under Art. 50. No high-risk scenarios (recruitment, credit scoring, law enforcement). We are the deployer (article 3(4)); Anthropic is the provider (article 3(3)) — Anthropic handles technical marking, we handle informing you.",
        },
        {
          heading: "Your rights",
          body:
            "You have the right to know that text is AI-generated (satisfied via the ai_disclosure field). For badge assessments of an individual's portfolio (potentially automated decision-making under GDPR Art. 22), you can request human review via info@opensverige.se.",
        },
        {
          heading: "Training data",
          body:
            "We do not train any models on your scan data. Anthropic, per their terms (trust.anthropic.com): API data is not used for model training by default on the enterprise tier.",
        },
      ] as ReadonlyArray<{ heading: string; body: string }>,
      backLink: "← Back to the privacy policy",
    },

    subprocessors: {
      title: "Sub-processors",
      lastUpdated: "Last updated: April 26, 2026",
      intro:
        "List of all third parties processing data on behalf of OpenSverige when you use agent.opensverige.se. We notify at least 30 days before adding new sub-processors.",
      tableHeaders: {
        provider: "Provider",
        purpose: "Purpose",
        location: "Region",
        dpf: "Adequacy",
      },
      providers: [
        {
          name: "Vercel Inc.",
          purpose: "Hosting + edge functions (Next.js)",
          location: "US / EU",
          dpf: "EU-US DPF (certified)",
          link: "https://vercel.com/legal/privacy-policy",
        },
        {
          name: "Supabase Inc.",
          purpose: "Postgres database + auth",
          location: "EU (eu-west-2, London)",
          dpf: "DPA + SCC",
          link: "https://supabase.com/legal/dpa",
        },
        {
          name: "Anthropic PBC",
          purpose: "AI summaries (Claude API)",
          location: "US (Microsoft Azure)",
          dpf: "SCC + TIA — migrating to AWS Bedrock Frankfurt",
          link: "https://trust.anthropic.com",
        },
        {
          name: "Mendable Labs (Firecrawl)",
          purpose: "Renders JS-heavy sites for content analysis",
          location: "US",
          dpf: "SCC",
          link: "https://www.firecrawl.dev/legal/privacy",
        },
        {
          name: "Exa Labs Inc.",
          purpose: "Semantic search for dev portal discovery",
          location: "US",
          dpf: "SCC",
          link: "https://exa.ai/privacy-policy",
        },
        {
          name: "Cloudflare Inc.",
          purpose: "DNS + DDoS protection for opensverige.se",
          location: "Global (EU nodes)",
          dpf: "EU-US DPF (certified)",
          link: "https://www.cloudflare.com/trust-hub/gdpr/",
        },
        {
          name: "Cal.com Inc.",
          purpose: "Meeting bookings for builder calls",
          location: "EU + US",
          dpf: "SCC",
          link: "https://cal.com/privacy",
        },
      ] as ReadonlyArray<{ name: string; purpose: string; location: string; dpf: string; link: string }>,
      footnote:
        "Sub-processors handling personal data all have signed DPAs under GDPR Art. 28. Questions about specific flows? Email info@opensverige.se.",
      backLink: "← Back to the privacy policy",
    },
  },
} as const;

export type Translations = typeof I18N.sv;
