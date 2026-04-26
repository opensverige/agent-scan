// app/api/stats/route.ts
//
// Returns aggregate scan counts for the live counter.
// - total: total scans ever
// - last24h: scans in the last 24 hours
//
// Reads Content-Range headers from Supabase REST `Prefer: count=exact`
// requests. Returns null fields when Supabase isn't configured so the
// client can hide the counter cleanly.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Cache the response for 60s on the edge so the counter doesn't hammer
// the database. Client polls at the same cadence.
export const revalidate = 60;

interface StatsResponse {
  total: number | null;
  last24h: number | null;
}

function parseContentRangeTotal(header: string | null): number | null {
  if (!header) return null;
  // Format: "0-9/247" or "*/247"
  const match = header.match(/\/(\d+)$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}

async function countRows(url: string, key: string, query: string): Promise<number | null> {
  try {
    const res = await fetch(`${url}/rest/v1/scan_submissions?${query}`, {
      method: "HEAD",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      },
      signal: AbortSignal.timeout(3_000),
      // Important: use Next.js fetch caching at this layer.
      next: { revalidate: 60 },
    });
    if (!res.ok && res.status !== 206) return null;
    return parseContentRangeTotal(res.headers.get("content-range"));
  } catch {
    return null;
  }
}

export async function GET(): Promise<NextResponse<StatsResponse>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ total: null, last24h: null });
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [total, last24h] = await Promise.all([
    countRows(url, key, "select=id"),
    countRows(url, key, `select=id&scanned_at=gte.${since24h}`),
  ]);

  return NextResponse.json({ total, last24h });
}
