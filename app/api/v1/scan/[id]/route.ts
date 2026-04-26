// app/api/v1/scan/[id]/route.ts
//
// Look up a previously-submitted scan by its UUID. Auth required (any
// valid API key — scans are not key-scoped because the same scan should
// be addressable from any consumer that has the URL, e.g. a webhook
// recipient downstream).
//
// ETag support: we hash {scan_id, scanned_at} so polling clients (Stage
// 2B async pattern) can `If-None-Match` and get 304s.
//
// 404 if not found, 401 if no key, 200 with full ScanResult shape on hit.

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { authenticate } from "@/lib/api-auth";
import type { AllChecks } from "@/lib/checks";
import { computeSeverityCounts } from "@/lib/checks";

interface ScanRow {
  id: string;
  domain: string;
  badge: "green" | "yellow" | "red";
  checks_passed: number;
  checks_total: number;
  checks_json: AllChecks;
  claude_summary: string | null;
  recommendations: unknown;
  scanned_at: string;
}

function errorResponse(status: number, code: string, message: string): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function makeEtag(scan: Pick<ScanRow, "id" | "scanned_at">): string {
  return `"${createHash("sha256").update(`${scan.id}:${scan.scanned_at}`).digest("hex").slice(0, 16)}"`;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticate(req);
  if (!auth.ok) return errorResponse(auth.status, auth.code, auth.error);

  const { id } = await ctx.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return errorResponse(400, "invalid_id", "Scan ID must be a UUID.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return errorResponse(500, "server_error", "API not configured");

  try {
    const res = await fetch(
      `${url}/rest/v1/scan_submissions?id=eq.${encodeURIComponent(id)}&select=id,domain,badge,checks_passed,checks_total,checks_json,claude_summary,recommendations,scanned_at&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(3_000),
      },
    );
    if (!res.ok) return errorResponse(500, "server_error", "Database lookup failed");
    const rows = await res.json() as ScanRow[];
    const row = rows[0];
    if (!row) return errorResponse(404, "not_found", `No scan with id ${id}`);

    const etag = makeEtag(row);
    if (req.headers.get("if-none-match") === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } });
    }

    const recommendations: string[] = Array.isArray(row.recommendations)
      ? row.recommendations.filter((r): r is string => typeof r === "string")
      : [];

    return NextResponse.json(
      {
        scan_id: row.id,
        domain: row.domain,
        badge: row.badge,
        score: row.checks_passed,
        checks_total: row.checks_total,
        checks: row.checks_json,
        summary: row.claude_summary ?? "",
        recommendations,
        severity_counts: computeSeverityCounts(row.checks_json),
        scanned_at: row.scanned_at,
        ai_disclosure: row.claude_summary
          ? { ai_generated: true, model: "anthropic/claude-sonnet-4-5", fields: ["summary"] }
          : { ai_generated: false },
      },
      {
        status: 200,
        headers: {
          ETag: etag,
          "Cache-Control": "private, max-age=60",
          "X-API-Key-Prefix": auth.key.prefix,
        },
      },
    );
  } catch {
    return errorResponse(500, "server_error", "Database lookup timed out");
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, If-None-Match",
      "Access-Control-Max-Age": "86400",
    },
  });
}
