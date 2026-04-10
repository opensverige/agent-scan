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

      // Agent catalog
      catalogTitle: "AGENT-KATALOGEN — KOMMER SNART",
      catalogDesc: "Öppen katalog för agenter mot svenska affärssystem.",

      // Sharing
      shareResult: "Dela ditt resultat",
      sendToTeam: "Skicka till ditt team",
      copied: "Kopierat!",
      discordBtn: "250+ builders i Discord →",
      scanAnother: "← Scanna en annan sajt",
      shareApiText: (domain: string, score: number, blockers: number, url: string) =>
        `${score < 30 ? "🔴" : score < 70 ? "🟡" : "🟢"} ${domain} fick ${score}/100 i API agent-readiness.\n\n${blockers} blockerare hittade.\n\nHur redo är ditt API? → ${url}`,
      shareSiteText: (domain: string, score: number, critical: number, important: number, passed: number, url: string) =>
        `${score <= 3 ? "🔴" : score <= 6 ? "🟡" : "🟢"} ${domain} fick ${score}/11 i AI-readiness.\n\n● ${critical} brister ● ${important} varningar ● ${passed} ok\n\nHur redo är din sajt? → ${url}`,
      teamShareText: (domain: string, score: number, total: number, url: string) =>
        `Jag scannade ${domain} med agent.opensverige.se — vi fick ${score}/${total}. Här är vad vi kan fixa: ${url}`,

      // Timestamps
      staleWarning: "Föråldrat resultat —",
      scannedAt: "Scannades",
      daysAgo: (n: number) => `(${n} dagar sedan)`,
      today: "(idag)",
      scanAgain: "Skanna igen →",

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

      catalogTitle: "AGENT CATALOG — COMING SOON",
      catalogDesc: "Open catalog for agents targeting Swedish business systems.",

      shareResult: "Share your result",
      sendToTeam: "Send to your team",
      copied: "Copied!",
      discordBtn: "250+ builders on Discord →",
      scanAnother: "← Scan another site",
      shareApiText: (domain: string, score: number, blockers: number, url: string) =>
        `${score < 30 ? "🔴" : score < 70 ? "🟡" : "🟢"} ${domain} scored ${score}/100 in API agent-readiness.\n\n${blockers} blockers found.\n\nHow ready is your API? → ${url}`,
      shareSiteText: (domain: string, score: number, critical: number, important: number, passed: number, url: string) =>
        `${score <= 3 ? "🔴" : score <= 6 ? "🟡" : "🟢"} ${domain} scored ${score}/11 in AI-readiness.\n\n● ${critical} issues ● ${important} warnings ● ${passed} ok\n\nHow ready is your site? → ${url}`,
      teamShareText: (domain: string, score: number, total: number, url: string) =>
        `I scanned ${domain} with agent.opensverige.se — we scored ${score}/${total}. Here's what we can fix: ${url}`,

      staleWarning: "Outdated result —",
      scannedAt: "Scanned",
      daysAgo: (n: number) => `(${n} days ago)`,
      today: "(today)",
      scanAgain: "Scan again →",

      demoBadge: "DEMO",
      demoText:
        "Technical checks are real. Analysis text is generic until ANTHROPIC_API_KEY is added.",

      notFoundText: "No scan found for this domain.",
      scanDomain: (d: string) => `Scan ${d} →`,

      disclaimer:
        "This is a technical observation, not legal advice. Compliance results are general and not based on a review of your specific policies.",
    },
  },
} as const;

export type Translations = typeof I18N.sv;
