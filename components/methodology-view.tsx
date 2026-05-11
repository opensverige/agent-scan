// components/methodology-view.tsx
//
// Server-component renderer for a single methodology article. Outer
// <div data-methodology> wrapper in [slug]/page.tsx flips shadcn HSL
// tokens to the light helpdesk palette (see globals.css).
//
// Section icons + step badges are detected via heading-text inspection
// — purely visual, no content changes required to the markdown source.

import {
  MdArrowForward,
  MdBuild,
  MdHelpOutline,
  MdHub,
  MdSmartToy,
  MdVerified,
  MdWarningAmber,
} from "react-icons/md";
import type { IconType } from "react-icons";
import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { MethodologyCodeBlock } from "@/components/methodology-code-block";
import type { MethodologyArticle } from "@/lib/methodology/types";

type MdIcon = IconType;

const SEVERITY_PILL: Record<string, string> = {
  critical:
    "border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/8 text-[hsl(var(--destructive))]",
  important:
    "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  info: "border-[hsl(var(--info))]/30 bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Critical fix",
  important: "Important",
  info: "Info",
};

// Section name (lowercased, trimmed) -> Material Design icon. Monochrome
// (text-muted-foreground) so the page reads as a clean reference doc,
// not an emoji-spam interface.
const SECTION_ICONS: Record<string, MdIcon> = {
  "why this fails on real sites": MdWarningAmber,
  "why scans flag this": MdWarningAmber,
  "how to fix": MdBuild,
  "verify the fix": MdVerified,
  "common false positives": MdHelpOutline,
  "how agents are recommended to use this article": MdSmartToy,
  "related agent.opensverige checks": MdHub,
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
        className="mt-16 mb-5 flex items-center gap-3 scroll-mt-24 font-serif text-[28px] font-normal tracking-tight text-[hsl(var(--foreground))]"
      >
        {Icon && (
          <Icon
            className="h-6 w-6 shrink-0 text-[hsl(var(--muted-foreground))]"
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
        <h3 className="mt-12 mb-4 flex items-baseline gap-3 font-serif text-xl font-normal tracking-tight text-[hsl(var(--foreground))]">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 shrink-0 translate-y-1 items-center justify-center rounded-full border border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/8 font-mono text-xs font-medium tabular-nums text-[hsl(var(--primary))]"
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
      <h3 className="mt-10 mb-3 font-serif text-xl font-normal tracking-tight text-[hsl(var(--foreground))]">
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="my-5 text-[15.5px] leading-[1.7] text-[hsl(var(--foreground))]/85">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-5 list-disc space-y-2 pl-6 text-[15.5px] leading-[1.7] text-[hsl(var(--foreground))]/85 marker:text-[hsl(var(--muted-foreground))]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 list-decimal space-y-2 pl-6 text-[15.5px] leading-[1.7] text-[hsl(var(--foreground))]/85 marker:text-[hsl(var(--muted-foreground))]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-[1.7]">{children}</li>,
  a: ({ href, children }) => {
    const isExternal = !!href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-[hsl(var(--primary))] underline underline-offset-4 decoration-[hsl(var(--primary))]/30 transition-colors hover:decoration-[hsl(var(--primary))]"
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
        <code className={`${className ?? ""} font-mono text-[13.5px]`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md border border-[hsl(var(--code-border))] bg-[hsl(var(--code-bg))] px-1.5 py-[2px] font-mono text-[13px] text-[hsl(var(--foreground))]"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <MethodologyCodeBlock>{children}</MethodologyCodeBlock>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-[hsl(var(--primary))]/40 pl-4 italic text-[hsl(var(--foreground))]/70">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-[hsl(var(--border))]" />,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th
      scope="col"
      className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]"
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-[hsl(var(--border))] px-3 py-2 align-top text-[hsl(var(--foreground))]/85">
      {children}
    </td>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[hsl(var(--foreground))]">
      {children}
    </strong>
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
    <article className="font-sans">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]"
      >
        <ol className="flex flex-wrap items-center gap-x-1">
          <li>
            <Link href="/" className="hover:text-[hsl(var(--foreground))]">
              agent.opensverige
            </Link>
          </li>
          <li aria-hidden className="px-1 opacity-40">·</li>
          <li>
            <Link
              href="/methodology"
              className="hover:text-[hsl(var(--foreground))]"
            >
              Methodology
            </Link>
          </li>
          <li aria-hidden className="px-1 opacity-40">·</li>
          <li className="text-[hsl(var(--foreground))]">{fm.checkId}</li>
        </ol>
      </nav>

      <header className="mb-12 border-b border-[hsl(var(--border))] pb-10">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${
              SEVERITY_PILL[fm.severity] ?? SEVERITY_PILL.info
            }`}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-current"
            />
            {SEVERITY_LABEL[fm.severity] ?? fm.severity}
          </span>
          <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            {fm.category}
          </span>
          <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            {fm.checkId}
          </span>
        </div>

        <h1 className="mb-5 font-serif text-[clamp(34px,5.4vw,52px)] font-normal leading-[1.06] tracking-[-1px] text-[hsl(var(--foreground))]">
          {fm.title}
        </h1>

        <p
          data-citable-lead
          className="mb-7 max-w-[62ch] text-[19px] leading-[1.55] text-[hsl(var(--foreground))]/85"
        >
          {fm.citableLead.trim()}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#how-to-fix"
            className="group inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 font-sans text-[14px] font-medium text-[hsl(var(--primary-foreground))] shadow-sm transition-all hover:translate-y-[-1px] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]"
          >
            Jump to the fix
            <MdArrowForward
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
          <a
            href="#verify-the-fix"
            className="font-mono text-[11px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] underline-offset-4 hover:text-[hsl(var(--foreground))] hover:underline"
          >
            or skip to verify ↓
          </a>
        </div>

        <p className="mt-5 font-mono text-[11px] text-[hsl(var(--muted-foreground))]">
          ~{readingMinutes} min read · {fm.tokenEstimate.toLocaleString()} tokens · last reviewed {fm.lastUpdated}
        </p>
      </header>

      <section
        aria-label="Why agents care"
        className="mb-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-6"
      >
        <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          <MdSmartToy className="h-4 w-4" aria-hidden />
          Why agents care
        </p>
        <p
          data-agent-impact
          className="text-[15.5px] leading-[1.65] text-[hsl(var(--foreground))]/85"
        >
          {fm.agentImpact.trim()}
        </p>
      </section>

      <div className="methodology-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
          {displayBody}
        </ReactMarkdown>
      </div>

      <footer className="mt-16 space-y-8 border-t border-[hsl(var(--border))] pt-8">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            Primary sources
          </p>
          <ul className="space-y-2 text-[14px]">
            {fm.primarySources
              .filter((s) => s.primary)
              .map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[hsl(var(--foreground))] underline-offset-4 hover:text-[hsl(var(--primary))] hover:underline"
                  >
                    {s.title}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                  <span className="text-[hsl(var(--muted-foreground))]"> · {s.publisher}</span>
                </li>
              ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-[hsl(var(--muted-foreground))]">
          <span>Last reviewed {fm.lastUpdated}</span>
          <a
            href={`https://github.com/opensverige/agent-scan/edit/main/content/methodology/${fm.slug}.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 uppercase tracking-widest underline-offset-4 hover:text-[hsl(var(--foreground))] hover:underline"
          >
            Edit on GitHub
            <MdArrowForward className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
      </footer>
    </article>
  );
}
