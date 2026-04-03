// app/api/results/[domain]/route.ts
// Machine-readable scan results endpoint — designed for AI tools, agents, and builders.
// GET /api/results/fortnox.se        → JSON
// GET /api/results/fortnox.se?format=text  → Markdown
// GET /api/results/fortnox.se        with Accept: text/plain → Markdown
import { NextRequest } from "next/server";
import type { AllChecks } from "@/lib/checks";
import { computeSeverityCounts } from "@/lib/checks";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

const SITE = "https://agent.opensverige.se";

interface ScanRow {
  badge: string;
  checks_passed: number;
  checks_json: AllChecks;
  claude_summary: string | null;
  recommendations: string | null;
  scanned_at: string | null;
}

async function fetchLatestScan(domain: string): Promise<ScanRow | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const res = await fetch(
    `${url}/rest/v1/scan_submissions?domain=eq.${encodeURIComponent(domain)}&order=scanned_at.desc&limit=1&select=badge,checks_passed,checks_json,claude_summary,recommendations,scanned_at`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    }
  );
  if (!res.ok) return null;
  const rows = await res.json() as ScanRow[];
  return rows[0] ?? null;
}

function badgeLabel(badge: string): string {
  if (badge === "green") return "REDO";
  if (badge === "yellow") return "DELVIS REDO";
  return "INTE REDO";
}

function checkLine(pass: boolean, label: string): string {
  return `${pass ? "✓" : "✗"} ${label}`;
}

function toMarkdown(domain: string, row: ScanRow): string {
  const c = row.checks_json;
  const sc = computeSeverityCounts(c);
  const recs: string[] = Array.isArray(row.recommendations) ? row.recommendations : [];

  const discoveryPassed = [c.robots_ok, c.sitemap_exists, c.llms_txt].filter(x => x.pass).length;
  const compliancePassed = [c.privacy_automation, c.cookie_bot_handling, c.ai_content_marking].filter(x => x.pass).length;
  const builderPassed = [c.api_exists, c.openapi_spec, c.api_docs, c.mcp_server, c.sandbox_available].filter(x => x.pass).length;
  const dateStr = row.scanned_at ? row.scanned_at.slice(0, 10) : "unknown";

  const sections: string[] = [
    `# AI Readiness: ${domain}`,
    "",
    `Score: ${row.checks_passed}/11 — ${badgeLabel(row.badge)}`,
    `Scanned: ${dateStr}`,
    `Issues: ${sc.critical} critical, ${sc.important} important`,
    "",
    `## Discovery (${discoveryPassed}/3)`,
    checkLine(c.robots_ok.pass, c.robots_ok.label),
    checkLine(c.sitemap_exists.pass, c.sitemap_exists.label),
    checkLine(c.llms_txt.pass, c.llms_txt.label),
    "",
    `## Compliance (${compliancePassed}/3)`,
    checkLine(c.privacy_automation.pass, c.privacy_automation.label),
    checkLine(c.cookie_bot_handling.pass, c.cookie_bot_handling.label),
    checkLine(c.ai_content_marking.pass, c.ai_content_marking.label),
    "",
    `## Builder (${builderPassed}/5)`,
    checkLine(c.api_exists.pass, c.api_exists.label),
    checkLine(c.openapi_spec.pass, c.openapi_spec.label),
    checkLine(c.api_docs.pass, c.api_docs.label),
    checkLine(c.mcp_server.pass, c.mcp_server.label),
    checkLine(c.sandbox_available.pass, c.sandbox_available.label),
  ];

  if (recs.length > 0) {
    sections.push("", "## Top Recommendations");
    recs.forEach((r, i) => sections.push(`${i + 1}. ${r}`));
  }

  if (row.claude_summary) {
    sections.push("", "## AI Analysis", row.claude_summary);
  }

  sections.push(
    "",
    "---",
    `Scan page: ${SITE}/scan/${domain}`,
    `Raw JSON:  ${SITE}/api/results/${domain}`,
    `New scan:  ${SITE}/scan?domain=${domain}`,
  );

  return sections.join("\n");
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain: rawDomain } = await params;
  const domain = rawDomain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  const row = await fetchLatestScan(domain);

  if (!row) {
    const body = {
      error: "No scan found for this domain.",
      domain,
      hint: "Run a scan first.",
      scan_url: `${SITE}/scan/${domain}`,
    };
    const accept = req.headers.get("accept") ?? "";
    const format = new URL(req.url).searchParams.get("format");
    if (format === "text" || accept.includes("text/plain") || accept.includes("text/markdown")) {
      return new Response(
        `# AI Readiness: ${domain}\n\nNo scan found.\n\nRun a scan: ${SITE}/scan/${domain}\n`,
        { status: 404, headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } }
      );
    }
    return Response.json(body, { status: 404, headers: CORS });
  }

  const accept = req.headers.get("accept") ?? "";
  const format = new URL(req.url).searchParams.get("format");
  const wantsText = format === "text" || accept.includes("text/plain") || accept.includes("text/markdown");

  if (wantsText) {
    return new Response(toMarkdown(domain, row), {
      headers: {
        ...CORS,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  const recs: string[] = Array.isArray(row.recommendations) ? row.recommendations : [];

  return Response.json(
    {
      domain,
      scanned_at: row.scanned_at,
      badge: row.badge,
      badge_label: badgeLabel(row.badge),
      score: row.checks_passed,
      max: 11,
      severity: computeSeverityCounts(row.checks_json),
      checks: row.checks_json,
      summary: row.claude_summary,
      recommendations: recs,
      _links: {
        scan_page: `${SITE}/scan/${domain}`,
        raw_text: `${SITE}/api/results/${domain}?format=text`,
        new_scan: `${SITE}/scan?domain=${domain}`,
      },
    },
    {
      status: 200,
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
