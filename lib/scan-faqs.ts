// lib/scan-faqs.ts
//
// Single source of truth for the homepage FAQ. Both the FAQPage JSON-LD
// schema injected into /scan and the visible accordion in
// app/scan/_components/HomepageFaq.tsx read from this list — schema and
// rendered DOM never drift.
//
// Bilingual: each entry carries Swedish (q/a) and English (qEn/aEn).
// HomepageFaq picks via useLang. The schema is rendered twice on /scan
// (once per language with distinct @id) so AI Overviews can serve the
// locale-appropriate answer.
//
// Tone: pedagogical, max ~12 words per sentence, "du" / "you", lead with
// everyday language. No "GDPR Art. X" or "EU AI Act Art. 50" in opening
// sentences. Native Swedish, not machine-translated English.

export interface ScanFaq {
  q: string;
  a: string;
  qEn: string;
  aEn: string;
}

export const SCAN_FAQS: readonly ScanFaq[] = [
  {
    q: "Vad är AI-readiness, egentligen?",
    a: "AI-agenter som ChatGPT och Claude surfar webben åt sina användare. Om din sajt inte är läsbar för dem, finns du inte i deras svar. Vi mäter hur lätt agenter kan hitta, läsa och använda din sajt.",
    qEn: "What is AI-readiness, really?",
    aEn: "AI agents like ChatGPT and Claude browse the web on behalf of their users. If your site isn't readable to them, you don't show up in their answers. We measure how easily agents can find, read and use your site.",
  },
  {
    q: "Vad testar scannern?",
    a: "17 saker, fördelat på tre delar. Hittas du av agenter (sitemap, llms.txt, AI-crawlers)? Är du laglig (cookie-banner, integritetspolicy, AI-märkning)? Kan utvecklare bygga mot dig (API, dokumentation, MCP, sandbox)? Varje check har en egen sida med källor.",
    qEn: "What does the scanner test?",
    aEn: "17 signals across three areas. Can agents find you (sitemap, llms.txt, AI crawlers)? Are you compliant (cookie banner, privacy policy, AI disclosure)? Can developers build against you (API, docs, MCP, sandbox)? Every check has its own page with primary sources.",
  },
  {
    q: "Kostar det något?",
    a: "Nej. Scanna fritt utan konto. Vill du köra via vårt API får du 15 scans i månaden gratis, en nyckel hämtas i Discord. Koden är öppen på GitHub.",
    qEn: "Does it cost anything?",
    aEn: "No. Scan freely without an account. For programmatic access via our API you get 15 scans per month free, key issued via Discord. The code is open source on GitHub.",
  },
  {
    q: "Var hamnar min data?",
    a: "Allt lagras i London hos Supabase, inom EU. Din IP sparas hashad, aldrig i klartext. Resultaten raderas automatiskt efter 90 dagar. Sammanfattningarna skrivs av Claude som ser domännamn och publikt scan-innehåll, inget annat.",
    qEn: "Where does my data go?",
    aEn: "Everything is stored in London at Supabase, inside the EU. Your IP is hashed, never stored in plaintext. Results auto-delete after 90 days. The AI summaries are written by Claude, which sees domain names and public scan content, nothing else.",
  },
  {
    q: "Varför inte bara använda Cloudflares scanner?",
    a: "Tre skäl. Vår data ligger i EU, inte USA. Vi följer EU AI Act med en maskinläsbar AI-stämpel på varje sammanfattning. Och vi letar efter svenska sidor som /integritetspolicy och /cookieanvandning, som globala scanners missar.",
    qEn: "Why not just use Cloudflare's scanner?",
    aEn: "Three reasons. Our data lives in the EU, not the US. We follow the EU AI Act with a machine-readable AI-disclosure on every summary. And we look for Swedish-language pages like /integritetspolicy and /cookieanvandning that global scanners miss.",
  },
  {
    q: "Vad gör jag med resultatet?",
    a: "Skicka rapporten till din utvecklare eller byrå. Varje punkt har en åtgärd och länk till hur man fixar den. Mindre sajter brukar hinna fixa det viktigaste på en eftermiddag.",
    qEn: "What do I do with the result?",
    aEn: "Send the report to your developer or agency. Every finding has an action and a link to the fix. Smaller sites usually fix the important parts in an afternoon.",
  },
  {
    q: "Är det här bara för utvecklare?",
    a: "Nej. Du som äger sajten ser direkt vad som funkar och inte. Tekniska detaljer finns för den som behöver dem, men resultaten läses som ett vanligt betyg.",
    qEn: "Is this only for developers?",
    aEn: "No. As the site owner you see directly what works and what doesn't. Technical details are there for those who need them, but the results read like a regular report card.",
  },
  {
    q: "Hur ofta uppdateras checklistan?",
    a: "Vi ser över listan varje kvartal. När EU släpper nya regler eller MCP-specen ändras, uppdaterar vi. Varje check har ett datum och länkar till källan, så du kan se exakt vad som ändrats och när.",
    qEn: "How often is the checklist updated?",
    aEn: "We review the list every quarter. When the EU releases new rules or the MCP spec changes, we update. Every check has a date and links to its source, so you can see exactly what changed and when.",
  },
] as const;

export function buildScanFaqSchema(
  canonicalUrl: string,
  lang: "sv" | "en" = "sv",
) {
  const isEn = lang === "en";
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq-${lang}`,
    inLanguage: isEn ? "en-US" : "sv-SE",
    mainEntity: SCAN_FAQS.map((f) => ({
      "@type": "Question",
      name: isEn ? f.qEn : f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: isEn ? f.aEn : f.a,
      },
    })),
  };
}
