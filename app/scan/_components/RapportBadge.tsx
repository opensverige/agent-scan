// app/scan/_components/RapportBadge.tsx
//
// Compact notification badge under the scanner pointing to the Q1 2026
// rapport. Single line on desktop, two on mobile. Pulsing primary dot on
// left signals "live publication", mono eyebrow + serif italic punchline
// give the editorial vibe of the underlying report.
//
// Placed between LiveCounter and the FAQ on /scan. Dismissable not yet —
// the rapport is fresh and we want every scanner-user to see it.

"use client";

import Link from "next/link";
import { MdArrowOutward } from "react-icons/md";

export function RapportBadge() {
  return (
    <div className="mx-auto mt-6 max-w-[580px] px-6">
      <Link
        href="/rapport/q1-2026"
        prefetch
        aria-label="Läs Svensk AI-Readiness Index Q1 2026"
        className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--bg-card)] py-2 pl-3 pr-4 transition-[border-color,background-color,transform] duration-200 ease-out hover:-translate-y-px hover:border-[var(--crayfish-light)] hover:bg-[var(--bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crayfish-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)]"
      >
        {/* Pulsing live-dot */}
        <span
          aria-hidden
          className="rb-dot relative inline-flex h-2 w-2 shrink-0 items-center justify-center"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--crayfish-light)] opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--crayfish-light)]" />
        </span>

        <span className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Ny rapport
          </span>
          <span
            aria-hidden
            className="font-mono text-[10px] text-[var(--text-muted)] opacity-50"
          >
            ·
          </span>
          {/* Desktop: full editorial punchline. Mobile: minimal title. */}
          <span className="hidden truncate font-serif text-[14px] italic leading-tight text-[var(--text-primary)] sm:inline">
            Q1 2026 · Skatteverket har ingen AI&#8209;vägledning
          </span>
          <span className="font-serif text-[14px] italic leading-tight text-[var(--text-primary)] sm:hidden">
            Q1 2026
          </span>
        </span>

        <span
          aria-hidden
          className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-secondary)] transition-[color,gap] duration-200 ease-out group-hover:gap-2 group-hover:text-[var(--crayfish-light)]"
        >
          Läs
          <MdArrowOutward className="h-3 w-3" />
        </span>
      </Link>
    </div>
  );
}
