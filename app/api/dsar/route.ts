// app/api/dsar/route.ts
//
// Data Subject Access Request submission endpoint.
//
// POST { request_type, contact_email, contact_name?, domain?, description }
//
// Per GDPR Art. 12(3) we must respond within 30 days. Each request is
// inserted with an automatic deadline_at = now() + 30 days. The internal
// dashboard (Stage 5) will list overdue requests.
//
// Rate-limited per IP-hash to prevent abuse — a malicious actor can't
// flood our queue. Public endpoint, no auth required (subjects don't
// have accounts on our service).

import { NextRequest, NextResponse } from "next/server";
import { getIpHash } from "@/lib/ip-hash";

const VALID_TYPES = [
  "access", "rectification", "erasure", "restriction",
  "portability", "objection", "automated",
] as const;
type RequestType = typeof VALID_TYPES[number];

function isValidType(value: unknown): value is RequestType {
  return typeof value === "string" && (VALID_TYPES as readonly string[]).includes(value);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface DsarBody {
  request_type?: unknown;
  contact_email?: unknown;
  contact_name?: unknown;
  domain?: unknown;
  description?: unknown;
}

function errorResponse(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Per-IP rate limit: max 3 DSAR submissions per hour from same hash. */
async function checkDsarRateLimit(supabaseUrl: string, supabaseKey: string, ipHash: string): Promise<boolean> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const res = await fetch(
      `${supabaseUrl}/rest/v1/dsar_requests?select=id&submitter_ip_hash=eq.${ipHash}&received_at=gte.${oneHourAgo}&limit=4`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        signal: AbortSignal.timeout(3_000),
      },
    );
    if (!res.ok) return true; // fail-open, log later
    const rows = await res.json() as unknown[];
    return rows.length < 3;
  } catch {
    return true;
  }
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return errorResponse(500, "server_error", "DSAR endpoint not configured");
  }

  let body: DsarBody;
  try {
    body = (await req.json()) as DsarBody;
  } catch {
    return errorResponse(400, "invalid_json", "Request body must be valid JSON.");
  }

  if (!isValidType(body.request_type)) {
    return errorResponse(400, "invalid_request_type", `request_type must be one of: ${VALID_TYPES.join(", ")}`);
  }
  const email = typeof body.contact_email === "string" ? body.contact_email.trim() : "";
  if (!EMAIL_REGEX.test(email)) {
    return errorResponse(400, "invalid_email", "contact_email must be a valid email address.");
  }
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length < 10 || description.length > 5_000) {
    return errorResponse(400, "invalid_description", "description must be 10-5000 chars.");
  }
  const contactName = typeof body.contact_name === "string" ? body.contact_name.trim().slice(0, 200) : null;
  const domain = typeof body.domain === "string" ? body.domain.trim().toLowerCase().slice(0, 253) : null;

  const ipHash = getIpHash(req);

  const allowed = await checkDsarRateLimit(supabaseUrl, supabaseKey, ipHash);
  if (!allowed) {
    return errorResponse(429, "rate_limited", "Too many DSAR submissions from this network. Email info@opensverige.se directly.");
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/dsar_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        request_type: body.request_type,
        contact_email: email,
        contact_name: contactName,
        domain,
        description,
        submitter_ip_hash: ipHash,
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) {
      return errorResponse(500, "server_error", "Failed to record DSAR request");
    }
    const rows = await res.json() as Array<{ id: string; received_at: string; deadline_at: string }>;
    const row = rows[0];
    return NextResponse.json(
      {
        ok: true,
        id: row.id,
        received_at: row.received_at,
        deadline_at: row.deadline_at,
        message:
          "Your request has been recorded. We'll respond within 30 days per GDPR Art. 12(3). " +
          "Reference this id when you contact info@opensverige.se: " + row.id,
      },
      { status: 201 },
    );
  } catch {
    return errorResponse(500, "server_error", "Failed to record DSAR request");
  }
}
