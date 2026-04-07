// lib/checks.ts

export type CheckId =
  | 'robots_ok' | 'sitemap_exists' | 'llms_txt'
  | 'privacy_automation' | 'cookie_bot_handling' | 'ai_content_marking'
  | 'api_exists' | 'openapi_spec' | 'api_docs'
  | 'mcp_server' | 'sandbox_available';

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

  // N/A when we couldn't find any policy pages at all — no evidence means we can't score.
  // This avoids penalising sites that simply don't have crawlable policy pages.
  const noPrivacyEvidence = privacyHay.trim().length === 0;
  const noCookieEvidence = cookieHay.trim().length === 0;
  const noAiEvidence = aiHay.trim().length === 0;

  const hasPrivacyAutomationInfo = !noPrivacyEvidence && /automatiserad|automated decision|profilering|profiling|art\.\s*22|artikel\s*22|machine-?made decision/.test(privacyHay);
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
          : 'Integritetspolicy: ingen tydlig info om automatiserad behandling',
      detail: noPrivacyEvidence
        ? 'Vi hittade ingen publik integritetspolicy att analysera'
        : hasPrivacyAutomationInfo
          ? 'Hittade signaler kopplade till GDPR Art. 22 i publikt material'
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

// MCP check: probe .well-known/mcp.json - if found, real MCP server exists.
// Falls back to hardcoded fail if not found (most companies don't have MCP yet).
export function checkMcpServer(probes: ProbeResult[]): CheckResult {
  const hit = probes.find(p =>
    p.status === 200 &&
    (p.url.includes('/.well-known/mcp') || p.url.includes('/mcp.json')) &&
    (p.contentType?.includes('application/json') || p.body.includes('"mcpVersion"') || p.body.includes('"tools"'))
  );
  return {
    id: 'mcp_server',
    pass: !!hit,
    label: hit
      ? 'MCP-server hittad - agenter kan koppla in sig direkt'
      : 'Ingen MCP-koppling hittad',
    detail: hit
      ? undefined
      : 'AI-verktyg som Claude, Cursor och Windsurf använder MCP för att koppla in sig direkt i system. Vi hittade ingen kopplad till den här domänen - det kan innebära att agenter inte kan nå er utan manuell integration.',
    category: 'builder',
    severity: 'important',
    hardcoded: !hit,
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

// â”€â”€ Badge and score â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  // N/A and recommendation-only checks are excluded — not actionable failures.
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
  privacy_automation: 'Uppdatera integritetspolicyn med info om automatiserad behandling (GDPR Art. 22).',
  mcp_server:
    'Vi hittade ingen MCP-koppling — agenter når er inte direkt utan manuell integration. Vill ni bolla nästa steg? Boka möte 15 min om ni vill.',
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
  'llms_txt', 'privacy_automation', 'mcp_server', 'openapi_spec',
  'api_exists', 'cookie_bot_handling', 'ai_content_marking',
  'sandbox_available', 'robots_ok', 'sitemap_exists', 'api_docs',
];

export function getTopRecommendations(checks: AllChecks, count = 3): string[] {
  return RECOMMENDATION_PRIORITY
    .filter(id => !checks[id].pass && !checks[id].na && !checks[id].recommendation)
    .slice(0, count)
    .map(id => RECOMMENDATION_MAP[id]);
}

// Fixed display order for Zeigarnik checklist
export const CHECK_DISPLAY_ORDER: CheckId[] = [
  'robots_ok', 'sitemap_exists', 'llms_txt',
  'privacy_automation', 'cookie_bot_handling', 'ai_content_marking',
  'api_exists', 'openapi_spec', 'api_docs', 'mcp_server', 'sandbox_available',
];


