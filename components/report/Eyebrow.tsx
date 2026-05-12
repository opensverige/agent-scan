// components/report/Eyebrow.tsx
//
// Mono-uppercase numbered eyebrow that doubles as section anchor.
// Used at start of every major section: "01 — METOD".

import type { ReactNode } from "react";

interface EyebrowProps {
  num?: string;
  children: ReactNode;
  /** Tone variants — primary uses brand red for the number */
  tone?: "muted" | "primary";
  className?: string;
}

export function Eyebrow({
  num,
  children,
  tone = "muted",
  className,
}: EyebrowProps) {
  return (
    <p
      className={`flex flex-wrap items-baseline gap-x-2.5 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-[hsl(var(--muted-foreground))] ${className ?? ""}`}
    >
      {num && (
        <>
          <span
            className={`tabular-nums ${tone === "primary" ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]"}`}
          >
            {num}
          </span>
          <span aria-hidden className="opacity-50">—</span>
        </>
      )}
      <span>{children}</span>
    </p>
  );
}
