// lib/api-score/axis-4.ts — Example quality (10p)

import type { AxisScore } from "./types";
import { getAllOperations } from "./parse-spec";

function hasExample(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (o.example !== undefined || o.examples !== undefined) return true;
  // Check nested content
  if (o.content && typeof o.content === "object") {
    for (const media of Object.values(o.content as Record<string, unknown>)) {
      if (hasExample(media)) return true;
    }
  }
  if (o.schema) return hasExample(o.schema);
  return false;
}

export function scoreExampleQuality(
  spec: Record<string, unknown> | null,
  docsHtml: string | null,
): AxisScore {
  const docs = (docsHtml ?? "").toLowerCase();
  const checks = [];

  if (!spec) {
    // Limited: docs analysis only, max 4/10
    const hasCodeExample = /curl |```|code example|example request|sample/.test(docs);
    checks.push({ name: "Auth-exempel i docs", score: hasCodeExample ? 2 : 0, maxScore: 2,
      detail: hasCodeExample ? "Kod-exempel hittade i docs" : "Inga kod-exempel hittade" });
    const hasErrorExample = /error example|error response|4\d\d|5\d\d/.test(docs);
    checks.push({ name: "Error examples i docs", score: hasErrorExample ? 2 : 0, maxScore: 2,
      detail: hasErrorExample ? "Error-exempel hittade i docs" : "Inga error-exempel hittade" });
    const total = checks.reduce((s, c) => s + c.score, 0);
    return { axis: "example_quality", label: "Exempelkvalitet", score: total, maxScore: 10, checks, limited: true };
  }

  const ops = getAllOperations(spec);

  // 1. Request examples (3p)
  const withReqExample = ops.filter(o => {
    if (o.requestBody) return hasExample(o.requestBody);
    // Swagger 2 body params
    return o.parameters?.some(p => (p as { in?: string }).in === "body" && hasExample(p));
  });
  const reqExPct = ops.length > 0 ? withReqExample.length / ops.length : 0;
  checks.push({ name: "Request examples", score: reqExPct > 0.5 ? 3 : reqExPct > 0.2 ? 2 : reqExPct > 0 ? 1 : 0, maxScore: 3,
    detail: `${withReqExample.length}/${ops.length} endpoints har request-exempel` });

  // 2. Response examples (3p)
  const withResExample = ops.filter(o => {
    const responses = o.responses ?? {};
    return Object.values(responses).some(r => hasExample(r));
  });
  const resExPct = ops.length > 0 ? withResExample.length / ops.length : 0;
  checks.push({ name: "Response examples", score: resExPct > 0.5 ? 3 : resExPct > 0.2 ? 2 : resExPct > 0 ? 1 : 0, maxScore: 3,
    detail: `${withResExample.length}/${ops.length} endpoints har response-exempel` });

  // 3. Auth example in docs (2p)
  const hasAuthExample = /curl.*auth|authorization.*example|api.key.*example|bearer.*example|example.*curl/.test(docs);
  checks.push({ name: "Auth-exempel", score: hasAuthExample ? 2 : 0, maxScore: 2,
    detail: hasAuthExample ? "Auth-kod-exempel hittade i docs" : "Inga auth-kod-exempel hittade" });

  // 4. Error examples (2p)
  const errorOps = ops.filter(o => {
    const responses = o.responses ?? {};
    return Object.entries(responses).some(([code, r]) =>
      (parseInt(code) >= 400) && hasExample(r)
    );
  });
  checks.push({ name: "Error examples", score: errorOps.length >= 1 ? 2 : 0, maxScore: 2,
    detail: `${errorOps.length} endpoints har error-response-exempel` });

  const total = checks.reduce((s, c) => s + c.score, 0);
  return { axis: "example_quality", label: "Exempelkvalitet", score: total, maxScore: 10, checks, limited: false };
}
