// lib/scan/pipeline.ts
//
// Main scan pipeline: composes phases into a single function returning the
// full scan result shape that /api/scan returns to the frontend.
//
// Pipeline:
//   1. validate domain (caller's responsibility)
//   2. rate limit (caller's responsibility — needs ipHash from request)
//   3. parallel phase 1 — runProbes()
//   4. parallel phase 2 — Firecrawl homepage + apis.guru + portal discovery
//   5. compute initial check verdicts
//   6. parallel phase 3 — Claude analysis + API score + MCP GitHub hint
//   7. derive — apply post-check derivation rules
//   8. score — compute badge + recommendations + severity counts
//   9. persist — Supabase write + local fallback
//
// This is the function /api/scan/route.ts calls. It accepts already-validated
// inputs and returns a fully-shaped response payload.

import {
  checkRobots, checkSitemap, checkLlms,
  complianceChecks, checkMcpServer, checkSandboxAvailable,
  checkApiExists, checkOpenApiSpec, checkApiDocs,
  calculateBadge, getTopRecommendations, computeSeverityCounts,
  type AllChecks,
} from "@/lib/checks";
import { analyzeWithClaude, buildDemoAnalysis, type LiveChecks, type BuilderProbeData } from "@/lib/claude";
import type { McpGithubHint, AIGenerationDisclosure } from "@/lib/scan-types";
import { saveLocalLatestScan } from "@/lib/local-scan-store";
import { scoreApi, type ApiScoreResult } from "@/lib/api-score";

import { runProbes } from "./probe";
import { fetchFirecrawlContent, firecrawlScrape } from "./firecrawl";
import { fetchApisGuruSpec, discoverApiPortalUrl, discoverMcpOnGitHub } from "./discovery";
import { extractRedocSpec } from "./openapi-extractor";
import { deriveChecks } from "./derive";
import { saveToSupabase } from "./persist";

export interface ScanPipelineResult {
  company: string;
  industry: string;
  summary: string;
  agent_suggestions: ReturnType<typeof buildDemoAnalysis>["agent_suggestions"];
  badge: string;
  score: number;
  checks_total: number;
  checks: AllChecks;
  recommendations: string[];
  severity_counts: ReturnType<typeof computeSeverityCounts>;
  scan_id: string;
  isDemo: boolean;
  api_score: ApiScoreResult | null;
  mcp_github_hint: McpGithubHint | null;
  scanned_at: string;
  /** EU AI Act Art. 50 disclosure for AI-generated fields in the response. */
  ai_disclosure: AIGenerationDisclosure;
}

