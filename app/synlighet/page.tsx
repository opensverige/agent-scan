// app/synlighet/page.tsx
import type { Metadata } from "next";
import Footer from "@/app/scan/_components/Footer";
import { SiteNav } from "@/components/site-nav";
import { VisibilityChecker } from "./_components/VisibilityChecker";

const TITLE = "Rekommenderar AI ditt företag? · AI-synlighetskollen";
const DESCRIPTION =
  "Gratis koll på svenska: vi ställer kundernas frågor till AI med webbsök från Sverige och visar om ditt företag nämns, vilka som nämns istället och vad som stänger ute AI från din sajt.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://agent.opensverige.se/synlighet" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://agent.opensverige.se/synlighet",
    siteName: "agent.opensverige",
    type: "website",
    locale: "sv_SE",
    images: [{ url: "https://agent.opensverige.se/assets/og-crayfish-bg.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://agent.opensverige.se/assets/og-crayfish-bg.png"],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI-synlighetskollen",
  url: "https://agent.opensverige.se/synlighet",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "sv-SE",
  offers: { "@type": "Offer", price: "0", priceCurrency: "SEK" },
  publisher: { "@type": "Organization", name: "OpenSverige", url: "https://opensverige.se" },
  description: DESCRIPTION,
};

export default function SynlighetPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteNav />
      <main>
        <VisibilityChecker />
      </main>
      <Footer />
    </>
  );
}
