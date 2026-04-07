// lib/swedish-validator.ts
// Validates that a domain belongs to a Swedish company.
//
// Decision tree (in order, fast to slow):
//   1. .se TLD                    → pass (0ms, free)
//   2. Known international list   → pass (0ms, free)  ← check root domain, handles subdomains
//   3. Wikidata SPARQL            → pass if country=Sweden (~500ms, free)
//   4. Otherwise                  → reject
//
// Wikidata fails OPEN — if their API is unavailable we don't block
// legitimate Swedish companies that happen to not be in the allowlist.

// Major Swedish companies that operate on non-.se domains.
// Covers multinationals founded in Sweden.
// Add new entries here — no deploy needed beyond a push.
const SWEDISH_INTERNATIONAL = new Set([
  // ── Tech & SaaS ──────────────────────────────────────────────
  "spotify.com", "mojang.com", "king.com",
  "paradoxplaza.com", "paradoxinteractive.com",
  "klarna.com", "klarnabank.com", "izettle.com",
  "bambuser.com", "truecaller.com", "tobii.com",
  "fingerprints.com", "sinch.com", "tink.com",
  "einride.tech", "einride.com", "northvolt.com",
  "voi.com", "lime-technologies.com", "sitoo.com",
  "quickchannel.com", "soundtrack.business",
  "storytel.com", "nelly.com", "bubbleroom.com",
  "qvantum.com", "eliq.net", "dooer.com",
  "mentimeter.com", "teamtailor.com", "quinyx.com",
  "uberall.com", "vimla.se", "cint.com",
  "mycronic.com", "nepa.com", "zettle.com",
  "digimarc.com", "anyfin.com", "lendo.se",
  "capcito.com", "acast.com", "epidemic.sound",
  "epidemicsound.com", "mojang.net",
  // ── Finance & Banking ─────────────────────────────────────────
  "swedbank.com", "handelsbanken.com", "nordea.com",
  "lansforsakringar.se", "folksam.se", "skandia.se",
  "collector.se", "resurs.se", "hoist.se",
  "klarna.com", "sveadirekt.se", "marginalen.se",
  // ── Retail & Consumer ─────────────────────────────────────────
  "hm.com", "ikea.com", "cdon.com", "lindex.com",
  "kappahl.com", "dustin.com", "komplett.se",
  "oatly.com", "babybjorn.com", "granit.com",
  "gina-tricot.com", "nakd.com", "bjorn-borg.com",
  "stronger.se", "curvelle.se", "bubbleroom.se",
  "elgiganten.se", "webhallen.com", "mediamarkt.se",
  // ── Industry & Engineering ────────────────────────────────────
  "volvo.com", "volvocars.com", "scania.com",
  "ericsson.com", "sandvik.com", "skf.com",
  "atlascopco.com", "electrolux.com", "assaabloy.com",
  "hexagon.com", "alfa-laval.com", "getinge.com",
  "husqvarna.com", "securitas.com", "saab.com",
  "nibe.se", "lindab.com", "trelleborg.com",
  "sweco.com", "afconsult.com", "bravida.se",
  "caverion.com", "instalco.se", "rejlers.se",
  // ── Media, Gaming & Entertainment ────────────────────────────
  "telia.com", "bonniernews.com", "schibsted.com",
  "evolution.com", "evolutiongaming.com",
  "netent.com", "leovegas.com", "kindredgroup.com",
  "betsson.com", "cherryab.com",
  // ── Healthcare & Life Science ─────────────────────────────────
  "astrazeneca.com", "essity.com", "recipharm.com",
  "getinge.com", "arjo.com", "nolato.se",
  "cellink.com", "biolamina.com",
  // ── Transport & Logistics ─────────────────────────────────────
  "postnord.com", "dhl.se", "db-schenker.com",
  "maersk.com",  // Danish but huge Swedish presence
  // ── Energy & Environment ──────────────────────────────────────
  "vattenfall.com", "stena.com", "circlek.com",
  "preem.se", "st1.se", "eon.se",
]);

