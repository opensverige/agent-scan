// components/methodology-toc.tsx
//
// Server-rendered table of contents. Parses H2 headings out of the
// markdown body at request time and returns a single <nav> with the
// anchor list. Parent decides where to mount it (mobile <details>
// drawer above content, or desktop sticky sidebar in a grid column).

import type { ReactNode } from "react";

interface TocEntry {
  id: string;
  title: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractH2s(body: string): TocEntry[] {
  const lines = body.split("\n");
  const out: TocEntry[] = [];
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const title = match[1].trim();
    if (/^Related\s+agent\.opensverige/i.test(title)) continue;
    out.push({ id: slugify(title), title });
  }
  return out;
}

interface MethodologyTocProps {
  body: string;
  className?: string;
  /** When true, render with the desktop heading. When false (mobile drawer
   * inside <details>), heading is rendered by the wrapping <summary>. */
  withHeading?: boolean;
}

export function MethodologyToc({
  body,
  className,
  withHeading = true,
}: MethodologyTocProps): ReactNode {
  const entries = extractH2s(body);
  if (entries.length < 2) return null;

  return (
    <nav aria-label="On this page" className={className}>
      {withHeading && (
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          On this page
        </p>
      )}
      <ol className="space-y-1.5">
        {entries.map((entry, idx) => (
          <li key={entry.id} className="flex gap-2.5 leading-snug">
            <span
              aria-hidden
              className="mt-[3px] inline-block w-5 shrink-0 font-mono text-[10px] tabular-nums text-[hsl(var(--muted-foreground))] opacity-60"
            >
              {String(idx + 1).padStart(2, "0")}
            </span>
            <a
              href={`#${entry.id}`}
              className="block text-[13px] text-[hsl(var(--muted-foreground))] underline-offset-4 transition-colors hover:text-[hsl(var(--foreground))] hover:underline focus-visible:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
            >
              {entry.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
