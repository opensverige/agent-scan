// app/scan/page.tsx
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import Nav from "./_components/Nav";
import ScannerSection from "./_components/ScannerSection";
import LiveCounter from "./_components/LiveCounter";
import CTA from "./_components/CTA";
import Footer from "./_components/Footer";

export const metadata: Metadata = {
  title: "AI Readiness Scanner — 17 checks · EU-jurisdiction",
  description:
    "Free EU-jurisdiction AI-agent-readiness scanner. 17 checks across discovery (llms.txt, robots, sitemap, MCP), EU AI Act Art. 50 compliance, and developer surface. No signup. Open source under FSL-1.1-MIT.",
  alternates: {
    canonical: "https://agent.opensverige.se/scan",
    types: {
      "text/markdown": "https://agent.opensverige.se/scan",
    },
  },
  openGraph: {
    title: "AI Readiness Scanner — 17 checks · EU-jurisdiction",
    description:
      "Free EU-jurisdiction AI-agent-readiness scanner. 17 checks. Open source.",
    url: "https://agent.opensverige.se/scan",
    siteName: "agent.opensverige",
    type: "website",
    images: [{ url: "https://agent.opensverige.se/assets/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Readiness Scanner — 17 checks · EU-jurisdiction",
    description: "Free EU-jurisdiction scanner. 17 checks. agent.opensverige.se",
    images: ["https://agent.opensverige.se/assets/og-default.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://agent.opensverige.se/scan#faq",
  inLanguage: "sv-SE",
  mainEntity: [
    {
      "@type": "Question",
      name: "Vad är AI-agent-readiness?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI-agent-readiness mäter hur väl en webbplats är konfigurerad för att hittas, förstås och användas av AI-agenter (Claude, ChatGPT, Cursor, Perplexity). Det inkluderar discovery-signaler (robots.txt, sitemap, llms.txt, llms-full.txt, markdown-content-negotiation, SSR-content, AI-crawler-access), regulatorisk compliance (GDPR Art. 6, EU AI Act Art. 50) och builder-API-yta (OpenAPI, MCP, sandbox).",
      },
    },
    {
      "@type": "Question",
      name: "Vad kollar scannern?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scannern kontrollerar 17 checks i tre kategorier. Discovery (7): robots_ok, crawler_access, sitemap_exists, llms_txt, llms_full_txt, markdown_negotiation, ssr_content. Compliance (3): privacy_automation, cookie_bot_handling, ai_content_marking. Builder (7): api_exists, openapi_spec, api_docs, mcp_server, mcp_well_known, mcp_server_card, sandbox_available.",
      },
    },
    {
      "@type": "Question",
      name: "Kostar det något?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nej, scannern är gratis och kräver ingen registrering. För programmatisk åtkomst via /api/v1/scan utfärdar vi API-nycklar via Discord. Hobby-tiern är 15 scans/månad utan kostnad. Source-available under FSL-1.1-MIT.",
      },
    },
    {
      "@type": "Question",
      name: "Vad är llms.txt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "llms.txt är en markdown-fil på /llms.txt som beskriver din sajt för AI-agenter. Den fungerar som en task-organiserad innehållskarta: vilka sidor är viktigast, vad gör API:t, var finns juridiska policys. Standarden bygger på llmstxt.org-spec:en. Vår egen ligger på https://agent.opensverige.se/llms.txt som referens.",
      },
    },
    {
      "@type": "Question",
      name: "Hur skiljer sig agent.opensverige.se från Cloudflares isitagentready.com?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tre konkreta skillnader. (1) EU-jurisdiktion: data-planet ligger i Supabase eu-west-2 London, inte USA. (2) EU AI Act Art. 50: varje AI-genererad sammanfattning levereras med en maskinläsbar ai_disclosure-block, vilket Cloudflare inte gör. (3) Svenska compliance-paths: scannern hittar /integritetspolicy, /personuppgifter, /cookieanvandning som ingen global scanner letar efter.",
      },
    },
    {
      "@type": "Question",
      name: "Vad händer med min data när jag scannar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scan-resultat och en HMAC-SHA256-hashad version av din IP lagras i Supabase eu-west-2 London. Allt raderas automatiskt efter 90 dagar via pg_cron. Anthropic Claude bearbetar domännamn och publikt scan-innehåll för att generera summary-fältet (men inte din IP); migrering till AWS Bedrock Frankfurt sker före EU AI Act-deadlinen 2026-08-02.",
      },
    },
  ],
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://agent.opensverige.se/#scanner",
  name: "agent.opensverige AI Readiness Scanner",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: "https://agent.opensverige.se/scan",
  description:
    "Free, open-source EU-jurisdiction scanner that measures any website's AI-agent readiness across 17 technical checks. Aligned with EU AI Act Art. 50 and GDPR. The Swedish/Nordic alternative to Cloudflare isitagentready.com.",
  inLanguage: ["sv-SE", "en-US"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
  audience: {
    "@type": "Audience",
    audienceType:
      "Developers, AI agent builders, agencies, compliance officers, EU SaaS vendors",
  },
  featureList: [
    "llms.txt and llms-full.txt detection",
    "robots.txt AI-crawler allow-list audit",
    "Sitemap discovery (xml, _index, wp-sitemap, .php variants)",
    "Markdown content negotiation probe (Accept: text/markdown)",
    "SSR content vs JS-only-content check",
    "AI-crawler accessibility probe (ClaudeBot, GPTBot, PerplexityBot)",
    "GDPR privacy-policy and cookie-banner heuristics",
    "EU AI Act Article 50 ai_disclosure detection",
    "OpenAPI 3.x / Swagger / RAML spec discovery",
    "API documentation surface check",
    "MCP server endpoint detection",
    ".well-known/mcp and mcp/server-card.json probes",
    "Public sandbox availability check",
    "Per-check severity (critical / important / info) with green-yellow-red badge",
  ],
  publisher: { "@id": "https://opensverige.se/#organization" },
  license: "https://github.com/opensverige/agent-scan/blob/main/LICENSE",
  isAccessibleForFree: true,
  countryOfOrigin: { "@type": "Country", name: "Sweden" },
  applicationSubCategory: "AI Readiness Scanner",
  softwareVersion: "Stage 1 / P0",
};

interface PageProps {
  searchParams: Promise<{ domain?: string }>;
}

export default async function ScanPage({ searchParams }: PageProps) {
  const { domain } = await searchParams;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <Nav />
      <ScannerSection initialDomain={domain} />
      <div className="px-6 pb-10">
        <LiveCounter />
      </div>
      <Separator className="max-w-[580px] mx-auto" />
      <CTA />
      <Footer />
    </>
  );
}
