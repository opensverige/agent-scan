// app/rapport/page.tsx
//
// Hub-sida för alla opensverige-rapporter. Listar publicerade kvartalsvis
// rapporter med eyebrow, titel, sammanfattning och publiceringsdatum.

import type { Metadata } from "next";
import Link from "next/link";
import { MdArrowForward } from "react-icons/md";
import Nav from "../scan/_components/Nav";
import Footer from "../scan/_components/Footer";
import { Eyebrow } from "@/components/report/Eyebrow";

export const metadata: Metadata = {
  title: "Rapporter — agent.opensverige",
  description:
    "Kvartalsvis öppen lägesrapport om svenska sajters AI-agent-readiness. Datadriven, granskningsbar, open source.",
  alternates: {
    canonical: "https://agent.opensverige.se/rapport",
  },
};

interface ReportEntry {
  slug: string;
  eyebrow: string;
  title: string;
  lead: string;
  publishedAt: string;
  status: "live" | "draft";
}

const REPORTS: readonly ReportEntry[] = [
  {
    slug: "q1-2026",
    eyebrow: "Q1 2026 · Volym 01",
    title: "Svensk AI-Readiness Index Q1 2026",
    lead:
      "Sex stora svenska myndighetssajter har ingen AI-policy. Mainstream-medier blockerar elva AI-bottar var. SaaS-sektorn öppnar dörrarna. En lägesbild över 500 sajter.",
    publishedAt: "2026-05-15",
    status: "draft",
  },
];

export default function ReportsHubPage() {
  return (
    <div data-report className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-[1280px] px-5 py-20 sm:px-8 md:py-28">
          <Eyebrow tone="primary">opensverige · Rapporter</Eyebrow>
          <h1 className="mt-8 max-w-[18ch] font-serif font-normal leading-[1.02] tracking-[-0.025em] text-[hsl(var(--foreground))]">
            <span className="block text-[clamp(44px,7vw,72px)]">
              Lägesrapporter om svenska sajters AI-agent-readiness
            </span>
          </h1>
          <p className="mt-8 max-w-[58ch] font-sans text-[clamp(18px,2vw,21px)] leading-[1.55] text-[hsl(var(--foreground-soft))]">
            Kvartalsvis. Datadriven. Öppen källkod, öppen data. Sveriges
            mest besökta sajter mäts mot tolv tekniska signaler för
            AI-agent-läsbarhet. Vi publicerar siffrorna, metodologin och
            rådatan.
          </p>
        </section>

        <section className="border-t border-[hsl(var(--hairline))] bg-[hsl(var(--surface-sunken))]">
          <div className="mx-auto w-full max-w-[1280px] px-5 py-16 sm:px-8 md:py-20">
            <Eyebrow>Publicerade rapporter</Eyebrow>
            <ul className="mt-10 space-y-px overflow-hidden rounded-md border border-[hsl(var(--hairline))] bg-[hsl(var(--hairline))]">
              {REPORTS.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/rapport/${r.slug}`}
                    className="group flex flex-col gap-6 bg-[hsl(var(--background))] p-7 transition-colors duration-150 hover:bg-[hsl(var(--surface-card))] md:flex-row md:items-start md:gap-12 md:p-10"
                  >
                    <div className="md:w-[220px] md:shrink-0">
                      <Eyebrow tone="primary">{r.eyebrow}</Eyebrow>
                      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                        <span className="tabular-nums">{r.publishedAt}</span>
                        {r.status === "draft" && (
                          <>
                            <span aria-hidden className="mx-2 opacity-40">·</span>
                            <span className="text-[hsl(var(--primary))]">
                              Utkast
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h2 className="font-serif text-[clamp(24px,3.5vw,34px)] font-normal leading-[1.15] tracking-[-0.015em] text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))]">
                        {r.title}
                      </h2>
                      <p className="mt-4 max-w-[60ch] font-sans text-[16px] leading-[1.6] text-[hsl(var(--muted-foreground))]">
                        {r.lead}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--foreground))] transition-all group-hover:gap-3">
                        Läs rapporten
                        <MdArrowForward className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
