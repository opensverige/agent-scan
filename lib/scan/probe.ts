// lib/scan/probe.ts
//
// Phase 1 + 1.5 of the scan pipeline: parallel HTTP probes against the target
// domain to determine basic discoverability and builder-API surface.
//
// This module is deliberately *only* I/O — it returns the raw probe results
// without computing any check verdicts. Verdict computation happens in
// `lib/scan/pipeline.ts` so we can swap in cached / Inngest-stepped data.

import { fetchSafe } from "./fetch";
import { parseRobots } from "./robots";
import { isValidLlmsTxt } from "./openapi-extractor";
import { BUILDER_PATHS, type ProbeResult } from "@/lib/checks";

export interface FetchedResponse {
  status: number;
  body: string;
  contentType: string | null;
}

export interface ProbeOutput {
  /** robots.txt fetch result + parsed allowed/sitemapUrl. */
  robots: { allowed: boolean; sitemapUrl: string | null };
  /** True if any sitemap URL returned 200. */
  sitemapExists: boolean;
  /** True if /llms.txt or /.well-known/llms.txt is a real text file. */
  llmsValid: boolean;
  /** Probe results for builder paths (api endpoints, OpenAPI specs, dev portals). */
  builderProbes: ProbeResult[];
  /** Probe results for compliance paths (privacy, cookie, GDPR pages). */
  complianceProbes: ProbeResult[];
  // ── Stage 1 — P0 checks (G-01..G-06) ────────────────────────────────────
  /** /llms-full.txt response (G-01). */
  llmsFullTxt: FetchedResponse | null;
  /** GET / with Accept: text/markdown (G-02). */
  markdownNegotiation: FetchedResponse | null;
  /** GET / with default User-Agent (G-03 — SSR check uses raw HTML). */
  homepageHtml: FetchedResponse | null;
  /** GET / with ClaudeBot User-Agent (G-04). Status only — body not needed. */
  crawlerClaudeBot: { status: number } | null;
  /** GET / with GPTBot User-Agent (G-04). */
  crawlerGptBot: { status: number } | null;
  /** GET / with PerplexityBot User-Agent (G-04). */
  crawlerPerplexityBot: { status: number } | null;
  /** /.well-known/mcp response (G-05). */
  mcpDiscovery: FetchedResponse | null;
  /** /.well-known/mcp/server-card.json response (G-06). */
  mcpServerCard: FetchedResponse | null;
}

/** Fetch with explicit User-Agent. Used for crawler-access probes (G-04). */
async function fetchWithUserAgent(url: string, userAgent: string): Promise<{ status: number } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": userAgent },
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    return { status: res.status };
  } catch {
    return null;
  }
}

/** Fetch with explicit Accept header. Used for content-negotiation probe (G-02). */
async function fetchWithAccept(url: string, accept: string): Promise<FetchedResponse | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "OpenSverige-Scanner/1.0 (https://opensverige.se/scan)",
        "Accept": accept,
      },
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    const body = (await res.text()).slice(0, 100_000);
    return { status: res.status, body, contentType: res.headers.get("content-type") };
  } catch {
    return null;
  }
}

const CRAWLER_USER_AGENTS = {
  claudebot: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
  gptbot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
  perplexitybot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
} as const;

const COMPLIANCE_PATH_SUFFIXES = [
  "/integritetspolicy",
  "/privacy",
  "/privacy-policy",
  "/gdpr",
  "/cookies",
  "/cookiepolicy",
  "/cookie-policy",
] as const;

const ADDITIONAL_BUILDER_PATHS = [
  "/mcp",
  "/.well-known/mcp.json",
  "/.well-known/llms.txt",
] as const;

/** Probes against subdomains (developer.*, api.*, apps.*) for portals + spec files. */
function subdomainBuilderUrls(domain: string): string[] {
  return [
    // developer.* — docs pages
    `https://developer.${domain}`,
    `https://developer.${domain}/developer-portal`,
    `https://developer.${domain}/docs`,
    // api.* — docs + spec roots
    `https://api.${domain}`,
    `https://api.${domain}/docs`,
    `https://api.${domain}/apidocs`,
    `https://api.${domain}/reference`,
    // apps.* — additional doc hosts (e.g. Fortnox)
    `https://apps.${domain}/apidocs`,
    `https://apps.${domain}/apidocs/experimental`,
    // Spec files at common non-root locations
    `https://api.${domain}/openapi.json`,
    `https://api.${domain}/openapi.yaml`,
    `https://api.${domain}/swagger.json`,
    `https://api.${domain}/v1/openapi.json`,
    `https://api.${domain}/v2/openapi.json`,
    `https://api.${domain}/v3/openapi.json`,
    `https://developer.${domain}/openapi.json`,
    `https://developer.${domain}/swagger.json`,
  ];
}

/**
 * Run all parallel probes for a domain.
 * Phase 1: robots + sitemap variants + llms.txt + builder + compliance probes.
 * Phase 1.5: if robots.txt declares a non-standard sitemap path, fetch it too.
 */
