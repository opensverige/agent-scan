// app/api/scan/route.ts
// Vercel: allow up to 60 s (Pro plan). Covers Claude (15 s) + Firecrawl × 2 + checks.
export const maxDuration = 60;

import { NextRequest } from "next/server";
import {
  analyzeWithClaude,
  buildDemoAnalysis,
  type LiveChecks,
  type BuilderProbeData,
} from "@/lib/claude";
import {
  checkRobots, checkSitemap, checkLlms,
  complianceChecks, builderHardcoded,
  checkApiExists, checkOpenApiSpec, checkApiDocs,
  calculateBadge, getTopRecommendations, computeSeverityCounts,
  BUILDER_PATHS,
  type AllChecks, type ProbeResult,
} from "@/lib/checks";
import { scoreApi } from "@/lib/api-score";

const AI_AGENTS = ["gptbot", "claudebot", "anthropic-ai", "ccbot", "google-extended", "omgilibot"];

function parseRobots(body: string): boolean {
  const lines = body.toLowerCase().split("\n");
  let groupUAs: string[] = [];
  let inGroup = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("user-agent:")) {
      const ua = line.replace("user-agent:", "").trim();
      if (!inGroup) { groupUAs = [ua]; inGroup = true; }
      else { groupUAs.push(ua); }
    } else if (line.startsWith("disallow:")) {
      const path = line.replace("disallow:", "").trim();
      if (path === "/" && groupUAs.some(ua => AI_AGENTS.includes(ua) || ua === "*")) return false;
      inGroup = false;
    } else if (line === "") { groupUAs = []; inGroup = false; }
  }
  return true;
}

async function fetchApisGuruSpec(domain: string): Promise<string | null> {
  try {
    const listRes = await fetch(`https://api.apis.guru/v2/${domain}.json`, {
      headers: { "User-Agent": "OpenSverige-Scanner/1.0" },
      signal: AbortSignal.timeout(3_000),
    });
    if (!listRes.ok) return null;
    const data = await listRes.json() as {
      preferred?: string;
      versions?: Record<string, { swaggerUrl?: string }>;
    };
    if (!data.versions || Object.keys(data.versions).length === 0) return null;
    const preferredKey = data.preferred ?? Object.keys(data.versions)[0];
    if (!preferredKey) return null;
    const specUrl = data.versions[preferredKey]?.swaggerUrl;
    if (!specUrl) return null;
    const specRes = await fetch(specUrl, {
      headers: { "User-Agent": "OpenSverige-Scanner/1.0" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!specRes.ok) return null;
    return (await specRes.text()).slice(0, 100_000);
  } catch { return null; }
}

// ── API portal discovery ──────────────────────────────────────────────────────
// Multi-signal pipeline: npm → GitHub → llms.txt subdomain → Exa (paid).
// All free signals race in parallel; Exa runs simultaneously when key is set.
// Returns the first confident developer portal URL found, or null.

function isLikelyDevPortal(url: string, baseDomain: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    const stripped = baseDomain.replace(/^www\./, "");
    if (!hostname.endsWith(stripped)) return false;
    if (/^(developer|api|docs|dev|apidocs|reference)\./i.test(hostname)) return true;
    if (/\/(developer|api\/|docs\/|reference|apidocs)/i.test(pathname)) return true;
    return false;
  } catch { return false; }
}

async function discoverFromNpm(domain: string, companyName: string): Promise<string | null> {
  const res = await fetch(
    `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(companyName)}+api&size=5`,
    { headers: { "User-Agent": "OpenSverige-Scanner/1.0" }, signal: AbortSignal.timeout(3_000) },
  );
  if (!res.ok) return null;
  const data = await res.json() as { objects?: Array<{ package: { links?: { homepage?: string } } }> };
  for (const obj of data.objects ?? []) {
    const hp = obj.package.links?.homepage;
    if (hp && isLikelyDevPortal(hp, domain)) return hp;
  }
  return null;
}

async function discoverFromGitHub(domain: string, companyName: string): Promise<string | null> {
  const headers = { "User-Agent": "OpenSverige-Scanner/1.0", "Accept": "application/vnd.github.v3+json" };
  const res = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(companyName)}+api&sort=stars&per_page=5`,
    { headers, signal: AbortSignal.timeout(4_000) },
  );
  if (!res.ok) return null;
  const data = await res.json() as { items?: Array<{ full_name: string; homepage?: string | null }> };
  // First pass: homepage field (no extra requests)
  for (const repo of data.items ?? []) {
    if (repo.homepage && isLikelyDevPortal(repo.homepage, domain)) return repo.homepage;
  }
  // Second pass: README of top 2 repos
  for (const repo of (data.items ?? []).slice(0, 2)) {
    try {
      const r = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`,
        { headers, signal: AbortSignal.timeout(3_000) });
      if (!r.ok) continue;
      const { content, encoding } = await r.json() as { content?: string; encoding?: string };
      if (!content || encoding !== "base64") continue;
      const text = Buffer.from(content, "base64").toString("utf-8");
      const urls = text.match(/https?:\/\/[^\s\)\"\'>\]]+/g) ?? [];
      const hit = urls.find(u => isLikelyDevPortal(u, domain));
      if (hit) return hit;
    } catch { continue; }
  }
  return null;
}

