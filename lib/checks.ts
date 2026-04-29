// lib/checks.ts

export type CheckId =
  | 'robots_ok' | 'sitemap_exists' | 'llms_txt'
  | 'privacy_automation' | 'cookie_bot_handling' | 'ai_content_marking'
  | 'api_exists' | 'openapi_spec' | 'api_docs'
  | 'mcp_server' | 'sandbox_available'
  // Stage 1, P0 checks per docs/strategy/research/02-agent-readiness-scoring-2026.md § 2.6
  | 'llms_full_txt' | 'markdown_negotiation' | 'ssr_content'
  | 'crawler_access' | 'mcp_well_known' | 'mcp_server_card';

export type CheckCategory = 'discovery' | 'compliance' | 'builder';
export type CheckSeverity = 'critical' | 'important' | 'info';
export type ScanBadge = 'green' | 'yellow' | 'red';

export interface CheckResult {
  id: CheckId;
  pass: boolean;
  /** true = check does not apply to this site; excluded from score denominator */
  na?: boolean;
  /** true = check is a nice-to-have suggestion, not a scored blocker */
  recommendation?: boolean;
  label: string;
  detail?: string;
  path?: string;
  category: CheckCategory;
  severity: CheckSeverity;
  hardcoded?: boolean;
}

export interface AllChecks {
  robots_ok: CheckResult;
  sitemap_exists: CheckResult;
  llms_txt: CheckResult;
  privacy_automation: CheckResult;
  cookie_bot_handling: CheckResult;
  ai_content_marking: CheckResult;
  api_exists: CheckResult;
  openapi_spec: CheckResult;
  api_docs: CheckResult;
  mcp_server: CheckResult;
  sandbox_available: CheckResult;
  // Stage 1, P0 checks
  llms_full_txt: CheckResult;
  markdown_negotiation: CheckResult;
  ssr_content: CheckResult;
  crawler_access: CheckResult;
  mcp_well_known: CheckResult;
  mcp_server_card: CheckResult;
}

export interface ProbeResult {
  url: string;
  status: number;
  contentType: string | null;
  body: string;
  error?: string;
}

export interface ComplianceEvidence {
  privacyText?: string;
  cookieText?: string;
  aiText?: string;
}

// Paths to probe for builder checks (relative to domain root)
export const BUILDER_PATHS = [
  '/api', '/api/v1', '/api/docs', '/developer', '/developers',
  '/docs', '/docs/api', '/openapi.json', '/openapi.yaml',
  '/swagger.json', '/swagger.yaml', '/api-docs',
  '/apidocs', '/reference', '/doc', '/api/reference',
  '/api/v2/openapi.json', '/api/v3/openapi.json',
  '/api/v2/swagger.json', '/api/v3/swagger.json',
  '/v3/api-docs', '/v2/api-docs',
  '/swagger-ui', '/swagger-ui/index.html',
  '/v1/openapi.json', '/v2/openapi.json', '/v3/openapi.json',
  '/v1/swagger.json', '/v2/swagger.json',
  // Deeper developer pages - often contain sandbox, auth, and getting-started content
  '/developer/developer-portal', '/developer/authentication',
  '/developer/getting-started', '/developer/docs',
  '/developers/docs', '/developers/api',
] as const;

const OPENAPI_PATHS = new Set([
  '/openapi.json', '/openapi.yaml', '/swagger.json', '/swagger.yaml',
  '/api/v2/openapi.json', '/api/v3/openapi.json',
  '/api/v2/swagger.json', '/api/v3/swagger.json',
  '/v3/api-docs', '/v2/api-docs',
  '/v1/openapi.json', '/v2/openapi.json', '/v3/openapi.json',
  '/v1/swagger.json', '/v2/swagger.json',
]);
const API_DOC_PATHS = new Set([
  '/developer', '/developers', '/docs', '/api/docs', '/api-docs',
  '/apidocs', '/reference', '/doc', '/api/reference',
  '/v3/api-docs', '/v2/api-docs', '/swagger-ui', '/swagger-ui/index.html',
]);

