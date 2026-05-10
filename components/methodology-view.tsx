// components/methodology-view.tsx
//
// Server-component renderer for a single methodology article. Server-side
// markdown rendering via react-markdown so we ship zero JS for content
// pages outside the small CodeBlock copy button.
//
// Tailwind classes mapped per element rather than via prose plugin so we
// don't add @tailwindcss/typography. Section icons + step badges are
// detected via heading-text inspection — purely visual, no content
// changes required to the markdown source.

import {
  AlertTriangle,
  Bot,
  HelpCircle,
  Network,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { MethodologyCodeBlock } from "@/components/methodology-code-block";
import type { MethodologyArticle } from "@/lib/methodology/types";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "text-destructive",
  important: "text-amber-500",
  info: "text-muted-foreground",
};

// Section name (lowercased, trimmed) -> Lucide icon. We keep tone
// monochrome (text-muted-foreground) intentionally — the page already
// has color cues via severity badge. Adding more colors here would feel
// like AI-slop.
const SECTION_ICONS: Record<string, LucideIcon> = {
  "why this fails on real sites": AlertTriangle,
  "how to fix": Wrench,
  "verify the fix": ShieldCheck,
  "common false positives": HelpCircle,
  "how agents are recommended to use this article": Bot,
  "related agent.opensverige checks": Network,
};

function flattenChildren(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(flattenChildren).join("");
  return "";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const MARKDOWN_COMPONENTS: Components = {
  h2: ({ children }) => {
    const text = flattenChildren(children).trim();
    const Icon = SECTION_ICONS[text.toLowerCase()];
    const id = slugify(text);
    return (
      <h2
        id={id}
        className="mt-16 mb-5 flex items-center gap-3 scroll-mt-20 font-serif text-3xl font-normal tracking-tight"
      >
        {Icon && (
          <Icon
            className="h-5 w-5 shrink-0 text-muted-foreground"
            aria-hidden
          />
        )}
        <span>{children}</span>
      </h2>
    );
  },
  h3: ({ children }) => {
    const text = flattenChildren(children).trim();
    const stepMatch = /^Step\s+(\d+):\s*(.+)$/.exec(text);
    if (stepMatch) {
      const [, num, title] = stepMatch;
      return (
        <h3 className="mt-12 mb-4 flex items-baseline gap-3 font-serif text-xl font-normal tracking-tight">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 shrink-0 translate-y-1 items-center justify-center rounded-full border border-primary/40 bg-primary/5 font-mono text-xs font-medium tabular-nums text-primary"
          >
            {num}
          </span>
          <span>
            <span className="sr-only">Step {num}: </span>
            {title}
          </span>
        </h3>
      );
    }
    return (
      <h3 className="mt-10 mb-3 font-serif text-xl font-normal tracking-tight">
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="my-5 text-base leading-relaxed text-foreground/85">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-5 list-disc space-y-2 pl-6 text-base leading-relaxed text-foreground/85 marker:text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 list-decimal space-y-2 pl-6 text-base leading-relaxed text-foreground/85 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => {
    const isExternal = !!href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-primary underline-offset-4 hover:underline hover:text-foreground"
      >
        {children}
        {isExternal && (
          <span className="sr-only"> (opens in new tab)</span>
        )}
      </a>
    );
  },
  code: ({ className, children, ...props }: ComponentProps<"code"> & { children?: ReactNode }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={`${className ?? ""} font-mono text-sm`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <MethodologyCodeBlock>{children}</MethodologyCodeBlock>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-primary/40 pl-4 italic text-foreground/70">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-border/40" />,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border/60">{children}</thead>
  ),
  th: ({ children }) => (
    <th
      scope="col"
      className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/30 px-3 py-2 align-top text-foreground/85">
      {children}
    </td>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
};

/**
 * Strip the trailing `## Related agent.opensverige checks` section (and
 * everything after it, including the FSL footer paragraph) from the body
 * we render to humans. The visual <RelatedArticles /> component on the
 * page replaces both. The full markdown body (with the section intact)
 * is still served verbatim to AI agents via Accept: text/markdown.
 */
function stripRelatedSection(body: string): string {
  const idx = body.search(/\n##\s+Related\s+agent\.opensverige\s+checks/i);
  if (idx === -1) return body;
  return body.slice(0, idx).trimEnd();
}

export function MethodologyView({ article }: { article: MethodologyArticle }) {
  const fm = article.frontmatter;
  const displayBody = stripRelatedSection(article.body);
  const readingMinutes = Math.max(1, Math.ceil(fm.tokenEstimate / 250));

  return (
    <article className="mx-auto max-w-[720px] px-6 py-12 md:py-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-x-1">
          <li>
            <Link href="/" className="hover:text-foreground">
              agent.opensverige
            </Link>
          </li>
          <li aria-hidden className="px-1 opacity-40">·</li>
          <li>
            <Link href="/methodology" className="hover:text-foreground">
              Methodology
            </Link>
          </li>
          <li aria-hidden className="px-1 opacity-40">·</li>
          <li className="text-foreground">{fm.checkId}</li>
        </ol>
      </nav>

      <header className="mb-10">
        <p
          className={`mb-4 font-mono text-[10px] uppercase tracking-widest ${
            SEVERITY_COLOR[fm.severity] ?? "text-muted-foreground"
          }`}
        >
          {fm.category} · {fm.severity} · check {fm.checkId}
          <span className="opacity-50"> · </span>
          <span className="text-muted-foreground">
            {readingMinutes} min read
          </span>
        </p>
        <h1 className="mb-6 font-serif text-[clamp(32px,6vw,52px)] font-normal leading-[1.08] tracking-[-1.5px]">
          {fm.title}
        </h1>
        <p
          data-citable-lead
          className="text-lg leading-relaxed text-foreground/85"
        >
          {fm.citableLead.trim()}
        </p>
      </header>

      <section className="mb-12 rounded-2xl border border-border/60 bg-muted/20 p-6">
        <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Bot className="h-3 w-3" aria-hidden />
          Why agents care
        </p>
        <p
          data-agent-impact
          className="text-base leading-relaxed text-foreground/85"
        >
          {fm.agentImpact.trim()}
        </p>
      </section>

      <div className="methodology-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
          {displayBody}
        </ReactMarkdown>
      </div>

      <footer className="mt-16 border-t border-border/40 pt-8 space-y-6">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Primary sources
          </p>
          <ul className="space-y-2 text-sm">
            {fm.primarySources
              .filter((s) => s.primary)
              .map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary underline-offset-4 hover:underline"
                  >
                    {s.title}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                  <span className="text-muted-foreground"> · {s.publisher}</span>
                </li>
              ))}
          </ul>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Last reviewed {fm.lastUpdated}</span>
          <span>{fm.tokenEstimate.toLocaleString()} tokens</span>
        </div>
      </footer>
    </article>
  );
}
