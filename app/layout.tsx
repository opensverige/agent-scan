import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  icons: {
    icon: [
      { url: "/assets/Favicon 49.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/Favicon 50.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/Favicon 51.png", sizes: "48x48", type: "image/png" },
    ],
    apple: { url: "/assets/Apple Touch.png", sizes: "180x180", type: "image/png" },
  },
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
        {/* Cal.com element-click embed — runs synchronously before any interaction */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(C,A,L){let p=function(a,ar){a.q.push(ar);};let d=C.document;C.Cal=C.Cal||function(){let cal=C.Cal;let ar=arguments;if(!cal.loaded){cal.ns={};cal.q=cal.q||[];d.head.appendChild(d.createElement("script")).src=A;cal.loaded=true;}if(ar[0]===L){const api=function(){p(api,arguments);};const namespace=ar[1];api.q=api.q||[];if(typeof namespace==="string"){cal.ns[namespace]=cal.ns[namespace]||api;p(cal.ns[namespace],ar);p(cal,["initNamespace",namespace]);}else p(cal,ar);return;}p(cal,ar);};})(window,"https://app.cal.com/embed/embed.js","init");Cal("init","opensverige",{origin:"https://app.cal.com"});Cal.ns.opensverige("ui",{"hideEventTypeDetails":false,"layout":"month_view"});`,
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