// Extracts the registrable root domain from any input.
// api.spotify.com → spotify.com
// developer.fortnox.se → fortnox.se (already covered by .se check)
// Handles simple cases — good enough for our allowlist lookup.
function getRootDomain(domain: string): string {
  const parts = domain.replace(/^www\./, "").split(".");
  if (parts.length <= 2) return parts.join(".");
  // Handle known 2-part TLDs (co.uk, com.au, etc.) — not relevant for .se but future-proof
  const knownSecondLevel = new Set(["co.uk", "com.au", "co.nz", "org.uk"]);
  const lastTwo = parts.slice(-2).join(".");
  if (knownSecondLevel.has(lastTwo)) return parts.slice(-3).join(".");
  return lastTwo;
}

// Wikidata SPARQL: company website contains domain AND country is Sweden (Q34).
// Returns true if found, false if not found OR if Wikidata is unavailable.
// Caller treats unavailability as pass (fail-open) to avoid blocking real Swedish companies.
async function checkWikidata(rootDomain: string): Promise<"swedish" | "not_swedish" | "unavailable"> {
  const sparql = `
    SELECT ?item WHERE {
      ?item wdt:P17 wd:Q34 .
      ?item wdt:P856 ?website .
      FILTER(CONTAINS(LCASE(STR(?website)), "${rootDomain}"))
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
        signal: AbortSignal.timeout(6_000),
      },
    );
    if (!res.ok) return "unavailable";
    const data = await res.json() as { results?: { bindings?: unknown[] } };
    return (data.results?.bindings?.length ?? 0) > 0 ? "swedish" : "not_swedish";
  } catch {
    return "unavailable";
  }
}

export type SwedishCheckResult =
  | { pass: true; reason: "se_tld" | "allowlist" | "swedish_language" | "wikidata" | "wikidata_unavailable" }
  | { pass: false; reason: "not_swedish" };

// Fetches the homepage and checks for Swedish language signals:
// - <html lang="sv"> or lang="sv-SE" / lang="sv-*"
// - <meta http-equiv="Content-Language" content="sv">
// Returns true only on a clear positive signal — never blocks on failure.
async function detectSwedishLanguage(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}`, {
      headers: { "User-Agent": "OpenSverige-Scanner/1.0 (https://opensverige.se)" },
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return false;
    // Only read the first 8 KB — lang attributes are always in <head>
    const reader = res.body?.getReader();
    if (!reader) return false;
    let chunk = "";
    let bytesRead = 0;
    while (bytesRead < 8_192) {
      const { done, value } = await reader.read();
      if (done) break;
      chunk += new TextDecoder().decode(value);
      bytesRead += value.byteLength;
    }
    reader.cancel();
    const head = chunk.slice(0, 8_192).toLowerCase();
    // Match lang="sv", lang="sv-se", lang="sv-*"
    if (/\blang=["']sv(-[a-z]{2,4})?["']/.test(head)) return true;
    // Meta content-language
    if (/content-language[^>]*content=["']sv/.test(head)) return true;
    return false;
  } catch {
    return false;
  }
}

export async function isSwedishCompany(domain: string): Promise<SwedishCheckResult> {
  // 1. .se TLD — covers all Swedish-registered domains including subdomains
  if (domain.endsWith(".se")) {
    return { pass: true, reason: "se_tld" };
  }

  // 2. Hardcoded allowlist — check root domain so subdomains also match
  //    e.g. developer.spotify.com → spotify.com → found in allowlist
  const root = getRootDomain(domain);
  if (SWEDISH_INTERNATIONAL.has(root)) {
    return { pass: true, reason: "allowlist" };
  }

  // 3. Swedish language detection — fast signal before Wikidata lookup.
  //    A site whose main page declares lang="sv" is almost certainly Swedish.
  //    Run in parallel with Wikidata to avoid extra latency.
  const [languageResult, wikidataResult] = await Promise.all([
    detectSwedishLanguage(domain),
    checkWikidata(root),
  ]);

  if (languageResult) {
    return { pass: true, reason: "swedish_language" };
  }

  // 4. Wikidata — covers companies not in the allowlist or without sv lang tag
  if (wikidataResult === "swedish") {
    return { pass: true, reason: "wikidata" };
  }
  if (wikidataResult === "unavailable") {
    return { pass: true, reason: "wikidata_unavailable" };
  }

  return { pass: false, reason: "not_swedish" };
}
