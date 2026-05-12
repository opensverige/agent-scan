// components/report/DenseSectionHeader.tsx
//
// Tighter alternative to SectionAnchor for sections that don't need a
// subtitle. Inline num + eyebrow above a smaller H2, hairline top rule.
// Saves ~120px of vertical real estate vs SectionAnchor.
//
// Use for §04/§05/§06 where the title alone is enough orientation.

interface DenseSectionHeaderProps {
  id: string;
  num: string;
  /** Optional mono eyebrow next to the number. Omit if the title carries it. */
  eyebrow?: string;
  title: string;
}

export function DenseSectionHeader({
  id,
  num,
  eyebrow,
  title,
}: DenseSectionHeaderProps) {
  return (
    <header className="mb-7 mt-20 border-t border-[hsl(var(--hairline))] pt-6 md:mt-24">
      <h2
        id={id}
        className="flex flex-wrap items-baseline gap-x-3 gap-y-2"
      >
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] tabular-nums text-[hsl(var(--primary))]">
          {num}
        </span>
        {eyebrow && (
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
            — {eyebrow}
          </span>
        )}
        <span className="font-editorial basis-full text-[clamp(26px,3.4vw,38px)] leading-[1.1] tracking-[-0.005em] text-[hsl(var(--foreground))] [text-wrap:balance]">
          {title}
        </span>
      </h2>
    </header>
  );
}
