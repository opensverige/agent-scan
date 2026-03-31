// lib/swedish-validator.ts
// Validates that a domain belongs to a Swedish company.
//
// Decision tree (in order, fast to slow):
//   1. .se TLD                    → pass (0ms, free)
//   2. Known international list   → pass (0ms, free)
//   3. Wikidata SPARQL            → pass if country=Sweden (~500ms, free)
//   4. Otherwise                  → reject

// Major Swedish companies that operate on non-.se domains.
// Includes multinationals founded in Sweden.
const SWEDISH_INTERNATIONAL = new Set([
  // Tech & SaaS
  "spotify.com", "mojang.com", "king.com", "paradoxplaza.com",
  "paradoxinteractive.com", "dice.se", "fatshark.se", "tink.com",
  "klarna.com", "klarnabank.com", "izettle.com", "bambuser.com",
  "truecaller.com", "tobii.com", "fingerprints.com", "sinch.com",
  "bambuser.com", "einride.tech", "northvolt.com", "voi.com",
  "einride.com", "quickchannel.com", "lime-technologies.com",
  "sitoo.com", "soundtrack.business", "carebite.com",
  // Finance & Banking
  "swedbank.com", "handelsbanken.com", "seb.se", "nordea.com",
  "avanza.se", "collector.se", "resurs.se",
  // Retail & Consumer
  "hm.com", "ikea.com", "cdon.com", "lindex.com", "kappahl.com",
  "elgiganten.se", "webhallen.com", "dustin.com", "komplett.se",
  "oatly.com", "oatly.se", "babybjorn.com",
  // Industry & Engineering
  "volvo.com", "volvocars.com", "scania.com", "ericsson.com",
  "sandvik.com", "skf.com", "atlascopco.com", "electrolux.com",
  "assaabloy.com", "hexagon.com", "alfa-laval.com", "getinge.com",
  "husqvarna.com", "securitas.com", "saab.com",
  // Media & Telecom
  "telia.com", "three.se", "telenor.se", "tv4.se",
  "bonniernews.com", "schibsted.com", "aftonbladet.se",
  // Other
  "vattenfall.com", "sveaskog.se", "postnord.com",
  "evolution.com", "evolutiongaming.com",
]);

// Wikidata SPARQL: find companies whose official website contains the domain
// and whose country (P17) is Sweden (Q34).
async function checkWikidata(domain: string): Promise<boolean> {
  const stripped = domain.replace(/^www\./, "");
  // Match both with and without www, http and https
  const sparql = `
    SELECT ?item WHERE {
      ?item wdt:P17 wd:Q34 .
      ?item wdt:P856 ?website .
      FILTER(CONTAINS(LCASE(STR(?website)), "${stripped}"))
    }
    LIMIT 1
  `.trim();

  try {
    const res = await fetch(
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`,
      {
        headers: {
          "User-Agent": "OpenSverige-Scanner/1.0 (https://opensverige.se)",
          "Accept": "application/sparql-results+json",
        },
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!res.ok) return false;
    const data = await res.json() as { results?: { bindings?: unknown[] } };
    return (data.results?.bindings?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

export type SwedishCheckResult =
  | { pass: true; reason: "se_tld" | "allowlist" | "wikidata" }
  | { pass: false; reason: "not_swedish" };

export async function isSwedishCompany(domain: string): Promise<SwedishCheckResult> {
  // 1. .se TLD
  if (domain.endsWith(".se")) {
    return { pass: true, reason: "se_tld" };
  }

  // 2. Known international Swedish companies
  const bare = domain.replace(/^www\./, "");
  if (SWEDISH_INTERNATIONAL.has(bare)) {
    return { pass: true, reason: "allowlist" };
  }

  // 3. Wikidata — free, official, covers most well-known companies
  const isSwedish = await checkWikidata(bare);
  if (isSwedish) {
    return { pass: true, reason: "wikidata" };
  }

  return { pass: false, reason: "not_swedish" };
}
