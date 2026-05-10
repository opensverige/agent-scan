// app/methodology/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../scan/_components/Nav";
import Footer from "../scan/_components/Footer";
import { listArticles } from "@/lib/methodology/load";
import { buildHubCollectionSchema } from "@/lib/methodology/schema";
import type { MethodologyIndexEntry } from "@/lib/methodology/types";

// 4 high-capture FAQ entries. Targets the explainer queries that don't
// fit per-check articles — the def of "AI-agent readiness" itself, the
// disambiguation between AEO/GEO/LLM-readiness, the Cloudflare-diff
// (Front 1 positioning), and the markdown-serving infrastructure.
//
// Rendered both as visible HTML and as FAQPage JSON-LD so AI Overviews
// and Featured Snippets can quote answers verbatim.
const HUB_FAQ: { question: string; answer: string }[] = [
  {
    question: "What is AI-agent readiness?",
    answer:
      "AI-agent readiness is how well a website is configured for autonomous AI agents (Claude Code, Cursor, ChatGPT search, Perplexity, Gemini) to find, fetch, parse and act on its content. It covers three layers: discovery (robots.txt, sitemap, llms.txt, llms-full.txt, markdown content negotiation, server-side rendering, AI-crawler access), compliance (GDPR Art. 22 automated decision-making, ePrivacy cookie handling, EU AI Act Art. 50 AI-content marking), and builder surface (public API, OpenAPI spec, API docs, MCP server discovery and capability cards, sandbox availability). agent.opensverige.se measures 17 such signals.",
  },
  {
    question:
      "What is the difference between AEO, GEO and LLM readiness?",
    answer:
      "All three terms describe optimising a site for non-human consumers. Agentic Engine Optimization (AEO, Addy Osmani, April 2026) is the umbrella for making content readable by AI agents that fetch and reason over technical material. Generative Engine Optimization (GEO) is the search-engine-marketing-flavoured subset focused on getting cited by AI search engines (ChatGPT search, Perplexity, AI Overviews). LLM readiness is the operational measurement: does this specific site pass concrete checks. agent.opensverige.se runs the LLM-readiness measurement, with checks aligned to AEO's six-layer stack and GEO citability patterns.",
  },
  {
    question:
      "How does agent.opensverige.se differ from Cloudflare's isitagentready.com?",
    answer:
      "Three differences. EU jurisdiction: scan results and hashed IPs live in Supabase eu-west-2 London, retained 90 days, deleted via pg_cron. EU AI Act Article 50 disclosure: every AI-generated summary ships with a machine-readable ai_disclosure object naming the model and fields, the only public scanner that does this in May 2026. Swedish-language compliance heuristics: probes /integritetspolicy, /personuppgifter, /cookieanvandning that no global scanner looks for. Cloudflare's scanner ships none of these. Both tools are free; agent.opensverige.se is open source under FSL-1.1-MIT.",
  },
  {
    question:
      "Can AI agents fetch these methodology articles as raw markdown?",
    answer:
      "Yes. Every article at /methodology/<slug> negotiates content type. Send Accept: text/markdown and the response is the raw markdown body (around 80 percent smaller than the rendered HTML), with X-Token-Count and X-Content-Negotiation: markdown headers. The hub at /methodology returns a synthesised markdown index of all 17 articles when negotiated. Cursor, Claude Code, OpenCode and Continue request markdown by default. The article source files live at github.com/opensverige/agent-scan under content/methodology/ and ship under FSL-1.1-MIT.",
  },
];

