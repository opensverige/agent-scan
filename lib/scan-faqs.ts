// lib/scan-faqs.ts
//
// Single source of truth for the homepage FAQ. Both the FAQPage JSON-LD
// schema injected into /scan and the visible accordion in
// app/scan/_components/HomepageFaq.tsx read from this list — schema and
// rendered DOM never drift.

export interface ScanFaq {
  q: string;
  a: string;
}

export const SCAN_FAQS: readonly ScanFaq[] = [
  {
    q: "Vad är AI-agent-readiness?",
    a: "AI-agent-readiness mäter hur väl en webbplats är konfigurerad för att hittas, förstås och användas av AI-agenter (Claude, ChatGPT, Cursor, Perplexity). Det inkluderar discovery-signaler (robots.txt, sitemap, llms.txt, llms-full.txt, markdown-content-negotiation, SSR-content, AI-crawler-access), regulatorisk compliance (GDPR Art. 6, EU AI Act Art. 50) och builder-API-yta (OpenAPI, MCP, sandbox).",
  },
  {
    q: "Vad kollar scannern?",
    a: "Scannern kontrollerar 17 checks i tre kategorier. Discovery (7): robots_ok, crawler_access, sitemap_exists, llms_txt, llms_full_txt, markdown_negotiation, ssr_content. Compliance (3): privacy_automation, cookie_bot_handling, ai_content_marking. Builder (7): api_exists, openapi_spec, api_docs, mcp_server, mcp_well_known, mcp_server_card, sandbox_available. Varje check har en metodologi-sida med primärkällor.",
  },
  {
    q: "Är scannern gratis?",
    a: "Ja, ingen registrering krävs. För programmatisk åtkomst via /api/v1/scan utfärdar vi API-nycklar via Discord. Hobby-tiern är 15 scans per månad utan kostnad. Source-available under FSL-1.1-MIT.",
  },
  {
    q: "Vad händer med min data?",
    a: "Scan-resultat och en HMAC-SHA256-hashad version av din IP lagras i Supabase eu-west-2 London. Allt raderas automatiskt efter 90 dagar via pg_cron. Anthropic Claude bearbetar domännamn och publikt scan-innehåll för att generera summary-fältet (men inte din IP); migrering till AWS Bedrock Frankfurt sker före EU AI Act-deadlinen 2026-08-02.",
  },
  {
    q: "Hur skiljer sig agent.opensverige från Cloudflares isitagentready.com?",
    a: "Tre konkreta skillnader. EU-jurisdiktion: data-planet ligger i Supabase eu-west-2 London, inte USA. EU AI Act Art. 50: varje AI-genererad sammanfattning levereras med en maskinläsbar ai_disclosure-block, vilket Cloudflare inte gör. Svenska compliance-paths: scannern hittar /integritetspolicy, /personuppgifter, /cookieanvandning som ingen global scanner letar efter.",
  },
  {
    q: "Hur ofta uppdateras checks-listan?",
    a: "Listan revideras kvartalsvis när nya specs eller regulatoriska krav landar (EU AI Act-tidlinje, MCP-spec-uppdateringar, llmstxt.org-revisioner). Varje check har en metodologi-sida med lastUpdated och primärkällor — du kan följa förändringarna där eller via vår GitHub.",
  },
] as const;

export function buildScanFaqSchema(canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    inLanguage: "sv-SE",
    mainEntity: SCAN_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}
