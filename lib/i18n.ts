// lib/i18n.ts
export type Lang = "sv" | "en";

export const I18N = {
  sv: {
    langToggle: "EN",

    nav: {
      discord: "🇸🇪 300+ builders →",
    },

    scanner: {
      headline: "Hur agent-redo är ditt företag?",
      subtext: "Vi visar vad AI-agenter ser — och vad som stoppar dem.",
      placeholder: "dittforetag.se",
      ariaLabel: "Domännamn att scanna",
      scanBtn: "Scanna →",
      whyHeading: "Varför",
      whyText:
        "Företag som inte syns för agenter blir ointegrerbara. Builders väljer system med öppna API:er — vi visar var ditt står.",
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
      headline: "Hur agent-redo är ditt företag?",
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
          heading: "Dina rättigheter",
          body:
            "Enligt GDPR har du rätt till tillgång, rättelse, radering, begränsning, dataportabilitet och invändning. Du kan klaga hos Integritetsskyddsmyndigheten (IMY) för GDPR-frågor och hos Post- och telestyrelsen (PTS) för AI Act-frågor (per SOU 2025:101).",
        },
        {
          heading: "Kontakt",
          body:
            "Personuppgiftsansvarig: OpenSverige. Kontakt: info@opensverige.se. Vi svarar så snart vi kan — vi är en community, inte en kundtjänst.",
        },
      ] as ReadonlyArray<{ heading: string; body: string }>,
      backLink: "← Tillbaka till scannern",
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
      headline: "How AI-ready is your company?",
      subtext: "We show what AI agents see — and what's stopping them.",
      placeholder: "yourcompany.com",
      ariaLabel: "Domain name to scan",
      scanBtn: "Scan →",
      whyHeading: "Why",
      whyText:
        "Companies invisible to agents become unintegrable. Builders choose systems with open APIs — we show where yours stands.",
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
      headline: "How AI-ready is your company?",
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
          heading: "Your rights",
          body:
            "Under GDPR you have the right to access, rectification, erasure, restriction, portability and objection. Complaints can be lodged with IMY for GDPR matters and with PTS (Swedish Post and Telecom Authority) for AI Act matters (per SOU 2025:101).",
        },
        {
          heading: "Contact",
          body:
            "Controller: OpenSverige. Contact: info@opensverige.se. We reply as soon as we can — we're a community, not a support desk.",
        },
      ] as ReadonlyArray<{ heading: string; body: string }>,
      backLink: "← Back to the scanner",
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
