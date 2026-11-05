// lib/visibility/plan.ts
//
// Turn what the homepage says into a test plan: who the company is, the
// facts we can check an AI's description against, and the questions a
// potential customer would plausibly type into an AI assistant. Questions
// are non-branded on purpose: the point is to see whether the company comes
// up when a buyer does NOT already know its name.

import { createMessage, parseJson } from "./anthropic";
import type { SiteProfile } from "./site";

export const CATEGORY_QUESTION_COUNT = 5;

export interface VisibilityPlan {
  company: string;
  /** Lower-case strings that count as a mention (brand spellings + domain root). */
  nameVariants: string[];
  /** What they sell, Swedish, a few words. */
  offering: string;
  /** City/region/"Sverige". */
  market: string;
  /** 3-5 facts from the homepage to verify the AI's description against. */
  facts: string[];
  /** Branded question: what does the AI know about the company? */
  entityQuestion: string;
  /** Non-branded buyer questions, Swedish. */
  categoryQuestions: string[];
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["company", "name_variants", "offering", "market", "facts", "category_questions"],
  properties: {
    company: { type: "string", description: "Företagets namn som det skrivs på sajten." },
    name_variants: {
      type: "array",
      items: { type: "string" },
      description: "Andra stavningar och varumärkesnamn som räknas som att företaget nämns. Inte generiska ord.",
    },
    offering: { type: "string", description: "Vad företaget säljer, på svenska, högst sex ord." },
    market: { type: "string", description: "Ort, region, eller 'Sverige' om de säljer i hela landet." },
    facts: {
      type: "array",
      items: { type: "string" },
      description: "Tre till fem korta, kontrollerbara fakta från sajten: vad de gör, var, för vem.",
    },
    category_questions: {
      type: "array",
      items: { type: "string" },
      description: "Exakt fem frågor på svenska.",
    },
  },
} as const;

const SYSTEM = `Du hjälper till att testa om ett svenskt företag syns när potentiella kunder frågar en AI-assistent.

Du får text från företagets startsida. Ta fram:
- företagets namn och stavningsvarianter (inklusive domännamnet utan toppdomän om det används som varumärke)
- vad de säljer och var
- tre till fem fakta som går att kontrollera mot sajten
- exakt fem frågor som en potentiell kund skulle kunna skriva till ChatGPT eller Claude när hen letar efter det här företaget erbjuder, utan att känna till företaget

Regler för frågorna:
- Skriv på naturlig svenska, som en riktig människa skriver i en chatt.
- Nämn aldrig företagets namn eller domän.
- Minst tre frågor ska be om konkreta rekommendationer ("Vilka ... rekommenderar du", "Var kan jag köpa ...", "Vilken ... är bäst för ...").
- Ta med orten om företaget är lokalt. Annars "i Sverige" där det är naturligt.
- Variera: en bred kategorifråga, en med ett specifikt behov, en jämförelsefråga, en med pris eller kvalitet, en med målgruppen.
- Var så specifik som sajten ger underlag för. "Redovisningsbyrå för enskild firma i Malmö" är bättre än "redovisning".

Om startsidan är tom eller oläslig, gör ditt bästa utifrån domännamnet och skriv det som fakta: "Startsidan gick inte att läsa".`;

function promptFor(profile: SiteProfile): string {
  const parts = [
    `Domän: ${profile.domain}`,
    profile.title && `Titel: ${profile.title}`,
    profile.description && `Beskrivning: ${profile.description}`,
    profile.orgNames.length > 0 && `Namn i strukturerad data: ${profile.orgNames.join(", ")}`,
    profile.localities.length > 0 && `Ort i strukturerad data: ${profile.localities.join(", ")}`,
    profile.headings.length > 0 && `Rubriker: ${profile.headings.join(" | ")}`,
    profile.text && `Text från startsidan:\n${profile.text}`,
  ];
  return parts.filter(Boolean).join("\n");
}

interface RawPlan {
  company: string;
  name_variants: string[];
  offering: string;
  market: string;
  facts: string[];
  category_questions: string[];
}

function domainRoot(domain: string): string {
  const host = domain.replace(/^www\./, "");
  return host.split(".")[0] ?? host;
}

/** Normalise and harden a raw plan from the model. Exported for tests. */
export function finalizePlan(domain: string, raw: RawPlan | null, profile: SiteProfile): VisibilityPlan | null {
  if (!raw || !raw.company || !Array.isArray(raw.category_questions)) return null;
  const company = raw.company.trim().slice(0, 80);
  const root = domainRoot(domain).toLowerCase();
  // Domain, distinctive domain root and the company name go first so the
  // cap below never drops them. The root only counts when it is distinctive
  // (avoids "bil" or "hem").
  const variants = new Set<string>(
    [
      domain.replace(/^www\./, ""),
      ...(root.length >= 5 ? [root] : []),
      company,
      ...profile.orgNames,
      ...(raw.name_variants ?? []),
    ]
      .filter((v): v is string => typeof v === "string")
      .map(v => v.toLowerCase().trim())
      .filter(v => v.length >= 3 && v.length <= 80),
  );

  const questions = raw.category_questions
    .map(q => q.trim())
    .filter(q => q.length > 8 && q.length < 300)
    .filter(q => ![...variants].some(v => q.toLowerCase().includes(v)))
    .slice(0, CATEGORY_QUESTION_COUNT);
  if (questions.length < 3) return null;

  return {
    company,
    nameVariants: [...variants].slice(0, 12),
    offering: (raw.offering ?? "").trim().slice(0, 80),
    market: (raw.market ?? "").trim().slice(0, 60) || "Sverige",
    facts: (raw.facts ?? []).map(f => f.trim()).filter(Boolean).slice(0, 5),
    entityQuestion: `Vad vet du om ${company} (${domain.replace(/^www\./, "")})? Vad gör de och var finns de?`,
    categoryQuestions: questions,
  };
}

export async function buildPlan(profile: SiteProfile): Promise<VisibilityPlan | null> {
  const res = await createMessage({
    system: SYSTEM,
    messages: [{ role: "user", content: promptFor(profile) }],
    maxTokens: 8_000,
    jsonSchema: SCHEMA as unknown as Record<string, unknown>,
    timeoutMs: 30_000,
  });
  return finalizePlan(profile.domain, parseJson<RawPlan>(res), profile);
}
