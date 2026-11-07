#!/usr/bin/env -S npx tsx
// scripts/visibility-index.ts
//
// Visibility study: which companies does AI recommend when Swedes ask buyer
// questions, and how much does that change from one answer to the next?
// A data post gets read and shared; a scanner on its own does not.
//
// Each question runs several times because answers vary between runs. The
// report says "named in k of n answers" with a 95 % interval, how much two
// answers overlap and how often the first name repeats. Never a rank.
//
// Study definitions live in data/visibility/studies/*.json. Keep the wording
// stable between editions or the numbers are not comparable.
//
// Usage:
//   npx tsx --env-file=.env.local scripts/visibility-index.ts --study tjanster-2026-11 --dry-run
//   npx tsx --env-file=.env.local scripts/visibility-index.ts --study tjanster-2026-11 --only redovisning-stockholm --runs 10
//
// Writes data/visibility/<study>-<date>/ with raw.json (every answer, its
// sources and the companies read from it), summary.json and rapport.md.
// Files are rewritten after each category, so a crash keeps what was paid for.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  VISIBILITY_MODEL,
  createMessage,
  responseCitedSources,
  responseSearched,
  responseSources,
  responseText,
  type ApiUsage,
} from "../lib/visibility/anthropic";
import { extractRecommended, webSearchTool } from "../lib/visibility/ask";
import { formatInterval } from "../lib/visibility/stats";
import {
  ZERO_USAGE,
  addUsage,
  costUsd,
  summarizeVariation,
  type Price,
  type Usage,
  type VariationSummary,
} from "../lib/visibility/study";

interface Category {
  id: string;
  label: string;
  /** Sent as the approximate user location for web search. */
  city?: string;
  questions: string[];
}

interface StudyFile {
  id: string;
  title: string;
  description: string;
  runs?: number;
  categories?: Category[];
  templates?: {
    cities: string[];
    services: { id: string; label: string; question: string }[];
  };
}

// Anthropic list prices, checked 2026-11-07. Web search is billed per search
// on top of tokens. Re-check https://platform.claude.com/docs/en/about-claude/pricing
// before a large run.
const PRICES: Record<string, Price> = {
  "claude-opus-5-5": { inputPerMTok: 4, outputPerMTok: 20, cacheReadPerMTok: 0.2, perThousandSearches: 10 },
  "claude-sonnet-5-5": { inputPerMTok: 2, outputPerMTok: 10, cacheReadPerMTok: 0.2, perThousandSearches: 10 },
};

// Rough per-answer guess for --dry-run only: search results count as input.
// The pilot replaces this with measured usage.
const GUESS_PER_ANSWER: Usage = { inputTokens: 25_000, outputTokens: 1_500, cacheReadTokens: 0, webSearches: 2 };
const CONCURRENCY = 4;

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function expand(study: StudyFile): Category[] {
  const cats: Category[] = [...(study.categories ?? [])];
  const t = study.templates;
  if (t) {
    for (const s of t.services) {
      for (const city of t.cities) {
        cats.push({
          id: `${s.id}-${slug(city)}`,
          label: `${s.label}, ${city}`,
          city,
          questions: [s.question.replaceAll("{stad}", city)],
        });
      }
    }
  }
  return cats;
}

interface Args {
  study: string;
  runs: number | null;
  only: Set<string> | null;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { study: "tjanster-2026-11", runs: null, only: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--study") args.study = argv[++i] ?? args.study;
    else if (a === "--runs") args.runs = Math.max(1, Math.min(30, parseInt(argv[++i] ?? "", 10) || 10));
    else if (a === "--only") args.only = new Set((argv[++i] ?? "").split(",").map(s => s.trim()).filter(Boolean));
    else if (a === "--dry-run") args.dryRun = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

function toUsage(u: ApiUsage | undefined): Usage {
  return {
    inputTokens: u?.input_tokens ?? 0,
    outputTokens: u?.output_tokens ?? 0,
    cacheReadTokens: u?.cache_read_input_tokens ?? 0,
    webSearches: u?.server_tool_use?.web_search_requests ?? 0,
  };
}

interface RawAnswer {
  text: string;
  /** URLs cited in the answer text. */
  cited: string[];
  /** Cited URLs, or every search result when nothing was cited. */
  sources: string[];
  searched: boolean;
  companies: string[];
}

interface RawQuestion {
  question: string;
  requested: number;
  failed: number;
  answers: RawAnswer[];
}

interface CategoryResult {
  id: string;
  label: string;
  city: string | null;
  questions: RawQuestion[];
  variation: VariationSummary;
  searchedShare: number;
  topSources: { host: string; answers: number }[];
  usage: Usage;
}

async function pool<T>(count: number, limit: number, task: () => Promise<T>): Promise<T[]> {
  const out: T[] = [];
  let started = 0;
  async function worker(): Promise<void> {
    while (started < count) {
      started++;
      out.push(await task());
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, count) }, worker));
  return out;
}

