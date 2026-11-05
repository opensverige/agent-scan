// app/api/synlighet/lead/route.ts
//
// Lead capture for the AI-visibility check. Unlike the old /api/notify this
// reports failure: if neither Supabase nor the webhook accepted the lead the
// visitor is told, instead of a silent "ok" that loses the address.

import type { NextRequest } from "next/server";
import { getIpHash } from "@/lib/ip-hash";
import { verifyPlanToken } from "@/lib/visibility/token";
import { saveLead } from "@/lib/visibility/store";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const recent = new Map<string, number[]>();

function allow(ipHash: string): boolean {
  const now = Date.now();
  const list = (recent.get(ipHash) ?? []).filter(t => now - t < 60 * 60_000);
  if (list.length >= 5) return false;
  list.push(now);
  recent.set(ipHash, list);
  return true;
}

export async function POST(req: NextRequest) {
  let body: {
    email?: unknown;
    token?: unknown;
    consent?: unknown;
    wantsMonitoring?: unknown;
    wantsCall?: unknown;
    resultLine?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return Response.json({ error: "Kontrollera e-postadressen." }, { status: 400 });
  }
  if (body.consent !== true) {
    return Response.json({ error: "Kryssa i att vi får spara adressen." }, { status: 400 });
  }

  // Only someone who just ran a check can leave an address for it.
  const verified = verifyPlanToken(body.token);
  if (!verified) {
    return Response.json({ error: "Kollen har gått ut. Kör den igen och fyll i formuläret direkt efter." }, { status: 401 });
  }
  const domain = verified.domain;

  const ipHash = getIpHash(req);
  if (!allow(ipHash)) {
    return Response.json({ error: "För många försök. Försök igen om en stund." }, { status: 429 });
  }

  const ok = await saveLead({
    email,
    domain,
    company: verified.plan.company,
    wantsMonitoring: body.wantsMonitoring === true,
    wantsCall: body.wantsCall === true,
    resultLine: String(body.resultLine ?? "").slice(0, 300),
    ipHash,
  });

  if (!ok) {
    return Response.json(
      { error: "Vi kunde inte spara din adress just nu. Mejla info@opensverige.se så hör vi av oss." },
      { status: 502 },
    );
  }
  return Response.json({ ok: true });
}
