// components/report/SectionAnchor.tsx
//
// Section header with numbered eyebrow, title, and short hairline rule.
// Used at the start of every major section in the report.
//
// Typography: Fraunces editorial display (.font-editorial) for the H2 —
// Instrument Serif weight 400 disappears at this scale; Fraunces wght 500
// + SOFT 50 has the structural weight to anchor a section visually.

import { Eyebrow } from "./Eyebrow";

interface SectionAnchorProps {
  id: string;
  num: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function SectionAnchor({
  id,
  num,
  eyebrow,
  title,
  subtitle,
}: SectionAnchorProps) {
  return (
    <header className="mb-12 mt-28 md:mt-36">
      <Eyebrow num={num} tone="primary">
        {eyebrow}
      </Eyebrow>
      <h2
        id={id}
        className="font-editorial mt-7 text-[clamp(34px,5.4vw,56px)] leading-[1.04] text-[hsl(var(--foreground))]"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 max-w-[62ch] font-sans text-[clamp(17px,1.5vw,20px)] leading-[1.5] text-[hsl(var(--muted-foreground))]">
          {subtitle}
        </p>
      )}
      <hr
        aria-hidden
        className="mt-9 w-16 border-0 border-t border-[hsl(var(--rule))]"
      />
    </header>
  );
}