// â”€â”€ Discovery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function checkRobots(allowed: boolean): CheckResult {
  return {
    id: 'robots_ok',
    pass: allowed,
    label: allowed
      ? 'Sajten tillåter AI-agenter (robots.txt)'
      : 'Sajten blockerar AI-agenter eller saknar robots.txt',
    category: 'discovery',
    severity: 'important',
  };
}

export function checkSitemap(exists: boolean): CheckResult {
  return {
    id: 'sitemap_exists',
    pass: exists,
    label: exists
      ? 'Sitemap finns - agenter kan navigera'
      : 'Ingen sitemap - agenter kan inte navigera sajten',
    category: 'discovery',
    severity: 'info',
  };
}

export function checkLlms(valid: boolean): CheckResult {
  return {
    id: 'llms_txt',
    pass: valid,
    label: valid
      ? 'llms.txt finns - agenter vet vad du erbjuder'
      : 'Ingen llms.txt - agenter vet inte vad du erbjuder',
    category: 'discovery',
    severity: 'important',
  };
}

// â”€â”€ Compliance (evidence-based heuristic) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function normalizedText(value?: string): string {
  return (value ?? "").toLowerCase();
}

export function complianceChecks(evidence?: ComplianceEvidence): [CheckResult, CheckResult, CheckResult] {
  const privacyHay = normalizedText(evidence?.privacyText);
  const cookieHay = normalizedText(evidence?.cookieText);
  const aiHay = normalizedText(evidence?.aiText);

  // N/A when we couldn't find any policy pages at all, no evidence means we can't score.
  // This avoids penalising sites that simply don't have crawlable policy pages.
  const noPrivacyEvidence = privacyHay.trim().length === 0;
  const noCookieEvidence = cookieHay.trim().length === 0;
  const noAiEvidence = aiHay.trim().length === 0;

  const hasPrivacyAutomationInfo = !noPrivacyEvidence && /automatiserad|automated decision|profilering|profiling|art\.\s*22|artikel\s*22|machine-?made decision/.test(privacyHay);
  // Softer signal: site mentions AI tools by name in privacy policy. Doesn't
  // qualify as Art. 22 awareness, but tells us the site is at least AI-aware.
  // We use this to differentiate the FAIL message: "no AI mention at all" vs
  // "AI tools mentioned but no formal Art. 22 vocabulary".
  const mentionsAiTools = !noPrivacyEvidence && /\b(claude|chatgpt|gpt-?[345]|perplexity|ai-agent|ai agent|ai-verktyg|ai-tj[aä]nst|llm|model context protocol|mcp|anthropic|openai)\b/.test(privacyHay);
  const hasCookieBotHandling = !noCookieEvidence && /bot|crawler|user-agent|icke-m[aä]nsklig|non-human|machine client|agent/.test(cookieHay);
  const hasAiLabelingInfo = !noAiEvidence && /ai-generated|ai generated|syntetisk|watermark|maskinl[aä]sbar m[aä]rkning|article\s*50|art\.\s*50|eu ai act/.test(aiHay);

  return [
    {
      id: 'privacy_automation',
      pass: hasPrivacyAutomationInfo,
      na: noPrivacyEvidence,
      label: noPrivacyEvidence
        ? 'Integritetspolicy: ingen policy-sida hittad (ej bedömd)'
        : hasPrivacyAutomationInfo
          ? 'Integritetspolicy nämner automatiserad behandling'
          : mentionsAiTools
            ? 'AI-verktyg nämns men inga Art. 22-formuleringar'
            : 'Integritetspolicy: ingen tydlig info om automatiserad behandling',
      detail: noPrivacyEvidence
        ? 'Vi hittade ingen publik integritetspolicy att analysera'
        : hasPrivacyAutomationInfo
          ? 'Hittade signaler kopplade till GDPR Art. 22 i publikt material'
          : mentionsAiTools
            ? 'Policy refererar AI-verktyg (Claude / ChatGPT / Perplexity etc.) men saknar formell Art. 22-vokabulär ("automatiserat beslutsfattande", "profilering"). Halvvägs framme, komplettera med GDPR-explicit text om automatiserade beslut och rätt till mänsklig granskning.'
            : 'Ingen tydlig Art. 22/profilering-signal hittad i publikt material',
      category: 'compliance',
      severity: 'critical',
      hardcoded: false,
    },
    {
      id: 'cookie_bot_handling',
      pass: hasCookieBotHandling,
      na: noCookieEvidence,
      label: noCookieEvidence
        ? 'Cookiehantering: ingen policy-sida hittad (ej bedömd)'
        : hasCookieBotHandling
          ? 'Cookiehantering för icke-mänskliga klienter nämns'
          : 'Cookiehantering för icke-mänskliga klienter är oklar',
      detail: noCookieEvidence
        ? 'Vi hittade ingen publik cookiepolicy att analysera'
        : hasCookieBotHandling
          ? 'Hittade bot/user-agent-relaterad signal i publik cookie/policy-text'
          : 'Ingen tydlig bot/crawler-hantering hittad i publikt material',
      category: 'compliance',
      severity: 'important',
      hardcoded: false,
    },
    {
      id: 'ai_content_marking',
      pass: hasAiLabelingInfo,
      na: noAiEvidence,
      label: noAiEvidence
        ? 'AI-märkning: ingen relevant sida hittad (ej bedömd)'
        : hasAiLabelingInfo
          ? 'Signal om märkning/AI-transparens hittad'
          : 'Ingen tydlig AI-märkningssignal hittad',
      detail: noAiEvidence
        ? 'Vi hittade inget publikt material att analysera för AI-märkning'
        : hasAiLabelingInfo
          ? 'Hittade referens till AI-märkning/transparens i publikt material'
          : 'Ingen tydlig Art. 50/maskinläsbar märkningssignal hittad',
      category: 'compliance',
      severity: 'important',
      hardcoded: false,
    },
  ];
}

