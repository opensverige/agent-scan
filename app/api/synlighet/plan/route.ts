// app/api/synlighet/plan/route.ts
//
// Step 1 of the AI-visibility check: technical prerequisites + question plan.
// Returns a signed token that /api/synlighet/ask and /analyze need. The
// client then runs every answer as its own request, so no single function
// invocation has to fit all model calls inside 60 s.

export const maxDuration = 60;

import type { NextRequest } from "next/server";
import { getIpHash } from "@/lib/ip-hash";
import { isValidDomain, normalizeDomain } from "@/lib/visibility/domain";
import { scanSite } from "@/lib/visibility/site";
import { buildPlan } from "@/lib/visibility/plan";
import { issuePlanToken, runsFor } from "@/lib/visibility/token";
import { admitCheck, allowWithoutDb } from "@/lib/visibility/store";
import { VISIBILITY_MODEL } from "@/lib/visibility/anthropic";

export async function POST(req: NextRequest) {
  let domain: string;
  try {
    const body = (await req.json()) as { domain?: unknown };
    domain = normalizeDomain(body.domain);
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }
  if (!isValidDomain(domain)) {
    return Response.json({ error: "Det där ser inte ut som en domän. Skriv till exempel foretaget.se." }, { status: 400 });
  }

  // Counted before anything runs, so concurrent requests cannot slip past the caps.
  const admission = await admitCheck(domain, getIpHash(req));
  if (!admission.ok) {
    return Response.json(
      {
        error:
          admission.reason === "daily"
            ? "Vi har nått dagens tak för kollar. Varje koll kostar oss riktiga AI-anrop. Försök igen imorgon."
            : "Du har kört tre kollar på kort tid. Vänta tio minuter och försök igen.",
      },
      { status: 429 },
    );
  }

  const site = await scanSite(domain);

  const aiReady = !!process.env.ANTHROPIC_API_KEY && (admission.dbBacked || allowWithoutDb());
  if (!aiReady) {
    return Response.json({
      domain,
      checks: site.checks,
      plan: null,
      notice: "AI-delen av kollen är pausad just nu. De tekniska kontrollerna nedan är live.",
    });
  }

  const plan = await buildPlan(site.profile);
  if (!plan) {
    return Response.json({
      domain,
      checks: site.checks,
      plan: null,
      notice: site.profile.reachable
        ? "Vi kunde inte formulera frågor utifrån startsidan just nu. De tekniska kontrollerna nedan är live."
        : "Vi kom inte åt startsidan, så vi vet inte vad ni säljer och kan inte ställa frågorna. Se de tekniska kontrollerna nedan.",
    });
  }

  const { token, expiresAt } = issuePlanToken(domain, plan);
  const questions = [plan.entityQuestion, ...plan.categoryQuestions];

  return Response.json({
    domain,
    checks: site.checks,
    plan: {
      company: plan.company,
      offering: plan.offering,
      market: plan.market,
      facts: plan.facts,
      questions,
      runs: questions.map((_, i) => runsFor(i)),
    },
    token,
    expiresAt,
    engine: { model: VISIBILITY_MODEL, label: "Claude med webbsök via API" },
    checkedAt: new Date().toISOString(),
  });
}
