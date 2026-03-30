// lib/api-score/axis-2.ts — Machine-readable structure (25p)

import type { AxisScore } from "./types";
import { getAllOperations, getAllSchemas, getAllParams, pct } from "./parse-spec";

export function scoreMachineStructure(spec: Record<string, unknown> | null): AxisScore {
  if (!spec) {
    return { axis: "machine_structure", label: "Maskinläsbar struktur", score: 0, maxScore: 25, checks: [], limited: true };
  }

  const ops = getAllOperations(spec);
  const schemas = getAllSchemas(spec);
  const params = getAllParams(spec);
  const checks = [];

  // 1. Spec found (5p) — always true when we have spec
  const specVersion = (spec.openapi ?? spec.swagger) as string;
  checks.push({ name: "OpenAPI/Swagger spec", score: 5, maxScore: 5,
    detail: `${specVersion} hittad` });

  // 2. Spec valid (3p)
  const isValid = !!(spec.paths && spec.info);
  checks.push({ name: "Spec valid", score: isValid ? 3 : 0, maxScore: 3,
    detail: isValid ? "Spec parsear utan fel" : "Spec har strukturfel (saknar paths eller info)" });

  // 3. operationId coverage (5p)
  const opsWithId = ops.filter(o => o.operationId);
  const opIdPct = pct(opsWithId.length, ops.length);
  const opIdScore = opIdPct > 0.8 ? 5 : opIdPct > 0.5 ? 3 : opIdPct > 0.2 ? 1 : 0;
  checks.push({ name: "operationId", score: opIdScore, maxScore: 5,
    detail: `${Math.round(opIdPct * 100)}% av endpoints har operationId (${opsWithId.length}/${ops.length})` });

  // 4. Typed parameters (4p)
  const typedParams = params.filter(p => p.schema?.type ?? p.type);
  const typedPct = pct(typedParams.length, params.length);
  const typedScore = typedPct > 0.8 ? 4 : typedPct > 0.5 ? 2 : typedPct > 0.2 ? 1 : 0;
  checks.push({ name: "Typed parameters", score: typedScore, maxScore: 4,
    detail: params.length === 0 ? "Inga parametrar hittade" : `${Math.round(typedPct * 100)}% av parametrar har type-definition` });

  // 5. Request/response schemas (4p)
  const withReqSchema = ops.filter(o => {
    if (o.requestBody) {
      const content = (o.requestBody as Record<string, unknown>)?.content as Record<string, unknown> | undefined;
      return !!(content?.["application/json"] as Record<string, unknown> | undefined)?.schema;
    }
    // Swagger 2: body parameter
    return o.parameters?.some((p) => (p as { in?: string }).in === "body" && (p as { schema?: unknown }).schema);
  });
  const withResSchema = ops.filter(o => {
    const responses = o.responses ?? {};
    return Object.values(responses).some(r => {
      const res = r as Record<string, unknown>;
      // OpenAPI 3
      if ((res.content as Record<string, unknown> | undefined)?.["application/json"]) return true;
      // Swagger 2
      if (res.schema) return true;
      return false;
    });
  });
  const schemaPct = ops.length === 0 ? 0 : (withReqSchema.length + withResSchema.length) / (ops.length * 2);
  const schemaScore = schemaPct > 0.7 ? 4 : schemaPct > 0.4 ? 2 : schemaPct > 0.1 ? 1 : 0;
  checks.push({ name: "Request/response schemas", score: schemaScore, maxScore: 4,
    detail: `${withResSchema.length}/${ops.length} endpoints har response-schema` });

  // 6. Reusable components (2p)
  const schemaCount = Object.keys(schemas).length;
  checks.push({ name: "Reusable components", score: schemaCount >= 3 ? 2 : schemaCount >= 1 ? 1 : 0, maxScore: 2,
    detail: `${schemaCount} schemas i components/definitions` });

  // 7. Status codes (2p)
  const allStatusCodes = new Set<string>();
  for (const op of ops) {
    if (op.responses) Object.keys(op.responses).forEach(code => allStatusCodes.add(code));
  }
  checks.push({ name: "Status codes", score: allStatusCodes.size >= 4 ? 2 : allStatusCodes.size >= 2 ? 1 : 0, maxScore: 2,
    detail: `${allStatusCodes.size} unika status codes: ${[...allStatusCodes].slice(0, 6).join(", ")}` });

  const total = checks.reduce((s, c) => s + c.score, 0);
  return { axis: "machine_structure", label: "Maskinläsbar struktur", score: total, maxScore: 25, checks, limited: false };
}
