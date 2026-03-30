// lib/api-score/axis-8.ts — Error handling & reliability (5p)

import type { AxisScore } from "./types";
import { getAllOperations } from "./parse-spec";

export function scoreErrorHandling(
  spec: Record<string, unknown> | null,
  docsHtml: string | null,
): AxisScore {
  const docs = (docsHtml ?? "").toLowerCase();
  const checks = [];

  // 1. Documented error codes (2p) — ≥3 documented in spec
  if (spec) {
    const ops = getAllOperations(spec);
    const errorCodes = new Set<string>();
    for (const op of ops) {
      for (const code of Object.keys(op.responses ?? {})) {
        if (parseInt(code) >= 400) errorCodes.add(code);
      }
    }
    const score = errorCodes.size >= 3 ? 2 : errorCodes.size >= 1 ? 1 : 0;
    checks.push({ name: "Error codes dokumenterade", score, maxScore: 2,
      detail: errorCodes.size === 0 ? "Inga error-responses i spec" : `${errorCodes.size} error codes: ${[...errorCodes].join(", ")}` });
  } else {
    const hasErrorDocs = /4\d\d|5\d\d|bad request|unauthorized|not found|error code/.test(docs);
    checks.push({ name: "Error codes dokumenterade", score: hasErrorDocs ? 1 : 0, maxScore: 2,
      detail: hasErrorDocs ? "Error codes nämnd i docs" : "Inga error codes hittade" });
  }

  // 2. Retry guidance (1p)
  const hasRetry = /retry|idempoten|retry.after|retryable/.test(docs);
  checks.push({ name: "Retry guidance", score: hasRetry ? 1 : 0, maxScore: 1,
    detail: hasRetry ? "Retry-dokumentation hittad" : "Ingen retry-dokumentation" });

  // 3. Rate limit headers (1p)
  const hasRateLimitHeaders = /x-ratelimit|retry.after|x.rate.limit/.test(docs) ||
    (spec ? JSON.stringify(spec).toLowerCase().includes("retry-after") : false);
  checks.push({ name: "Rate limit headers", score: hasRateLimitHeaders ? 1 : 0, maxScore: 1,
    detail: hasRateLimitHeaders ? "Rate limit headers dokumenterade" : "Inga rate limit headers" });

  // 4. Webhook retry behavior (1p)
  const hasWebhookRetry = /webhook.*retry|retry.*webhook|webhook.*failure|event.*retry/.test(docs);
  checks.push({ name: "Webhook retry behavior", score: hasWebhookRetry ? 1 : 0, maxScore: 1,
    detail: hasWebhookRetry ? "Webhook retry-beteende dokumenterat" : "Ingen webhook retry-dokumentation" });

  const total = checks.reduce((s, c) => s + c.score, 0);
  return { axis: "error_handling", label: "Felhantering & tillförlitlighet", score: total, maxScore: 5, checks, limited: !spec };
}