async function discoverFromLlmsTxt(domain: string): Promise<string | null> {
  const subdomains = ["developer", "api", "docs", "dev"];
  const results = await Promise.all(
    subdomains.map(async sub => {
      const base = `https://${sub}.${domain}`;
      const r = await fetch(`${base}/llms.txt`, {
        headers: { "User-Agent": "OpenSverige-Scanner/1.0" },
        signal: AbortSignal.timeout(4_000),
      }).catch(() => null);
      return r?.status === 200 ? base : null;
    }),
  );
  return results.find(Boolean) ?? null;
}

async function discoverFromExa(
  domain: string,
  companyName: string,
  apiKey: string,
): Promise<{ url: string; content?: string } | null> {
  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      query: `${companyName} REST API developer documentation portal`,
      category: "company",
      numResults: 5,
      useAutoprompt: true,
      contents: { text: { maxCharacters: 10_000 } },
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return null;
  const data = await res.json() as { results?: Array<{ url: string; text?: string }> };
  const hit = data.results?.find(r => isLikelyDevPortal(r.url, domain));
  if (!hit) return null;
  return { url: hit.url, content: hit.text ?? undefined };
}

interface DiscoveredPortal {
  url: string;
  content?: string;
}

async function discoverApiPortalUrl(domain: string): Promise<DiscoveredPortal | null> {
  const companyName = domain.split(".")[0];
  const exaKey = process.env.EXA_API_KEY;

  // Wrap string-only signals into DiscoveredPortal shape
  const wrap = (p: Promise<string | null>): Promise<DiscoveredPortal | null> =>
    p.then(url => (url ? { url } : null));

  const signals: Promise<DiscoveredPortal | null>[] = [
    wrap(discoverFromNpm(domain, companyName).catch(() => null)),
    wrap(discoverFromGitHub(domain, companyName).catch(() => null)),
    wrap(discoverFromLlmsTxt(domain).catch(() => null)),
    ...(exaKey ? [discoverFromExa(domain, companyName, exaKey).catch(() => null)] : []),
  ];
  try {
    return await Promise.any(
      signals.map(p => p.then(r => r ?? Promise.reject(new Error("miss")))),
    );
  } catch {
    return null;
  }
}

async function fetchSafe(url: string): Promise<{ status: number; body: string; contentType: string | null } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "OpenSverige-Scanner/1.0 (https://opensverige.se/scan)" },
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    const body = (await res.text()).slice(0, 15_000);
    return { status: res.status, body, contentType: res.headers.get("content-type") };
  } catch { return null; }
}

