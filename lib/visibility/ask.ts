// lib/visibility/ask.ts
//
// Ask a question to the model with web search, then read the answers.
// Mention detection is deterministic (string match on the plan's name
// variants, and the company's domain among the URLs the answer actually
// cites) so the headline number does not depend on a model judging itself.
// The model is only used to list which companies an answer recommends and,
// for the entity question, to compare the answer with the homepage facts.
//
// The web app calls answerOnce and analyzeAnswers from separate requests so
// each Vercel invocation gets its full time budget. askQuestion runs both in
// sequence for scripts, where there is no 60 s limit.

import {
  createMessage,
  parseJson,
  responseCitedSources,
  responseSearched,
  responseSources,
  responseText,
} from "./anthropic";
import type { VisibilityPlan } from "./plan";

export interface AnswerRun {
  text: string;
  sources: string[];
  searched: boolean;
  mentioned: boolean;
}

export interface EntityVerdict {
  knows: boolean;
  accuracy: "correct" | "partly" | "wrong" | "unknown";
  issues: string[];
}

export interface Recommended {
  name: string;
  runs: number;
  isTarget: boolean;
}

export interface QuestionResult {
  index: number;
  kind: "entity" | "category";
  question: string;
  runs: AnswerRun[];
  /** Companies recommended across the runs, with how many runs named them. */
  recommended: Recommended[];
  entity: EntityVerdict | null;
  /** True when every run failed (API down, timeout). */
  failed: boolean;
}

export interface Analysis {
  recommended: Recommended[];
  entity: EntityVerdict | null;
}

export const MAX_ANSWER_CHARS = 6_000;

