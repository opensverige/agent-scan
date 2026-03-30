// lib/api-score/index.ts

export type { ApiScoreResult, ApiScoreInput, AxisScore, AxisCheck, ScoreBand } from "./types";

import type { ApiScoreInput, ApiScoreResult } from "./types";
import { parseSpec } from "./parse-spec";
import { scoreDiscoverability } from "./axis-1";
import { scoreMachineStructure } from "./axis-2";
import { scoreEndpointClarity } from "./axis-3";
import { scoreExampleQuality } from "./axis-4";
import { scoreConsistency } from "./axis-5";
import { scoreQualityGates } from "./axis-6";
import { scoreAuthUsability } from "./axis-7";
import { scoreErrorHandling } from "./axis-8";
import { scoreAgentReadiness } from "./axis-9";
import { getBand, getBandLabel, generateBlockers, generateFixes } from "./scorer";

export async function scoreApi(input: ApiScoreInput): Promise<ApiScoreResult> {
  const { specRaw, docsHtml, domain } = input;

  let spec: Record<string, unknown> | null = null;
  let specFormat: ApiScoreResult["specFormat"] = null;

  if (specRaw) {
    const parsed = await parseSpec(specRaw);
    if (parsed) {
      spec = parsed.spec;
      specFormat = parsed.format;
    }
  }

  const [
    axis1,
    axis2,
    axis3,
    axis4,
    axis5,
    axis6,
    axis7,
    axis8,
    axis9,
  ] = await Promise.all([
    Promise.resolve(scoreDiscoverability(spec, docsHtml)),
    Promise.resolve(scoreMachineStructure(spec)),
    Promise.resolve(scoreEndpointClarity(spec, docsHtml)),
    Promise.resolve(scoreExampleQuality(spec, docsHtml)),
    Promise.resolve(scoreConsistency(spec)),
    scoreQualityGates(spec, docsHtml, domain),
    Promise.resolve(scoreAuthUsability(spec, docsHtml)),
    Promise.resolve(scoreErrorHandling(spec, docsHtml)),
    scoreAgentReadiness(spec, docsHtml, domain),
  ]);

  const axes = [axis1, axis2, axis3, axis4, axis5, axis6, axis7, axis8, axis9];
  const totalScore = axes.reduce((s, a) => s + a.score, 0);
  // maxPossibleScore: if spec present = 100, else sum of non-limited maxScores
  const maxPossibleScore = spec
    ? 100
    : axes.reduce((s, a) => s + (a.limited ? a.score : a.maxScore), 0);

  const band = getBand(totalScore);

  return {
    totalScore,
    maxPossibleScore,
    band,
    bandLabel: getBandLabel(band),
    axes,
    hasSpec: !!spec,
    specFormat,
    topBlockers: generateBlockers(axes),
    fastestFixes: generateFixes(axes),
  };
}
