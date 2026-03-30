// lib/api-score/scorer.ts

import type { AxisScore, ScoreBand } from "./types";

export function getBand(score: number): ScoreBand {
  if (score >= 90) return "agent_ready";
  if (score >= 75) return "strong";
  if (score >= 60) return "dev_ready";
  if (score >= 40) return "partial";
  return "not_ready";
}

export function getBandLabel(band: ScoreBand): string {
  const labels: Record<ScoreBand, string> = {
    agent_ready: "Agent-redo / tool-ready",
    strong: "Stark grund",
    dev_ready: "Developer-redo, inte agent-redo",
    partial: "Delvis användbart",
    not_ready: "Inte agent-redo",
  };
  return labels[band];
}

const FIX_MAP: Partial<Record<string, string>> = {
  "OpenAPI/Swagger spec": "Publicera OpenAPI-spec på /openapi.json",
  "operationId": "Lägg till operationIds på alla endpoints",
  "operationIds lämpliga för function calling": "Ge endpoints deskriptiva operationIds (inte get_1, post_2)",
  "Typed parameters": "Definiera type och schema på alla parametrar",
  "Request/response schemas": "Lägg till JSON schemas i request/response",
  "Status codes": "Dokumentera relevanta HTTP status codes",
  "Reusable components": "Extrahera gemensamma schemas till components",
  "Auth-metod dokumenterad": "Dokumentera auth-metod i securitySchemes",
  "Error examples": "Lägg till exempel på error-responses",
  "Request examples": "Lägg till request-exempel i spec",
  "Response examples": "Lägg till response-exempel i spec",
  "Service account / M2M stöd": "Dokumentera OAuth2 client credentials flow",
  "Rate limits dokumenterade": "Dokumentera rate limits och Retry-After header",
  "Descriptions tillräckliga för LLM-val": "Lägg till beskrivningar >30 tecken på alla endpoints",
  "Endpoint descriptions": "Lägg till description/summary på alla endpoints",
  "Sandbox / testmiljö": "Erbjud sandbox-miljö och dokumentera den",
  "Parametrar dokumenterade": "Lägg till description på alla parametrar",
  "Samma error-struktur": "Standardisera alla error-responses till samma schema",
};

export function generateBlockers(axes: AxisScore[]): string[] {
  const blockers: Array<{ text: string; severity: number }> = [];
  for (const axis of axes) {
    for (const check of axis.checks) {
      if (check.score < check.maxScore * 0.5) {
        blockers.push({ text: `${check.name}: ${check.detail}`, severity: check.maxScore - check.score });
      }
    }
  }
  return blockers
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 5)
    .map(b => b.text);
}

export function generateFixes(axes: AxisScore[]): string[] {
  const fixes: Array<{ text: string; gain: number }> = [];
  for (const axis of axes) {
    for (const check of axis.checks) {
      const gap = check.maxScore - check.score;
      const fix = FIX_MAP[check.name];
      if (gap > 0 && fix) fixes.push({ text: fix, gain: gap });
    }
  }
  return fixes
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 5)
    .map(f => f.text);
}
