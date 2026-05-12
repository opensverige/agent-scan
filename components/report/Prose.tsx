// components/report/Prose.tsx
//
// Container for body text inside a report section. Sets max line-length,
// typography rhythm, and link styling. Use this around plain JSX text
// content within a section — not for components like DataBar or PullQuote.

import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="report-prose max-w-[64ch] font-sans text-[18px] leading-[1.7] text-[hsl(var(--foreground-soft))] [&_a]:text-[hsl(var(--foreground))] [&_a]:underline [&_a]:decoration-[hsl(var(--hairline))] [&_a]:underline-offset-[3px] [&_a]:transition-colors [&_a]:duration-150 hover:[&_a]:decoration-[hsl(var(--primary))] [&_p+p]:mt-6 [&_strong]:font-semibold [&_strong]:text-[hsl(var(--foreground))]">
      {children}
    </div>
  );
}
