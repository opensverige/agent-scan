// lib/scan/derive.ts
//
// Post-check derivation rules. Pure transformations applied AFTER the initial
// check pass, when we have additional context (Firecrawl docs, API access
// patterns, presence of OpenAPI spec) that lets us refine verdicts.
//
// Why a separate module? In the old route.ts, checks were retroactively
// mutated in-place after orchestration. That made the orchestrator hard to
// reason about and tests near-impossible. By isolating these rules here as
// pure functions, the pipeline becomes:  probe → checks → derive → score.

import type { AllChecks } from "@/lib/checks";

export interface DeriveContext {
  firecrawlDocsContent: string | null;
  firecrawlMarkdown: string | null;
  apiPathsFound: string[];
}

/**
 * Apply all derivation rules to the check results.
 * Returns a new AllChecks object — does not mutate input.
 */
export function deriveChecks(checks: AllChecks, ctx: DeriveContext): AllChecks {
  let next: AllChecks = { ...checks };

  next = upgradeSandboxFromDocs(next, ctx.firecrawlDocsContent);
  next = downgradeMcpToRecommendation(next);
  next = markSandboxNAForOpenApi(next, ctx);
  next = markSandboxNAWithoutApi(next);

  return next;
}

/**
 * If the sandbox probe missed but Firecrawl docs mention it (often behind
 * login), upgrade to a softer pass with a "mentioned in docs" label.
 */
function upgradeSandboxFromDocs(checks: AllChecks, docsContent: string | null): AllChecks {
  if (checks.sandbox_available.pass || typeof docsContent !== "string") return checks;
  const hay = docsContent.toLowerCase();
  if (!/sandbox|testmilj|test.?environment|playground|staging|testbolag|test.?account/.test(hay)) return checks;
  return {
    ...checks,
    sandbox_available: {
      ...checks.sandbox_available,
      pass: true,
      label: "Sandbox nämns i dokumentation",
      detail: "Nämnd i developer-docs — kan finnas bakom inloggning. Vi kunde inte verifiera direkt åtkomst.",
    },
  };
}

/**
 * MCP is a recommendation (not a scored blocker) when the site has a
 * documented REST API. REST + OpenAPI is already agent-ready — MCP is an
 * enhancement, not a requirement.
 */
function downgradeMcpToRecommendation(checks: AllChecks): AllChecks {
  if (checks.mcp_server.pass) return checks;
  if (!checks.openapi_spec.pass && !checks.api_docs.pass) return checks;
  return {
    ...checks,
    mcp_server: {
      ...checks.mcp_server,
      recommendation: true,
      severity: "info",
      label: "MCP-server saknas — rekommenderas för djupare agent-integration",
      detail: "REST API + OpenAPI är agent-ready utan MCP. MCP ger direkt tool-koppling för Claude, Cursor och Windsurf — ett bra nästa steg men inte ett blockerande krav.",
    },
  };
}

/**
 * If the API responds without authentication and there are no pricing
 * signals, the sandbox check is N/A — builders can test against production.
 */
function markSandboxNAForOpenApi(checks: AllChecks, ctx: DeriveContext): AllChecks {
  if (checks.sandbox_available.pass || !checks.api_exists.pass) return checks;
  if (ctx.apiPathsFound.length === 0) return checks;

  const hay = ((ctx.firecrawlMarkdown ?? "") + (ctx.firecrawlDocsContent ?? "")).toLowerCase();
  const hasPricingMention = /pris|pricing|betalplan|subscription|billing|faktur/.test(hay);
  if (hasPricingMention) return checks;

  return {
    ...checks,
    sandbox_available: {
      ...checks.sandbox_available,
      na: true,
      label: "Öppet API — testa direkt, ingen sandbox behövs",
      detail: "API:et svarar utan autentisering. Builders kan testa mot produktions-API:et direkt.",
    },
  };
}

/** Sandbox is only applicable when an API exists. */
function markSandboxNAWithoutApi(checks: AllChecks): AllChecks {
  if (checks.api_exists.pass) return checks;
  return {
    ...checks,
    sandbox_available: { ...checks.sandbox_available, na: true },
  };
}
