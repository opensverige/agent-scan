// lib/api-score/index.ts

export type { ApiScoreResult, ApiScoreInput, AxisScore, AxisCheck, ScoreBand } from "./types";

import type { ApiScoreInput, ApiScoreResult, AxisScore } from "./types";
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
import { extractApiSignals, type LLMApiSignals } from "./llm-extract";

// ── LLM boost helpers ─────────────────────────────────────────

function boostCheck(axis: AxisScore, checkName: string, newScore: number, newDetail: string): AxisScore {
  const checks = axis.checks.map(c => {
    if (c.name !== checkName) return c;
    const capped = Math.min(newScore, c.maxScore);
    return c.score < capped ? { ...c, score: capped, detail: newDetail } : c;
  });
  return { ...axis, checks, score: checks.reduce((s, c) => s + c.score, 0) };
}

function applyLlmBoosts(axes: AxisScore[], s: LLMApiSignals): AxisScore[] {
  return axes.map(axis => {
    switch (axis.axis) {
      case "discoverability": {
        let a = axis;
        if (s.authMethods.length > 0)
          a = boostCheck(a, "Auth-metod förklarad", 2, `Auth hittad av LLM: ${s.authMethods.join(", ")}`);
        if (s.hasChangelog)
          a = boostCheck(a, "Changelog / versionsinfo", 2, "Changelog hittad av LLM");
        return a;
      }
      case "example_quality": {
        let a = axis;
        if (s.hasCodeExamples)
          a = boostCheck(a, "Auth-exempel i docs", 2, "Kod-exempel hittad av LLM");
        if (s.hasErrorCodes)
          a = boostCheck(a, "Error examples i docs", 2, "Error-exempel hittad av LLM");
        return a;
      }
      case "quality_gates": {
        let a = axis;
        if (s.lastUpdatedYear && s.lastUpdatedYear >= 2023)
          a = boostCheck(a, "Senast uppdaterad / aktiv", 2, `Senast uppdaterad ${s.lastUpdatedYear} (LLM)`);
        if (s.hasStatusPage)
          a = boostCheck(a, "Status-sida / uptime", 2, "Status-sida hittad av LLM");
        if (s.hasSandbox)
          a = boostCheck(a, "Sandbox / testmiljö", 3, "Testmiljö hittad av LLM");
        return a;
      }
      case "auth_usability": {
        let a = axis;
        if (s.authMethods.length > 0)
          a = boostCheck(a, "Auth-metod dokumenterad", 1, `Auth: ${s.authMethods.join(", ")} (LLM)`);
        if (s.hasM2MAuth)
          a = boostCheck(a, "Service account / M2M stöd", 2, "M2M/client credentials hittad av LLM");
        if (s.hasRateLimits)
          a = boostCheck(a, "Rate limits dokumenterade", 1, "Rate limits hittad av LLM");
        if (s.hasTokenRefresh)
          a = boostCheck(a, "Token refresh förklarat", 1, "Token refresh hittad av LLM");
        return a;
      }
      case "error_handling": {
        let a = axis;
        if (s.hasErrorCodes)
          a = boostCheck(a, "Error codes dokumenterade", 2, "Error codes hittad av LLM");
        if (s.hasRetry)
          a = boostCheck(a, "Retry guidance", 1, "Retry guidance hittad av LLM");
        return a;
      }
      default:
        return axis;
    }
  });
}

// ── Main scorer ───────────────────────────────────────────────

export async function scoreApi(input: ApiScoreInput): Promise<ApiScoreResult> {
  const { specRaw, docsHtml, domain, anthropicApiKey } = input;

  let spec: Record<string, unknown> | null = null;
  let specFormat: ApiScoreResult["specFormat"] = null;

  if (specRaw) {
    const parsed = await parseSpec(specRaw);
    if (parsed) {
      spec = parsed.spec;
      specFormat = parsed.format;
    }
  }

  // Run all axis scoring and LLM extraction in parallel.
  // LLM extraction only when no spec — pass raw spec text as context even if parsing failed.
  const shouldExtract = !spec && !!anthropicApiKey && !!docsHtml;

  const [axisResults, llmSignals] = await Promise.all([
    Promise.all([
      Promise.resolve(scoreDiscoverability(spec, docsHtml)),
      Promise.resolve(scoreMachineStructure(spec)),
      Promise.resolve(scoreEndpointClarity(spec, docsHtml)),
      Promise.resolve(scoreExampleQuality(spec, docsHtml)),
      Promise.resolve(scoreConsistency(spec)),
      scoreQualityGates(spec, docsHtml, domain),
      Promise.resolve(scoreAuthUsability(spec, docsHtml)),
      Promise.resolve(scoreErrorHandling(spec, docsHtml)),
      scoreAgentReadiness(spec, docsHtml, domain),
    ]),
    shouldExtract
      ? extractApiSignals(docsHtml!, anthropicApiKey!, specRaw ?? undefined)
      : Promise.resolve(null),
  ]);

  const axes = llmSignals ? applyLlmBoosts(axisResults, llmSignals) : axisResults;

  const totalScore = axes.reduce((s, a) => s + a.score, 0);
  // Always divide by the full possible points — never by achieved score.
  // Without a spec, limited axes can only reach a fraction of their maxScore,
  // but the denominator must reflect what could have been scored, not what was.
  const maxPossibleScore = axes.reduce((s, a) => s + a.maxScore, 0);

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