/** Run the full scan pipeline for a validated domain. */
export async function runScanPipeline(domain: string, ipHash: string): Promise<ScanPipelineResult> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const companyName = domain.split(".")[0] ?? domain;

  // ── Phase 1+2: parallel probes + enrichment ──────────────────────────────
  const [probeOutput, firecrawlMarkdown, apisGuruSpec, discoveredPortal] = await Promise.all([
    runProbes(domain),
    firecrawlKey ? fetchFirecrawlContent(domain, firecrawlKey) : Promise.resolve(null),
    fetchApisGuruSpec(domain),
    discoverApiPortalUrl(domain),
  ]);

  // ── Compute initial check verdicts from probe output ─────────────────────
  const liveChecks: LiveChecks = {
    robots: probeOutput.robots.allowed,
    sitemap: probeOutput.sitemapExists,
    llms: probeOutput.llmsValid,
  };

  const joinedComplianceText = probeOutput.complianceProbes
    .filter(p => p.status === 200 || p.status === 401 || p.status === 403)
    .map(p => `${p.url}\n${p.body}`)
    .join("\n\n");

  const [privacyCheck, cookieCheck, aiMarkingCheck] = complianceChecks({
    privacyText: joinedComplianceText,
    cookieText: joinedComplianceText,
    aiText: joinedComplianceText,
  });

  const initialChecks: AllChecks = {
    robots_ok: checkRobots(probeOutput.robots.allowed),
    sitemap_exists: checkSitemap(probeOutput.sitemapExists),
    llms_txt: checkLlms(probeOutput.llmsValid),
    privacy_automation: privacyCheck,
    cookie_bot_handling: cookieCheck,
    ai_content_marking: aiMarkingCheck,
    api_exists: checkApiExists(probeOutput.builderProbes),
    openapi_spec: checkOpenApiSpec(probeOutput.builderProbes),
    api_docs: checkApiDocs(probeOutput.builderProbes),
    mcp_server: checkMcpServer(probeOutput.builderProbes),
    sandbox_available: checkSandboxAvailable(probeOutput.builderProbes),
  };

  // ── Compute builder data from probe output ───────────────────────────────
  // 200 = confirmed; 429 = rate-limited — API definitely exists either way
  const apiPathsFound = probeOutput.builderProbes
    .filter(p => p.status === 200 || p.status === 429)
    .map(p => { try { return new URL(p.url).pathname; } catch { return p.url; } });

  // Score dev portal candidates by specificity — prefer actual API docs over marketing pages.
  // api.*/apidocs > developer.* > api.* (root) > /apidocs path > /developer path
  function devPortalPriority(url: string): number {
    if (/https?:\/\/api\./i.test(url) && (url.includes("/apidocs") || url.includes("/reference"))) return 5;
    if (/https?:\/\/(developer|docs)\./i.test(url)) return 4;
    if (/https?:\/\/api\./i.test(url)) return 3;
    if (url.includes("/apidocs") || url.includes("/reference")) return 2;
    if (url.includes("/developer") || url.includes("/docs")) return 1;
    return 0;
  }
  const devCandidates = probeOutput.builderProbes.filter(p =>
    (p.status === 200 || p.status === 429) && (
      p.url.includes("/developer") ||
      /https?:\/\/(developer|docs)\./i.test(p.url) ||
      p.url.includes("/apidocs") ||
      p.url.includes("/reference") ||
      (p.url.startsWith(`https://api.`) && p.contentType?.includes("text/html"))
    )
  );
  devCandidates.sort((a, b) => devPortalPriority(b.url) - devPortalPriority(a.url));
  const devHit = devCandidates[0];

  const specProbe = probeOutput.builderProbes.find(p =>
    (p.status === 200 || p.status === 429) &&
    (p.url.includes("/openapi") || p.url.includes("/swagger") || p.body.includes("__redoc_state")) &&
    (p.body.includes('"openapi"') || p.body.includes('"swagger"') || p.body.includes("openapi:") ||
     p.body.includes("swagger:") || p.body.includes("__redoc_state"))
  );
  const specBodyRaw = specProbe?.body
    ? (specProbe.body.includes("__redoc_state") ? extractRedocSpec(specProbe.body) : specProbe.body)
    : null;

  const docsProbe = probeOutput.builderProbes.find(p =>
    (p.status === 200 || p.status === 429) &&
    p.contentType?.includes("text/html") &&
    (p.url.includes("/developer") || p.url.includes("/docs") ||
     p.url.includes("/apidocs") || p.url.includes("/reference") ||
     /https?:\/\/(developer|docs|api)\./i.test(p.url))
  );

  const builderData: BuilderProbeData = {
    apiPathsFound,
    openApiSpecFound: initialChecks.openapi_spec.pass,
    developerPortalUrl: devHit?.url,
    specRaw: specBodyRaw ?? undefined,
    docsHtml: devHit?.body ?? docsProbe?.body,
  };

  // ── Phase 3: Claude analysis + API score + MCP GitHub hint ───────────────
  const discoveredPortalUrl = discoveredPortal?.url ?? null;
  const discoveredPortalContent = discoveredPortal?.content ?? null;
  const portalUrl = builderData.developerPortalUrl ?? discoveredPortalUrl ?? undefined;
  const shouldScoreApi = initialChecks.api_exists.pass || initialChecks.openapi_spec.pass || initialChecks.api_docs.pass || !!discoveredPortalUrl;
  const specRaw = builderData.specRaw ?? (shouldScoreApi ? apisGuruSpec : null) ?? null;

  console.log(`[scan] domain=${domain} shouldScore=${shouldScoreApi} portalUrl=${portalUrl ?? "none"} hasSpec=${!!specRaw} docsHtmlLen=${builderData.docsHtml?.length ?? 0} hasFirecrawl=${!!firecrawlKey} hasExa=${!!process.env.EXA_API_KEY} hasAnthropicKey=${!!anthropicKey}`);

  const firecrawlDocTarget: string | undefined = portalUrl
    ?? (firecrawlKey && shouldScoreApi && !builderData.docsHtml
      ? `https://developer.${domain}`
      : undefined);

  // Hoisted so the derive step can reference the same Firecrawl content used by API scoring.
  let firecrawlDocsContent: string | null = null;

  const [analysis, apiScore, mcpGithubHint] = await Promise.all([
    anthropicKey
      ? analyzeWithClaude(domain, liveChecks, builderData, anthropicKey, firecrawlMarkdown ?? undefined)
      : Promise.resolve(null),
    shouldScoreApi
      ? (async () => {
          // onlyMain=false: Redoc/Swagger UI renders content in sidebars/panels
          // that onlyMainContent:true strips as "navigation noise" — we need all of it.
          firecrawlDocsContent = (firecrawlKey && firecrawlDocTarget)
            ? await firecrawlScrape(firecrawlDocTarget, firecrawlKey, 40_000, false)
            : null;
          const docsHtml = firecrawlDocsContent ?? builderData.docsHtml ?? discoveredPortalContent ?? null;
          return scoreApi({
            specRaw,
            docsHtml,
            domain,
            anthropicApiKey: anthropicKey ?? undefined,
          }).catch(() => null);
        })()
      : Promise.resolve(null),
    initialChecks.mcp_server.pass
      ? Promise.resolve(null)
      : discoverMcpOnGitHub(companyName),
  ]);

  // ── Derive: apply post-check rules using newly-fetched data ──────────────
  const checks = deriveChecks(initialChecks, {
    firecrawlDocsContent,
    firecrawlMarkdown,
    apiPathsFound,
  });

  // ── Score ────────────────────────────────────────────────────────────────
  const { badge, score, total } = calculateBadge(checks);
  const recommendations = getTopRecommendations(checks);
  const severityCounts = computeSeverityCounts(checks);

  const isDemo = !analysis;
  const finalAnalysis = analysis ?? buildDemoAnalysis(domain);
  const scannedAt = new Date().toISOString();

  // ── Persist ──────────────────────────────────────────────────────────────
  const persistedScanId = await saveToSupabase({
    domain, checks, badge, score, total,
    summary: finalAnalysis.summary,
    recommendations, ipHash,
  }).catch(() => null);

  // Local fallback so dev/preview environments without Supabase can still
  // serve the scan back to the result page.
  const localScanId = saveLocalLatestScan({
    domain, badge,
    checks_passed: score,
    checks_json: checks,
    claude_summary: finalAnalysis.summary,
    recommendations,
    scanned_at: scannedAt,
  });

  // EU AI Act Art. 50 (applies 2 Aug 2026): mark AI-generated content.
  // We label `summary`, `industry`, and `agent_suggestions` as AI-generated
  // because Claude produced them. `recommendations` is a hand-curated
  // mapping from check IDs (see lib/checks.ts RECOMMENDATION_MAP) — not AI.
  // In demo mode (no Anthropic key) the summary is templated, not AI.
  const aiDisclosure: AIGenerationDisclosure = isDemo
    ? { ai_generated: false }
    : {
        ai_generated: true,
        model: "anthropic/claude-sonnet-4-5",
        fields: ["summary", "industry", "agent_suggestions"],
      };

  return {
    company: finalAnalysis.company,
    industry: finalAnalysis.industry,
    summary: finalAnalysis.summary,
    agent_suggestions: finalAnalysis.agent_suggestions,
    badge,
    score,
    checks_total: total,
    checks,
    recommendations,
    severity_counts: severityCounts,
    scan_id: persistedScanId ?? localScanId,
    isDemo,
    api_score: apiScore ?? null,
    mcp_github_hint: mcpGithubHint ?? null,
    scanned_at: scannedAt,
    ai_disclosure: aiDisclosure,
  };
}
