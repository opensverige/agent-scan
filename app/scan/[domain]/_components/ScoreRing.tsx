// app/scan/[domain]/_components/ScoreRing.tsx
"use client";

import { useState, useEffect } from "react";
import { RING_R, RING_CIRC } from "./constants";

/**
 * Animated SVG progress ring with count-up number in the center.
 * Respects prefers-reduced-motion: skips animation, jumps straight to final state.
 */
export function ScoreRing({ score, total, ringColor }: { score: number; total: number; ringColor: string }) {
  const [filled, setFilled] = useState(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const finalFilled = (score / total) * RING_CIRC;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setFilled(finalFilled); setDisplay(score); return; }
    let raf = 0;
    const timer = setTimeout(() => setFilled(finalFilled), 50);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 700, 1);
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(ease * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [score, total]);

  return (
    <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
      <svg width={150} height={150} viewBox="0 0 150 150">
        <circle cx={75} cy={75} r={RING_R} fill="none" className="stroke-muted" strokeWidth={8} />
        <circle
          cx={75} cy={75} r={RING_R} fill="none"
          stroke={ringColor} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${filled} ${RING_CIRC - filled}`}
          className="transition-[stroke-dasharray] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          transform="rotate(-90 75 75)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-mono text-5xl font-extrabold leading-none">{display}</span>
        <span className="font-mono text-sm text-muted-foreground mt-1">/{total}</span>
      </div>
    </div>
  );
}
