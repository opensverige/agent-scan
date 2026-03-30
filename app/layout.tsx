import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import Script from "next/script";
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
    default: "AI Readiness Scanner | agent.opensverige",
    template: "%s | agent.opensverige",
  },
  description:
    "Scanna din sajt och se hur redo du är för AI-agenter. Gratis, öppen källkod.",
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: "https://agent.opensverige.se",
    siteName: "agent.opensverige",
  },
  robots: { index: true, follow: true },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "opensverige",
  url: "https://agent.opensverige.se",
  sameAs: ["https://opensverige.se", "https://discord.gg/CSphbTk8En"],
  description: "Sveriges öppna community för AI-agenter. Gratis verktyg för att mäta AI-readiness.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@opensverige.se",
    contactType: "customer support",
    availableLanguage: "Swedish",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="sv"
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
        <Script src="https://app.cal.com/embed/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
