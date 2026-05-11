// app/scan/page.tsx
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import Nav from "./_components/Nav";
import ScannerSection from "./_components/ScannerSection";
import LiveCounter from "./_components/LiveCounter";
import CTA from "./_components/CTA";
import Footer from "./_components/Footer";
import { HomepageFaq } from "./_components/HomepageFaq";
import { buildScanFaqSchema } from "@/lib/scan-faqs";

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

// FAQ data is centralised in lib/scan-faqs.ts so the JSON-LD schema and
// the visible <HomepageFaq /> accordion render from a single source.
// Both Swedish and English FAQPage schemas are emitted so AI Overviews
// can serve the locale-appropriate answer regardless of the visitor's
// browser language.
const faqSchemaSv = buildScanFaqSchema(
  "https://agent.opensverige.se/scan",
  "sv",
);
const faqSchemaEn = buildScanFaqSchema(
  "https://agent.opensverige.se/scan",
  "en",
);

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaSv) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaEn) }}
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
      <HomepageFaq />
      <Separator className="max-w-[580px] mx-auto" />
      <CTA />
      <Footer />
    </>
  );
}
