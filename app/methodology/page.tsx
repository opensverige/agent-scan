// app/methodology/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Nav from "../scan/_components/Nav";
import Footer from "../scan/_components/Footer";
import { listArticles } from "@/lib/methodology/load";
import { buildHubCollectionSchema } from "@/lib/methodology/schema";
import type { MethodologyIndexEntry } from "@/lib/methodology/types";

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
      </main>
      <Footer />
    </>
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