async function firecrawlScrape(url: string, apiKey: string, maxChars = 8000): Promise<string | null> {
  try {
    // eslint-disable-next-line
    const { default: FirecrawlApp } = await import("@mendable/firecrawl-js");
    const app = new FirecrawlApp({ apiKey });
    // Hard cap: the SDK has no externally enforced timeout — race against a 20s deadline
    // so a hanging page cannot push the Lambda past Vercel's 60 s maxDuration.
    const deadline = new Promise<null>(resolve => setTimeout(() => resolve(null), 20_000));
    const result = await Promise.race([
      app.scrapeUrl(url, { formats: ["markdown"], onlyMainContent: true }),
      deadline,
    ]);
    if (!result || !("success" in result) || !result.success || !result.markdown) return null;
    return result.markdown.slice(0, maxChars);
  } catch { return null; }
}

async function fetchFirecrawlContent(domain: string, apiKey: string): Promise<string | null> {
  return firecrawlScrape(`https://${domain}`, apiKey, 8000);
}

async function runAllChecks(domain: string): Promise<{ checks: AllChecks; liveChecks: LiveChecks; builderData: BuilderProbeData }> {
  const base = `https://${domain}`;
  const builderUrls = [
    ...BUILDER_PATHS.map(p => `${base}${p}`),
    // API subdomain — docs pages
    `https://developer.${domain}`,
    `https://api.${domain}`,
    `https://api.${domain}/docs`,
    `https://api.${domain}/apidocs`,
    `https://api.${domain}/reference`,
    `https://developer.${domain}/docs`,
    // API subdomain — spec files (common non-root locations)
    `https://api.${domain}/openapi.json`,
    `https://api.${domain}/openapi.yaml`,
    `https://api.${domain}/swagger.json`,
    `https://api.${domain}/v1/openapi.json`,
    `https://api.${domain}/v2/openapi.json`,
    `https://api.${domain}/v3/openapi.json`,
    `https://developer.${domain}/openapi.json`,
    `https://developer.${domain}/swagger.json`,
  ];

  const [robotsRes, sitemapRes, llmsRes, ...builderResults] = await Promise.all([
    fetchSafe(`${base}/robots.txt`),
    fetchSafe(`${base}/sitemap.xml`),
    fetchSafe(`${base}/llms.txt`),
    ...builderUrls.map(url => fetchSafe(url).then(r => ({ url, ...r ?? { status: 0, body: "", contentType: null } } as ProbeResult))),
  ]);

  const robotsAllowed = robotsRes?.status === 200 ? parseRobots(robotsRes.body) : false;
  const liveChecks: LiveChecks = {
    robots: robotsAllowed,
    sitemap: sitemapRes?.status === 200,
    llms: llmsRes?.status === 200,
  };

  const [privacyCheck, cookieCheck, aiMarkingCheck] = complianceChecks();
  const probeResults = builderResults as ProbeResult[];
  const apiExistsCheck = checkApiExists(probeResults);
  const openApiCheck = checkOpenApiSpec(probeResults);
  const apiDocsCheck = checkApiDocs(probeResults);
  const [mcpCheck, sandboxCheck] = builderHardcoded();

  const checks: AllChecks = {
    robots_ok: checkRobots(robotsAllowed),
    sitemap_exists: checkSitemap(sitemapRes?.status ?? 0),
    llms_txt: checkLlms(llmsRes?.status ?? 0),
    privacy_automation: privacyCheck,
    cookie_bot_handling: cookieCheck,
    ai_content_marking: aiMarkingCheck,
    api_exists: apiExistsCheck,
    openapi_spec: openApiCheck,
    api_docs: apiDocsCheck,
    mcp_server: mcpCheck,
    sandbox_available: sandboxCheck,
  };

  // 200 = confirmed; 429 = rate-limited — API definitely exists either way
  const apiPathsFound = probeResults
    .filter(p => p.status === 200 || p.status === 429)
    .map(p => { try { return new URL(p.url).pathname; } catch { return p.url; } });

  let developerPortalUrl: string | undefined;
  const devHit = probeResults.find(p =>
    (p.status === 200 || p.status === 429) && (
      p.url.includes('/developer') ||
      p.url.startsWith(`https://developer.`) ||
      p.url.includes('/apidocs') ||
      p.url.includes('/reference') ||
      (p.url.startsWith(`https://api.`) && p.contentType?.includes('text/html'))
    )
  );
  if (devHit) developerPortalUrl = devHit.url;

  // Extract raw spec body and docs HTML for API scoring.
  // Also handle Redoc pages that embed the full spec as __redoc_state JSON.
  const specProbe = probeResults.find(p =>
    (p.status === 200 || p.status === 429) &&
    (p.url.includes('/openapi') || p.url.includes('/swagger') || p.body.includes('__redoc_state')) &&
    (p.body.includes('"openapi"') || p.body.includes('"swagger"') || p.body.includes('openapi:') ||
     p.body.includes('swagger:') || p.body.includes('__redoc_state'))
  );
  // Try to extract the embedded spec from a Redoc page (__redoc_state)
  function extractRedocSpec(body: string): string | null {
    const idx = body.indexOf('__redoc_state');
    if (idx === -1) return null;
    const m = body.slice(idx).match(/__redoc_state\s*=\s*(\{[\s\S]{0,50000})/);
    if (!m) return null;
    try {
      const json = JSON.parse(m[1].replace(/;\s*$/, '').replace(/\n/g, ''));
      const spec = (json as Record<string, unknown>)?.spec as Record<string, unknown>;
      const data = spec?.data;
      return data ? JSON.stringify(data) : null;
    } catch { return null; }
  }
  const specBodyRaw = specProbe?.body
    ? (specProbe.body.includes('__redoc_state') ? extractRedocSpec(specProbe.body) : specProbe.body)
    : null;

  const docsProbe = probeResults.find(p =>
    (p.status === 200 || p.status === 429) &&
    p.contentType?.includes('text/html') &&
    (p.url.includes('/developer') || p.url.includes('/docs') ||
     p.url.includes('/apidocs') || p.url.includes('/reference') ||
     /https?:\/\/(developer|docs|api)\./i.test(p.url))
  );

  const builderData: BuilderProbeData = {
    apiPathsFound,
    openApiSpecFound: openApiCheck.pass,
    developerPortalUrl,
    specRaw: specBodyRaw ?? undefined,
    docsHtml: docsProbe?.body ?? devHit?.body,
  };

  return { checks, liveChecks, builderData };
}

async function getIpHash(req: NextRequest): Promise<string> {
  const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function checkRateLimit(ipHash: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return true;
  try {
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const res = await fetch(
      `${url}/rest/v1/scan_submissions?select=id&ip_hash=eq.${ipHash}&scanned_at=gte.${oneMinuteAgo}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(3_000) }
    );
    if (!res.ok) return true;
    const rows = await res.json() as unknown[];
    return rows.length === 0;
  } catch { return true; }
}

async function saveToSupabase(
  domain: string,
  checks: AllChecks,
  badge: string,
  score: number,
  summary: string,
  recommendations: string[],
  ipHash: string
): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const discovery = [checks.robots_ok, checks.sitemap_exists, checks.llms_txt];
  const compliance = [checks.privacy_automation, checks.cookie_bot_handling, checks.ai_content_marking];
  const builder = [checks.api_exists, checks.openapi_spec, checks.api_docs, checks.mcp_server, checks.sandbox_available];

  try {
    const res = await fetch(`${url}/rest/v1/scan_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        domain, badge,
        checks_passed: score, checks_total: 11,
        discovery_passed: discovery.filter(c => c.pass).length,
        compliance_passed: compliance.filter(c => c.pass).length,
        builder_passed: builder.filter(c => c.pass).length,
        has_robots: checks.robots_ok.pass, has_sitemap: checks.sitemap_exists.pass,
        has_llms_txt: checks.llms_txt.pass, has_api: checks.api_exists.pass,
        has_openapi_spec: checks.openapi_spec.pass, has_api_docs: checks.api_docs.pass,
        checks_json: checks, claude_summary: summary, recommendations, ip_hash: ipHash,
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return null;
    const rows = await res.json() as Array<{ id: string }>;
    return rows[0]?.id ?? null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  let rawDomain: string;
  try {
    const body = await req.json();
    rawDomain = String(body.domain ?? "")
      .trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!rawDomain || rawDomain.length > 253 || !/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(rawDomain)) {
    return Response.json({ error: "Ogiltig domän" }, { status: 400 });
  }
  const privateTLDs = [".local", ".internal", ".localdomain", ".localhost"];
  if (privateTLDs.some(tld => rawDomain.endsWith(tld))) {
    return Response.json({ error: "Ogiltig domän" }, { status: 400 });
  }

  const ipHash = await getIpHash(req);
  const allowed = await checkRateLimit(ipHash);
  if (!allowed) {
    return Response.json({ error: "För många scanningar. Vänta en minut." }, { status: 429 });
  }

  const firecrawlKey = process.env.FIRECRAWL_API_KEY;

  // Run checks, Firecrawl, apis.guru, and multi-signal portal discovery in parallel
  const [checkResult, firecrawlMarkdown, apisGuruSpec, discoveredPortal] = await Promise.all([
    runAllChecks(rawDomain),
    firecrawlKey
      ? fetchFirecrawlContent(rawDomain, firecrawlKey)
      : Promise.resolve(null),
    fetchApisGuruSpec(rawDomain),
    discoverApiPortalUrl(rawDomain),
  ]);

  const { checks, liveChecks, builderData } = checkResult;
  const { badge, score } = calculateBadge(checks);
  const recommendations = getTopRecommendations(checks);
  const severity_counts = computeSeverityCounts(checks);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  // discoveredPortal: found via npm/GitHub/llms.txt/Exa — may include page text content (from Exa)
  const discoveredPortalUrl = discoveredPortal?.url ?? null;
  const discoveredPortalContent = discoveredPortal?.content ?? null;
  const portalUrl = builderData.developerPortalUrl ?? discoveredPortalUrl ?? undefined;
  // APIs.guru enriches the spec but does NOT trigger scoring on its own —
  // probes must confirm an API exists, OR discovery found a portal.
  const shouldScoreApi = checks.api_exists.pass || checks.openapi_spec.pass || !!discoveredPortalUrl;
  const specRaw = builderData.specRaw ?? (shouldScoreApi ? apisGuruSpec : null) ?? null;

  // Determine the best Firecrawl target for developer docs:
  // - Known portal URL (from probes or discovery) — always use it
  // - developer.{domain} as best-guess — only when we have no docs from path probes,
  //   so we don't waste 20 s on a subdomain that may be login-gated
  const firecrawlDocTarget: string | undefined = portalUrl
    ?? (firecrawlKey && shouldScoreApi && !builderData.docsHtml
      ? `https://developer.${rawDomain}`
      : undefined);

  // Run Claude analysis and API score in parallel.
  // API score uses Firecrawl to render JS-heavy developer portals if available.
  // LLM extraction (claude-haiku) runs inside scoreApi when no spec is found.
  const [analysis, apiScore] = await Promise.all([
    apiKey
      ? analyzeWithClaude(rawDomain, liveChecks, builderData, apiKey, firecrawlMarkdown ?? undefined)
      : Promise.resolve(null),
    shouldScoreApi
      ? (async () => {
          const firecrawlResult = (firecrawlKey && firecrawlDocTarget)
            ? await firecrawlScrape(firecrawlDocTarget, firecrawlKey, 12_000)
            : null;
          // Always fall back to probe-detected docs or Exa content if Firecrawl returns null
          const docsHtml = firecrawlResult ?? builderData.docsHtml ?? discoveredPortalContent ?? null;
          return scoreApi({
            specRaw,
            docsHtml,
            domain: rawDomain,
            anthropicApiKey: apiKey ?? undefined,
          }).catch(() => null);
        })()
      : Promise.resolve(null),
  ]);

  const isDemo = !analysis;
  const finalAnalysis = analysis ?? buildDemoAnalysis(rawDomain);

  const scanId = await saveToSupabase(
    rawDomain, checks, badge, score, finalAnalysis.summary, recommendations, ipHash
  ).catch(() => null);

  return Response.json({
    company: finalAnalysis.company,
    industry: finalAnalysis.industry,
    summary: finalAnalysis.summary,
    agent_suggestions: finalAnalysis.agent_suggestions,
    badge,
    score,
    checks,
    recommendations,
    severity_counts,
    scan_id: scanId,
    isDemo,
    api_score: apiScore ?? null,
  });
}
