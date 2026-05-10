// components/related-articles.tsx
//
// Server-rendered "see also" rail at the foot of every methodology
// article. Selection prefers explicit relatedChecks frontmatter, then
// fills from same-category/same-severity, then same-category any.
// Caps at 4 cards. Zero JS.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listArticles } from "@/lib/methodology/load";
import type { CheckId } from "@/lib/checks";
import type {
  MethodologyArticle,
  MethodologyIndexEntry,
} from "@/lib/methodology/types";

const SEVERITY_EDGE: Record<string, string> = {
  critical: "bg-[hsl(var(--destructive))]",
  important: "bg-[hsl(var(--warning))]",
  info: "bg-[hsl(var(--muted-foreground))]/40",
};

const SEVERITY_TONE: Record<string, string> = {
  critical: "text-[hsl(var(--destructive))]",
  important: "text-[hsl(var(--warning))]",
  info: "text-[hsl(var(--muted-foreground))]",
};

function checkIdsToSlugs(ids: readonly CheckId[]): Set<string> {
  return new Set(ids.map((id) => id.replace(/_/g, "-")));
}

function pickRelated(
  current: MethodologyArticle,
  all: readonly MethodologyIndexEntry[],
): MethodologyIndexEntry[] {
  const fm = current.frontmatter;
  const others = all.filter((a) => a.slug !== fm.slug);
  const picked: MethodologyIndexEntry[] = [];
  const taken = new Set<string>();

  // 1. explicit relatedChecks from frontmatter
  const explicitSlugs = checkIdsToSlugs(fm.relatedChecks);
  for (const entry of others) {
    if (explicitSlugs.has(entry.slug)) {
      picked.push(entry);
      taken.add(entry.slug);
    }
  }

  // 2. same category + same severity
  if (picked.length < 4) {
    for (const entry of others) {
      if (taken.has(entry.slug)) continue;
      if (entry.category === fm.category && entry.severity === fm.severity) {
        picked.push(entry);
        taken.add(entry.slug);
        if (picked.length >= 4) break;
      }
    }
  }

  // 3. same category any severity
  if (picked.length < 3) {
    for (const entry of others) {
      if (taken.has(entry.slug)) continue;
      if (entry.category === fm.category) {
        picked.push(entry);
        taken.add(entry.slug);
        if (picked.length >= 4) break;
      }
    }
  }

  return picked.slice(0, 4);
}

export async function RelatedArticles({
  article,
}: {
  article: MethodologyArticle;
}) {
  const all = await listArticles();
  const related = pickRelated(article, all);
  if (related.length === 0) return null;

  return (
    <aside
      aria-labelledby="related-articles-heading"
      className="mx-auto max-w-[720px] border-t border-[hsl(var(--border))] px-6 pt-12 pb-16"
    >
      <p
        id="related-articles-heading"
        className="mb-1 font-serif text-[20px] font-normal leading-snug text-[hsl(var(--foreground))]"
      >
        Continue reading
      </p>
      <p className="mb-7 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        {related.length} related {related.length === 1 ? "check" : "checks"}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {related.map((entry, idx) => (
          <li key={entry.slug}>
            <Link
              href={`/methodology/${entry.slug}`}
              className="group relative flex h-full flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-4 transition-all hover:border-[hsl(var(--ring))] hover:shadow-[0_2px_0_hsl(var(--border)),0_8px_24px_-12px_hsl(var(--ring)/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
            >
              <span
                aria-hidden
                className={`absolute left-0 top-4 bottom-4 w-[2px] rounded-r ${
                  SEVERITY_EDGE[entry.severity] ?? "bg-[hsl(var(--muted-foreground))]/40"
                }`}
              />
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                <span className="font-medium tabular-nums text-[hsl(var(--foreground))]/70">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="opacity-40">·</span>
                <span>{entry.category}</span>
                <span className="opacity-40">·</span>
                <span
                  className={SEVERITY_TONE[entry.severity] ?? "text-[hsl(var(--muted-foreground))]"}
                >
                  {entry.severity}
                </span>
              </p>
              <h3 className="mb-1.5 font-serif text-[18px] font-normal leading-snug tracking-[-0.2px] text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))]">
                {entry.title}
              </h3>
              <p className="mb-4 line-clamp-2 text-[14px] leading-[1.55] text-[hsl(var(--muted-foreground))]">
                {entry.citableLead.split(/\n+/)[0]}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-[hsl(var(--foreground))]/70 transition-all group-hover:gap-2 group-hover:text-[hsl(var(--primary))]">
                Open check
                <ArrowRight className="h-3 w-3" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
