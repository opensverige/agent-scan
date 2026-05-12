// app/rapport/q1-2026/page.tsx
//
// Svensk AI-Readiness Index Q1 2026 — long-form rapport.
// Wraps in [data-report] for light editorial theme. Two-column desktop
// layout with sticky table-of-contents on the left and article on the
// right. Mobile collapses to single column.

import type { Metadata } from "next";
import Link from "next/link";
import { MdArrowOutward, MdDownload } from "react-icons/md";
import Nav from "../../scan/_components/Nav";
import Footer from "../../scan/_components/Footer";
import { Eyebrow } from "@/components/report/Eyebrow";
import { Hero } from "@/components/report/Hero";
import { CompactStatRow } from "@/components/report/CompactStatRow";
import { DenseSectionHeader } from "@/components/report/DenseSectionHeader";
import { SectionAnchor } from "@/components/report/SectionAnchor";
import { Sidenote } from "@/components/report/Sidenote";
import { DataBar } from "@/components/report/DataBar";
import { PullQuote } from "@/components/report/PullQuote";
import { Prose } from "@/components/report/Prose";
import { ReadingProgress } from "@/components/report/ReadingProgress";
import { StickyToc, type TocEntry } from "@/components/report/StickyToc";
import { MetaBar } from "@/components/report/MetaBar";
import { LiveCountdown } from "@/components/report/LiveCountdown";

const REPORT_URL = "https://agent.opensverige.se/rapport/q1-2026";

export const metadata: Metadata = {
  title:
    "Svensk AI-Readiness Index Q1 2026 — opensverige",
  description:
    "Sex av sex stora svenska myndighetssajter publicerar ingen AI-vägledning för agenter. Mainstream-medier blockerar elva AI-bottar var. SaaS-sektorn öppnar dörrarna. En öppen lägesrapport över Sveriges 500 mest besökta sajter, 84 dagar innan EU AI Act Article 50 börjar tillämpas.",
  keywords: [
    "AI-readiness",
    "llms.txt",
    "EU AI Act",
    "svenska sajter",
    "AI-agenter",
    "GEO",
    "AEO",
    "robots.txt",
    "myndigheter",
  ],
  authors: [
    { name: "Gustaf Garnow" },
    { name: "Felipe Otarola" },
  ],
  alternates: { canonical: REPORT_URL },
  openGraph: {
    type: "article",
    title: "Svensk AI-Readiness Index Q1 2026",
    description:
      "Sex av sex svenska myndighetssajter publicerar ingen AI-vägledning för agenter. Mainstream-medier blockerar. SaaS leder. En lägesbild över 500 sajter.",
    url: REPORT_URL,
    siteName: "opensverige",
    locale: "sv_SE",
    publishedTime: "2026-05-15T08:00:00.000Z",
    authors: ["Gustaf Garnow", "Felipe Otarola"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Svensk AI-Readiness Index Q1 2026",
    description:
      "0/6 svenska myndigheter publicerar AI-vägledning för agenter. 23 medier blockerar. 16 sajter leder. Öppen data, öppen källkod.",
  },
};

// --- TOC entries ----------------------------------------------------------
// Numbering matches reader-feedback v2 — policy-vakuum first, sales pitch
// section removed entirely.
const TOC: readonly TocEntry[] = [
  { id: "sammanfattning", num: "00", title: "Sammanfattning" },
  { id: "policy-vakuum", num: "01", title: "Policy-vakuumet" },
  { id: "saas-vs-media", num: "02", title: "SaaS vs mainstream" },
  { id: "sverige-vs-usa", num: "03", title: "Sverige vs Fortune 500" },
  { id: "sektor-breakdown", num: "04", title: "Sektor för sektor" },
  { id: "pionjarer", num: "05", title: "Sveriges 16 pionjärer" },
  { id: "metod", num: "06", title: "Metod och begränsningar" },
];

// --- JSON-LD --------------------------------------------------------------
const REPORT_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Report",
  headline: "Svensk AI-Readiness Index Q1 2026",
  inLanguage: "sv-SE",
  datePublished: "2026-05-15",
  dateModified: "2026-05-15",
  url: REPORT_URL,
  author: [
    { "@type": "Person", name: "Gustaf Garnow" },
    { "@type": "Person", name: "Felipe Otarola" },
  ],
  publisher: {
    "@type": "Organization",
    name: "opensverige",
    url: "https://agent.opensverige.se",
  },
  license: "https://creativecommons.org/licenses/by/4.0/",
  about: [
    "AI-readiness",
    "llms.txt",
    "EU AI Act",
    "svenska sajter",
  ],
  isBasedOn: {
    "@type": "Dataset",
    name: "opensverige Q1 2026 probe results",
    license: "https://creativecommons.org/licenses/by/4.0/",
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl:
        "https://github.com/opensverige/agent-scan/blob/main/data/q1-2026-probe-results.csv",
    },
  },
};

