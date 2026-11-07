// lib/visibility/study.test.ts

import { describe, expect, it } from "vitest";
import { brandKey, costUsd, firstNameStability, jaccard, meanPairwiseOverlap, summarizeVariation } from "./study";

describe("brandKey", () => {
  it("merges legal suffixes, domains and spacing", () => {
    const key = brandKey("Grant Thornton");
    expect(brandKey("Grant Thornton Sverige AB")).toBe(key);
    expect(brandKey("grantthornton.se")).toBe(key);
    expect(brandKey("Grant Thornton (Stockholm)")).toBe(key);
  });

  it("keeps different companies apart", () => {
    expect(brandKey("Folktandvården")).not.toBe(brandKey("Folktandvården Skåne Malmö"));
    expect(brandKey("Stabil Redovisning")).toContain("stabil");
  });

  it("returns empty for punctuation only", () => {
    expect(brandKey(" - ")).toBe("");
  });
});

describe("overlap", () => {
  it("computes Jaccard and the pairwise mean", () => {
    expect(jaccard(["a", "b"], ["b", "c"])).toBeCloseTo(1 / 3);
    expect(jaccard([], [])).toBe(1);
    expect(meanPairwiseOverlap([["a"]])).toBeNull();
    expect(meanPairwiseOverlap([["a", "b"], ["a", "b"], ["c"]])).toBeCloseTo((1 + 0 + 0) / 3);
  });

  it("finds the most common first name among non-empty answers", () => {
    expect(firstNameStability([["a", "b"], ["b"], ["a"], []])).toEqual({ key: "a", answers: 2, of: 3 });
    expect(firstNameStability([[], []])).toBeNull();
  });
});

describe("summarizeVariation", () => {
  it("counts each company once per answer and keeps the first spelling", () => {
    const v = summarizeVariation([
      ["Bokio AB", "Fortnox", "Bokio"],
      ["bokio", "Visma"],
      [],
    ]);
    expect(v.answers).toBe(3);
    expect(v.emptyAnswers).toBe(1);
    expect(v.distinctCompanies).toBe(3);
    expect(v.namedOnce).toBe(2);
    expect(v.brands[0]).toMatchObject({ name: "Bokio AB", answers: 2 });
    expect(v.brands[0].interval.low).toBeGreaterThan(0);
    expect(v.firstName).toMatchObject({ name: "Bokio AB", answers: 2, of: 2 });
    expect(v.meanCompaniesPerAnswer).toBeCloseTo(4 / 3);
  });
});

describe("costUsd", () => {
  it("adds tokens and searches", () => {
    const price = { inputPerMTok: 4, outputPerMTok: 20, cacheReadPerMTok: 0.2, perThousandSearches: 10 };
    expect(costUsd({ inputTokens: 1_000_000, outputTokens: 100_000, cacheReadTokens: 0, webSearches: 100 }, price)).toBeCloseTo(4 + 2 + 1);
  });
});
