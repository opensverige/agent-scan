import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/lib/language-context";
import { detectLang } from "@/lib/detect-lang";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agent.opensverige.se"),
  title: {
    default: "EU AI Act Readiness Scanner | agent.opensverige",
    template: "%s | agent.opensverige",
  },
  description:
    "EU-jurisdiction AI-agent-readiness scanner. 17 checks across discovery, EU AI Act Art. 50 compliance, and builder surface (API + MCP). Free. Open source under FSL-1.1-MIT. The Swedish/Nordic alternative to Cloudflare's isitagentready.com.",
  alternates: {
    canonical: "https://agent.opensverige.se",
    languages: {
      "sv-SE": "https://agent.opensverige.se",
      "en-US": "https://agent.opensverige.se",
    },
    types: {
      "text/markdown": "https://agent.opensverige.se/llms.txt",
    },
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    alternateLocale: ["en_US"],
    url: "https://agent.opensverige.se",
    siteName: "agent.opensverige",
    title: "EU AI Act Readiness Scanner | agent.opensverige",
    description:
      "Free EU-jurisdiction AI-agent-readiness scanner. 17 checks. Open source under FSL-1.1-MIT.",
    images: [{ url: "/assets/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EU AI Act Readiness Scanner | agent.opensverige",
    description:
      "17 checks for AI-agent readiness, EU AI Act Art. 50, GDPR. Free. Open source.",
    images: ["/assets/og-default.png"],
  },
  robots: { index: true, follow: true },
  other: {
    "ai-content-declaration":
      "AI-assisted summaries on /scan/* are produced by Anthropic Claude Sonnet 4.5 and labelled inline per EU AI Act Art. 50.",
  },
  icons: {
    icon: [
      { url: "/assets/Favicon 49.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/Favicon 50.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/Favicon 51.png", sizes: "48x48", type: "image/png" },
    ],
    apple: { url: "/assets/Apple Touch.png", sizes: "180x180", type: "image/png" },
  },
};

// Single canonical Organization entity for the whole opensverige
// constellation. Both opensverige.se and agent.opensverige.se share the
// same @id so AI search engines and Knowledge Graph collapse them into
// one node instead of treating them as separate entities.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://opensverige.se/#organization",
  name: "opensverige",
  alternateName: ["Open Sverige", "OpenSverige"],
  url: "https://opensverige.se",
  logo: {
    "@type": "ImageObject",
    url: "https://agent.opensverige.se/assets/og-default.png",
    width: 1200,
    height: 630,
  },
  description:
    "Sveriges öppna community för AI-agenter, MCP-integrationer och vibecoding. Builds open tooling for EU-jurisdiction AI-agent readiness, including agent.opensverige.se — a free, open-source scanner aligned with the EU AI Act.",
  foundingDate: "2025",
  foundingLocation: {
    "@type": "Place",
    name: "Stockholm, Sweden",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Stockholm",
      addressCountry: "SE",
    },
  },
  areaServed: [
    { "@type": "Country", name: "Sweden" },
    { "@type": "Place", name: "European Union" },
  ],
  knowsAbout: [
    "AI agents",
    "Model Context Protocol",
    "MCP servers",
    "EU AI Act",
    "EU AI Act Article 50",
    "AI-readiness scanning",
    "GDPR Article 6(1)(f)",
    "llms.txt",
    "Agentic Engine Optimization",
    "vibecoding",
    "OpenClaw",
    "Claude Agent SDK",
    "OpenAI Agents SDK",
    "Functional Source License",
  ],
  founder: [
    { "@id": "https://opensverige.se/#gustaf-garnow" },
    { "@id": "https://opensverige.se/#felipe-otarola" },
  ],
  sameAs: [
    "https://opensverige.se",
    "https://github.com/opensverige",
    "https://discord.gg/CSphbTk8En",
    "https://www.linkedin.com/groups/9544657/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@opensverige.se",
    contactType: "customer support",
    availableLanguage: ["sv", "en"],
  },
  subOrganization: {
    "@type": "Organization",
    "@id": "https://agent.opensverige.se/#organization",
    name: "agent.opensverige",
    url: "https://agent.opensverige.se",
    parentOrganization: { "@id": "https://opensverige.se/#organization" },
  },
};

const personSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://opensverige.se/#gustaf-garnow",
    name: "Gustaf Garnow",
    alternateName: "Baltsar",
    jobTitle: "Co-founder",
    worksFor: { "@id": "https://opensverige.se/#organization" },
    knowsAbout: [
      "AI agents",
      "Model Context Protocol",
      "EU AI Act",
      "vibecoding",
      "Agentic Engine Optimization",
    ],
    sameAs: ["https://www.linkedin.com/in/gustafgarnow/"],
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://opensverige.se/#felipe-otarola",
    name: "Felipe Otarola",
    jobTitle: "Co-founder",
    worksFor: { "@id": "https://opensverige.se/#organization" },
    knowsAbout: ["AI agents", "Model Context Protocol", "developer tools"],
    sameAs: ["https://www.linkedin.com/in/felipe-otarola/"],
  },
];

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://agent.opensverige.se/#website",
  url: "https://agent.opensverige.se",
  name: "agent.opensverige",
  description:
    "Free EU-jurisdiction AI-agent-readiness scanner. 17 checks. Open source under FSL-1.1-MIT.",
  publisher: { "@id": "https://opensverige.se/#organization" },
  inLanguage: ["sv-SE", "en-US"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://agent.opensverige.se/scan?domain={domain}",
    },
    "query-input": "required name=domain",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Server-side language detection. Cookie wins (manual choice persists),
  // then Accept-Language (browser preference), then Vercel's geo header.
  // Setting <html lang> here matches initial React state so there's no
  // hydration flash from sv → en for English-preferring visitors.
  const h = await headers();
  const initialLang = detectLang({
    cookie: h.get("cookie") ?? undefined,
    acceptLanguage: h.get("accept-language") ?? undefined,
    country: h.get("x-vercel-ip-country") ?? undefined,
    userAgent: h.get("user-agent") ?? undefined,
  });

  return (
    <html
      lang={initialLang}
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchemas) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Cal.com element-click embed, runs synchronously before any interaction */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(C,A,L){let p=function(a,ar){a.q.push(ar);};let d=C.document;C.Cal=C.Cal||function(){let cal=C.Cal;let ar=arguments;if(!cal.loaded){cal.ns={};cal.q=cal.q||[];d.head.appendChild(d.createElement("script")).src=A;cal.loaded=true;}if(ar[0]===L){const api=function(){p(api,arguments);};const namespace=ar[1];api.q=api.q||[];if(typeof namespace==="string"){cal.ns[namespace]=cal.ns[namespace]||api;p(cal.ns[namespace],ar);p(cal,["initNamespace",namespace]);}else p(cal,ar);return;}p(cal,ar);};})(window,"https://app.cal.com/embed/embed.js","init");Cal("init","opensverige",{origin:"https://app.cal.com"});Cal.ns.opensverige("ui",{"hideEventTypeDetails":false,"layout":"month_view"});`,
          }}
        />
        <LanguageProvider initialLang={initialLang}>
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
