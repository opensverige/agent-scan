// lib/api-score/axis-7.ts — Authentication usability (5p)

import type { AxisScore } from "./types";

export function scoreAuthUsability(
  spec: Record<string, unknown> | null,
  docsHtml: string | null,
): AxisScore {
  const docs = (docsHtml ?? "").toLowerCase();
  const checks = [];

  // 1. Auth method documented (1p)
  const secSchemes = (spec?.components as Record<string, unknown> | undefined)?.securitySchemes;
  const secDefs = spec?.securityDefinitions;
  const hasAuthInDocs = /auth|api.?key|bearer|oauth|jwt/.test(docs);
  const hasAuth = !!(secSchemes ?? secDefs) || hasAuthInDocs;
  checks.push({ name: "Auth-metod dokumenterad", score: hasAuth ? 1 : 0, maxScore: 1,
    detail: hasAuth ? (secSchemes ?? secDefs ? "securitySchemes i spec" : "Auth-info i docs") : "Ingen auth-dokumentation" });

  // 2. Service account / M2M support (2p)
  let hasM2M = /service.account|server.to.server|machine.to.machine|m2m|client.credential/.test(docs);
  if (!hasM2M && spec) {
    // Check OAuth2 clientCredentials flow in spec
    const checkSchemes = (schemes: Record<string, unknown>) => {
      for (const scheme of Object.values(schemes)) {
        const s = scheme as Record<string, unknown>;
        if (s.type === "oauth2") {
          const flows = s.flows as Record<string, unknown> | undefined;
          const flow2 = s.flow as string | undefined; // Swagger 2
          if (flows?.clientCredentials || flow2 === "application") {
            hasM2M = true;
            break;
          }
        }
      }
    };
    if (secSchemes) checkSchemes(secSchemes as Record<string, unknown>);
    if (secDefs) checkSchemes(secDefs as Record<string, unknown>);
  }
  checks.push({ name: "Service account / M2M stöd", score: hasM2M ? 2 : 0, maxScore: 2,
    detail: hasM2M ? "M2M/client credentials auth hittad" : "Ingen M2M-auth dokumenterad" });

  // 3. Rate limits documented (1p)
  const hasRateLimits = /rate.?limit|x-ratelimit|throttl|quota/.test(docs) ||
    (spec ? JSON.stringify(spec).toLowerCase().includes("x-ratelimit") : false);
  checks.push({ name: "Rate limits dokumenterade", score: hasRateLimits ? 1 : 0, maxScore: 1,
    detail: hasRateLimits ? "Rate limit-dokumentation hittad" : "Inga rate limits dokumenterade" });

  // 4. Token refresh documented (1p)
  const hasRefresh = /refresh.token|token.refresh|renew.token/.test(docs);
  checks.push({ name: "Token refresh förklarat", score: hasRefresh ? 1 : 0, maxScore: 1,
    detail: hasRefresh ? "Token refresh-flöde dokumenterat" : "Ingen token refresh-dokumentation" });

  const total = checks.reduce((s, c) => s + c.score, 0);
  return { axis: "auth_usability", label: "Auth-användbarhet", score: total, maxScore: 5, checks, limited: !spec && !hasAuthInDocs };
}