export function webSearchTool(market: string): Record<string, unknown> {
  const city = market && !/^sverige$/i.test(market) ? market.split(/[,/]/)[0].trim() : undefined;
  return {
    type: "web_search_20260209",
    name: "web_search",
    max_uses: 2,
    user_location: {
      type: "approximate",
      country: "SE",
      timezone: "Europe/Stockholm",
      ...(city ? { city } : {}),
    },
  };
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFKC");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsTerm(hay: string, needle: string): boolean {
  // Letter/digit boundaries so "kontor" does not match "hemkontor" and
  // "kontor.se" does not match "hemkontor.se".
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(needle)}($|[^\\p{L}\\p{N}])`, "u").test(hay);
}

/**
 * Does `text` mention the company, or does the answer cite its domain?
 * Pass only URLs the answer cited, not every search result. Exported for tests.
 */
export function detectMention(text: string, citedSources: string[], variants: string[], domain: string): boolean {
  const hay = normalize(text);
  const host = domain.replace(/^www\./, "").toLowerCase();
  if (host && containsTerm(hay, host)) return true;
  for (const v of variants) {
    const needle = normalize(v);
    if (needle.length >= 3 && containsTerm(hay, needle)) return true;
  }
  if (!host) return false;
  return citedSources.some(u => {
    try {
      const h = new URL(u).hostname.replace(/^www\./, "").toLowerCase();
      return h === host || h.endsWith(`.${host}`);
    } catch {
      return false;
    }
  });
}

export function questionAt(plan: VisibilityPlan, index: number): string | null {
  if (index === 0) return plan.entityQuestion;
  return plan.categoryQuestions[index - 1] ?? null;
}

/** One answer with web search. Null on failure or truncated output. */
export async function answerOnce(
  plan: VisibilityPlan,
  domain: string,
  index: number,
  timeoutMs: number,
): Promise<AnswerRun | null> {
  const question = questionAt(plan, index);
  if (!question) return null;
  const res = await createMessage({
    messages: [{ role: "user", content: question }],
    maxTokens: 16_000,
    tools: [webSearchTool(plan.market)],
    timeoutMs,
  });
  if (!res || res.stop_reason === "max_tokens") return null;
  const text = responseText(res.content);
  if (!text) return null;
  return {
    text: text.slice(0, MAX_ANSWER_CHARS),
    sources: responseSources(res.content).slice(0, 12),
    searched: responseSearched(res.content),
    mentioned: detectMention(text, responseCitedSources(res.content), plan.nameVariants, domain),
  };
}

const RECOMMEND_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["answers"],
  properties: {
    answers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["companies"],
        properties: {
          companies: {
            type: "array",
            items: { type: "string" },
            description: "Företag, varumärken eller tjänster som svaret rekommenderar eller listar som alternativ. Tom lista om inga namnges.",
          },
        },
      },
    },
  },
} as const;

const ENTITY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["knows", "accuracy", "issues"],
  properties: {
    knows: { type: "boolean", description: "Känner svaret till just det här företaget (inte bara branschen)?" },
    accuracy: { type: "string", enum: ["correct", "partly", "wrong", "unknown"] },
    issues: {
      type: "array",
      items: { type: "string" },
      description: "Konkreta felaktigheter eller förväxlingar i svaret, på svenska. Tom om inga.",
    },
  },
} as const;

/** Companies named per answer, aligned with `runs` (padded/truncated). */
export async function extractRecommended(
  question: string,
  runs: Pick<AnswerRun, "text">[],
  timeoutMs = 25_000,
): Promise<string[][] | null> {
  if (runs.length === 0) return [];
  const body = runs.map((r, i) => `<svar nr="${i + 1}">\n${r.text}\n</svar>`).join("\n\n");
  const res = await createMessage({
    system:
      "Du läser AI-svar och listar vilka företag, varumärken eller tjänster varje svar rekommenderar eller nämner som alternativ. Använd namnen som de står i svaret, i den ordning de först nämns. Ta inte med källsajter som bara citeras, myndigheter eller jämförelsesajter om de inte rekommenderas som leverantör.",
    messages: [
      {
        role: "user",
        content: `Fråga: ${question}\n\n${body}\n\nDet finns ${runs.length} svar. Returnera exakt ${runs.length} poster i "answers", i samma ordning som svaren.`,
      },
    ],
    maxTokens: 8_000,
    jsonSchema: RECOMMEND_SCHEMA as unknown as Record<string, unknown>,
    timeoutMs,
  });
  const parsed = parseJson<{ answers: { companies: string[] }[] }>(res);
  if (!parsed || !Array.isArray(parsed.answers)) return null;
  return runs.map((_, i) => {
    const companies = parsed.answers[i]?.companies;
    return Array.isArray(companies) ? companies.filter(c => typeof c === "string") : [];
  });
}

async function judgeEntity(plan: VisibilityPlan, domain: string, run: Pick<AnswerRun, "text">, timeoutMs: number): Promise<EntityVerdict | null> {
  const facts = plan.facts.length > 0 ? plan.facts.map(f => `- ${f}`).join("\n") : "- (inga fakta tillgängliga)";
  const res = await createMessage({
    system:
      "Du jämför en AI-assistents beskrivning av ett företag med fakta från företagets egen webbplats. Var strikt: förväxling med ett annat företag med liknande namn räknas som fel. Om svaret säger att den inte vet, är accuracy 'unknown' och knows false.",
    messages: [
      {
        role: "user",
        content: `Företag: ${plan.company} (${domain})\n\nFakta från sajten:\n${facts}\n\nAI-svaret:\n${run.text}`,
      },
    ],
    maxTokens: 8_000,
    jsonSchema: ENTITY_SCHEMA as unknown as Record<string, unknown>,
    timeoutMs,
  });
  const parsed = parseJson<EntityVerdict>(res);
  if (!parsed) return null;
  return {
    knows: !!parsed.knows,
    accuracy: ["correct", "partly", "wrong", "unknown"].includes(parsed.accuracy) ? parsed.accuracy : "unknown",
    issues: Array.isArray(parsed.issues) ? parsed.issues.filter(i => typeof i === "string").slice(0, 5) : [],
  };
}

function tallyRecommended(perRun: string[][], plan: VisibilityPlan, domain: string): Recommended[] {
  const counts = new Map<string, { name: string; runs: number }>();
  for (const companies of perRun) {
    const seen = new Set<string>();
    for (const raw of companies) {
      const name = raw.trim().slice(0, 80);
      const key = name.toLowerCase();
      if (!name || seen.has(key)) continue;
      seen.add(key);
      const prev = counts.get(key);
      counts.set(key, { name: prev?.name ?? name, runs: (prev?.runs ?? 0) + 1 });
    }
  }
  return [...counts.values()]
    .map(c => ({ ...c, isTarget: detectMention(c.name, [], plan.nameVariants, domain) }))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 12);
}

/** Read a question's answers: recommended companies, or entity accuracy for index 0. */
export async function analyzeAnswers(
  plan: VisibilityPlan,
  domain: string,
  index: number,
  runs: Pick<AnswerRun, "text">[],
  timeoutMs = 25_000,
): Promise<Analysis> {
  if (runs.length === 0) return { recommended: [], entity: null };
  if (index === 0) {
    return { recommended: [], entity: await judgeEntity(plan, domain, runs[0], timeoutMs) };
  }
  const question = questionAt(plan, index) ?? "";
  const perRun = await extractRecommended(question, runs, timeoutMs);
  return { recommended: perRun ? tallyRecommended(perRun, plan, domain) : [], entity: null };
}

/** Full question in one go (scripts only, no per-request time limit). */
export async function askQuestion(
  plan: VisibilityPlan,
  domain: string,
  index: number,
  runsPerQuestion: number,
): Promise<QuestionResult> {
  const question = questionAt(plan, index) ?? "";
  const kind = index === 0 ? "entity" : "category";
  const runCount = index === 0 ? 1 : runsPerQuestion;
  const settled = await Promise.all(Array.from({ length: runCount }, () => answerOnce(plan, domain, index, 90_000)));
  const runs = settled.filter((r): r is AnswerRun => r !== null);
  if (runs.length === 0) return { index, kind, question, runs, recommended: [], entity: null, failed: true };
  const analysis = await analyzeAnswers(plan, domain, index, runs, 60_000);
  return { index, kind, question, runs, ...analysis, failed: false };
}
