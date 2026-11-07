// lib/visibility/study.ts
//
// Pure aggregation for the visibility study (scripts/visibility-index.ts).
// The study's point is to show how much AI answers vary between runs of the
// same question, so besides "named in k of n answers" it reports overlap
// between answers and how often the first name repeats.

import { wilson, type Interval } from "./stats";

const LEGAL_SUFFIXES = /\b(ab|aktiebolag|hb|kb|publ|sverige|sweden|nordic|group)\b/g;

/**
 * Key for counting the same company across answers: "Grant Thornton Sverige AB",
 * "grant thornton" and "GrantThornton.se" are one company, the display name
 * stays as first seen.
 */
export function brandKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKC")
    .replace(/https?:\/\//g, "")
    .replace(/^www\./, "")
    .replace(/\.(se|com|nu|net|org|io)\b/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(LEGAL_SUFFIXES, " ")
    .replace(/&/g, " och ")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

/** Unique keys per answer, empty keys dropped, first-mention order kept. */
export function keysPerAnswer(perAnswer: string[][]): string[][] {
  return perAnswer.map(names => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const n of names) {
      const k = brandKey(n);
      if (k && !seen.has(k)) {
        seen.add(k);
        out.push(k);
      }
    }
    return out;
  });
}

export function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 && sb.size === 0) return 1;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  return inter / (sa.size + sb.size - inter);
}

/** Mean Jaccard overlap over every pair of answers. Null with fewer than two. */
export function meanPairwiseOverlap(lists: string[][]): number | null {
  if (lists.length < 2) return null;
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < lists.length; i++) {
    for (let j = i + 1; j < lists.length; j++) {
      sum += jaccard(lists[i], lists[j]);
      pairs++;
    }
  }
  return sum / pairs;
}

export interface FirstName {
  key: string;
  /** Answers whose first named company is `key`. */
  answers: number;
  /** Answers that named at least one company. */
  of: number;
}

/** The most common first-named company and how many answers led with it. */
export function firstNameStability(lists: string[][]): FirstName | null {
  const firsts = lists.filter(l => l.length > 0).map(l => l[0]);
  if (firsts.length === 0) return null;
  const counts = new Map<string, number>();
  for (const f of firsts) counts.set(f, (counts.get(f) ?? 0) + 1);
  const [key, answers] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return { key, answers, of: firsts.length };
}

export interface BrandShare {
  key: string;
  name: string;
  answers: number;
  interval: Interval;
}

export interface VariationSummary {
  answers: number;
  /** Answers that named no company at all. */
  emptyAnswers: number;
  distinctCompanies: number;
  meanCompaniesPerAnswer: number;
  meanOverlap: number | null;
  firstName: (FirstName & { name: string }) | null;
  /** Companies named in exactly one answer. */
  namedOnce: number;
  brands: BrandShare[];
}

/** Summarise the companies named per answer for one question. */
export function summarizeVariation(perAnswer: string[][]): VariationSummary {
  const keys = keysPerAnswer(perAnswer);
  const display = new Map<string, string>();
  perAnswer.forEach(names => {
    for (const n of names) {
      const k = brandKey(n);
      if (k && !display.has(k)) display.set(k, n.trim());
    }
  });

  const counts = new Map<string, number>();
  for (const list of keys) for (const k of list) counts.set(k, (counts.get(k) ?? 0) + 1);

  const n = keys.length;
  const brands = [...counts.entries()]
    .map(([key, answers]) => ({ key, name: display.get(key) ?? key, answers, interval: wilson(answers, n) }))
    .sort((a, b) => b.answers - a.answers || a.name.localeCompare(b.name, "sv"));

  const first = firstNameStability(keys);
  return {
    answers: n,
    emptyAnswers: keys.filter(l => l.length === 0).length,
    distinctCompanies: counts.size,
    meanCompaniesPerAnswer: n > 0 ? keys.reduce((s, l) => s + l.length, 0) / n : 0,
    meanOverlap: meanPairwiseOverlap(keys),
    firstName: first ? { ...first, name: display.get(first.key) ?? first.key } : null,
    namedOnce: brands.filter(b => b.answers === 1).length,
    brands,
  };
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  webSearches: number;
}

export interface Price {
  inputPerMTok: number;
  outputPerMTok: number;
  cacheReadPerMTok: number;
  perThousandSearches: number;
}

export function addUsage(a: Usage, b: Usage): Usage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
    webSearches: a.webSearches + b.webSearches,
  };
}

export const ZERO_USAGE: Usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, webSearches: 0 };

export function costUsd(u: Usage, p: Price): number {
  return (
    (u.inputTokens * p.inputPerMTok + u.outputTokens * p.outputPerMTok + u.cacheReadTokens * p.cacheReadPerMTok) / 1e6 +
    (u.webSearches * p.perThousandSearches) / 1000
  );
}
