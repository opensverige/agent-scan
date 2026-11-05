#!/usr/bin/env -S npx tsx
// scripts/visibility-index.ts
//
// "Sveriges AI-synlighetsindex": which brands does AI recommend when Swedes
// ask buyer questions, per category? This is the distribution engine for
// /synlighet. A data post ("we asked AI 60 times which bank to choose") gets
// read and shared; a scanner on its own does not.
//
// Each question runs several times because answers vary between runs. The
// output reports how many answers named each brand, never a rank.
//
// Usage:
//   npx tsx --env-file=.env.local scripts/visibility-index.ts [--runs 3] [--only bank,el]
//
// Writes data/visibility/index-<date>.json and prints a Markdown summary.
// Cost: categories x questions x runs answer calls with web search plus one
// extraction call per question. With the defaults below (8 x 2 x 3) that is
// 48 answer calls; check the price of VISIBILITY_MODEL before running.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createMessage, responseSources, responseText } from "../lib/visibility/anthropic";
import { extractRecommended, webSearchTool } from "../lib/visibility/ask";

interface Category {
  id: string;
  label: string;
  questions: string[];
}

// Phrased the way people actually type into a chat. Edit freely; keep them
// stable between index editions or the numbers are not comparable.
const CATEGORIES: Category[] = [
  {
    id: "bank",
    label: "Bank",
    questions: [
      "Vilken bank i Sverige rekommenderar du för privatpersoner som vill ha låga avgifter?",
      "Jag ska byta bank. Vilken svensk bank är bäst just nu?",
    ],
  },
  {
    id: "el",
    label: "Elavtal",
    questions: [
      "Vilket elbolag är billigast och bäst i Sverige just nu?",
      "Vilket elavtal ska jag välja i elområde 3?",
    ],
  },
  {
    id: "mobil",
    label: "Mobilabonnemang",
    questions: [
      "Vilket mobilabonnemang rekommenderar du i Sverige för mycket surf?",
      "Billigaste bra mobiloperatören i Sverige?",
    ],
  },
  {
    id: "forsakring",
    label: "Hemförsäkring",
    questions: [
      "Vilken hemförsäkring är bäst i Sverige?",
      "Vilket försäkringsbolag rekommenderar du för hem och bil i Sverige?",
    ],
  },
  {
    id: "bokforing",
    label: "Bokföringsprogram",
    questions: [
      "Vilket bokföringsprogram rekommenderar du för ett litet aktiebolag i Sverige?",
      "Fortnox eller något annat? Vilket bokföringsprogram är bäst för enskild firma?",
    ],
  },
  {
    id: "redovisning",
    label: "Redovisningsbyrå (Stockholm)",
    questions: [
      "Vilken redovisningsbyrå i Stockholm rekommenderar du för ett litet AB?",
      "Bra och prisvärd redovisningsbyrå i Stockholm för startups?",
    ],
  },
  {
    id: "mode",
    label: "Kläder online",
    questions: [
      "Var ska jag köpa kläder online i Sverige med snabb leverans och fri retur?",
      "Bästa svenska nätbutikerna för herrkläder?",
    ],
  },
  {
    id: "mat",
    label: "Matkasse",
    questions: [
      "Vilken matkasse är bäst i Sverige?",
      "Jag vill prova matkasse för en barnfamilj i Göteborg, vilken rekommenderar du?",
    ],
  },
];

function parseArgs(argv: string[]): { runs: number; only: Set<string> | null } {
  let runs = 3;
  let only: Set<string> | null = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--runs") runs = Math.max(1, Math.min(10, parseInt(argv[++i] ?? "3", 10) || 3));
    else if (argv[i] === "--only") only = new Set((argv[++i] ?? "").split(",").map(s => s.trim()));
  }
  return { runs, only };
}

interface Answer {
  text: string;
  sources: string[];
}

async function ask(question: string): Promise<Answer | null> {
  const res = await createMessage({
    messages: [{ role: "user", content: question }],
    maxTokens: 3_000,
    tools: [webSearchTool("Sverige")],
    timeoutMs: 60_000,
  });
  if (!res) return null;
  const text = responseText(res.content);
  return text ? { text, sources: responseSources(res.content) } : null;
}

interface CategoryResult {
  id: string;
  label: string;
  answers: number;
  brands: { name: string; answers: number }[];
  sources: { host: string; answers: number }[];
}

function host(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function runCategory(cat: Category, runs: number): Promise<CategoryResult> {
  const brandCounts = new Map<string, { name: string; answers: number }>();
  const sourceCounts = new Map<string, number>();
  let answers = 0;

  for (const q of cat.questions) {
    const got = (await Promise.all(Array.from({ length: runs }, () => ask(q)))).filter((a): a is Answer => !!a);
    answers += got.length;
    const perRun = (await extractRecommended(q, got)) ?? [];
    for (const companies of perRun) {
      const seen = new Set<string>();
      for (const raw of companies) {
        const key = raw.trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        const prev = brandCounts.get(key);
        brandCounts.set(key, { name: prev?.name ?? raw.trim(), answers: (prev?.answers ?? 0) + 1 });
      }
    }
    for (const a of got) {
      for (const h of new Set(a.sources.map(host).filter((x): x is string => !!x))) {
        sourceCounts.set(h, (sourceCounts.get(h) ?? 0) + 1);
      }
    }
  }

  return {
    id: cat.id,
    label: cat.label,
    answers,
    brands: [...brandCounts.values()].sort((a, b) => b.answers - a.answers).slice(0, 10),
    sources: [...sourceCounts.entries()].map(([h, n]) => ({ host: h, answers: n })).sort((a, b) => b.answers - a.answers).slice(0, 5),
  };
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY missing. Run with --env-file=.env.local.");
    process.exit(1);
  }
  const { runs, only } = parseArgs(process.argv);
  const cats = CATEGORIES.filter(c => !only || only.has(c.id));
  const results: CategoryResult[] = [];
  for (const cat of cats) {
    process.stderr.write(`${cat.label}...\n`);
    results.push(await runCategory(cat, runs));
  }

  const date = new Date().toISOString().slice(0, 10);
  const dir = path.join(process.cwd(), "data", "visibility");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `index-${date}.json`), JSON.stringify({ date, runs, results }, null, 2));

  console.log(`# Sveriges AI-synlighetsindex · ${date}\n`);
  console.log(`Claude med webbsök via API, plats Sverige. Varje fråga ställd ${runs} gånger. Siffran är antal svar som nämnde varumärket, inte en placering.\n`);
  for (const r of results) {
    console.log(`## ${r.label} (${r.answers} svar)\n`);
    for (const b of r.brands) console.log(`- ${b.name}: ${b.answers} av ${r.answers}`);
    if (r.sources.length > 0) console.log(`\nKällor: ${r.sources.map(s => `${s.host} (${s.answers})`).join(", ")}`);
    console.log("");
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
