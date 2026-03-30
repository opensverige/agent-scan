// lib/api-score/axis-5.ts — Consistency & standards (10p)

import type { AxisScore } from "./types";
import { getAllOperations, getAllSchemas } from "./parse-spec";

function detectNamingCase(names: string[]): "camelCase" | "snake_case" | "mixed" | "none" {
  if (names.length === 0) return "none";
  const camel = names.filter(n => /^[a-z][a-zA-Z0-9]*$/.test(n) && /[A-Z]/.test(n));
  const snake = names.filter(n => /^[a-z][a-z0-9_]*$/.test(n) && n.includes("_"));
  const total = camel.length + snake.length;
  if (total === 0) return "none";
  const dominantPct = Math.max(camel.length, snake.length) / names.length;
  if (dominantPct > 0.9) return camel.length > snake.length ? "camelCase" : "snake_case";
  return "mixed";
}

export function scoreConsistency(spec: Record<string, unknown> | null): AxisScore {
  if (!spec) {
    return { axis: "consistency", label: "Konsistens & standarder", score: 0, maxScore: 10, checks: [], limited: true };
  }

  const ops = getAllOperations(spec);
  const schemas = getAllSchemas(spec);
  const checks = [];

  // 1. Consistent naming (3p) — analyze property names in schemas
  const allPropNames: string[] = [];
  for (const schema of Object.values(schemas)) {
    const s = schema as Record<string, unknown>;
    const props = (s.properties ?? {}) as Record<string, unknown>;
    allPropNames.push(...Object.keys(props));
  }
  const namingStyle = detectNamingCase(allPropNames);
  const namingScore = namingStyle !== "mixed" && namingStyle !== "none" ? 3 : namingStyle === "none" ? 1 : 0;
  checks.push({ name: "Consistent naming (camelCase/snake_case)", score: namingScore, maxScore: 3,
    detail: namingStyle === "none" ? "Inga schemas med properties hittade" : `Namnformat: ${namingStyle} (${allPropNames.length} properties analyserade)` });

  // 2. Same pagination model (2p)
  const listOps = ops.filter(o => o.path.endsWith("s") || o.path.endsWith("/") || o.tags?.some(t => t.toLowerCase().includes("list")));
  let paginationConsistent = true;
  let paginationFound = false;
  const paginationPatterns = new Set<string>();
  for (const op of listOps) {
    const params = (op.parameters ?? []) as Array<{ name: string }>;
    const paramNames = params.map(p => p.name.toLowerCase());
    if (paramNames.includes("page") || paramNames.includes("offset") || paramNames.includes("cursor") || paramNames.includes("after")) {
      paginationFound = true;
      const pattern = paramNames.includes("cursor") || paramNames.includes("after") ? "cursor" :
        paramNames.includes("offset") ? "offset" : "page";
      paginationPatterns.add(pattern);
    }
  }
  if (paginationFound && paginationPatterns.size > 1) paginationConsistent = false;
  const paginationScore = !paginationFound ? 1 : (paginationConsistent ? 2 : 0);
  checks.push({ name: "Samma pagineringsmodell", score: paginationScore, maxScore: 2,
    detail: !paginationFound ? "Ingen paginering hittad" : (paginationConsistent ? `Konsekvent: ${[...paginationPatterns].join(", ")}` : `Inkonsekvent: ${[...paginationPatterns].join(" vs ")}`) });

  // 3. Same error structure (3p)
  const errorResponseRefs = new Set<string>();
  let errorCount = 0;
  for (const op of ops) {
    for (const [code, res] of Object.entries(op.responses ?? {})) {
      if (parseInt(code) >= 400) {
        errorCount++;
        const r = res as Record<string, unknown>;
        const ref = (r.schema as Record<string, unknown> | undefined)?.$ref ?? (r.content as Record<string, unknown> | undefined);
        if (ref) errorResponseRefs.add(typeof ref === "string" ? ref : "schema");
      }
    }
  }
  const errorScore = errorCount === 0 ? 0 : errorResponseRefs.size <= 1 ? 3 : errorResponseRefs.size <= 2 ? 1 : 0;
  checks.push({ name: "Samma error-struktur", score: errorScore, maxScore: 3,
    detail: errorCount === 0 ? "Inga error-responses dokumenterade" : (errorResponseRefs.size <= 1 ? "Konsekvent error-schema" : `${errorResponseRefs.size} olika error-scheman`) });

  // 4. Same auth style (2p)
  const authStyles = new Set<string>();
  for (const op of ops) {
    if (Array.isArray(op.security)) {
      if (op.security.length === 0) authStyles.add("none");
      else {
        for (const s of op.security) {
          authStyles.add(Object.keys(s as Record<string, unknown>)[0] ?? "unknown");
        }
      }
    }
  }
  const globalSec = spec.security;
  if (globalSec) authStyles.add("global");
  const authScore = authStyles.size <= 1 ? 2 : authStyles.size <= 2 ? 1 : 0;
  checks.push({ name: "Samma auth-stil", score: authScore, maxScore: 2,
    detail: authStyles.size === 0 ? "Ingen auth-konfiguration hittad" : (authStyles.size === 1 ? `Konsekvent: ${[...authStyles][0]}` : `${authStyles.size} olika auth-konfigurationer`) });

  const total = checks.reduce((s, c) => s + c.score, 0);
  return { axis: "consistency", label: "Konsistens & standarder", score: total, maxScore: 10, checks, limited: false };
}
