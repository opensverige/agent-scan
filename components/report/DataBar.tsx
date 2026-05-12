// components/report/DataBar.tsx
//
// Horizontal bar chart for inline figures. CSS-only animation via
// IntersectionObserver-set data-visible attribute (handled by a thin
// client wrapper). Single accent bar in brand red — everything else
// in muted gray. No rainbow, no gradients.

"use client";

import { useEffect, useRef, useState } from "react";

export interface DataBarSeries {
  label: string;
  value: number;
  /** Pre-formatted display value, e.g. "3,8 %" or "56 sajter" */
  display: string;
  /** Set true to render in brand red (the value that matters) */
  highlight?: boolean;
}

interface DataBarProps {
  caption: string;
  source?: string;
  /** Max value to scale all bars against. Default: 100 (percent) */
  max?: number;
  series: readonly DataBarSeries[];
  /** Unit displayed in axis label */
  unit?: string;
}

export function DataBar({
  caption,
  source,
  max = 100,
  series,
  unit = "%",
}: DataBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={containerRef}
      className="my-12 border-y border-[hsl(var(--hairline))] py-8 md:my-16 md:py-10"
    >
      <figcaption className="mb-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">
          {caption}
        </span>
        {source && (
          <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]/80">
            {source}
          </span>
        )}
      </figcaption>
      <ul className="space-y-5">
        {series.map((s, idx) => {
          const pct = Math.min(1, Math.max(0, s.value / max));
          return (
            <li
              key={idx}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto] sm:gap-x-6"
            >
              <p className="font-sans text-[14px] leading-[1.3] text-[hsl(var(--foreground))]">
                {s.label}
              </p>
              <div
                aria-hidden
                className="col-span-2 h-2 overflow-hidden rounded-sm bg-[hsl(var(--chart-bar-mute))]/40 sm:col-span-1 sm:h-3"
              >
                <div
                  className="databar-fill h-full rounded-sm"
                  data-visible={visible}
                  style={
                    {
                      "--databar-value": pct,
                      background: s.highlight
                        ? "hsl(var(--chart-bar-accent))"
                        : "hsl(var(--chart-bar-mute))",
                    } as React.CSSProperties
                  }
                />
              </div>
              <p
                data-numeric
                className={`text-right font-mono text-[13.5px] font-medium leading-[1.3] tabular-nums tracking-[-0.005em] ${
                  s.highlight
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--foreground))]"
                }`}
              >
                {s.display}
              </p>
            </li>
          );
        })}
      </ul>
      {unit && (
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
          Skala 0–{max} {unit}
        </p>
      )}
    </figure>
  );
}