export async function runProbes(domain: string): Promise<ProbeOutput> {
  const base = `https://${domain}`;

  const builderUrls = [
    ...BUILDER_PATHS.map(p => `${base}${p}`),
    ...ADDITIONAL_BUILDER_PATHS.map(p => `${base}${p}`),
    ...subdomainBuilderUrls(domain),
  ];
  const complianceUrls = COMPLIANCE_PATH_SUFFIXES.map(p => `${base}${p}`);

  // Phase 1 — fan-out parallel fetches.
  // Sitemap: probe four variants (xml, _index, wp, php) to cover WP/static/PHP CMSes.
  // llms.txt: probe both root and .well-known/ — content-validated separately.
  // Stage 1 P0 probes: llms-full.txt, markdown negotiation, raw homepage HTML,
  // 3× crawler-UA homepage probes, MCP well-known + server-card.
  const [
    robotsRes, sitemapRes, sitemapIndexRes, sitemapWpRes, sitemapPhpRes,
    llmsRes, llmsWellKnownRes,
    llmsFullTxt, markdownNegotiation, homepageHtml,
    crawlerClaudeBot, crawlerGptBot, crawlerPerplexityBot,
    mcpDiscovery, mcpServerCard,
    ...probeResultsRaw
  ] = await Promise.all([
    fetchSafe(`${base}/robots.txt`),
    fetchSafe(`${base}/sitemap.xml`),
    fetchSafe(`${base}/sitemap_index.xml`),
    fetchSafe(`${base}/wp-sitemap.xml`),
    fetchSafe(`${base}/sitemap.php`),
    fetchSafe(`${base}/llms.txt`),
    fetchSafe(`${base}/.well-known/llms.txt`),
    // G-01 llms-full.txt
    fetchSafe(`${base}/llms-full.txt`),
    // G-02 markdown negotiation — root with Accept: text/markdown
    fetchWithAccept(base, "text/markdown"),
    // G-03 SSR — root with default UA, raw HTML
    fetchSafe(base),
    // G-04 crawler access — three AI User-Agents
    fetchWithUserAgent(base, CRAWLER_USER_AGENTS.claudebot),
    fetchWithUserAgent(base, CRAWLER_USER_AGENTS.gptbot),
    fetchWithUserAgent(base, CRAWLER_USER_AGENTS.perplexitybot),
    // G-05 .well-known/mcp + G-06 server-card.json
    fetchSafe(`${base}/.well-known/mcp`),
    fetchSafe(`${base}/.well-known/mcp/server-card.json`),
    ...builderUrls.map(url => fetchSafe(url).then(r => ({ url, ...r ?? { status: 0, body: "", contentType: null } } as ProbeResult))),
    ...complianceUrls.map(url => fetchSafe(url).then(r => ({ url, ...r ?? { status: 0, body: "", contentType: null } } as ProbeResult))),
  ]);

  // RFC 9309: 404/absent = allow-all, 403 = deny-all, 200 = parse
  const robots = robotsRes?.status === 200
    ? parseRobots(robotsRes.body)
    : robotsRes?.status === 403
      ? { allowed: false, sitemapUrl: null }
      : { allowed: true, sitemapUrl: null };

  // Phase 1.5 — fetch robots-declared sitemap URL if it's at a path we haven't probed.
  const KNOWN_SITEMAP_URLS = new Set([
    `${base}/sitemap.xml`, `${base}/sitemap_index.xml`,
    `${base}/wp-sitemap.xml`, `${base}/sitemap.php`,
  ]);
  let robotsDeclaredSitemapRes = null;
  if (robots.sitemapUrl) {
    const declared = robots.sitemapUrl;
    const declaredAbs = declared.startsWith("http")
      ? declared
      : `${base}${declared.startsWith("/") ? declared : `/${declared}`}`;
    if (!KNOWN_SITEMAP_URLS.has(declaredAbs)) {
      robotsDeclaredSitemapRes = await fetchSafe(declaredAbs);
    }
  }

  const sitemapExists =
    sitemapRes?.status === 200 ||
    sitemapIndexRes?.status === 200 ||
    sitemapWpRes?.status === 200 ||
    sitemapPhpRes?.status === 200 ||
    robotsDeclaredSitemapRes?.status === 200;

  const llmsValid =
    (llmsRes?.status === 200 && isValidLlmsTxt(llmsRes.body, llmsRes.contentType)) ||
    (llmsWellKnownRes?.status === 200 && isValidLlmsTxt(llmsWellKnownRes.body, llmsWellKnownRes.contentType));

  const builderProbes = probeResultsRaw.slice(0, builderUrls.length) as ProbeResult[];
  const complianceProbes = probeResultsRaw.slice(builderUrls.length) as ProbeResult[];

  return {
    robots,
    sitemapExists,
    llmsValid,
    builderProbes,
    complianceProbes,
    llmsFullTxt,
    markdownNegotiation,
    homepageHtml,
    crawlerClaudeBot,
    crawlerGptBot,
    crawlerPerplexityBot,
    mcpDiscovery,
    mcpServerCard,
  };
}
