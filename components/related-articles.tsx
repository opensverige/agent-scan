// components/related-articles.tsx
//
// Server-rendered "see also" rail at the foot of every methodology
// article. Selection prefers explicit relatedChecks frontmatter, then
// fills from same-category/same-severity, then same-category any.
// Caps at 4 cards. Zero JS.

import Link from "next/link";
import { listArticles } from "@/lib/methodology/load";
import type { CheckId } from "@/lib/checks";
import type {
  MethodologyArticle,
  MethodologyIndexEntry,
} from "@/lib/methodology/types";

const SEVERITY_TONE: Record<string, string> = {
  critical: "text-destructive",
  important: "text-amber-500",
  info: "text-muted-foreground",
};

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-destructive",
  important: "bg-amber-400",
  info: "bg-muted-foreground",
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
      className="mx-auto max-w-[720px] border-t border-border/40 px-6 pt-12 pb-16"
    >
      <p
        id="related-articles-heading"
        className="mb-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        Continue reading · {related.length}{" "}
        {related.length === 1 ? "related check" : "related checks"}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {related.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/methodology/${entry.slug}`}
              className="group block h-full rounded-xl border border-border/50 bg-muted/15 p-5 transition-colors hover:border-border hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[entry.severity] ?? "bg-muted-foreground"}`}
                />
                <span className={SEVERITY_TONE[entry.severity] ?? "text-muted-foreground"}>
                  {entry.severity}
                </span>
                <span className="opacity-50">·</span>
                <span>{entry.category}</span>
              </p>
              <h3 className="mb-2 font-serif text-lg font-normal leading-snug tracking-tight text-foreground">
                {entry.title}
              </h3>
              <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-foreground/70">
                {entry.citableLead.split(/\n+/)[0]}
              </p>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-foreground">
                Read →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
