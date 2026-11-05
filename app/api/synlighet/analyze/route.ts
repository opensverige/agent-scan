// app/api/synlighet/analyze/route.ts
//
// Step 3 of the AI-visibility check: read a question's answers. For buyer
// questions, list the companies each answer recommends; for the entity
// question, compare the answer with the homepage facts. The answers come
// from the browser, so input is capped and every (plan, index) can be
// analysed once. Nothing is stored or shown to anyone but the requester,
// so a doctored answer only misleads whoever doctored it.

export const maxDuration = 60;

import type { NextRequest } from "next/server";
import { runsFor, verifyPlanToken } from "@/lib/visibility/token";
import { analyzeAnswers, MAX_ANSWER_CHARS } from "@/lib/visibility/ask";
import { allowWithoutDb, claimOnce } from "@/lib/visibility/store";

export async function POST(req: NextRequest) {
  let body: { token?: unknown; index?: unknown; answers?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const verified = verifyPlanToken(body.token);
  if (!verified) return Response.json({ error: "Kollen har gått ut. Starta om." }, { status: 401 });
  const { domain, plan, sig } = verified;
  const index = Number(body.index);
  if (!Number.isInteger(index) || index < 0 || index > plan.categoryQuestions.length) {
    return Response.json({ error: "Ogiltig fråga." }, { status: 400 });
  }
  if (!Array.isArray(body.answers) || body.answers.length === 0 || body.answers.length > runsFor(index)) {
    return Response.json({ error: "Ogiltiga svar." }, { status: 400 });
  }
  const answers = body.answers
    .map(a => (a && typeof a === "object" ? String((a as { text?: unknown }).text ?? "") : ""))
    .map(text => ({ text: text.slice(0, MAX_ANSWER_CHARS) }))
    .filter(a => a.text.trim().length > 0);
  if (answers.length === 0) return Response.json({ error: "Ogiltiga svar." }, { status: 400 });

  const claim = await claimOnce(`${sig}:${index}:analyze`);
  if (claim === "duplicate") return Response.json({ error: "Redan analyserad." }, { status: 409 });
  if (claim === "unavailable" && !allowWithoutDb()) {
    return Response.json({ error: "AI-delen är pausad just nu." }, { status: 503 });
  }

  const analysis = await analyzeAnswers(plan, domain, index, answers, 40_000);
  return Response.json({ index, ...analysis });
}
