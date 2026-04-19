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
import { saveLocalLatestScan } from "@/lib/local-scan-store";
import {
  checkRobots, checkSitemap, checkLlms,
  complianceChecks, checkMcpServer, checkSandboxAvailable,
  checkApiExists, checkOpenApiSpec, checkApiDocs,
  calculateBadge, getTopRecommendations, computeSeverityCounts,
  BUILDER_PATHS,
  type AllChecks, type ProbeResult,
} from "@/lib/checks";
import { scoreApi } from "@/lib/api-score";
import { isSwedishCompany } from "@/lib/swedish-validator";

const AI_AGENTS = ["gptbot", "claudebot", "anthropic-ai", "ccbot", "google-extended", "omgilibot"];

function parseRobots(body: string): { allowed: boolean; sitemapUrl: string | null } {
  const lines = body.split("\n");
  let groupUAs: string[] = [];
  let inGroup = false;
  let blocked = false;
  let sitemapUrl: string | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    const lower = line.toLowerCase();
    if (lower.startsWith("user-agent:")) {
      const ua = lower.replace("user-agent:", "").trim();
      if (!inGroup) { groupUAs = [ua]; inGroup = true; }
      else { groupUAs.push(ua); }
    } else if (lower.startsWith("disallow:")) {
      const path = lower.replace("disallow:", "").trim();
      if (path === "/" && groupUAs.some(ua => AI_AGENTS.includes(ua) || ua === "*")) blocked = true;
      inGroup = false;
    } else if (lower.startsWith("sitemap:")) {
      const url = line.slice(8).trim();
      if (url) sitemapUrl = url;
    } else if (line === "") { groupUAs = []; inGroup = false; }
  }
  return { allowed: !blocked, sitemapUrl };
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

