// components/report/InlineStat.tsx
//
// Editorial inline-stat for embedding numeric figures into prose without
// breaking out to a card or full-bleed band. Renders the number ~1.6x the
// surrounding line size in Fraunces tabular nums, with a small mono label.
// Baseline-aligned so it doesn't disrupt line height.
//
// Use: <InlineStat value="0" unit="/6" label="myndigheter" emphasis />
//      drop directly inside a <p> in Prose.

interface InlineStatProps {
  value: string;
  unit?: string;
  label: string;
  /** Highlights the number in brand red. */
  emphasis?: boolean;
}

export function InlineStat({
  value,
  unit,
  label,
  emphasis,
}: InlineStatProps) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap align-baseline">
      <span
        className={`font-editorial font-editorial-display tabular-nums leading-none text-[1.55em] ${
          emphasis
            ? "text-[hsl(var(--primary))]"
            : "text-[hsl(var(--foreground))]"
        }`}
      >
        {value}
        {unit && (
          <span className="ml-0.5 text-[0.55em] tracking-tight opacity-80">
            {unit}
          </span>
        )}
      </span>
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
        {label}
      </span>
    </span>
  );
}
