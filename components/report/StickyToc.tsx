// components/report/StickyToc.tsx
//
// Desktop sticky table of contents. Uses IntersectionObserver to highlight
// the section currently in the reading band (top 20-30% of viewport).
// Mobile: hidden, replaced by a collapsible <details> placed by parent.

"use client";

import { useEffect, useState } from "react";

export interface TocEntry {
  id: string;
  num: string;
  title: string;
}

interface StickyTocProps {
  entries: readonly TocEntry[];
  className?: string;
}

export function StickyToc({ entries, className }: StickyTocProps) {
  const [activeId, setActiveId] = useState<string | null>(
    entries[0]?.id ?? null,
  );

  useEffect(() => {
    const elements = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (intersections) => {
        // Pick the section with smallest distance to the reading band
        let best: { id: string; ratio: number } | null = null;
        for (const i of intersections) {
          if (i.isIntersecting && (!best || i.intersectionRatio > best.ratio)) {
            best = { id: i.target.id, ratio: i.intersectionRatio };
          }
        }
        if (best) setActiveId(best.id);
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0, 0.1, 0.5, 1],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav aria-label="Innehållsförteckning" className={className}>
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
        På denna sida
      </p>
      <ol className="space-y-0.5">
        {entries.map((entry) => {
          const isActive = activeId === entry.id;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`group relative block py-2 pl-4 transition-colors duration-150 ease-[var(--ease-out-quint)] ${
                  isActive
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 transition-all duration-150 ease-[var(--ease-out-quint)] ${
                    isActive
                      ? "bg-[hsl(var(--primary))] opacity-100"
                      : "bg-[hsl(var(--foreground))] opacity-0 group-hover:opacity-30"
                  }`}
                />
                <span className="flex items-baseline gap-2.5 text-[12.5px] leading-[1.4]">
                  <span
                    className={`font-mono text-[10px] tabular-nums transition-colors duration-150 ${
                      isActive
                        ? "text-[hsl(var(--primary))] opacity-100"
                        : "opacity-50"
                    }`}
                  >
                    {entry.num}
                  </span>
                  <span>{entry.title}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