interface Asked {
  answer: Omit<RawAnswer, "companies"> | null;
  usage: Usage;
}

async function ask(question: string, city: string | undefined): Promise<Asked> {
  const res = await createMessage({
    messages: [{ role: "user", content: question }],
    maxTokens: 16_000,
    tools: [webSearchTool(city ?? "Sverige")],
    timeoutMs: 180_000,
  });
  const usage = toUsage(res?.usage);
  if (!res || res.stop_reason === "max_tokens") return { answer: null, usage };
  const text = responseText(res.content);
  if (!text) return { answer: null, usage };
  return {
    answer: {
      text,
      cited: responseCitedSources(res.content),
      sources: responseSources(res.content),
      searched: responseSearched(res.content),
    },
    usage,
  };
}

function host(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function runCategory(cat: Category, runs: number): Promise<CategoryResult> {
  let usage = ZERO_USAGE;
  const questions: RawQuestion[] = [];

  for (const q of cat.questions) {
    const asked = await pool(runs, CONCURRENCY, () => ask(q, cat.city));
    for (const a of asked) usage = addUsage(usage, a.usage);
    const got = asked.map(a => a.answer).filter((a): a is Omit<RawAnswer, "companies"> => a !== null);
    // Extraction reads every answer of the question in one call; its tokens
    // are not tracked, they are small next to the answers with search.
    const perAnswer = (await extractRecommended(q, got, 120_000)) ?? got.map(() => []);
    questions.push({
      question: q,
      requested: runs,
      failed: runs - got.length,
      answers: got.map((a, i) => ({ ...a, companies: perAnswer[i] ?? [] })),
    });
  }

  const answers = questions.flatMap(q => q.answers);
  const sourceCounts = new Map<string, number>();
  for (const a of answers) {
    for (const h of new Set(a.sources.map(host).filter((x): x is string => !!x))) {
      sourceCounts.set(h, (sourceCounts.get(h) ?? 0) + 1);
    }
  }

  return {
    id: cat.id,
    label: cat.label,
    city: cat.city ?? null,
    questions,
    variation: summarizeVariation(answers.map(a => a.companies)),
    searchedShare: answers.length > 0 ? answers.filter(a => a.searched).length / answers.length : 0,
    topSources: [...sourceCounts.entries()]
      .map(([h, n]) => ({ host: h, answers: n }))
      .sort((a, b) => b.answers - a.answers)
      .slice(0, 8),
    usage,
  };
}

const pct = (x: number): string => `${Math.round(x * 100)} %`;
const num = (x: number): string => x.toLocaleString("sv-SE", { maximumFractionDigits: 1 });

function report(study: StudyFile, date: string, runs: number, results: CategoryResult[], cost: number | null): string {
  const lines: string[] = [
    `# ${study.title}`,
    "",
    `${date} · ${VISIBILITY_MODEL} med webbsök via API · varje fråga ställd ${runs} gånger.`,
    "",
    study.description,
    "",
    "Siffran är antal svar som nämnde företaget, med 95 % intervall. Ingen placering.",
    "",
  ];
  for (const r of results) {
    const v = r.variation;
    const failed = r.questions.reduce((s, q) => s + q.failed, 0);
    lines.push(`## ${r.label} (${v.answers} svar${failed > 0 ? `, ${failed} misslyckades` : ""})`, "");
    for (const q of r.questions) lines.push(`> ${q.question}`, "");
    lines.push(
      `- ${v.distinctCompanies} olika företag nämndes. Ett svar nämnde i snitt ${num(v.meanCompaniesPerAnswer)}.`,
      `- ${v.namedOnce} av dem nämndes bara i ett enda svar.`,
    );
    if (v.meanOverlap !== null) lines.push(`- Två svar på samma fråga delade i snitt ${pct(v.meanOverlap)} av namnen.`);
    if (v.firstName) lines.push(`- Vanligaste förstanamnet, ${v.firstName.name}, kom först i ${v.firstName.answers} av ${v.firstName.of} svar.`);
    if (v.emptyAnswers > 0) lines.push(`- ${v.emptyAnswers} svar nämnde inget företag alls.`);
    lines.push(`- Sökte på webben i ${pct(r.searchedShare)} av svaren.`, "");
    for (const b of v.brands.slice(0, 10)) {
      lines.push(`- ${b.name}: ${b.answers} av ${v.answers} (${formatInterval(b.interval)})`);
    }
    if (r.topSources.length > 0) lines.push("", `Källor: ${r.topSources.map(s => `${s.host} (${s.answers})`).join(", ")}`);
    lines.push("");
  }
  if (cost !== null) lines.push(`Kostnad för svaren: cirka ${cost.toFixed(2)} USD.`, "");
  return lines.join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const studyPath = path.join(process.cwd(), "data", "visibility", "studies", `${args.study}.json`);
  const study = JSON.parse(readFileSync(studyPath, "utf8")) as StudyFile;
  const runs = args.runs ?? study.runs ?? 10;
  const all = expand(study);
  const cats = all.filter(c => !args.only || args.only.has(c.id));
  if (cats.length === 0) throw new Error(`No categories match. Ids: ${all.map(c => c.id).join(", ")}`);

  const price = PRICES[VISIBILITY_MODEL] ?? null;
  const answerCalls = cats.reduce((s, c) => s + c.questions.length * runs, 0);

  if (args.dryRun) {
    console.log(`${study.id}: ${cats.length} kategorier, ${answerCalls} svar (${runs} per fråga), modell ${VISIBILITY_MODEL}.`);
    for (const c of cats) console.log(`  ${c.id}: ${c.questions.join(" | ")}`);
    if (price) {
      const guess = costUsd({
        inputTokens: GUESS_PER_ANSWER.inputTokens * answerCalls,
        outputTokens: GUESS_PER_ANSWER.outputTokens * answerCalls,
        cacheReadTokens: 0,
        webSearches: GUESS_PER_ANSWER.webSearches * answerCalls,
      }, price);
      console.log(`Grov gissning: cirka ${guess.toFixed(0)} USD. Kör en kategori först och läs den uppmätta kostnaden.`);
    }
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY missing. Run with --env-file=.env.local.");
  }

  const date = new Date().toISOString().slice(0, 10);
  const dir = path.join(process.cwd(), "data", "visibility", `${study.id}-${date}`);
  mkdirSync(dir, { recursive: true });

  const results: CategoryResult[] = [];
  for (const cat of cats) {
    process.stderr.write(`${cat.label}...\n`);
    results.push(await runCategory(cat, runs));

    const usage = results.reduce((u, r) => addUsage(u, r.usage), ZERO_USAGE);
    const cost = price ? costUsd(usage, price) : null;
    const meta = { study: study.id, date, model: VISIBILITY_MODEL, runs, usage, costUsd: cost };
    writeFileSync(path.join(dir, "raw.json"), JSON.stringify({ ...meta, results }, null, 2));
    writeFileSync(
      path.join(dir, "summary.json"),
      JSON.stringify(
        { ...meta, results: results.map(({ questions, ...rest }) => ({ ...rest, questions: questions.map(q => q.question) })) },
        null,
        2,
      ),
    );
    writeFileSync(path.join(dir, "rapport.md"), report(study, date, runs, results, cost));
    process.stderr.write(`  ${results[results.length - 1].variation.answers} svar, hittills ${cost !== null ? `${cost.toFixed(2)} USD` : "okänd kostnad"}\n`);
  }

  console.log(readFileSync(path.join(dir, "rapport.md"), "utf8"));
  console.error(`Sparat i ${path.relative(process.cwd(), dir)}/`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
