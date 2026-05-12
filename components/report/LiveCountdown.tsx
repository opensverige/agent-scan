// components/report/LiveCountdown.tsx
//
// Live countdown ticking every minute from "now" toward a target ISO date.
// SSR-safe: server renders the initial value (computed from the request time)
// so there's no layout shift when the client hydrates. The client then takes
// over and ticks every 60s.
//
// Format: <days> · <hh tim> e.g. "81 · 02 tim"  (use unit="dagar" for full word)
// In compact mode, falls back to just the days number.
//
// Reduced motion-safe: no animation, no transitions — just a value swap.

"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  /** ISO target — interpreted in the local browser timezone. */
  to: string;
  /** If true, renders only the days number (no hour suffix). */
  compact?: boolean;
  /** Optional unit label appended after the days number. */
  unit?: string;
  className?: string;
}

function computeRemaining(target: Date, now: Date) {
  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  return { days, hours, passed: diffMs === 0 };
}

export function LiveCountdown({
  to,
  compact = false,
  unit,
  className,
}: CountdownProps) {
  const target = new Date(to);
  // Server snapshot: stable initial render so SSR + hydration agree.
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // Sync immediately on mount (the server snapshot may be a second stale).
    setNow(new Date());
    // Tick every minute — second-level resolution adds nothing for a
    // 80-day countdown and would burn re-renders.
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const { days, hours, passed } = computeRemaining(target, now);

  if (passed) {
    return (
      <span
        className={className}
        aria-label="Tillämpningsdatum passerat"
      >
        passerad
      </span>
    );
  }

  const dayStr = String(days);
  const hourStr = String(hours).padStart(2, "0");

  if (compact) {
    return (
      <span
        className={className}
        aria-label={`${days} ${unit ?? "dagar"} kvar`}
      >
        {dayStr}
        {unit && (
          <span className="ml-1 text-[0.55em] tracking-tight opacity-90">
            {unit}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={className}
      aria-label={`${days} dagar och ${hours} timmar kvar`}
    >
      <span>{dayStr}</span>
      {unit && (
        <span className="ml-1 text-[0.55em] tracking-tight opacity-90">
          {unit}
        </span>
      )}
      <span className="ml-3 text-[0.4em] font-mono uppercase tracking-[0.18em] opacity-50 align-middle">
        · {hourStr} tim
      </span>
    </span>
  );
}
