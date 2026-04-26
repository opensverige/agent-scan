// lib/scan/discovery.ts
//
// Multi-signal developer-portal discovery for the scanner.
// Pipeline: npm → GitHub repos → llms.txt subdomain probes → Exa (paid).
// All free signals race in parallel; Exa runs simultaneously when key is set.
// Returns the first confident developer portal URL found, or null.
//
// Also includes APIs.guru lookup (free OpenAPI spec database) and an
// informational MCP-on-GitHub search used to surface "possible MCP server"
// hints when the official check fails.

import type { McpGithubHint } from "@/lib/scan-types";

const SCANNER_UA = "OpenSverige-Scanner/1.0";

// ── apis.guru — free OpenAPI spec lookup ─────────────────────────────────────

export async function fetchApisGuruSpec(domain: string): Promise<string | null> {
  try {
    const listRes = await fetch(`https://api.apis.guru/v2/${domain}.json`, {
      headers: { "User-Agent": SCANNER_UA },
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
      headers: { "User-Agent": SCANNER_UA },
      signal: AbortSignal.timeout(5_000),
    });
    if (!specRes.ok) return null;
    return (await specRes.text()).slice(0, 100_000);
  } catch {
    return null;
  }
}

// ── MCP GitHub discovery (informational) ─────────────────────────────────────
// Searches GitHub for repos mentioning the company + MCP. Purely informational —
// does NOT affect the mcp_server check score.

export async function discoverMcpOnGitHub(companyName: string): Promise<McpGithubHint | null> {
  try {
    const companyToken = companyName.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const q = encodeURIComponent(`"${companyName}" mcp (server OR "model context protocol")`);
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=8`,
      {
        headers: { "User-Agent": SCANNER_UA, "Accept": "application/vnd.github.v3+json" },
        signal: AbortSignal.timeout(4_000),
      },
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
  } catch {
    return null;
  }
}

// ── Multi-signal portal discovery ────────────────────────────────────────────

export interface DiscoveredPortal {
  url: string;
  content?: string;
}

function isLikelyDevPortal(url: string, baseDomain: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    const stripped = baseDomain.replace(/^www\./, "");
    if (!hostname.endsWith(stripped)) return false;
    if (/^(developer|api|docs|dev|apidocs|reference)\./i.test(hostname)) return true;
    if (/\/(developer|api\/|docs\/|reference|apidocs)/i.test(pathname)) return true;
    return false;
  } catch {
    return false;
  }
}

async function discoverFromNpm(domain: string, companyName: string): Promise<string | null> {
  const res = await fetch(
    `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(companyName)}+api&size=5`,
    { headers: { "User-Agent": SCANNER_UA }, signal: AbortSignal.timeout(3_000) },
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
  const headers = { "User-Agent": SCANNER_UA, "Accept": "application/vnd.github.v3+json" };
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
      const r = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
        headers, signal: AbortSignal.timeout(3_000),
      });
      if (!r.ok) continue;
      const { content, encoding } = await r.json() as { content?: string; encoding?: string };
      if (!content || encoding !== "base64") continue;
      const text = Buffer.from(content, "base64").toString("utf-8");
      const urls = text.match(/https?:\/\/[^\s\)\"\'>\]]+/g) ?? [];
      const hit = urls.find(u => isLikelyDevPortal(u, domain));
      if (hit) return hit;
    } catch {
      continue;
    }
  }
  return null;
}

async function discoverFromLlmsTxt(domain: string): Promise<string | null> {
  const subdomains = ["developer", "api", "docs", "dev"];
  const results = await Promise.all(
    subdomains.map(async sub => {
      const base = `https://${sub}.${domain}`;
      const r = await fetch(`${base}/llms.txt`, {
        headers: { "User-Agent": SCANNER_UA },
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
): Promise<DiscoveredPortal | null> {
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

/**
 * Race multiple discovery signals — first hit wins.
 * Free signals (npm, GitHub, llms.txt) always run; Exa joins when key is set.
 */
export async function discoverApiPortalUrl(domain: string): Promise<DiscoveredPortal | null> {
  const companyName = domain.split(".")[0];
  const exaKey = process.env.EXA_API_KEY;

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