export const metadata: Metadata = {
  title: "Methodology — agent.opensverige",
  description:
    "Per-check deep-dives behind every signal the agent.opensverige.se EU-jurisdiction AI-readiness scanner measures. 17 articles covering discovery, EU AI Act compliance, and developer surface. Authoritative reference for builders and AI agents.",
  alternates: {
    canonical: "https://agent.opensverige.se/methodology",
    types: {
      "text/markdown": "https://agent.opensverige.se/methodology",
    },
  },
  openGraph: {
    type: "website",
    url: "https://agent.opensverige.se/methodology",
    title: "Methodology — agent.opensverige",
    description:
      "Per-check deep-dives behind every signal the EU-jurisdiction AI-readiness scanner measures.",
    images: [
      {
        url: "https://agent.opensverige.se/assets/og-default.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

const CATEGORY_LABELS: Record<MethodologyIndexEntry["category"], string> = {
  discovery: "Discovery",
  compliance: "EU compliance",
  builder: "Builder surface",
};

const CATEGORY_DESCRIPTIONS: Record<MethodologyIndexEntry["category"], string> = {
  discovery: "Can AI agents find and read the site?",
  compliance: "Does it meet EU regulatory requirements?",
  builder: "Can devs and agents build against it?",
};

const SEVERITY_COLOR: Record<MethodologyIndexEntry["severity"], string> = {
  critical: "text-destructive",
  important: "text-amber-500",
  info: "text-muted-foreground",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://agent.opensverige.se/methodology#faq",
  inLanguage: "en-US",
  mainEntity: HUB_FAQ.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default async function MethodologyHubPage() {
  const entries = await listArticles();
  const collectionSchema = buildHubCollectionSchema(entries);
  const grouped = groupByCategory(entries);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Nav />
      <main className="mx-auto max-w-[820px] px-6 py-16 md:py-20">
        <header className="mb-14">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Methodology · {entries.length} of 17 articles published
          </p>
          <h1 className="mb-6 font-serif text-[clamp(36px,7vw,60px)] font-normal leading-[1.05] tracking-[-2px]">
            Per-check methodology
          </h1>
          <p className="max-w-[640px] text-lg leading-relaxed text-foreground/85">
            Every signal agent.opensverige.se measures has a deep-dive. Why it
            matters for AI agents, how to fix it, common false positives, and
            primary sources you can cite. Open source under FSL-1.1-MIT.
          </p>
        </header>

        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          (["discovery", "compliance", "builder"] as const).map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              entries={grouped[cat] ?? []}
            />
          ))
        )}

        <FaqSection />
      </main>
      <Footer />
    </>
  );
}

function FaqSection() {
  return (
    <section
      aria-labelledby="methodology-faq"
      className="mt-20 border-t border-border/40 pt-14"
    >
      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Frequently asked
      </p>
      <h2
        id="methodology-faq"
        className="mb-10 font-serif text-3xl font-normal tracking-tight"
      >
        Background and definitions
      </h2>
      <ul className="space-y-8">
        {HUB_FAQ.map(({ question, answer }, idx) => (
          <li key={idx}>
            <h3 className="mb-3 font-serif text-xl font-normal leading-snug tracking-tight">
              {question}
            </h3>
            <p className="text-base leading-relaxed text-foreground/85">
              {answer}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategorySection({
  category,
  entries,
}: {
  category: MethodologyIndexEntry["category"];
  entries: MethodologyIndexEntry[];
}) {
  if (entries.length === 0) return null;
  return (
    <section className="mb-16">
      <h2 className="mb-2 font-serif text-3xl font-normal tracking-tight">
        {CATEGORY_LABELS[category]}
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {CATEGORY_DESCRIPTIONS[category]}
      </p>
      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/methodology/${e.slug}`}
              className="block rounded-xl border border-border/60 bg-background p-5 transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-medium leading-snug">{e.title}</h3>
                <span
                  className={`shrink-0 font-mono text-[10px] uppercase tracking-widest ${
                    SEVERITY_COLOR[e.severity]
                  }`}
                >
                  {e.severity}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {e.citableLead.trim()}
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                {e.tokenEstimate.toLocaleString()} tokens · updated {e.lastUpdated}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
      <p className="mb-3 font-serif text-2xl font-normal">
        Methodology articles coming soon
      </p>
      <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
        We&apos;re publishing 17 deep-dives, one per scanner check. While we
        write them, the full methodology lives at{" "}
        <a
          href="https://github.com/opensverige/agent-scan/blob/main/docs/SCANNER-METHODOLOGY.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          docs/SCANNER-METHODOLOGY.md
        </a>{" "}
        on GitHub.
      </p>
    </div>
  );
}

function groupByCategory(
  entries: MethodologyIndexEntry[],
): Partial<Record<MethodologyIndexEntry["category"], MethodologyIndexEntry[]>> {
  const grouped: Partial<
    Record<MethodologyIndexEntry["category"], MethodologyIndexEntry[]>
  > = {};
  for (const e of entries) {
    const list = grouped[e.category] ?? [];
    list.push(e);
    grouped[e.category] = list;
  }
  return grouped;
}
