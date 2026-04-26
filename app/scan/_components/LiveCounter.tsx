// app/scan/_components/LiveCounter.tsx
"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/language-context";

interface Stats {
  total: number | null;
  last24h: number | null;
}

const REFRESH_MS = 60_000;
const COUNT_UP_MS = 700;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const CSS = `
  @keyframes lc-pulse {
    0%, 100% { opacity: 0.35; }
    50%      { opacity: 1; }
  }
  @keyframes lc-fadein {
    from { opacity: 0; transform: translateY(2px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .lc-dot { animation: none !important; opacity: 0.7 !important; }
  }
`;

function useCountUp(target: number | null) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target === null || target <= 0) {
      setDisplay(target ?? 0);
      return;
    }
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNT_UP_MS, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return display;
}

export default function LiveCounter() {
  const { t } = useLang();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function fetchStats() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Stats;
        if (!cancelled) setStats(data);
      } catch {
        /* ignore network errors — counter just stays hidden */
      } finally {
        if (!cancelled) {
          timeoutId = setTimeout(fetchStats, REFRESH_MS);
        }
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const totalDisplay = useCountUp(stats?.total ?? null);

  // Hide if Supabase isn't wired or there's nothing to brag about yet —
  // honesty over fake social proof.
  if (!stats || stats.total === null || stats.total <= 0) return null;

  const delta = stats.last24h ?? 0;

  return (
    <>
      <style>{CSS}</style>
      <div
        className="mx-auto flex w-fit max-w-full items-baseline gap-3 rounded-lg border border-border/60 bg-card/60 px-4 py-2.5 font-mono"
        style={{ animation: `lc-fadein 0.5s ${EASE} both` }}
        role="status"
        aria-live="polite"
        aria-label={`${stats.total} ${t.liveCounter.totalLabel}, ${delta} ${t.liveCounter.last24hLabel}`}
      >
        <span className="text-[22px] font-semibold tabular-nums leading-none text-foreground sm:text-[24px]">
          {totalDisplay.toLocaleString("sv-SE")}
        </span>
        <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {t.liveCounter.totalLabel}
        </span>
        {delta > 0 && (
          <>
            <span aria-hidden className="text-muted-foreground/40">
              ·
            </span>
            <span className="text-sm font-semibold tabular-nums leading-none text-primary">
              +{delta.toLocaleString("sv-SE")}
            </span>
            <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {t.liveCounter.last24hLabel}
            </span>
          </>
        )}
        <span
          aria-hidden
          className="lc-dot ml-2 h-1.5 w-1.5 shrink-0 self-center rounded-full bg-primary"
          style={{ animation: "lc-pulse 2.4s ease-in-out infinite" }}
        />
      </div>
    </>
  );
}
