// app/verktyg/page.tsx
import type { Metadata } from "next";
import Footer from "@/app/scan/_components/Footer";
import { CommunityToolCard } from "@/components/community-tool-card";
import { SiteNav } from "@/components/site-nav";
import { COMMUNITY_TOOLS } from "@/lib/community-tools";

const TITLE = "Gratis verktyg från communityn · Open source";
const DESCRIPTION =
  "Open source-verktyg byggda av folk i OpenSverige. Granska koden, säkerheten och agenterna du bygger. Gratis och körs på din dator.";
const URL = "https://agent.opensverige.se/verktyg";
const DISCORD = "https://discord.gg/CSphbTk8En";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: "agent.opensverige",
    type: "website",
    locale: "sv_SE",
    images: [{ url: "https://agent.opensverige.se/assets/og-crayfish-bg.png", width: 1200, height: 630 }],
  },
};

export default function VerktygPage() {
  return (
    <>
      <SiteNav />
      <main>
        <div className="mx-auto w-full max-w-[720px] px-5 pb-24">
          <section className="pt-14 sm:pt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Byggt i communityn · Open source · Gratis
            </p>
            <h1 className="mt-4 font-serif text-[clamp(38px,8vw,64px)] font-normal leading-[1.04] tracking-[-1.5px]">
              Gratis verktyg från communityn
            </h1>
            <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-muted-foreground">
              Byggda av folk i OpenSverige. Kör dem på din egen dator, utan konto. Källkoden är öppen.
            </p>
          </section>

          <section className="mt-12 space-y-5" aria-label="Verktyg">
            {COMMUNITY_TOOLS.map(tool => (
              <CommunityToolCard key={tool.id} tool={tool} />
            ))}
          </section>

          <section className="mt-12 rounded-2xl bg-muted/50 px-5 py-5 text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-sm font-semibold text-foreground">Så väljer vi verktyg</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Byggt av någon i OpenSverige-communityn.</li>
              <li>Gratis att använda, utan konto.</li>
              <li>
                Open source med en licens i repot, till exempel MIT eller AGPL. Utan licensfil är koden inte fri att
                använda, så då väntar vi.
              </li>
            </ul>
            <p className="mt-4">
              Har du byggt något som passar?{" "}
              <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                Tipsa oss i Discord →
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