// ── MCP GitHub discovery ─────────────────────────────────────────────────────
// Searches GitHub for repos mentioning the company + MCP.
// Purely informational — does NOT affect the mcp_server check score.
async function discoverMcpOnGitHub(companyName: string): Promise<import('@/lib/scan-types').McpGithubHint | null> {
  try {
    const companyToken = companyName.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const q = encodeURIComponent(`"${companyName}" mcp (server OR "model context protocol")`);
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=8`,
      {
        headers: { "User-Agent": "OpenSverige-Scanner/1.0", "Accept": "application/vnd.github.v3+json" },
        signal: AbortSignal.timeout(4_000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      items?: Array<{
        full_name: string;
        html_url: string;
        stargazers_count: number;
        owner: { login: string };
        name: string;
        description: string | null;
      }>;
    };
    if (!data.items?.length) return null;

    const scored = data.items
      .map((r) => {
        const name = r.name.toLowerCase();
        const full = r.full_name.toLowerCase();
        const desc = (r.description ?? "").toLowerCase();
        const text = `${name} ${full} ${desc}`;

        const mentionsMcp = /(^|[^a-z])(mcp|model context protocol)($|[^a-z])/i.test(text);
        if (!mentionsMcp) return null;

        const mentionsCompany = companyToken.length >= 3 && text.includes(companyToken);
        if (!mentionsCompany) return null;

        let confidenceScore = 0;
        if (name.includes("mcp")) confidenceScore += 2;
        if (full.includes(companyToken)) confidenceScore += 2;
        if (desc.includes("model context protocol")) confidenceScore += 1;
        if (r.stargazers_count > 10) confidenceScore += 1;

        return { repo: r, confidenceScore };
      })
      .filter((row): row is { repo: NonNullable<typeof data.items>[number]; confidenceScore: number } => row !== null)
      .sort((a, b) => b.confidenceScore - a.confidenceScore || b.repo.stargazers_count - a.repo.stargazers_count);

    const hit = scored[0]?.repo;
    if (!hit) return null;
    return { url: hit.html_url, full_name: hit.full_name, stars: hit.stargazers_count, owner: hit.owner.login };
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
    // Developer portals are often JS-heavy and put important signals far down the HTML.
    // Keep both head and tail windows so we don't miss markers appended late in the document.
    const fullBody = await res.text();
    const BODY_WINDOW = 1_000_000;
    const body = fullBody.length <= BODY_WINDOW * 2
      ? fullBody
      : `${fullBody.slice(0, BODY_WINDOW)}\n<!-- snip -->\n${fullBody.slice(-BODY_WINDOW)}`;
    return { status: res.status, body, contentType: res.headers.get("content-type") };
  } catch { return null; }
}

async function firecrawlScrape(
  url: string,
  apiKey: string,
  maxChars = 8000,
  onlyMain = true,
): Promise<string | null> {
  try {
    // eslint-disable-next-line
    const { default: FirecrawlApp } = await import("@mendable/firecrawl-js");
    const app = new FirecrawlApp({ apiKey });
    const deadline = new Promise<null>(resolve => setTimeout(() => resolve(null), 20_000));
    const result = await Promise.race([
      app.scrapeUrl(url, {
        formats: ["markdown"],
        onlyMainContent: onlyMain,
        // Give JS-heavy pages (Redoc, Swagger UI) time to initialize
        ...(onlyMain ? {} : { waitFor: 2000 }),
      }),
      deadline,
    ]);
    if (!result || !("success" in result) || !result.success || !result.markdown) {
      const r = result as unknown as Record<string,unknown> | null;
      console.log(`[firecrawl] miss url=${url} success=${r?.success} len=${r?.markdown ? String(r.markdown).length : 0}`);
      return null;
    }
    console.log(`[firecrawl] ok url=${url} chars=${result.markdown.length}`);
    return result.markdown.slice(0, maxChars);
  } catch (e) {
    console.log(`[firecrawl] error url=${url}`, String(e).slice(0, 120));
    return null;
  }
}

async function fetchFirecrawlContent(domain: string, apiKey: string): Promise<string | null> {
  // Homepage: onlyMainContent=true strips navigation noise
  return firecrawlScrape(`https://${domain}`, apiKey, 8000, true);
}

// ── Decision tree helpers ─────────────────────────────────────────────────────

// llms.txt must be a real text file — not an HTML page returned by a CMS catch-all.
// Many sites return 200 with HTML for any unknown path (Next.js, WordPress, etc.).
function isValidLlmsTxt(body: string, contentType: string | null): boolean {
  const ct = contentType?.toLowerCase() ?? "";
  // Reject HTML regardless of what the body says
  if (ct.includes("text/html") || body.trimStart().startsWith("<!DOCTYPE") || body.trimStart().startsWith("<html")) return false;
  // Accept explicit text/plain or text/markdown
  if (ct.includes("text/plain") || ct.includes("text/markdown")) return true;
  // Accept if body looks like an llms.txt file: starts with # heading or > blockquote
  const start = body.trimStart().slice(0, 50);
  return start.startsWith("#") || start.startsWith(">");
}

async function runAllChecks(domain: string): Promise<{ checks: AllChecks; liveChecks: LiveChecks; builderData: BuilderProbeData }> {
  const base = `https://${domain}`;
  const builderUrls = [
    ...BUILDER_PATHS.map(p => `${base}${p}`),
    // .well-known standard paths (MCP, alternative llms location)
    `${base}/.well-known/mcp.json`,
    `${base}/.well-known/llms.txt`,
    // API subdomain — docs pages
    `https://developer.${domain}`,
    `https://developer.${domain}/developer-portal`,
    `https://api.${domain}`,
    `https://api.${domain}/docs`,
    `https://api.${domain}/apidocs`,
    `https://api.${domain}/reference`,
    `https://developer.${domain}/docs`,
    // apps subdomain — some companies (e.g. Fortnox) host additional docs here
    `https://apps.${domain}/apidocs`,
    `https://apps.${domain}/apidocs/experimental`,
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
  const complianceUrls = [
    `${base}/integritetspolicy`,
    `${base}/privacy`,
    `${base}/privacy-policy`,
    `${base}/gdpr`,
    `${base}/cookies`,
    `${base}/cookiepolicy`,
    `${base}/cookie-policy`,
  ];

  // ── Phase 1: parallel quick fetches ──────────────────────────────────────
  // Checks multiple common sitemap paths in parallel — no latency penalty.
  // llms.txt: checked at root AND .well-known — content-validated in phase 2
  const [robotsRes, sitemapRes, sitemapIndexRes, sitemapWpRes, sitemapPhpRes, llmsRes, llmsWellKnownRes, ...probeResultsRaw] = await Promise.all([
    fetchSafe(`${base}/robots.txt`),
    fetchSafe(`${base}/sitemap.xml`),
    fetchSafe(`${base}/sitemap_index.xml`),
    fetchSafe(`${base}/wp-sitemap.xml`),        // WordPress 5.5+ core sitemaps
    fetchSafe(`${base}/sitemap.php`),           // PHP CMS sitemap generators
    fetchSafe(`${base}/llms.txt`),
    fetchSafe(`${base}/.well-known/llms.txt`),
    ...builderUrls.map(url => fetchSafe(url).then(r => ({ url, ...r ?? { status: 0, body: "", contentType: null } } as ProbeResult))),
    ...complianceUrls.map(url => fetchSafe(url).then(r => ({ url, ...r ?? { status: 0, body: "", contentType: null } } as ProbeResult))),
  ]);

  // ── Phase 1.5: fetch robots.txt-declared sitemap if at non-standard path ──
  // Many sites declare their sitemap in robots.txt but at a path we haven't probed yet
  // (e.g. /sitemap-news.xml, /sitemaps/sitemap.xml, www-subdomain variants).
  const KNOWN_SITEMAP_URLS = new Set([
    `${base}/sitemap.xml`, `${base}/sitemap_index.xml`,
    `${base}/wp-sitemap.xml`, `${base}/sitemap.php`,
  ]);
  const robotsParsedEarly = robotsRes?.status === 200
    ? parseRobots(robotsRes.body)
    : robotsRes?.status === 403
      ? { allowed: false, sitemapUrl: null }
      : { allowed: true, sitemapUrl: null };
  let robotsDeclaredSitemapRes = null;
  if (robotsParsedEarly.sitemapUrl) {
    const declared = robotsParsedEarly.sitemapUrl;
    const declaredAbs = declared.startsWith("http")
      ? declared
      : `${base}${declared.startsWith("/") ? declared : `/${declared}`}`;
    if (!KNOWN_SITEMAP_URLS.has(declaredAbs)) {
      robotsDeclaredSitemapRes = await fetchSafe(declaredAbs);
    }
  }

  // ── Phase 2: resolve from phase 1 results ────────────────────────────────
  // RFC 9309: 404/absent = allow-all, 403 = deny-all, 200 = parse
  const robotsParsed = robotsParsedEarly;
  const robotsAllowed = robotsParsed.allowed;

  // Sitemap: any 200 response from standard paths OR robots.txt-declared URL
  const sitemapExists =
    sitemapRes?.status === 200 ||
    sitemapIndexRes?.status === 200 ||
    sitemapWpRes?.status === 200 ||
    sitemapPhpRes?.status === 200 ||
    robotsDeclaredSitemapRes?.status === 200;

  // llms.txt: valid at root OR at .well-known/llms.txt — must be real text, not HTML catch-all
  const llmsValid =
    (llmsRes?.status === 200 && isValidLlmsTxt(llmsRes.body, llmsRes.contentType)) ||
    (llmsWellKnownRes?.status === 200 && isValidLlmsTxt(llmsWellKnownRes.body, llmsWellKnownRes.contentType));

  const liveChecks: LiveChecks = {
    robots: robotsAllowed,
    sitemap: sitemapExists,
    llms: llmsValid,
  };

  const probeResults = probeResultsRaw.slice(0, builderUrls.length) as ProbeResult[];
  const complianceProbeResults = probeResultsRaw.slice(builderUrls.length) as ProbeResult[];

  const joinedComplianceText = complianceProbeResults
    .filter((p) => p.status === 200 || p.status === 401 || p.status === 403)
    .map((p) => `${p.url}\n${p.body}`)
    .join("\n\n");

  const [privacyCheck, cookieCheck, aiMarkingCheck] = complianceChecks({
    privacyText: joinedComplianceText,
    cookieText: joinedComplianceText,
    aiText: joinedComplianceText,
  });
  const apiExistsCheck = checkApiExists(probeResults);
  const openApiCheck = checkOpenApiSpec(probeResults);
  const apiDocsCheck = checkApiDocs(probeResults);
  const mcpCheck = checkMcpServer(probeResults);
  const sandboxCheck = checkSandboxAvailable(probeResults);

  const checks: AllChecks = {
    robots_ok: checkRobots(robotsAllowed),
    sitemap_exists: checkSitemap(sitemapExists),
    llms_txt: checkLlms(llmsValid),
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

  // Score dev portal candidates by specificity — prefer actual API docs over marketing pages.
  // api.*/apidocs > developer.* > api.* (root) > /apidocs path > /developer path
  function devPortalPriority(url: string): number {
    if (/https?:\/\/api\./i.test(url) && (url.includes('/apidocs') || url.includes('/reference'))) return 5;
    if (/https?:\/\/(developer|docs)\./i.test(url)) return 4;
    if (/https?:\/\/api\./i.test(url)) return 3;
    if (url.includes('/apidocs') || url.includes('/reference')) return 2;
    if (url.includes('/developer') || url.includes('/docs')) return 1;
    return 0;
  }
  const devCandidates = probeResults.filter(p =>
    (p.status === 200 || p.status === 429) && (
      p.url.includes('/developer') ||
      /https?:\/\/(developer|docs)\./i.test(p.url) ||
      p.url.includes('/apidocs') ||
      p.url.includes('/reference') ||
      (p.url.startsWith(`https://api.`) && p.contentType?.includes('text/html'))
    )
  );
  devCandidates.sort((a, b) => devPortalPriority(b.url) - devPortalPriority(a.url));
  const devHit = devCandidates[0];
  let developerPortalUrl: string | undefined;
  if (devHit) developerPortalUrl = devHit.url;

  // Extract raw spec body and docs HTML for API scoring.
  // Also handle Redoc pages that embed the full spec as __redoc_state JSON.
  const specProbe = probeResults.find(p =>
    (p.status === 200 || p.status === 429) &&
    (p.url.includes('/openapi') || p.url.includes('/swagger') || p.body.includes('__redoc_state')) &&
    (p.body.includes('"openapi"') || p.body.includes('"swagger"') || p.body.includes('openapi:') ||
     p.body.includes('swagger:') || p.body.includes('__redoc_state'))
  );
  // Try to extract embedded spec from Redoc state assignment:
  // window.__redoc_state = { ... };
  function extractRedocSpec(body: string): string | null {
    const marker = "__redoc_state";
    const idx = body.indexOf(marker);
    if (idx === -1) return null;

    const eq = body.indexOf("=", idx);
    if (eq === -1) return null;

    const start = body.indexOf("{", eq);
    if (start === -1) return null;

    // Brace matching with string-awareness to capture the full JSON object.
    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;
    for (let i = start; i < body.length; i++) {
      const ch = body[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === "\"") inString = false;
        continue;
      }
      if (ch === "\"") {
        inString = true;
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) return null;

    try {
      const state = JSON.parse(body.slice(start, end + 1)) as Record<string, unknown>;
      const spec = state.spec as Record<string, unknown> | undefined;
      const data = spec?.data;
      return data ? JSON.stringify(data) : null;
    } catch {
      return null;
    }
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
    // Prefer the highest-priority developer portal candidate we already ranked.
    docsHtml: devHit?.body ?? docsProbe?.body,
  };

  return { checks, liveChecks, builderData };
}

async function getIpHash(req: NextRequest): Promise<string> {
  const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Returns { perIpOk, globalOk } — both must be true to proceed.
// Global daily limit: configurable via DAILY_SCAN_LIMIT env var (default 200).
// If Supabase is unavailable, both return true (fail open — better than blocking all scans).
async function checkRateLimits(ipHash: string): Promise<{ perIpOk: boolean; globalOk: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { perIpOk: true, globalOk: true };

  const dailyLimit = parseInt(process.env.DAILY_SCAN_LIMIT ?? "200", 10) || 200;
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  try {
    const [perIpRes, globalRes] = await Promise.all([
      fetch(
        `${url}/rest/v1/scan_submissions?select=id&ip_hash=eq.${ipHash}&scanned_at=gte.${oneMinuteAgo}&limit=1`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(3_000) }
      ),
      fetch(
        `${url}/rest/v1/scan_submissions?select=id&scanned_at=gte.${dayStart.toISOString()}&limit=${dailyLimit + 1}`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(3_000) }
      ),
    ]);

    const perIpRows = perIpRes.ok ? await perIpRes.json() as unknown[] : [];
    const globalRows = globalRes.ok ? await globalRes.json() as unknown[] : [];

    return {
      perIpOk: perIpRows.length === 0,
      globalOk: globalRows.length < dailyLimit,
    };
  } catch { return { perIpOk: true, globalOk: true }; }
}

async function saveToSupabase(
  domain: string,
  checks: AllChecks,
  badge: string,
  score: number,
  total: number,
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

  const baseHeaders = {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: "return=representation",
  };

  const modernPayload = {
    domain, badge,
    checks_passed: score, checks_total: total,
    discovery_passed: discovery.filter(c => c.pass).length,
    compliance_passed: compliance.filter(c => c.pass).length,
    builder_passed: builder.filter(c => c.pass).length,
    has_robots: checks.robots_ok.pass, has_sitemap: checks.sitemap_exists.pass,
    has_llms_txt: checks.llms_txt.pass, has_api: checks.api_exists.pass,
    has_openapi_spec: checks.openapi_spec.pass, has_api_docs: checks.api_docs.pass,
    checks_json: checks, claude_summary: summary, recommendations, ip_hash: ipHash,
  };

  // Backward-compatible payload for older scan_submissions schemas.
  const legacyPayload = {
    domain,
    badge,
    checks_passed: score,
    checks_json: checks,
    has_robots: checks.robots_ok.pass,
    has_sitemap: checks.sitemap_exists.pass,
    has_llms_txt: checks.llms_txt.pass,
    wants_deep_scan: false,
    ip_hash: ipHash,
  };

  try {
    const res = await fetch(`${url}/rest/v1/scan_submissions`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(modernPayload),
      signal: AbortSignal.timeout(5_000),
    });
    if (res.ok) {
      const rows = await res.json() as Array<{ id: string }>;
      return rows[0]?.id ?? null;
    }

    const errText = await res.text().catch(() => "");
    console.warn(`[scan] modern insert failed status=${res.status} body=${errText.slice(0, 220)}`);

    const fallbackRes = await fetch(`${url}/rest/v1/scan_submissions`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(legacyPayload),
      signal: AbortSignal.timeout(5_000),
    });

    if (!fallbackRes.ok) {
      const fallbackErr = await fallbackRes.text().catch(() => "");
      console.warn(`[scan] legacy insert failed status=${fallbackRes.status} body=${fallbackErr.slice(0, 220)}`);
      return null;
    }
    const rows = await fallbackRes.json() as Array<{ id: string }>;
    return rows[0]?.id ?? null;
  } catch (error) {
    console.warn("[scan] saveToSupabase error", error);
    return null;
  }
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

  // Swedish filter removed — scanner is open to all domains.
  const bypassSwedishCheck = true;
  const [, ipHash] = await Promise.all([
    Promise.resolve(null),
    getIpHash(req),
  ]);
  const swedishCheck = { pass: true as const, reason: "bypass_env" as const };

  const { perIpOk, globalOk } = await checkRateLimits(ipHash);
  if (!perIpOk) {
    return Response.json({ error: "För många scanningar. Vänta en minut." }, { status: 429 });
  }
  if (!globalOk) {
    return Response.json({ error: "Daglig scanlimit nådd. Försök igen imorgon." }, { status: 429 });
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  // discoveredPortal: found via npm/GitHub/llms.txt/Exa — may include page text content (from Exa)
  const discoveredPortalUrl = discoveredPortal?.url ?? null;
  const discoveredPortalContent = discoveredPortal?.content ?? null;
  const portalUrl = builderData.developerPortalUrl ?? discoveredPortalUrl ?? undefined;
  // APIs.guru enriches the spec but does NOT trigger scoring on its own —
  // probes must confirm an API exists, OR discovery found a portal.
  // Also score when api_docs was found — company has documented an API even if /api path didn't respond.
  const shouldScoreApi = checks.api_exists.pass || checks.openapi_spec.pass || checks.api_docs.pass || !!discoveredPortalUrl;
  const specRaw = builderData.specRaw ?? (shouldScoreApi ? apisGuruSpec : null) ?? null;

  console.log(`[scan] domain=${rawDomain} shouldScore=${shouldScoreApi} portalUrl=${portalUrl ?? 'none'} hasSpec=${!!specRaw} docsHtmlLen=${builderData.docsHtml?.length ?? 0} hasFirecrawl=${!!firecrawlKey} hasExa=${!!process.env.EXA_API_KEY} hasAnthropicKey=${!!apiKey}`);

  // Determine the best Firecrawl target for developer docs:
  // - Known portal URL (from probes or discovery) — always use it
  // - developer.{domain} as best-guess — only when we have no docs from path probes,
  //   so we don't waste 20 s on a subdomain that may be login-gated
  const firecrawlDocTarget: string | undefined = portalUrl
    ?? (firecrawlKey && shouldScoreApi && !builderData.docsHtml
      ? `https://developer.${rawDomain}`
      : undefined);

  const companyName = rawDomain.split(".")[0] ?? rawDomain;

  // Run Claude analysis, API score and MCP GitHub discovery in parallel.
  // API score uses Firecrawl to render JS-heavy developer portals if available.
  // LLM extraction (claude-haiku) runs inside scoreApi when no spec is found.
  // MCP GitHub search only runs when the official check fails — purely informational.
  // Hoisted so sandbox re-check can use the same Firecrawl content as API scoring.
  let firecrawlDocsContent: string | null = null;

  const [analysis, apiScore, mcpGithubHint] = await Promise.all([
    apiKey
      ? analyzeWithClaude(rawDomain, liveChecks, builderData, apiKey, firecrawlMarkdown ?? undefined)
      : Promise.resolve(null),
    shouldScoreApi
      ? (async () => {
          // onlyMain=false: Redoc/Swagger UI renders content in sidebars/panels
          // that onlyMainContent:true strips as "navigation noise" — we need all of it.
          // 40K chars: enough to cover a full Redoc page past the navigation sidebar
          // into actual API titles, auth docs, and endpoint descriptions.
          firecrawlDocsContent = (firecrawlKey && firecrawlDocTarget)
            ? await firecrawlScrape(firecrawlDocTarget, firecrawlKey, 40_000, false)
            : null;
          // Always fall back to probe-detected docs or Exa content if Firecrawl returns null
          const docsHtml = firecrawlDocsContent ?? builderData.docsHtml ?? discoveredPortalContent ?? null;
          return scoreApi({
            specRaw,
            docsHtml,
            domain: rawDomain,
            anthropicApiKey: apiKey ?? undefined,
          }).catch(() => null);
        })()
      : Promise.resolve(null),
    checks.mcp_server.pass
      ? Promise.resolve(null)
      : discoverMcpOnGitHub(companyName),
  ]);

  // Post-check: if sandbox probe missed but Firecrawl docs mention it (e.g. behind login),
  // upgrade the check with a softer label. Reuses already-fetched Firecrawl content — no extra cost.
  const docsForSandboxCheck: unknown = firecrawlDocsContent;
  if (!checks.sandbox_available.pass && typeof docsForSandboxCheck === "string") {
    const hay = docsForSandboxCheck.toLowerCase();
    if (/sandbox|testmilj|test.?environment|playground|staging|testbolag|test.?account/.test(hay)) {
      checks.sandbox_available = {
        ...checks.sandbox_available,
        pass: true,
        label: 'Sandbox nämns i dokumentation',
        detail: 'Nämnd i developer-docs — kan finnas bakom inloggning. Vi kunde inte verifiera direkt åtkomst.',
      };
    }
  }

  // MCP is a recommendation (not a scored blocker) when the site has a documented REST API.
  // REST + OpenAPI is already agent-ready — MCP is an enhancement, not a requirement.
  if (!checks.mcp_server.pass && (checks.openapi_spec.pass || checks.api_docs.pass)) {
    checks.mcp_server = {
      ...checks.mcp_server,
      recommendation: true,
      severity: 'info',
      label: 'MCP-server saknas — rekommenderas för djupare agent-integration',
      detail: 'REST API + OpenAPI är agent-ready utan MCP. MCP ger direkt tool-koppling för Claude, Cursor och Windsurf — ett bra nästa steg men inte ett blockerande krav.',
    };
  }

  // Open API: sandbox not needed if API responds without auth and no pricing signals.
  // apiPathsFound contains only 200/429 paths — empty means all hits were auth-gated (401/403+json).
  const apiIsOpenAccess = checks.api_exists.pass && builderData.apiPathsFound.length > 0;
  const hasPricingMention = /pris|pricing|betalplan|subscription|billing|faktur/.test(
    ((firecrawlMarkdown ?? "") + (firecrawlDocsContent ?? "")).toLowerCase()
  );
  if (apiIsOpenAccess && !hasPricingMention && !checks.sandbox_available.pass) {
    checks.sandbox_available = {
      ...checks.sandbox_available,
      na: true,
      label: 'Öppet API — testa direkt, ingen sandbox behövs',
      detail: 'API:et svarar utan autentisering. Builders kan testa mot produktions-API:et direkt.',
    };
  }

  // Sandbox is only applicable when an API exists — no API means no sandbox to offer.
  if (!checks.api_exists.pass) {
    checks.sandbox_available = { ...checks.sandbox_available, na: true };
  }

  // Recalculate derived values after possible sandbox upgrade and N/A marking.
  const { badge, score, total } = calculateBadge(checks);
  const recommendations = getTopRecommendations(checks);
  const severity_counts = computeSeverityCounts(checks);

  const isDemo = !analysis;
  const finalAnalysis = analysis ?? buildDemoAnalysis(rawDomain);

  const scannedAt = new Date().toISOString();

  const persistedScanId = await saveToSupabase(
    rawDomain, checks, badge, score, total, finalAnalysis.summary, recommendations, ipHash
  ).catch(() => null);

  // Keep latest scan available in local/dev even when database persistence is missing.
  const localScanId = saveLocalLatestScan({
    domain: rawDomain,
    badge,
    checks_passed: score,
    checks_json: checks,
    claude_summary: finalAnalysis.summary,
    recommendations,
    scanned_at: scannedAt,
  });
  const scanId = persistedScanId ?? localScanId;

  return Response.json({
    company: finalAnalysis.company,
    industry: finalAnalysis.industry,
    summary: finalAnalysis.summary,
    agent_suggestions: finalAnalysis.agent_suggestions,
    badge,
    score,
    checks_total: total,
    checks,
    recommendations,
    severity_counts,
    scan_id: scanId,
    isDemo,
    api_score: apiScore ?? null,
    mcp_github_hint: mcpGithubHint ?? null,
    swedish_check: {
      bypassed: bypassSwedishCheck,
      reason: swedishCheck.reason,
    },
    scanned_at: scannedAt,
  });
}
