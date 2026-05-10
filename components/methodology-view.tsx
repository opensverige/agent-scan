// components/methodology-view.tsx
//
// Server-component renderer for a single methodology article. Server-side
// markdown rendering via react-markdown so we ship zero JS for content
// pages. Component overrides handle Tailwind styling so we don't need
// @tailwindcss/typography.

import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { MethodologyArticle } from "@/lib/methodology/types";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "text-destructive",
  important: "text-amber-500",
  info: "text-muted-foreground",
};

const MARKDOWN_COMPONENTS: Components = {
  h2: ({ children }) => (
    <h2 className="mt-14 mb-5 font-serif text-3xl font-normal tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-10 mb-3 font-serif text-xl font-normal tracking-tight">
      {children}
    </h3>
  ),
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
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-primary underline-offset-4 hover:underline hover:text-foreground"
    >
      {children}
    </a>
  ),
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
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-xl border border-border/50 bg-muted/40 p-4 font-mono text-sm leading-relaxed">
      {children}
    </pre>
  ),
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
    <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
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

export function MethodologyView({ article }: { article: MethodologyArticle }) {
  const fm = article.frontmatter;

  return (
    <article className="mx-auto max-w-[720px] px-6 py-12 md:py-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground">
          agent.opensverige
        </Link>
        <span aria-hidden className="px-2 opacity-40">·</span>
        <Link href="/methodology" className="hover:text-foreground">
          Methodology
        </Link>
        <span aria-hidden className="px-2 opacity-40">·</span>
        <span className="text-foreground">{fm.checkId}</span>
      </nav>

      <header className="mb-10">
        <p
          className={`mb-4 font-mono text-[10px] uppercase tracking-widest ${
            SEVERITY_COLOR[fm.severity] ?? "text-muted-foreground"
          }`}
        >
          {fm.category} · {fm.severity} · check {fm.checkId}
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
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
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
          {article.body}
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
