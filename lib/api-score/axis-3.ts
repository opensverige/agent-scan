// lib/api-score/axis-3.ts — Endpoint clarity (10p)

import type { AxisScore } from "./types";
import { getAllOperations, getAllParams, pct } from "./parse-spec";

export function scoreEndpointClarity(
  spec: Record<string, unknown> | null,
  docsHtml: string | null,
): AxisScore {
  const docs = (docsHtml ?? "").toLowerCase();
  const checks = [];

  if (!spec) {
    // Limited: docs analysis only, max 5/10
    const hasEndpointList = /endpoint|route|resource|get |post |put |delete /.test(docs);
    checks.push({ name: "Endpoint-lista i docs", score: hasEndpointList ? 2 : 0, maxScore: 3,
      detail: hasEndpointList ? "Endpoints dokumenterade i docs" : "Inga endpoints dokumenterade" });
    const hasParamDocs = /parameter|param|query|header|body/.test(docs);
    checks.push({ name: "Parametrar dokumenterade", score: hasParamDocs ? 2 : 0, maxScore: 2,
      detail: hasParamDocs ? "Parameterdokumentation hittad" : "Ingen parameterdokumentation" });
    const hasRequired = /required|optional|mandatory/.test(docs);
    checks.push({ name: "Required/optional märkt", score: hasRequired ? 1 : 0, maxScore: 2,
      detail: hasRequired ? "Required/optional info hittad" : "Ingen required-märkning hittad" });
    const total = checks.reduce((s, c) => s + c.score, 0);
    return { axis: "endpoint_clarity", label: "Endpoint clarity", score: total, maxScore: 10, checks, limited: true };
  }

  const ops = getAllOperations(spec);
  const params = getAllParams(spec);

  // 1. Descriptions on endpoints (3p) — >80% have description >20 chars
  const withDesc = ops.filter(o =>
    (typeof o.description === "string" && o.description.length > 20) ||
    (typeof o.summary === "string" && o.summary.length > 20)
  );
  const descPct = pct(withDesc.length, ops.length);
  checks.push({ name: "Endpoint descriptions", score: descPct > 0.8 ? 3 : descPct > 0.5 ? 2 : descPct > 0.2 ? 1 : 0, maxScore: 3,
    detail: `${Math.round(descPct * 100)}% av endpoints har description >20 tecken` });

  // 2. Naming consistency (2p) — rough check: all paths start with /
  const paths = ops.map(o => o.path);
  const consistent = paths.length === 0 || paths.every(p => p.startsWith("/"));
  const hasVersionInPath = paths.some(p => /\/v\d+\//.test(p));
  checks.push({ name: "Naming consistency", score: consistent ? (hasVersionInPath ? 2 : 1) : 0, maxScore: 2,
    detail: consistent ? (hasVersionInPath ? "Konsekvent versionerade paths" : "Konsekvent path-format") : "Inkonsekvent path-format" });

  // 3. Parameters documented (2p)
  const paramWithDesc = params.filter(p => typeof p.description === "string" && p.description.length > 0);
  const paramDescPct = pct(paramWithDesc.length, params.length);
  checks.push({ name: "Parametrar dokumenterade", score: paramDescPct > 0.7 ? 2 : paramDescPct > 0.3 ? 1 : 0, maxScore: 2,
    detail: params.length === 0 ? "Inga parametrar" : `${Math.round(paramDescPct * 100)}% av parametrar har description` });

  // 4. Required/optional marked (2p)
  const paramWithRequired = params.filter(p => p.required !== undefined);
  const requiredPct = pct(paramWithRequired.length, params.length);
  checks.push({ name: "Required/optional märkt", score: requiredPct > 0.7 ? 2 : requiredPct > 0.3 ? 1 : 0, maxScore: 2,
    detail: params.length === 0 ? "Inga parametrar" : `${Math.round(requiredPct * 100)}% av parametrar har required-field` });

  // 5. Enums/constraints (1p)
  const withConstraints = params.filter(p => (p.schema?.enum ?? p.enum) || p.schema?.minimum !== undefined || p.schema?.maximum !== undefined);
  checks.push({ name: "Enums / constraints", score: withConstraints.length >= 3 ? 1 : 0, maxScore: 1,
    detail: `${withConstraints.length} parametrar har enum eller min/max-begränsningar` });

  const total = checks.reduce((s, c) => s + c.score, 0);
  return { axis: "endpoint_clarity", label: "Endpoint clarity", score: total, maxScore: 10, checks, limited: false };
}
