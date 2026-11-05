// lib/visibility/stats.ts
//
// Pure aggregation, safe for client and server. We report "mentioned in k of
// n answers" with a Wilson 95 % interval and never a 0-100 score or a rank:
// repeated runs of the same prompt rarely return the same brand list
// (SparkToro, Jan 2026), so a single number would claim precision we do not
// have.

import type { QuestionResult } from "./ask";

export interface Interval {
  low: number;
  high: number;
}

/** Wilson score interval for k successes out of n, 95 % by default. */
export function wilson(k: number, n: number, z = 1.96): Interval {
  if (n <= 0) return { low: 0, high: 1 };
  const p = k / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return { low: Math.max(0, centre - margin), high: Math.min(1, centre + margin) };
}

export interface CompetitorShare {
  name: string;
  /** Answers (runs) that named this company. */
  answers: number;
}

export interface VisibilitySummary {
  /** Category answers (runs) that completed. */
  answers: number;
  /** Category answers that mention the company. */
  mentioned: number;
  interval: Interval;
  /** Category questions with at least one mentioning answer. */
  questionsWithMention: number;
  questionsAnswered: number;
  competitors: CompetitorShare[];
  /** Domains cited most often across category answers. */
  topSources: { host: string; answers: number }[];
  searchedShare: number;
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function summarize(results: QuestionResult[]): VisibilitySummary {
  const category = results.filter(r => r.kind === "category" && !r.failed);
  const runs = category.flatMap(r => r.runs);
  const mentioned = runs.filter(r => r.mentioned).length;

  const comp = new Map<string, CompetitorShare>();
  for (const r of category) {
    for (const c of r.recommended) {
      if (c.isTarget) continue;
      const key = c.name.toLowerCase();
      const prev = comp.get(key);
      comp.set(key, { name: prev?.name ?? c.name, answers: (prev?.answers ?? 0) + c.runs });
    }
  }

  const sources = new Map<string, number>();
  for (const run of runs) {
    const hosts = new Set(run.sources.map(hostOf).filter((h): h is string => !!h));
    for (const h of hosts) sources.set(h, (sources.get(h) ?? 0) + 1);
  }

  return {
    answers: runs.length,
    mentioned,
    interval: wilson(mentioned, runs.length),
    questionsWithMention: category.filter(r => r.runs.some(run => run.mentioned)).length,
    questionsAnswered: category.length,
    competitors: [...comp.values()].sort((a, b) => b.answers - a.answers).slice(0, 8),
    topSources: [...sources.entries()]
      .map(([host, answers]) => ({ host, answers }))
      .sort((a, b) => b.answers - a.answers)
      .slice(0, 6),
    searchedShare: runs.length > 0 ? runs.filter(r => r.searched).length / runs.length : 0,
  };
}

/** "11–60 %" style label, Swedish formatting. */
export function formatInterval(i: Interval): string {
  return `${Math.round(i.low * 100)}–${Math.round(i.high * 100)} %`;
}
