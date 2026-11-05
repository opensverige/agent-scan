// app/api/synlighet/ask/route.ts
//
// Step 2 of the AI-visibility check: one answer, with web search, to one
// question from a signed plan. Index 0 is "what do you know about X", 1..5
// the buyer questions; `run` numbers the repeats. Every (plan, index, run)
// can be answered once, enforced by a unique key in Postgres.

export const maxDuration = 60;

import type { NextRequest } from "next/server";
import { runsFor, verifyPlanToken } from "@/lib/visibility/token";
import { answerOnce } from "@/lib/visibility/ask";
import { allowWithoutDb, claimOnce } from "@/lib/visibility/store";

const ANSWER_TIMEOUT_MS = 52_000;

export async function POST(req: NextRequest) {
  let token: unknown;
  let index: number;
  let run: number;
  try {
    const body = (await req.json()) as { token?: unknown; index?: unknown; run?: unknown };
    token = body.token;
    index = Number(body.index);
    run = Number(body.run ?? 0);
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const verified = verifyPlanToken(token);
  if (!verified) return Response.json({ error: "Kollen har gått ut. Starta om." }, { status: 401 });
  const { domain, plan, sig } = verified;
  if (!Number.isInteger(index) || index < 0 || index > plan.categoryQuestions.length) {
    return Response.json({ error: "Ogiltig fråga." }, { status: 400 });
  }
  if (!Number.isInteger(run) || run < 0 || run >= runsFor(index)) {
    return Response.json({ error: "Ogiltig körning." }, { status: 400 });
  }

  const claim = await claimOnce(`${sig}:${index}:${run}`);
  if (claim === "duplicate") return Response.json({ error: "Frågan är redan körd." }, { status: 409 });
  if (claim === "unavailable" && !allowWithoutDb()) {
    return Response.json({ error: "AI-delen är pausad just nu." }, { status: 503 });
  }

  const answer = await answerOnce(plan, domain, index, ANSWER_TIMEOUT_MS);
  return Response.json({ index, run, answer });
}
