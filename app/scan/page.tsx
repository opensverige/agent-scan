// app/scan/page.tsx
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import Nav from "./_components/Nav";
import ScannerSection from "./_components/ScannerSection";
import CTA from "./_components/CTA";
import Footer from "./_components/Footer";

export const metadata: Metadata = {
  title: "Hur agent-redo är ditt företag?",
  description: "Gratis AI-readiness scanner. 11 checks. Öppet.",
  openGraph: {
    title: "Hur agent-redo är ditt företag?",
    description: "Gratis AI-readiness scanner — 11 checks. Öppet.",
    url: "https://agent.opensverige.se",
    siteName: "agent.opensverige",
    type: "website",
    images: [{ url: "https://agent.opensverige.se/assets/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hur agent-redo är ditt företag?",
    description: "Gratis AI-readiness scanner — agent.opensverige.se",
    images: ["https://agent.opensverige.se/assets/og-default.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Vad är AI-readiness?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI-readiness mäter hur väl en webbplats är konfigurerad för att hittas, förstås och användas av AI-agenter. Det inkluderar tekniska faktorer som robots.txt, llms.txt, API-tillgänglighet och regulatorisk efterlevnad (GDPR, EU AI Act).",
      },
    },
    {
      "@type": "Question",
      name: "Vad kollar scannern?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scannern kontrollerar 11 kriterier i tre kategorier: Discovery (robots.txt, sitemap.xml, llms.txt), Compliance (GDPR, cookiehantering, AI-märkning) och Builder (API, OpenAPI-spec, API-dokumentation, MCP-server, sandbox).",
      },
    },
    {
      "@type": "Question",
      name: "Kostar det något?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nej, scannern är helt gratis och öppen källkod. Du kan scanna din sajt utan att registrera dig.",
      },
    },
    {
      "@type": "Question",
      name: "Vad är llms.txt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "llms.txt är en textfil placerad på /llms.txt på din domän som beskriver din sajt för AI-system. Precis som robots.txt kommunicerar med sökmotorer kommunicerar llms.txt med stora språkmodeller och AI-agenter.",
      },
    },
  ],
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
      <Nav />
      <ScannerSection initialDomain={domain} />
      <Separator className="max-w-[580px] mx-auto" />
      <CTA />
      <Footer />
    </>
  );
}