// â”€â”€ Builder (live probes) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function checkApiExists(probes: ProbeResult[]): CheckResult {
  // 200/429 = confirmed; 401/403 only count if application/json (avoids Next.js auth HTML walls)
  const hit = probes.find(p =>
    p.status === 200 || p.status === 429 ||
    ((p.status === 401 || p.status === 403) && p.contentType?.includes('application/json'))
  );
  let path: string | undefined;
  try { path = hit ? new URL(hit.url).pathname : undefined; } catch { path = undefined; }
  return {
    id: 'api_exists',
    pass: !!hit,
    label: hit
      ? `Publikt API hittat (${path ?? hit.url})`
      : 'Inget publikt API hittat',
    path,
    category: 'builder',
    severity: 'critical',
  };
}

export function checkOpenApiSpec(probes: ProbeResult[]): CheckResult {
  const isHtmlLike = (body: string, contentType: string | null): boolean => {
    const ct = (contentType ?? '').toLowerCase();
    const start = body.trimStart().slice(0, 120).toLowerCase();
    return ct.includes('text/html') || start.startsWith('<!doctype') || start.startsWith('<html');
  };

  const looksLikeSpecDocument = (body: string, contentType: string | null): boolean => {
    const ct = (contentType ?? '').toLowerCase();
    const trimmed = body.trimStart();
    if (/"openapi"\s*:/.test(body) || /"swagger"\s*:/.test(body)) return true;
    if (/^openapi:\s*[0-9.]+/im.test(trimmed) || /^swagger:\s*['"]?2\.0['"]?/im.test(trimmed)) return true;
    if (ct.includes('application/json') || ct.includes('application/yaml') || ct.includes('text/yaml')) {
      return /openapi|swagger/i.test(body);
    }
    return false;
  };

  const hit = probes.find(p => {
    if (p.status !== 200 && p.status !== 429 && p.status !== 401 && p.status !== 403) return false;
    const body = p.body.toLowerCase();
    const hasExplicitSpecPath = (() => {
      try { return OPENAPI_PATHS.has(new URL(p.url).pathname); } catch { return false; }
    })();
    if (hasExplicitSpecPath) {
      // 401/403/429 on a spec path still indicates a real spec endpoint exists.
      if (p.status === 401 || p.status === 403 || p.status === 429) return true;
      // Avoid false positives from HTML catch-all pages behind redirects.
      if (isHtmlLike(p.body, p.contentType)) return looksLikeSpecDocument(p.body, p.contentType);
      return looksLikeSpecDocument(p.body, p.contentType);
    }

    // Redoc/Swagger docs can expose the spec via JS download links instead of direct static paths.
    const isLikelyDocsPage = (() => {
      try {
        const { hostname, pathname } = new URL(p.url);
        const isDocSubdomain = /^(api|developer|docs|dev|apps)\./i.test(hostname);
        return isDocSubdomain || pathname.includes('/apidocs') || pathname.includes('/docs') || pathname.includes('/reference');
      } catch { return false; }
    })();
    if (!isLikelyDocsPage) return false;

    return (
      body.includes('__redoc_state') ||
      body.includes('download openapi specification') ||
      body.includes('download="openapi.json"') ||
      /openapi\.(json|ya?ml)/.test(body) ||
      /swagger\.(json|ya?ml)/.test(body)
    );
  });
  return {
    id: 'openapi_spec',
    pass: !!hit,
    label: hit
      ? 'OpenAPI-spec hittad - agenter kan mappa ditt API'
      : 'Ingen OpenAPI-spec - agenter kan inte mappa ditt API automatiskt',
    category: 'builder',
    severity: 'important',
  };
}

export function checkApiDocs(probes: ProbeResult[]): CheckResult {
  const hit = probes.find(p => {
    // 429 = rate-limited, 401/403 = auth-gated - all mean the page exists
    if (p.status !== 200 && p.status !== 429 && p.status !== 401 && p.status !== 403) return false;
    try {
      const { hostname, pathname } = new URL(p.url);
      // Subdomain-based docs (api.X, developer.X) count even if path is "/"
      const isDocSubdomain = /^(api|developer|docs|dev)\./i.test(hostname);
      if (!isDocSubdomain && !API_DOC_PATHS.has(pathname)) return false;
    } catch { return false; }
    const ct = p.contentType?.toLowerCase() ?? '';
    if (!ct.includes('text/html')) return false;
    const body = p.body.toLowerCase();
    return body.includes('api') || body.includes('documentation') || body.includes('developer') || body.includes('redoc') || body.includes('swagger');
  });
  return {
    id: 'api_docs',
    pass: !!hit,
    label: hit
      ? 'API-dokumentation tillgänglig'
      : 'Ingen API-dokumentation hittad',
    category: 'builder',
    severity: 'info',
  };
}

// â”€â”€ Builder (hardcoded fails) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// MCP check: accept both legacy /.well-known/mcp.json and current
// discovery/card surfaces. Dedicated validators below still check shape.
export function checkMcpServer(
  probes: ProbeResult[],
  discovered?: { mcpWellKnown?: CheckResult; mcpServerCard?: CheckResult },
): CheckResult {
  const discoveredHit = !!(discovered?.mcpWellKnown?.pass || discovered?.mcpServerCard?.pass);
  const hit = probes.find(p => {
    if (p.status !== 200) return false;
    let pathname = "";
    try {
      pathname = new URL(p.url).pathname;
    } catch {
      pathname = p.url;
    }
    if (!["/mcp", "/mcp.json", "/.well-known/mcp", "/.well-known/mcp.json", "/.well-known/mcp/server-card.json"].includes(pathname)) {
      return false;
    }
    const body = p.body.toLowerCase();
    return p.contentType?.includes('application/json') ||
      body.includes('"mcpversion"') ||
      body.includes('"mcp_version"') ||
      body.includes('"serverinfo"') ||
      body.includes('"tools"');
  });
  return {
    id: 'mcp_server',
    pass: discoveredHit || !!hit,
    label: discoveredHit || hit
      ? 'MCP-server hittad - agenter kan koppla in sig direkt'
      : 'Ingen MCP-koppling hittad',
    detail: discoveredHit || hit
      ? undefined
      : 'AI-verktyg som Claude, Cursor och Windsurf använder MCP för att koppla in sig direkt i system. Vi hittade ingen kopplad till den här domänen - det kan innebära att agenter inte kan nå er utan manuell integration.',
    category: 'builder',
    severity: 'important',
    hardcoded: !(discoveredHit || hit),
  };
}

export function checkSandboxAvailable(probes: ProbeResult[]): CheckResult {
  const hit = probes.find(p => {
    if (p.status !== 200 && p.status !== 429 && p.status !== 401 && p.status !== 403) return false;
    const hay = `${p.url}\n${p.body}`.toLowerCase();
    return /sandbox|test.?environment|staging|testbed|playground|test.?compan|demo.?env|testmilj|testbolag|test.?account/.test(hay);
  });
  return {
    id: 'sandbox_available',
    pass: !!hit,
    label: hit ? 'Sandbox/testmiljö identifierad' : 'Ingen sandbox/testmiljö identifierad',
    detail: hit
      ? 'Testmiljö nämns i API-dokumentation eller relaterad utvecklar-sida'
      : 'Builders behöver testa utan att påverka produktionsdata',
    category: 'builder',
    severity: 'info',
    hardcoded: false,
  };
}

// ── Stage 1, P0 checks (G-01..G-06) ─────────────────────────────────────────
// Per docs/strategy/research/02-agent-readiness-scoring-2026.md § 2.6.
// These bring us to feature parity with Cloudflare's isitagentready.com.

/** G-01: /llms-full.txt, single-URL full Markdown context for agents. */
export function checkLlmsFullTxt(probe: { status: number; body: string; contentType: string | null } | null): CheckResult {
  const contentType = probe?.contentType?.toLowerCase() ?? "";
  const isHtml = contentType.includes("text/html") ||
    probe?.body.trimStart().startsWith("<!DOCTYPE") ||
    probe?.body.trimStart().startsWith("<html");
  const valid = probe?.status === 200 &&
    !isHtml &&
    probe.body.length > 1000 &&
    /^#\s/m.test(probe.body);
  return {
    id: 'llms_full_txt',
    pass: !!valid,
    label: valid
      ? 'llms-full.txt finns, agenter får komplett kontext'
      : 'Ingen llms-full.txt, agenter saknar djupkontext',
    detail: valid ? undefined : 'llms-full.txt är komplementet till llms.txt, komplett Markdown-konkatenering av sajten i en URL. Anthropic, Cloudflare och Stripe har alla redan implementerat detta.',
    category: 'discovery',
    severity: 'important',
  };
}

/**
 * G-02: Markdown content negotiation. Server returns text/markdown when
 * Accept: text/markdown is sent. Cloudflare measured 80% token reduction;
 * Vercel saw 500 KB → 2 KB. Claude Code, Cursor and OpenCode send this
 * header by default in 2026.
 */
export function checkMarkdownNegotiation(probe: { status: number; body: string; contentType: string | null } | null): CheckResult {
  const ct = probe?.contentType?.toLowerCase() ?? "";
  const valid = probe?.status === 200 &&
    ct.includes("text/markdown") &&
    !ct.includes("text/html");
  return {
    id: 'markdown_negotiation',
    pass: !!valid,
    label: valid
      ? 'Markdown content negotiation aktiv'
      : 'Ingen Markdown content negotiation, agenter får full HTML',
    detail: valid ? undefined : 'Servera text/markdown när klienten skickar Accept: text/markdown. Reducerar context-konsumtion ~80% för Claude Code, Cursor, OpenCode.',
    category: 'discovery',
    severity: 'important',
  };
}

/**
 * G-03: Server-side rendering. Critical content must appear in raw HTML
 * without JavaScript execution. GPTBot, ClaudeBot, PerplexityBot do NOT
 * run JS, a SPA that renders client-side is invisible to AI crawlers.
 *
 * Detection strategy: strip scripts/styles/tags from the response body
 * and measure how much actual user-visible text remains. A real
 * server-rendered landing page has thousands of stripped characters; a
 * SPA shell (`<div id="root"></div><script src="bundle.js">`) has under
 * a few hundred.
 *
 * Why not require <h1>: many design-forward landing pages style their
 * hero heading as <div> + CSS (e.g. headless.design). The h1 absence
 * is a SEO/accessibility concern, not a SSR concern, and we shouldn't
 * conflate them.
 */
const SSR_TEXT_THRESHOLD = 500;

function stripHtmlForTextCount(body: string): string {
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkSsrContent(probe: { status: number; body: string; contentType: string | null } | null): CheckResult {
  if (!probe || probe.status !== 200) {
    return {
      id: 'ssr_content',
      pass: false,
      label: 'SSR-check ej körd, kunde inte hämta sidan',
      category: 'discovery',
      severity: 'critical',
    };
  }
  const body = probe.body;
  const hasTitle = /<title[^>]*>\s*\S[\s\S]*?<\/title>/i.test(body);
  const text = stripHtmlForTextCount(body);
  const textLength = text.length;
  const hasContent = textLength >= SSR_TEXT_THRESHOLD;
  const valid = hasTitle && hasContent;

  if (valid) {
    return {
      id: 'ssr_content',
      pass: true,
      label: `Innehåll renderas server-side, agenter ser ${textLength.toLocaleString('sv-SE')} tecken`,
      category: 'discovery',
      severity: 'critical',
    };
  }
  // Differentiate the failure mode: missing title vs SPA shell
  const reason = !hasTitle
    ? 'Saknar <title>-element i HTML.'
    : `Bara ${textLength} tecken text i HTML, sannolikt en SPA-shell som renderar med JavaScript.`;
  return {
    id: 'ssr_content',
    pass: false,
    label: 'JS-render krävs, AI-crawlers ser tom sida',
    detail: `${reason} GPTBot/ClaudeBot/PerplexityBot kör inte JavaScript.`,
    category: 'discovery',
    severity: 'critical',
  };
}

/**
 * G-04: Actual AI-crawler access. robots.txt allow-rules are necessary
 * but not sufficient, WAFs (Cloudflare/Akamai/Fastly) often block AI
 * User-Agents at the edge regardless of robots.txt. We probe with the
 * actual User-Agent strings to verify reality matches policy.
 */
export interface CrawlerAccessProbes {
  claudebot: { status: number } | null;
  gptbot: { status: number } | null;
  perplexitybot: { status: number } | null;
}

export function checkCrawlerAccess(probes: CrawlerAccessProbes): CheckResult {
  const accessible = (p: { status: number } | null) => p?.status === 200 || p?.status === 429;
  const claude = accessible(probes.claudebot);
  const gpt = accessible(probes.gptbot);
  const perplexity = accessible(probes.perplexitybot);
  const allOk = claude && gpt && perplexity;
  const someOk = claude || gpt || perplexity;
  const blocked: string[] = [];
  if (!claude) blocked.push('ClaudeBot');
  if (!gpt) blocked.push('GPTBot');
  if (!perplexity) blocked.push('PerplexityBot');
  return {
    id: 'crawler_access',
    pass: allOk,
    label: allOk
      ? 'AI-crawlers kommer in, robots.txt + WAF samarbetar'
      : someOk
        ? `WAF blockerar några crawlers: ${blocked.join(', ')}`
        : 'WAF blockerar alla AI-crawlers, robots.txt-regler ignoreras',
    detail: allOk
      ? undefined
      : 'Vanligaste produktionsfelet 2026: robots.txt säger Allow men Cloudflare/Akamai-regel blockerar User-Agent. Verifiera WAF-konfigen.',
    category: 'discovery',
    severity: 'critical',
  };
}

/**
 * G-05: /.well-known/mcp (SEP-1960 Discovery Manifest). Lets MCP clients
 * (Claude Desktop, ChatGPT, Cursor) auto-configure when given just the
 * domain.
 */
export function checkMcpWellKnown(probe: { status: number; body: string; contentType: string | null } | null): CheckResult {
  if (!probe || probe.status !== 200) {
    return {
      id: 'mcp_well_known',
      pass: false,
      label: 'Ingen /.well-known/mcp, MCP-klienter kan inte auto-konfigurera',
      detail: 'SEP-1960 discovery manifest. Cloudflare implementerade detta i sin egen scanner april 2026.',
      category: 'builder',
      severity: 'info',
      recommendation: true,
    };
  }
  let json: unknown;
  try {
    json = JSON.parse(probe.body);
  } catch {
    return {
      id: 'mcp_well_known',
      pass: false,
      label: '/.well-known/mcp returnerar ogiltig JSON',
      category: 'builder',
      severity: 'info',
    };
  }
  const obj = json as Record<string, unknown>;
  const valid = typeof obj.mcp_version === 'string' && Array.isArray(obj.endpoints);
  return {
    id: 'mcp_well_known',
    pass: valid,
    label: valid
      ? '/.well-known/mcp publicerad, MCP-klienter kan auto-konfigurera'
      : '/.well-known/mcp finns men saknar mcp_version / endpoints',
    category: 'builder',
    severity: 'info',
    recommendation: !valid,
  };
}

/**
 * G-06: /.well-known/mcp/server-card.json (SEP-1649 Server Cards). Rich
 * server metadata (capabilities, tools, transport) for discovery.
 */
export function checkMcpServerCard(probe: { status: number; body: string; contentType: string | null } | null): CheckResult {
  if (!probe || probe.status !== 200) {
    return {
      id: 'mcp_server_card',
      pass: false,
      label: 'Inget MCP server-card, capabilities ej discoverable',
      detail: 'SEP-1649 server-card.json beskriver kapabiliteter + transport för agenter som vill förstå servern innan de ansluter.',
      category: 'builder',
      severity: 'info',
      recommendation: true,
    };
  }
  let json: unknown;
  try {
    json = JSON.parse(probe.body);
  } catch {
    return {
      id: 'mcp_server_card',
      pass: false,
      label: 'server-card.json returnerar ogiltig JSON',
      category: 'builder',
      severity: 'info',
    };
  }
  const obj = json as Record<string, unknown>;
  const serverInfo = obj.serverInfo as Record<string, unknown> | undefined;
  const transport = obj.transport as Record<string, unknown> | undefined;
  const valid = !!(serverInfo?.name && transport?.type);
  return {
    id: 'mcp_server_card',
    pass: valid,
    label: valid
      ? 'MCP server-card publicerad, agenter ser kapabiliteter'
      : 'server-card.json saknar serverInfo.name eller transport.type',
    category: 'builder',
    severity: 'info',
    recommendation: !valid,
  };
}

// ── Badge and score ──────────────────────────────────────────────────────────

export function calculateBadge(checks: AllChecks): { badge: ScanBadge; score: number; total: number } {
  // Exclude N/A (not applicable) and recommendation-only checks from scored denominator.
  const applicable = Object.values(checks).filter(c => !c.na && !c.recommendation);
  const score = applicable.filter(c => c.pass).length;
  const total = applicable.length;
  // Proportional thresholds matching original 8/11 and 4/11 cutoffs.
  const pct = total > 0 ? score / total : 0;
  const badge: ScanBadge = pct >= 8 / 11 ? 'green' : pct >= 4 / 11 ? 'yellow' : 'red';
  return { badge, score, total };
}

// â”€â”€ Severity counts (failing checks only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function computeSeverityCounts(checks: AllChecks): { critical: number; important: number; info: number } {
  // N/A and recommendation-only checks are excluded, not actionable failures.
  const failing = Object.values(checks).filter(c => !c.pass && !c.na && !c.recommendation);
  return {
    critical: failing.filter(c => c.severity === 'critical').length,
    important: failing.filter(c => c.severity === 'important').length,
    info: failing.filter(c => c.severity === 'info').length,
  };
}

// â”€â”€ Top recommendations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const RECOMMENDATION_MAP: Record<CheckId, string> = {
  llms_txt: 'Lägg till /llms.txt som beskriver ditt API och dina tjänster för AI-agenter.',
  llms_full_txt: 'Lägg till /llms-full.txt, komplett Markdown-konkatenering av sajten i en URL. Anthropic, Cloudflare och Stripe har redan implementerat det.',
  markdown_negotiation: 'Servera text/markdown när Accept: text/markdown skickas. Reducerar AI-context ~80%.',
  ssr_content: 'Rendera kritiskt innehåll server-side. AI-crawlers kör inte JavaScript, utan SSR är sajten osynlig.',
  crawler_access: 'Verifiera WAF-config, robots.txt säger Allow men Cloudflare/Akamai-regel kan blockera User-Agent. Vanligaste produktionsfelet 2026.',
  privacy_automation: 'Uppdatera integritetspolicyn med info om automatiserad behandling (GDPR Art. 22).',
  mcp_server:
    'Vi hittade ingen MCP-koppling, agenter når er inte direkt utan manuell integration. Vill ni bolla nästa steg? Boka möte 15 min om ni vill.',
  mcp_well_known: 'Publicera /.well-known/mcp (SEP-1960) så MCP-klienter (Claude, ChatGPT, Cursor) kan auto-konfigurera.',
  mcp_server_card: 'Publicera /.well-known/mcp/server-card.json (SEP-1649) så agenter kan se kapabiliteter innan de ansluter.',
  openapi_spec: 'Publicera en OpenAPI-spec så agenter och builders kan mappa ditt API automatiskt.',
  api_exists: 'Skapa ett publikt API - utan det kan ingen agent interagera med ditt system.',
  cookie_bot_handling: 'Se över hur din cookielösning hanterar icke-mänskliga besökare.',
  ai_content_marking: 'Förbered för EU AI Act - märk AI-genererat innehåll maskinläsbart (Art. 50).',
  sandbox_available: 'Erbjud en sandbox/testmiljö så builders kan testa utan att påverka produktionsdata.',
  robots_ok: 'Se till att robots.txt inte blockerar AI-agenter som GPTBot och ClaudeBot.',
  sitemap_exists: 'Lägg till sitemap.xml så agenter kan navigera din sajt.',
  api_docs: 'Publicera API-dokumentation - utan docs kan ingen bygga mot ditt system.',
};

const RECOMMENDATION_PRIORITY: CheckId[] = [
  // Critical first, content invisibility blockers
  'ssr_content', 'crawler_access',
  // Then context-quality (Markdown nego + llms.txt + spec)
  'markdown_negotiation', 'llms_txt', 'llms_full_txt', 'openapi_spec',
  // Compliance + governance
  'privacy_automation', 'ai_content_marking',
  // Builder surface
  'mcp_server', 'api_exists', 'mcp_well_known', 'mcp_server_card',
  'cookie_bot_handling', 'sandbox_available',
  // Foundation
  'robots_ok', 'sitemap_exists', 'api_docs',
];

export function getTopRecommendations(checks: AllChecks, count = 3): string[] {
  return RECOMMENDATION_PRIORITY
    .filter(id => !checks[id].pass && !checks[id].na && !checks[id].recommendation)
    .slice(0, count)
    .map(id => RECOMMENDATION_MAP[id]);
}

// Fixed display order for Zeigarnik checklist
export const CHECK_DISPLAY_ORDER: CheckId[] = [
  // Discovery, can agents find + read the site?
  'robots_ok', 'crawler_access', 'sitemap_exists', 'llms_txt', 'llms_full_txt',
  'markdown_negotiation', 'ssr_content',
  // Compliance, does it meet EU regulatory requirements?
  'privacy_automation', 'cookie_bot_handling', 'ai_content_marking',
  // Builder, can devs/agents build against it?
  'api_exists', 'openapi_spec', 'api_docs',
  'mcp_server', 'mcp_well_known', 'mcp_server_card',
  'sandbox_available',
];


