// components/report/KeyFindings.tsx
//
// 4-cell grid of nyckeltal under the hero. Each tile = one stat + label
// + optional context. Hairline borders, no shadows. Server component.

import { Eyebrow } from "./Eyebrow";

interface KeyFinding {
  value: string;
  unit?: string;
  label: string;
  context?: string;
  emphasis?: boolean;
}

interface KeyFindingsProps {
  eyebrow?: string;
  findings: readonly KeyFinding[];
}

export function KeyFindings({
  eyebrow = "Fem nyckeltal",
  findings,
}: KeyFindingsProps) {
  return (
    <section
      aria-labelledby="key-findings-heading"
      className="border-t border-[hsl(var(--hairline))] bg-[hsl(var(--surface-sunken))]"
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 py-14 sm:px-8 md:py-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id="key-findings-heading" className="sr-only">
          {eyebrow}
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-[hsl(var(--hairline))] bg-[hsl(var(--hairline))] sm:grid-cols-2 lg:grid-cols-4">
          {findings.map((f, idx) => (
            <li
              key={idx}
              className={`flex flex-col gap-4 bg-[hsl(var(--background))] p-6 md:p-7 ${f.emphasis ? "bg-[hsl(var(--surface-card))]" : ""}`}
            >
              <p
                data-numeric
                className={`font-editorial leading-[0.92] ${
                  f.emphasis
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--foreground))]"
                }`}
              >
                <span className="block text-[clamp(48px,7vw,72px)]">
                  {f.value}
                  {f.unit && (
                    <span className="ml-1 text-[0.55em] tracking-tight opacity-90">
                      {f.unit}
                    </span>
                  )}
                </span>
              </p>
              <p className="font-sans text-[15px] font-medium leading-[1.4] text-[hsl(var(--foreground-soft))]">
                {f.label}
              </p>
              {f.context && (
                <p className="font-sans text-[13px] leading-[1.55] text-[hsl(var(--muted-foreground))]">
                  {f.context}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