export default function Q1Report2026Page() {
  return (
    <div data-report lang="sv" className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(REPORT_JSONLD) }}
      />
      <ReadingProgress />
      <Nav />

      <main className="flex-1">
        {/* ── Hero ── */}
        <Hero
          kicker="Q1 2026 · Volym 01 · Rapport"
          title={
            <>
              <span>
                Skatteverket har ingen{" "}
                <span className="whitespace-nowrap">AI&#8209;vägledning</span>
                .
              </span>
              <span className="text-[hsl(var(--foreground-soft))]/85">
                Bahnhof har det.
              </span>
              <span className="text-[hsl(var(--foreground-soft))]/65">
                Bonnier blockerar.
              </span>
            </>
          }
          lead="Hur Sveriges 500 mest besökta sajter står sig mot AI-agenter. Mätt 10 maj 2026."
          stat={{
            value: (
              <LiveCountdown to="2026-08-02T00:00:00+02:00" compact />
            ),
            unit: "dagar",
            label: "till EU AI Act Article 50 tillämpas, 2 augusti 2026.",
          }}
          meta={{
            publishedAt: "2026-05-15",
            version: "1.0",
            authors: "Garnow · Otarola",
          }}
        />

        {/* ── Nyckeltal: kompakt one-row band ── */}
        <CompactStatRow
          id="sammanfattning"
          eyebrow="Fyra nyckeltal · 500 sajter mätt 10 maj 2026"
          stats={[
            {
              value: "0",
              unit: "/6",
              label: "myndigheter publicerar AI-vägledning",
              emphasis: true,
            },
            {
              value: "3,2",
              unit: "%",
              label: "har llms.txt",
            },
            {
              value: "23",
              label: "medier blockerar AI",
            },
            {
              value: "16",
              label: "sajter leder adoption",
            },
          ]}
          source="Verifierat live via agent.opensverige.se/scan · 12 maj 2026"
        />

        {/* ── Two-column body ── */}
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-12 pt-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16 lg:pt-16">
            {/* Sticky TOC — desktop only */}
            <aside
              aria-label="Innehållsförteckning och delning"
              className="hidden lg:block"
            >
              <div className="sticky top-28">
                <StickyToc entries={TOC} />
                <div className="mt-10 border-t border-[hsl(var(--hairline))] pt-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                    Dela rapporten
                  </p>
                  <ul className="mt-4 space-y-3 font-sans text-[12.5px]">
                    <li>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Skatteverket har ingen AI-policy. Bahnhof har det. Bonnier blockerar. Svensk AI-Readiness Index Q1 2026.")}&url=${encodeURIComponent(REPORT_URL)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[hsl(var(--muted-foreground))] underline decoration-[hsl(var(--hairline))] underline-offset-[3px] transition-colors hover:text-[hsl(var(--foreground))] hover:decoration-[hsl(var(--primary))]"
                      >
                        X (Twitter)
                        <MdArrowOutward className="h-3 w-3" aria-hidden />
                      </a>
                    </li>
                    <li>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(REPORT_URL)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[hsl(var(--muted-foreground))] underline decoration-[hsl(var(--hairline))] underline-offset-[3px] transition-colors hover:text-[hsl(var(--foreground))] hover:decoration-[hsl(var(--primary))]"
                      >
                        LinkedIn
                        <MdArrowOutward className="h-3 w-3" aria-hidden />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/opensverige/agent-scan/blob/main/data/q1-2026-probe-results.csv"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[hsl(var(--muted-foreground))] underline decoration-[hsl(var(--hairline))] underline-offset-[3px] transition-colors hover:text-[hsl(var(--foreground))] hover:decoration-[hsl(var(--primary))]"
                      >
                        Rådata (CSV)
                        <MdDownload className="h-3 w-3" aria-hidden />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>

            <article className="min-w-0 max-w-[760px] pb-32">
              {/* Lead paragraph + summary */}
              <div className="mt-10 lg:mt-0">
                <h2 id="sammanfattning-heading" className="sr-only">
                  Sammanfattning
                </h2>
                <Eyebrow tone="primary">Sammanfattning</Eyebrow>
                <Prose>
                  <p>
                    Endast <strong>3,2 %</strong> av Sveriges 500 mest
                    besökta sajter har en <code>/llms.txt</code>-fil
                    som faktiskt innehåller markdown och vägleder
                    AI-agenter. Motsvarande siffra för USA:s Fortune
                    500 är <strong>7,4 %</strong>. Sverige ligger
                    ungefär hälften så långt fram i en av de tydligaste
                    signalerna för AI-search-läsbarhet.
                  </p>
                  <p>
                    Sex av sex stora svenska myndighetssajter —
                    Skatteverket, 1177, Riksdagen, Regeringen,
                    Migrationsverket och Försäkringskassan — har
                    <strong> inga regler alls</strong> för AI-agenter.
                    Ingen blockering. Ingen vägledning. Ingen
                    transparens. Det här händer 84 dagar innan EU:s AI
                    Act Article 50 börjar tillämpas.
                  </p>
                  <p>
                    Mainstream-medier blockerar hårdast: 23 svenska
                    nyhetssajter, inklusive Expressen, DN, Dagens
                    Industri, Sydsvenskan och samtliga större
                    lokaltidningar, blockerar i snitt 10 av de
                    vanligaste AI-bottarna. GPTBot är mest blockerad (56
                    av 500 sajter), följt av CCBot (55) och ClaudeBot
                    (52).
                  </p>
                  <p>
                    Den här rapporten kartlägger var Sverige står. Datan
                    är öppen.
                  </p>
                </Prose>
              </div>

              {/* ── Section 1 · Policy-vakuumet ── */}
              <SectionAnchor
                id="policy-vakuum"
                num="01"
                eyebrow="Policy-vakuumet"
                title="Sex av sex stora myndigheter publicerar ingen AI-vägledning"
                subtitle="Maskinläsbara signaler: llms.txt, agent-permissions.json, AI-bottar i robots.txt. Interna policys kan finnas — externt syns inget."
              />

              <Prose>
                <p>
                  Vi körde probe mot sex stora svenska myndigheter med
                  hög trafik och stor påverkan på medborgarnas vardag.
                  Tabellen är inte snäll mot någon.
                </p>
              </Prose>

              <figure className="my-10 overflow-hidden rounded-md border border-[hsl(var(--hairline))]">
                <table className="w-full border-collapse text-left font-sans text-[14.5px]">
                  <thead className="bg-[hsl(var(--surface-sunken))] text-[hsl(var(--foreground-soft))]">
                    <tr className="border-b border-[hsl(var(--hairline))]">
                      <th className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                        Myndighet
                      </th>
                      <th className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                        llms.txt
                      </th>
                      <th className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                        Blockerar AI
                      </th>
                      <th className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                        agent-permissions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[hsl(var(--foreground))]">
                    {[
                      { name: "Skatteverket · skatteverket.se", llms: "nej", blocks: "nej", perms: "nej" },
                      { name: "1177 Vårdguiden · 1177.se", llms: "nej", blocks: "nej", perms: "nej" },
                      { name: "Riksdagen · riksdagen.se", llms: "nej", blocks: "delvis (ClaudeBot)", perms: "nej", emphasis: true },
                      { name: "Regeringen · regeringen.se", llms: "nej", blocks: "nej", perms: "nej" },
                      { name: "Migrationsverket · migrationsverket.se", llms: "nej", blocks: "nej", perms: "nej" },
                      { name: "Försäkringskassan · forsakringskassan.se", llms: "nej", blocks: "nej", perms: "nej" },
                    ].map((row) => (
                      <tr
                        key={row.name}
                        className="border-b border-[hsl(var(--hairline))] last:border-0"
                      >
                        <td className="px-5 py-3">{row.name}</td>
                        <td className="px-5 py-3 text-[hsl(var(--muted-foreground))]">
                          {row.llms}
                        </td>
                        <td
                          className={`px-5 py-3 ${row.emphasis ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"}`}
                        >
                          {row.blocks}
                        </td>
                        <td className="px-5 py-3 text-[hsl(var(--muted-foreground))]">
                          {row.perms}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </figure>

              <Prose>
                <p>
                  <strong>
                    Sex av sex publicerar ingen maskinläsbar
                    AI-vägledning.
                  </strong>{" "}
                  Endast Riksdagen har en passiv signal (blockerar
                  ClaudeBot via robots.txt). Övriga fem har ingen
                  maskinläsbar signal alls. Interna policys kan finnas
                  — men AI-modeller som besöker sajten ser ingen
                  signal.
                </p>
              </Prose>
              <Sidenote label="Anm.">
                Om <code>agent-permissions.json</code>: föreslagen
                standard, akademisk publikation jan 2026 — global
                adoption fortfarande nära noll.
              </Sidenote>

              <PullQuote
                attribution="Q1 2026 · § 01"
                copyText="Sex av sex svenska myndigheter publicerar ingen AI-vägledning för agenter. AI-modeller som besöker sajten ser ingen signal."
              >
                Sex av sex svenska myndigheter publicerar ingen
                AI-vägledning för agenter. AI-modeller som besöker
                sajten ser ingen signal.
              </PullQuote>

              <h3
                id="varfor-vakuum"
                className="mt-12 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Varför detta är ett problem
              </h3>
              <Prose>
                <p>
                  EU AI Act Article 50 börjar tillämpas{" "}
                  <strong>2 augusti 2026</strong>. Den kräver att
                  providers av AI-system märker AI-genererat syntetiskt
                  innehåll (audio, bild, video, text) i maskinläsbart
                  format, och att deployers transparent kommunicerar
                  AI-interaktion samt deepfake-genererat material till
                  användare. Article 50 reglerar AI-systemens output —
                  inte hur webbsajter konfigurerar sig för AI-agenter.
                  Vi använder ikraftträdandedatumet som referenspunkt
                  för svensk AI-readiness, inte som direkt rättslig
                  grund för <code>/llms.txt</code>.
                </p>
                <p>
                  Just nu är svenska myndighetssajter de facto i ett
                  gränsläge: helt öppna för AI-skrapning, helt utan
                  publicerad transparens om vad de tillåter, helt utan
                  att proaktivt vägleda AI-modeller till officiella
                  källor.
                </p>
                <p>
                  Det här är inte en abstrakt fråga. När en svensk
                  person frågar ChatGPT eller Claude{" "}
                  <em>&ldquo;hur ansöker jag om föräldrapenning?&rdquo;</em>
                  läser modellen webben i realtid. Om
                  Försäkringskassan inte är konfigurerad för att läsas
                  korrekt av en AI-agent — eller inte vägleder den till
                  rätt sektion — försvinner myndigheten som primärkälla
                  ur svaret. Och ersätts av forum, kommersiella
                  konsulter, eller en hallucination.
                </p>
              </Prose>

              <h3
                id="imy-tacker-inte"
                className="mt-12 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                IMY:s vägledning täcker inte detta
              </h3>
              <Prose>
                <p>
                  Integritetsskyddsmyndigheten (IMY) har publicerat två
                  relevanta dokument:
                </p>
                <ul className="mt-4 space-y-2 pl-5 [&_li]:list-disc">
                  <li>
                    <a
                      href="https://www.imy.se/en/news/national-guidelines-for-generative-ai-in-public-administration-are-launched/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Nationella riktlinjer för generativ AI i
                      offentlig förvaltning
                    </a>{" "}
                    (jan 2025, med Digg)
                  </li>
                  <li>
                    <a
                      href="https://www.regeringen.se/contentassets/5be33bc7e11e45bf8e56aa7bce900d43/integritetsskyddsmyndigheten.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Yttrande över SOU 2025:101
                    </a>{" "}
                    (feb 2026)
                  </li>
                </ul>
                <p>
                  Ingen av dem nämner <code>llms.txt</code>,
                  MCP-server-discovery eller AI-agent-crawling.
                  Vägledningen täcker hur offentlig sektor{" "}
                  <em>använder</em> AI internt — inte hur den{" "}
                  <em>exponeras för</em> AI externt.
                </p>
                <p>
                  Det är ett policy-vakuum. Det är inte IMY:s fel — de
                  följer sin mandatperiod. Men någon behöver fylla det
                  innan EU AI Act bestämmer riktningen åt oss.
                </p>
              </Prose>

              <h3
                id="fragor"
                className="mt-12 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Fyra frågor till svenska beslutsfattare
              </h3>
              <ol className="mt-6 max-w-[64ch] space-y-4 font-sans text-[17px] leading-[1.6] text-[hsl(var(--foreground-soft))]">
                {[
                  "Bör myndighetssajter publicera /llms.txt som transparens-instrument?",
                  "Bör EU AI Act Article 50:s ai_disclosure-fält bli del av svensk e-förvaltningsstandard?",
                  "Var i Sveriges digital-agenda 2030 hör AI-agent-readiness hemma?",
                  "Vem på IMY, Digg, MSB eller PTS ska äga frågan?",
                ].map((q, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-l border-[hsl(var(--hairline))] pl-5"
                  >
                    <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-[hsl(var(--primary))]">
                      Q{i + 1}
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>

              {/* ── Section 2 · SaaS vs media ── */}
              <SectionAnchor
                id="saas-vs-media"
                num="02"
                title="SaaS-sektorn öppnar dörrarna. Mainstream-medier stänger dem."
                subtitle="Två branscher, samma teknik, motsatta beslut."
              />

              <Prose>
                <p>
                  Det intressanta är vad som händer i sektorerna mellan
                  myndigheterna och allmänheten. Två tydliga läger har
                  redan formats — utan att någon koordinerade det.
                </p>
                <p>
                  <strong>Mediahusen blockerar.</strong> Av de 500
                  sajterna har 66 minst en AI-bot på sin blocklista. 23
                  av dem är mainstream-medier — Aftonbladet, Expressen,
                  DN, DI, Sydsvenskan, GP, plus samtliga större
                  lokaltidningar. När de blockerar gör de det grundligt:
                  i snitt 10 olika AI-bottar per sajt.
                </p>
                <p>
                  <strong>SaaS och e-handel välkomnar.</strong> Bahnhof,
                  Loopia, Nordnet, Bokadirekt, Telavox, Bubbleroom — alla
                  publicerar <code>/llms.txt</code> med tydlig vägledning
                  om vad sajten innehåller och hur den bäst läses av en
                  AI-modell.
                </p>
              </Prose>

              <DataBar
                caption="Mest blockerade AI-bottar i svensk topp-500"
                source="opensverige probe · 10 maj 2026 · n=500"
                max={60}
                unit="sajter"
                series={[
                  {
                    label: "GPTBot (OpenAI)",
                    value: 56,
                    display: "56",
                    highlight: true,
                  },
                  {
                    label: "CCBot (Common Crawl)",
                    value: 55,
                    display: "55",
                  },
                  {
                    label: "ClaudeBot (Anthropic)",
                    value: 52,
                    display: "52",
                  },
                  {
                    label: "Bytespider (ByteDance)",
                    value: 51,
                    display: "51",
                  },
                  { label: "Google-Extended", value: 50, display: "50" },
                  { label: "anthropic-ai", value: 44, display: "44" },
                  { label: "ChatGPT-User", value: 43, display: "43" },
                  { label: "PerplexityBot", value: 40, display: "40" },
                ]}
              />

              <Prose>
                <p>
                  Resonemanget från SaaS-sidan är operationellt: en kund
                  som hittar oss via ChatGPT eller Claude är en kund.
                  Resonemanget från mediasidan är distributions-baserat:
                  en användare som läser vår artikel via ChatGPT är inte
                  vår kund — de är OpenAI:s kund som råkade konsumera
                  vårt material gratis.
                </p>
                <p>
                  Båda är legitima. Men de leder till olika Sverige om
                  de håller i sig. Ett där SaaS-sektorn växer genom
                  AI-rekommendationer, och där mainstream-medier tappar
                  synlighet i AI-genererade svar om svenska frågor.
                </p>
              </Prose>

              <PullQuote
                attribution="Q1 2026 · § 02"
                copyText="Där köpbeslutet sker via en AI-rekommendation kommer adoption först. Försäkringsbolag, banker och offentlig sektor kommer senare — eller aldrig."
              >
                Där köpbeslutet sker via en AI-rekommendation kommer
                adoption först. Försäkringsbolag, banker och offentlig
                sektor kommer senare — eller aldrig.
              </PullQuote>

              <h3
                id="konsekvenser"
                className="mt-12 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Den oavsiktliga konsekvensen
              </h3>
              <Prose>
                <p>
                  När svenska nyhetshus blockerar AI-bottar samtidigt som
                  myndigheterna är helt tysta, kan fältet i praktiken
                  lämnas öppet för utländska källor, Wikipedia och
                  AI-genererade svenska artiklar — utan svensk
                  redaktionell kvalitetskontroll.
                </p>
                <p>
                  Mediahusens beslut är legitimt. Det är ett affärsval
                  som EU AI Act Recital 105 och DSM-direktivets
                  Art. 4(3) (Directive (EU) 2019/790) uttryckligen
                  stöder (TDM opt-out). Men kombinerat med tystnaden
                  från offentlig sektor är resultatet konsistent med en
                  informations-asymmetri där AI-baserade svar om svenska
                  frågor får sin grundval från sekundärkällor snarare än
                  primärkällor.
                </p>
              </Prose>

              {/* ── Section 3 · Sverige vs Fortune 500 ── */}
              <SectionAnchor
                id="sverige-vs-usa"
                num="03"
                title="Sverige ligger ungefär hälften så långt fram som Fortune 500"
                subtitle="Andelen sajter med /llms.txt. ProGEO.ai mätte Fortune 500 i mars 2026. Vi körde samma probe på svenska topp-500."
              />

              <DataBar
                caption="Andel sajter med /llms.txt — Sverige vs Fortune 500"
                source="ProGEO.ai mars 2026 · opensverige maj 2026"
                max={10}
                unit="%"
                series={[
                  {
                    label: "Fortune 500 (USA)",
                    value: 7.4,
                    display: "7,4 %",
                  },
                  {
                    label: "Topp-500 (Sverige)",
                    value: 3.2,
                    display: "3,2 %",
                    highlight: true,
                  },
                ]}
              />

              <Prose>
                <p>
                  37 av 500 amerikanska Fortune 500-bolag har{" "}
                  <code>/llms.txt</code>. Det är 7,4 %.
                </p>
                <p>Sverige: 16 av 500. Det är 3,2 %.</p>
                <p>
                  Sverige ligger ungefär hälften så långt fram som
                  Fortune 500 på den här mätningen. Inte katastrof —
                  men inte ledarskap heller.
                </p>
              </Prose>
              <Sidenote label="Försiktig läsning" tone="warn">
                Fortune 500 är rankad efter omsättning, Tranco efter
                trafik. Populationerna överlappar inte. Siffrorna är
                jämförbara som riktning, inte som exakt procentuell
                skillnad. Bägge är ändå de mest etablerade baselines
                som finns publika just nu.
              </Sidenote>

              <PullQuote
                attribution="Q1 2026 · § 03"
                copyText="Sverige har ungefär halva Fortune 500-takten på llms.txt — men i en annan urvalskontext. Riktning, inte exakt skillnad."
              >
                Sverige har ungefär halva Fortune 500-takten på llms.txt
                — men i en annan urvalskontext. Riktning, inte exakt
                skillnad.
              </PullQuote>

              <h3
                id="vad-ar-llmstxt"
                className="mt-12 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Vad är <code className="font-mono">/llms.txt</code>?
              </h3>
              <Prose>
                <p>
                  En markdown-fil på roten av en domän som beskriver vad
                  sajten innehåller — i ett format som AI-modeller läser
                  direkt. Tänk <code>robots.txt</code> men för innebörd
                  istället för åtkomst.
                </p>
                <p>
                  Standarden specifierades av{" "}
                  <a
                    href="https://github.com/AnswerDotAI/llms-txt"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Jeremy Howard på Answer.AI
                  </a>{" "}
                  i september 2024. Anthropic, Stripe, Cloudflare,
                  Supabase, Next.js och Perplexity publicerar redan
                  filen själva.
                </p>
                <p>
                  För användare innebär det att en AI-modell som besöker
                  en sajt med <code>/llms.txt</code> snabbare hittar
                  rätt sektioner. Det leder till mer korrekta svar i
                  ChatGPT, Claude och Perplexity — och färre
                  hallucinationer.
                </p>
              </Prose>

              {/* ── Section 4 · Sektor för sektor ── */}
              <DenseSectionHeader
                id="sektor-breakdown"
                num="04"
                title="500 sajter, sju mönster"
              />

              <h3
                id="medier"
                className="mt-10 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Mainstream-medier (n=23) · blockerar i snitt 10
                AI-bottar
              </h3>
              <Prose>
                <p>
                  Svenska nyhetshus har tagit ett tydligt beslut: AI-bottar
                  är inte välkomna. 17 av 23 mediasajter blockerar minst
                  5 AI-bottar. Snittet bland blockerande medier är 10,1
                  blockerade bottar per sajt.
                </p>
                <p>
                  <strong>Hårdast blockerare</strong> (mer än 13 bottar
                  blockerade): aftonbladet.se, expressen.se (14 bottar),
                  dn.se, di.se, sydsvenskan.se, gp.se.
                </p>
                <p>
                  <strong>Lokaltidningar</strong> (alla blockerar
                  ungefär 10 bottar): HD, NWT, Corren, Barometern, KB,
                  BT, SMP, UNT, NSD, OP, VLT, NA, Ystads Allehanda.
                </p>
                <p>
                  Mönstret är konsistent med koncentrerat ägarskap
                  (Bonnier, Schibsted, NTM, Stampen, MittMedia) — när
                  sajter i samma portfölj delar robots.txt-mönster är
                  central styrning en rimlig förklaring, men det kan
                  också vara gemensam CMS-mall eller branschnorm. Datan
                  visar artefakten, inte beslutskedjan.
                </p>
              </Prose>

              <h3
                id="ehandel-saas"
                className="mt-10 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                E-handel och SaaS · Sveriges tysta pionjärer
              </h3>
              <Prose>
                <p>
                  Av de 16 svenska sajter med <code>/llms.txt</code> är
                  10 antingen e-handel eller B2B SaaS. Det är där
                  adoption sker först. Nordnet (bank för småinvesterare),
                  Bahnhof (internet), Bubbleroom (mode), Bokadirekt
                  (boknings-plattform), Hobbii (handarbete) — det är
                  operationella företag där en kund som hittar sajten
                  via ChatGPT räknas som en kund.
                </p>
              </Prose>

              <h3
                id="universitet"
                className="mt-10 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Universitet · 1 av flera
              </h3>
              <Prose>
                <p>
                  Linnéuniversitetet (lnu.se) är det enda lärosäte i
                  topp-500 som har <code>/llms.txt</code>. Inte KTH,
                  inte Uppsala, inte Stockholms universitet, inte Lund.
                  Linné gjorde det. Det är värt att fråga vad de såg som
                  de andra missade.
                </p>
              </Prose>

              <h3
                id="kasino-dating"
                className="mt-10 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Underhållning, kasino, dating · noll adoption
              </h3>
              <Prose>
                <p>
                  I topp-500 finns ungefär 40 underhållnings-,
                  spel- och kasino-sajter (StarVegas, LeoVegas, MrGreen,
                  med flera). Noll har <code>/llms.txt</code>. Det är
                  konsistent: de vill inte att en AI-rekommendation som
                  leder till deras sajt loggas av Google eller en
                  konkurrent.
                </p>
              </Prose>

              {/* ── Section 5 · Sveriges 16 pionjärer ── */}
              <DenseSectionHeader
                id="pionjarer"
                num="05"
                eyebrow="Hela listan"
                title="Sveriges 16 llms.txt-pionjärer"
              />

              <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-[hsl(var(--hairline))] bg-[hsl(var(--hairline))] sm:grid-cols-2">
                {[
                  {
                    sector: "Webhotell · molninfra",
                    count: 5,
                    sites: [
                      "loopia.se",
                      "bahnhof.se",
                      "soluno.se",
                      "quicknet.se",
                      "tripnet.se",
                    ],
                  },
                  {
                    sector: "E-handel",
                    count: 5,
                    sites: [
                      "bubbleroom.se",
                      "shein.se",
                      "hobbii.se",
                      "dutchgrown.se",
                      "bildelsbasen.se",
                    ],
                  },
                  {
                    sector: "SaaS · B2B",
                    count: 4,
                    sites: [
                      "seenthis.se",
                      "telavox.se",
                      "bokadirekt.se",
                      "designbysi.se",
                    ],
                  },
                  {
                    sector: "Finans · universitet",
                    count: 2,
                    sites: [
                      "nordnet.se",
                      "lnu.se",
                    ],
                  },
                ].map((group) => (
                  <div
                    key={group.sector}
                    className="bg-[hsl(var(--background))] p-6 md:p-7"
                  >
                    <p className="flex items-baseline justify-between">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
                        {group.sector}
                      </span>
                      <span className="font-mono text-[10.5px] tabular-nums text-[hsl(var(--primary))]">
                        {group.count}
                      </span>
                    </p>
                    <ul className="mt-4 space-y-1 font-mono text-[13px] text-[hsl(var(--foreground))]">
                      {group.sites.map((s) => (
                        <li
                          key={s}
                          className="flex items-center gap-2 leading-[1.5]"
                        >
                          <span
                            aria-hidden
                            className="inline-block h-1 w-1 rounded-full bg-[hsl(var(--primary))]"
                          />
                          <a
                            href={`https://${s}/llms.txt`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block min-h-[28px] py-1 underline decoration-[hsl(var(--hairline))] underline-offset-[3px] transition-colors hover:decoration-[hsl(var(--primary))]"
                          >
                            {s}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Prose>
                <p className="mt-10">
                  Vad de har gemensamt: en operationell anledning. Deras
                  kunder hittar dem (eller borde hitta dem) via AI-search.
                  Webhotellsbranschen leder för att deras kunder är
                  utvecklare som söker tekniska detaljer. SaaS-bolagen
                  leder för att en B2B-köpare som frågar ChatGPT om
                  &ldquo;bokningssystem för svensk salong&rdquo; ska få
                  Bokadirekt som svar.
                </p>
                <p>
                  För kommande kvartalsrapporter (Q2 september 2026)
                  följer vi upp vilka nya som gått med, vilka som tagit
                  bort sin <code>/llms.txt</code>, och hur sektorerna
                  förändras.
                </p>
                <p className="rounded-md border border-[hsl(var(--hairline))] bg-[hsl(var(--surface-sunken))] p-4 text-[14.5px] leading-[1.55]">
                  <strong className="text-[hsl(var(--foreground))]">
                    Verifiera själv:
                  </strong>{" "}
                  Tveka inte — kör vilken domän som helst genom
                  scanner-verktyget på{" "}
                  <a
                    href="https://agent.opensverige.se/scan"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    agent.opensverige.se/scan
                  </a>{" "}
                  och få live-resultat. Listan ovan live-verifierad
                  12 maj 2026 — adoption kan flytta sig dagligen.
                </p>
              </Prose>

              {/* ── Section 6 · Metod ── */}
              <DenseSectionHeader
                id="metod"
                num="06"
                eyebrow="Reproducerbarhet"
                title="Metod och begränsningar"
              />

              <h3
                id="datakalla"
                className="mt-10 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Datakälla
              </h3>
              <Prose>
                <p>
                  Domänlistan är topp-500 svenska <code>.se</code>-domäner
                  från{" "}
                  <a
                    href="https://tranco-list.eu/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tranco-listans dagliga snapshot 2026-05-10
                  </a>
                  . Tranco aggregerar Alexa Internet Top Sites, Cisco
                  Umbrella Popularity List, Majestic Million och
                  Cloudflare Radar — och filtrerar bort manipulation.
                </p>
                <p>
                  Fortune 500-siffran <strong>7,4 %</strong> kommer från{" "}
                  <a
                    href="https://ppc.land/only-7-4-of-fortune-500-have-an-llms-txt-file-study-finds/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ProGEO.ai-studien publicerad april 2026
                  </a>{" "}
                  (sekundärkälla: PPC.land, ProGEO.ai LinkedIn). Vissa
                  metodologiska detaljer i originalstudien har
                  ifrågasatts publikt — vi använder siffran som
                  riktningsindikator, inte som exakt jämförelse.
                </p>
              </Prose>

              <h3
                id="probe-process"
                className="mt-10 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Probe-process
              </h3>
              <Prose>
                <p>
                  För varje domän kördes följande HTTP-requests från en
                  Stockholm-baserad serverless-runtime mellan 2026-05-10
                  06:00 och 18:00 UTC:
                </p>
              </Prose>

              <ol className="mt-6 max-w-[64ch] space-y-3 font-sans text-[15.5px] leading-[1.55] text-[hsl(var(--foreground-soft))]">
                {[
                  {
                    code: "HEAD /llms.txt",
                    note: "om 200 OK, även GET för storleksmätning",
                  },
                  {
                    code: "HEAD /.well-known/agent-permissions.json",
                    note: "200 OK / 404 Not Found",
                  },
                  {
                    code: "GET /robots.txt",
                    note: "full text-extraktion + regex för AI-bot-omnämnanden",
                  },
                  {
                    code: "HEAD / med User-Agent: OpenSverigeReadinessProbe/1.0",
                    note: "accessibility check",
                  },
                  {
                    code: "HEAD / med Accept: text/markdown",
                    note: "content-negotiation-test",
                  },
                ].map((row, idx) => (
                  <li
                    key={idx}
                    className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-x-4"
                  >
                    <span className="font-mono text-[12px] tabular-nums text-[hsl(var(--muted-foreground))]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <code className="font-mono text-[13.5px] text-[hsl(var(--primary))]">
                        {row.code}
                      </code>
                      <span className="ml-2 text-[hsl(var(--muted-foreground))]">
                        — {row.note}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              <h3
                id="begransningar"
                className="mt-10 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Begränsningar
              </h3>
              <Prose>
                <ul className="mt-4 space-y-3 pl-5 [&_li]:list-disc">
                  <li>
                    <strong>
                      Listan re-verifierad genom vår egen scanner.
                    </strong>{" "}
                    Stickprov av alla 19 originaldomäner mot{" "}
                    <a
                      href="https://agent.opensverige.se/scan"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      agent.opensverige.se/scan
                    </a>{" "}
                    avförde tre sajter:{" "}
                    <code>sportadmin.se/llms.txt</code> returnerar 200
                    OK men body är &ldquo;Fel!&rdquo;,{" "}
                    <code>skolplus.se/llms.txt</code> serverar HTML
                    (catch-all/homepage), och{" "}
                    <code>bitdefender.se/llms.txt</code> returnerar
                    Cloudflare-challenge — filen kan finnas bakom
                    bot-skyddet men är inte programmatiskt verifierbar.
                    Riktig siffra:{" "}
                    <strong>16 av 500 (3,2 %)</strong>, inte 19 av 500
                    (3,8 %) som original-proben rapporterade utan
                    content-validation. Skannerns fetch-timeout höjdes
                    samtidigt från 5 s till 10 s för att matcha
                    verkliga AI-agent-tools (ChatGPT/Claude:s
                    web-fetch ligger på 10–15 s); det eliminerade
                    false negatives på legitimt långsamma sajter som
                    Bahnhof.
                  </li>
                  <li>
                    <strong>Target rate-limiting förekommer.</strong>{" "}
                    Tre sajter (bahnhof.se, soluno.se, nordnet.se)
                    returnerar 429/blockering efter 1–2 upprepade
                    requests från samma IP. Vår scanner ger korrekt
                    PASS på första försöket men intermittent FAIL vid
                    retest. För kvartalsmätningen behandlar vi
                    first-attempt-resultatet som auktoritativt — det
                    speglar hur en verklig AI-agent skulle se sajten.
                  </li>
                  <li>
                    <strong>21 % returnerade 403 mot okänd UA.</strong>{" "}
                    Verklig adoption-siffra kan därför vara 1–2
                    procentenheter högre om vi räknar bara nåbara sajter
                    (3,2 % → ungefär 4,1 %).
                  </li>
                  <li>
                    <strong>
                      Tranco-listan baseras på trafik, inte storlek.
                    </strong>{" "}
                    Vissa stora företag (familjeägda eller rent B2B) kan
                    saknas. Vissa lågtrafikerade sajter kan finnas med.
                  </li>
                  <li>
                    <strong>Probe körd en gång.</strong> Adoption
                    förändras dagligen. Q2-rapporten kommer med diff
                    från denna datapunkt.
                  </li>
                  <li>
                    <strong>
                      Robots-blockering är inte faktisk blockering.
                    </strong>{" "}
                    Robots.txt är en rekommendation, inte en teknisk
                    barriär. Vissa AI-företag respekterar den, andra
                    inte.
                  </li>
                  <li>
                    <strong>
                      Vi mätte 12 av 17 möjliga signaler.
                    </strong>{" "}
                    Hela vår scanner mäter 17. Vissa (MCP,
                    EU-AI-Act-disclosure) kräver djupare scan som inte
                    ingick i denna probe.
                  </li>
                </ul>
              </Prose>

              <h3
                id="reproducera"
                className="mt-10 font-serif text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.2] tracking-[-0.015em] text-[hsl(var(--foreground))]"
              >
                Reproducera mätningen
              </h3>
              <figure className="mt-6 overflow-hidden rounded-md border border-[hsl(var(--code-border,_var(--hairline)))] bg-[hsl(var(--code-bg,_var(--surface-card)))]">
                <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.6] text-[hsl(var(--foreground))]">
                  <code>{`git clone https://github.com/opensverige/agent-scan
cd agent-scan
npm install
npm run probe:sweden -- --output probe_results.csv`}</code>
                </pre>
              </figure>
              <Prose>
                <p className="mt-6">
                  Probe-script + data + analys är CC-BY-4.0 (text och
                  data) + FSL-1.1-MIT (kod).
                </p>
              </Prose>

              {/* ── Soft CTA ── */}
              <aside
                aria-labelledby="cta-heading"
                className="mt-20 rounded-lg border border-[hsl(var(--hairline))] bg-[hsl(var(--surface-card))] p-7 md:p-9"
              >
                <Eyebrow tone="primary">Kolla din egen sajt</Eyebrow>
                <h2
                  id="cta-heading"
                  className="mt-4 font-serif text-[clamp(22px,3vw,28px)] font-normal leading-[1.15] tracking-[-0.015em] text-[hsl(var(--foreground))]"
                >
                  Är din sajt redo för en AI-agent? Få svar på 30
                  sekunder.
                </h2>
                <p className="mt-3 max-w-[58ch] font-sans text-[16px] leading-[1.55] text-[hsl(var(--muted-foreground))]">
                  Klistra in din domän — vi kör 17 tekniska checks och
                  ger dig severity-rankade åtgärdsförslag. Gratis, ingen
                  registrering.
                </p>
                <Link
                  href="/scan"
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-[hsl(var(--primary))] px-5 py-3 font-sans text-[14px] font-medium text-[hsl(var(--primary-foreground))] transition-[transform,background-color] duration-150 ease-[var(--ease-out-quint)] hover:translate-x-0.5 hover:bg-[hsl(var(--primary-ink))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                >
                  Kör scannern
                  <MdArrowOutward className="h-4 w-4" aria-hidden />
                </Link>
              </aside>

              {/* ── Meta ── */}
              <MetaBar
                authors={[
                  {
                    name: "Gustaf Garnow",
                    href: "https://linkedin.com/in/gustafgarnow",
                  },
                  {
                    name: "Felipe Otarola",
                    href: "https://linkedin.com/in/felipe-otarola",
                  },
                ]}
                publishedAt="15 maj 2026"
                lastReviewed="12 maj 2026"
                version="1.0"
                license="CC-BY-4.0 (text + data) · FSL-1.1-MIT (kod)"
                doi="pending Zenodo upload"
                citationApa="Garnow, G., & Otarola, F. (2026). Svensk AI-Readiness Index Q1 2026. opensverige. https://agent.opensverige.se/rapport/q1-2026"
                repoUrl="https://github.com/opensverige/agent-scan"
              />
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
