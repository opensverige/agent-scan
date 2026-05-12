// components/report/Hero.tsx
//
// Hero block: eyebrow ("Q1 2026 · Rapport"), giant title, citable lead,
// + a hero data-stat that sits next to the title on desktop and stacks
// below on mobile. `title` is ReactNode so callers can compose multi-line
// editorial rhythm (e.g. three statements, each on its own line).
//
// Typography: Fraunces variable serif via .font-editorial-display class
// (opsz 144 + SOFT 50 + wght 500) gives the title editorial weight at
// huge sizes — Instrument Serif weight 400 is too thin to "fastna i ögat"
// at flagship-publication scale.

import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface HeroStat {
  /** Numeric/display value — accepts ReactNode so callers can pass a live
   *  countdown component, a tabular number, or a plain string. */
  value: ReactNode;
  unit?: string;
  label: string;
}

interface HeroProps {
  kicker: string;
  /** Editorial title — pass a string for simple titles or ReactNode for
   *  multi-line composition (<span className="block">…</span>). */
  title: ReactNode;
  lead: string;
  stat: HeroStat;
  meta: {
    publishedAt: string;
    version: string;
    authors: string;
  };
}

export function Hero({ kicker, title, lead, stat, meta }: HeroProps) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-12 sm:px-8 md:pb-24 md:pt-16 lg:pb-32 lg:pt-20">
      <Eyebrow tone="primary">{kicker}</Eyebrow>

      <div className="mt-14 grid items-end gap-12 md:mt-16 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
        <div className="min-w-0">
          <h1
            // Fraunces editorial display: opsz 144 (designed-for-huge),
            // SOFT 50 (warm-but-serious), wght 500 (more bite than 400).
            // [&>span]:block lets callers compose multi-line editorial rhythm.
            className="font-editorial font-editorial-display text-[clamp(48px,8.4vw,108px)] leading-[0.98] text-[hsl(var(--foreground))] [&>span]:block"
          >
            {title}
          </h1>
        </div>
        <HeroStatBlock stat={stat} />
      </div>

      <p className="mt-12 max-w-[58ch] font-sans text-[clamp(19px,1.8vw,23px)] leading-[1.5] tracking-[-0.005em] text-[hsl(var(--foreground-soft))]">
        {lead}
      </p>

      <dl className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
        <div className="flex items-center gap-2">
          <dt className="opacity-85">Publicerad</dt>
          <dd className="tabular-nums text-[hsl(var(--foreground))]">{meta.publishedAt}</dd>
        </div>
        <span aria-hidden className="opacity-40">·</span>
        <div className="flex items-center gap-2">
          <dt className="opacity-85">Version</dt>
          <dd className="tabular-nums text-[hsl(var(--foreground))]">{meta.version}</dd>
        </div>
        <span aria-hidden className="opacity-40">·</span>
        <div className="flex items-center gap-2">
          <dt className="opacity-85">Författare</dt>
          <dd className="text-[hsl(var(--foreground))]">{meta.authors}</dd>
        </div>
      </dl>
    </section>
  );
}

function HeroStatBlock({ stat }: { stat: HeroStat }) {
  // The value is rendered as visible text — no aria-label needed because
  // screen readers will read the literal content. If the caller passes a
  // LiveCountdown component as value, that component supplies its own
  // accessible label.
  // Sized down per UX review: 196 → 128px peak so the H1 wins the eye.
  const visualUnit = stat.unit;
  return (
    <div className="border-l-2 border-[hsl(var(--primary))] pl-6 lg:pl-8">
      <p className="font-editorial font-editorial-display tabular-nums leading-[0.9] text-[hsl(var(--primary))]">
        <span className="block text-[clamp(72px,10vw,128px)]">
          {stat.value}
          {visualUnit && (
            <span className="ml-1 text-[clamp(28px,3.6vw,44px)] tracking-[-0.02em] opacity-90">
              {visualUnit}
            </span>
          )}
        </span>
      </p>
      <p className="mt-4 max-w-[24ch] font-sans text-[14px] leading-[1.5] text-[hsl(var(--muted-foreground))]">
        {stat.label}
      </p>
    </div>
  );
}
