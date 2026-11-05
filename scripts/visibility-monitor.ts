#!/usr/bin/env -S npx tsx
// scripts/visibility-monitor.ts
//
// Concierge version of the 30-day measurement promised on /synlighet. Run it
// once a day per lead (local cron, GitHub Action, whatever) until we know
// whether enough people want this to automate it properly.
//
// The first run freezes the question plan to disk so every day asks exactly
// the same questions; otherwise day-to-day numbers are not comparable.
//
// Usage:
//   npx tsx --env-file=.env.local scripts/visibility-monitor.ts --domain foretaget.se [--runs 3]
//   npx tsx --env-file=.env.local scripts/visibility-monitor.ts --domain foretaget.se --report
//
// Files (git-ignored by data/ rule below, contains no personal data):
//   data/visibility/<domain>.plan.json   frozen plan
//   data/visibility/<domain>.jsonl       one line per daily run

import { mkdirSync, existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { scanSite } from "../lib/visibility/site";
import { buildPlan, type VisibilityPlan } from "../lib/visibility/plan";
import { askQuestion, type QuestionResult } from "../lib/visibility/ask";
import { summarize, wilson, formatInterval } from "../lib/visibility/stats";
import { isValidDomain, normalizeDomain } from "../lib/visibility/domain";

interface Args {
  domain: string;
  runs: number;
  report: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { domain: "", runs: 3, report: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--domain") args.domain = normalizeDomain(argv[++i]);
    else if (a === "--runs") args.runs = Math.max(1, Math.min(10, parseInt(argv[++i] ?? "3", 10) || 3));
    else if (a === "--report") args.report = true;
  }
  if (!isValidDomain(args.domain)) {
    console.error("Usage: visibility-monitor.ts --domain foretaget.se [--runs 3] [--report]");
    process.exit(1);
  }
  return args;
}

interface DailyLine {
  at: string;
  results: QuestionResult[];
}

const DIR = path.join(process.cwd(), "data", "visibility");

async function loadOrCreatePlan(domain: string): Promise<VisibilityPlan> {
  const file = path.join(DIR, `${domain}.plan.json`);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8")) as VisibilityPlan;
  const site = await scanSite(domain);
  const plan = await buildPlan(site.profile);
  if (!plan) throw new Error("Could not build a plan, is ANTHROPIC_API_KEY set and the site reachable?");
  writeFileSync(file, JSON.stringify(plan, null, 2));
  console.log(`Froze plan for ${domain}:\n${plan.categoryQuestions.map(q => `  - ${q}`).join("\n")}`);
  return plan;
}

async function runDaily(domain: string, runs: number): Promise<void> {
  const plan = await loadOrCreatePlan(domain);
  const indices = [0, ...plan.categoryQuestions.map((_, i) => i + 1)];
  const results = await Promise.all(indices.map(i => askQuestion(plan, domain, i, runs)));
  const line: DailyLine = { at: new Date().toISOString(), results };
  appendFileSync(path.join(DIR, `${domain}.jsonl`), `${JSON.stringify(line)}\n`);
  const s = summarize(results);
  console.log(`${line.at} ${domain}: mentioned in ${s.mentioned}/${s.answers} answers (${formatInterval(s.interval)})`);
}

function report(domain: string): void {
  const file = path.join(DIR, `${domain}.jsonl`);
  if (!existsSync(file)) {
    console.error(`No data for ${domain} yet.`);
    process.exit(1);
  }
  const lines = readFileSync(file, "utf8").trim().split("\n").map(l => JSON.parse(l) as DailyLine);
  const all = summarize(lines.flatMap(l => l.results));
  const entity = lines.map(l => l.results.find(r => r.kind === "entity")?.entity?.accuracy ?? "n/a");

  console.log(`# AI-synlighet för ${domain}\n`);
  console.log(`Mätperiod: ${lines[0].at.slice(0, 10)} till ${lines[lines.length - 1].at.slice(0, 10)}, ${lines.length} dagar, ${all.answers} svar.\n`);
  console.log(`**Nämnd i ${all.mentioned} av ${all.answers} svar (${Math.round((all.mentioned / Math.max(1, all.answers)) * 100)} %, 95 % intervall ${formatInterval(all.interval)}).**\n`);
  console.log("## Per dag\n");
  for (const l of lines) {
    const s = summarize(l.results);
    const i = wilson(s.mentioned, s.answers);
    console.log(`- ${l.at.slice(0, 10)}: ${s.mentioned}/${s.answers} (${formatInterval(i)})`);
  }
  console.log("\n## Nämns istället\n");
  for (const c of all.competitors) console.log(`- ${c.name}: ${c.answers} av ${all.answers} svar`);
  console.log("\n## Källor AI läste oftast\n");
  for (const src of all.topSources) console.log(`- ${src.host}: ${src.answers} svar`);
  console.log("\n## Vad AI säger om företaget\n");
  const counts = entity.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e]: (acc[e] ?? 0) + 1 }), {});
  for (const [k, v] of Object.entries(counts)) console.log(`- ${k}: ${v} dagar`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  mkdirSync(DIR, { recursive: true });
  if (args.report) report(args.domain);
  else await runDaily(args.domain, args.runs);
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
