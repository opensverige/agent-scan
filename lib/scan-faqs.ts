// lib/scan-faqs.ts
//
// Single source of truth for the homepage FAQ. Both the FAQPage JSON-LD
// schema injected into /scan and the visible accordion in
// app/scan/_components/HomepageFaq.tsx read from this list — schema and
// rendered DOM never drift.
//
// Tone: pedagogical, max ~12 words per sentence, "du" not "ni", lead
// with everyday language and put legal references at the end if at all.

export interface ScanFaq {
  q: string;
  a: string;
}

export type ScanFaqGroupId = "quick-start" | "security" | "build";

export interface ScanFaqGroup {
  id: ScanFaqGroupId;
  label: string;
  glyph: string;
  questions: readonly ScanFaq[];
}

const QUICK_START: readonly ScanFaq[] = [
  {
    q: "Vad är AI-readiness, egentligen?",
    a: "AI-agenter som ChatGPT och Claude surfar webben åt sina användare. Om din sajt inte är läsbar för dem, finns du inte i deras svar. Vi mäter hur lätt agenter kan hitta, läsa och använda din sajt.",
  },
  {
    q: "Vad testar scannern?",
    a: "17 saker, fördelat på tre delar. Hittas du av agenter (sitemap, llms.txt, AI-crawlers)? Är du laglig (cookie-banner, integritetspolicy, AI-märkning)? Kan utvecklare bygga mot dig (API, dokumentation, MCP, sandbox)? Varje check har en egen sida med källor.",
  },
  {
    q: "Kostar det något?",
    a: "Nej. Scanna fritt utan konto. Vill du köra via vårt API får du 15 scans i månaden gratis, en nyckel hämtas i Discord. Koden är öppen på GitHub.",
  },
];

const SECURITY: readonly ScanFaq[] = [
  {
    q: "Var hamnar min data?",
    a: "Allt lagras i London hos Supabase, inom EU. Din IP sparas hashad, aldrig i klartext. Resultaten raderas automatiskt efter 90 dagar. Sammanfattningarna skrivs av Claude som ser domännamn och publikt scan-innehåll, inget annat.",
  },
  {
    q: "Varför inte bara använda Cloudflares scanner?",
    a: "Tre skäl. Vår data ligger i EU, inte USA. Vi följer EU AI Act med en maskinläsbar AI-stämpel på varje sammanfattning. Och vi letar efter svenska sidor som /integritetspolicy och /cookieanvandning, som globala scanners missar.",
  },
];

const BUILD: readonly ScanFaq[] = [
  {
    q: "Vad gör jag med resultatet?",
    a: "Skicka rapporten till din utvecklare eller byrå. Varje punkt har en åtgärd och länk till hur man fixar den. Mindre sajter brukar hinna fixa det viktigaste på en eftermiddag.",
  },
  {
    q: "Är det här bara för utvecklare?",
    a: "Nej. Du som äger sajten ser direkt vad som funkar och inte. Tekniska detaljer finns för den som behöver dem, men resultaten läses som ett vanligt betyg.",
  },
  {
    q: "Hur ofta uppdateras checklistan?",
    a: "Vi ser över listan varje kvartal. När EU släpper nya regler eller MCP-specen ändras, uppdaterar vi. Varje check har ett datum och länkar till källan, så du kan se exakt vad som ändrats och när.",
  },
];

export const SCAN_FAQ_GROUPS: readonly ScanFaqGroup[] = [
  { id: "quick-start", label: "Snabbstart", glyph: "◐", questions: QUICK_START },
  { id: "security", label: "Säkerhet & data", glyph: "◑", questions: SECURITY },
  { id: "build", label: "Använd resultatet", glyph: "◒", questions: BUILD },
] as const;

/** Flat list — used by the FAQPage JSON-LD schema where grouping isn't
 * meaningful. The visible accordion renders by SCAN_FAQ_GROUPS. */
export const SCAN_FAQS: readonly ScanFaq[] = SCAN_FAQ_GROUPS.flatMap(
  (g) => g.questions,
);

export function buildScanFaqSchema(canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    inLanguage: "sv-SE",
    mainEntity: SCAN_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}
