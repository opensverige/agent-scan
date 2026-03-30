// lib/api-score/types.ts

export type ScoreBand = "not_ready" | "partial" | "dev_ready" | "strong" | "agent_ready";

export interface AxisCheck {
  name: string;
  score: number;
  maxScore: number;
  detail: string;
}

export interface AxisScore {
  axis: string;
  label: string;
  score: number;
  maxScore: number;
  checks: AxisCheck[];
  /** true when maxScore could not be reached due to missing spec */
  limited: boolean;
}

export interface ApiScoreResult {
  totalScore: number;
  maxPossibleScore: number;
  band: ScoreBand;
  bandLabel: string;
  axes: AxisScore[];
  hasSpec: boolean;
  specFormat: "openapi3" | "swagger" | null;
  topBlockers: string[];
  fastestFixes: string[];
}

export interface ApiScoreInput {
  /** Raw spec body (JSON or YAML), truncated at 15KB by the probe */
  specRaw: string | null;
  /** HTML/text from developer portal page, if any probe found one */
  docsHtml: string | null;
  domain: string;
  /** Anthropic API key for LLM-based signal extraction when no spec found */
  anthropicApiKey?: string;
}
