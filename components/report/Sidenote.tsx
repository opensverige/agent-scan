// components/report/Sidenote.tsx
//
// Editorial sidenote / footnote-style aside. Replaces rounded-card callouts
// where information is supporting (caveats, methodology disclaimers,
// provenance notes). Hairline-only treatment — no fill, no rounded corners —
// so it reads as a footnote, not a UI alert.
//
// Layout: [LABEL mono] | [prose] with a left border-l hairline.

import type { ReactNode } from "react";

interface SidenoteProps {
  /** Mono uppercase prefix shown next to the body. Default: "Anm." */
  label?: string;
  /** "warn" highlights the label in primary. Default: "muted". */
  tone?: "muted" | "warn";
  children: ReactNode;
  className?: string;
}

export function Sidenote({
  label = "Anm.",
  tone = "muted",
  children,
  className,
}: SidenoteProps) {
  return (
    <aside
      className={`my-7 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 border-l border-[hsl(var(--hairline))] pl-4 text-[13.5px] leading-[1.55] text-[hsl(var(--muted-foreground))] ${className ?? ""}`}
    >
      <span
        className={`pt-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.18em] ${
          tone === "warn"
            ? "text-[hsl(var(--primary))]"
            : "text-[hsl(var(--foreground-soft))]"
        }`}
      >
        {label}
      </span>
      <div className="[&_strong]:font-medium [&_strong]:text-[hsl(var(--foreground))]">
        {children}
      </div>
    </aside>
  );
}
