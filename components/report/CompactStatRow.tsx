// components/report/CompactStatRow.tsx
//
// Compact horizontal stat band that replaces the heavy 4-card KeyFindings
// grid. One row, one scan, ~140px tall instead of ~520px. Eyebrow on top,
// then a dl grid of stat tiles separated by left-hairline rules.
//
// Use under the hero as the "fem nyckeltal" band.

interface CompactStat {
  value: string;
  unit?: string;
  label: string;
  /** Highlights the value in brand red. Use sparingly — once per row. */
  emphasis?: boolean;
}

interface CompactStatRowProps {
  eyebrow?: string;
  stats: readonly CompactStat[];
  source?: string;
  /** Optional section id for deep-linking and TOC. */
  id?: string;
}

export function CompactStatRow({
  eyebrow,
  stats,
  source,
  id,
}: CompactStatRowProps) {
  return (
    <section
      id={id}
      aria-labelledby={eyebrow ? `${id ?? "stats"}-eyebrow` : undefined}
      className="scroll-mt-24 border-y border-[hsl(var(--hairline))] bg-[hsl(var(--surface-sunken))]"
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 py-7 sm:px-8 md:py-9">
        {eyebrow && (
          <p
            id={id ? `${id}-eyebrow` : undefined}
            className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]"
          >
            {eyebrow}
          </p>
        )}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`min-w-0 ${
                idx > 0
                  ? "sm:border-l sm:border-[hsl(var(--hairline))] sm:pl-5"
                  : ""
              }`}
            >
              <dt className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                {s.label}
              </dt>
              <dd
                className={`mt-2 font-editorial font-editorial-display tabular-nums leading-none text-[clamp(28px,3.6vw,40px)] ${
                  s.emphasis
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--foreground))]"
                }`}
              >
                {s.value}
                {s.unit && (
                  <span className="ml-0.5 text-[0.5em] tracking-tight opacity-80">
                    {s.unit}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        {source && (
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]/80">
            {source}
          </p>
        )}
      </div>
    </section>
  );
}
