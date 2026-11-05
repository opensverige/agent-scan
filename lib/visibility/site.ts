// lib/visibility/site.ts
//
// Deterministic part of the AI-visibility check: fetch the homepage and
// robots.txt, extract what the site says about itself, and test the
// technical prerequisites that have a documented mechanism:
//
//   1. robots.txt lets the *search* bots in (OAI-SearchBot, Claude-SearchBot,
//      PerplexityBot, Googlebot, Bingbot). Vendors document that blocking
//      them removes you from AI answers.
//   2. The CDN/WAF does not block those bots by User-Agent (Cloudflare has
//      blocked AI crawlers by default on new zones since July 2025).
//   3. The homepage is not noindex / nosnippet (Google: AI Overviews and AI
//      Mode only need an indexable page eligible for a snippet).
//   4. The content is in the HTML without JavaScript (AI fetchers mostly do
//      not execute JS).
//
// Training-bot blocking is reported as information, never as a failure.
// llms.txt, MCP cards and schema markup are deliberately not scored: there is
// no controlled evidence they affect AI answers.

import { AI_BOTS, evaluateRobotsForBots, summarizeByPurpose, type AiBot } from "@/lib/scan/ai-bots";
import { safeFetch, type SafeResponse } from "./safe-fetch";

const FETCH_TIMEOUT_MS = 8_000;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const MAX_HTML = 600_000;

export type CheckStatus = "pass" | "warn" | "fail" | "unknown";

export interface TechCheck {
  id: "search_bots_robots" | "search_bots_waf" | "indexable" | "no_js_needed" | "training_bots";
  status: CheckStatus;
  /** Short verdict, Swedish. */
  label: string;
  /** One or two sentences: why it matters and what to do. */
  detail: string;
}

export interface SiteProfile {
  domain: string;
  finalUrl: string | null;
  reachable: boolean;
  title: string;
  description: string;
  headings: string[];
  lang: string | null;
  /** Names found in JSON-LD Organization/LocalBusiness blocks. */
  orgNames: string[];
  /** addressLocality values found in JSON-LD. */
  localities: string[];
  /** Visible text of the raw HTML, trimmed for the prompt. */
  text: string;
  textLength: number;
}

type RawFetch = SafeResponse;

function fetchRaw(url: string, userAgent: string, readBody = true): Promise<RawFetch | null> {
  return safeFetch(url, {
    headers: { "User-Agent": userAgent, Accept: "text/html,application/xhtml+xml,*/*;q=0.8" },
    timeoutMs: FETCH_TIMEOUT_MS,
    maxBytes: MAX_HTML,
    readBody,
  });
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
};

// One pass, so "&amp;lt;" decodes to the text "&lt;" and is not decoded twice.
function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match: string, ref: string) => {
    if (ref[0] === "#") {
      const code = ref[1] === "x" || ref[1] === "X" ? parseInt(ref.slice(2), 16) : Number(ref.slice(1));
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[ref.toLowerCase()] ?? match;
  });
}

function stripTags(html: string): string {
  return decodeEntities(
    html
      // End tags may carry whitespace or junk before ">" ("</script >").
      // This extracts text for the model; it is not an HTML sanitiser.
      .replace(/<script\b[\s\S]*?<\/script\b[^>]*>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style\b[^>]*>/gi, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript\b[^>]*>/gi, " ")
      .replace(/<svg\b[\s\S]*?<\/svg\b[^>]*>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html: string, name: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
    "i",
  );
  const m = html.match(re);
  return decodeEntities((m?.[1] ?? m?.[2] ?? "").trim());
}

function collectJsonLd(html: string): unknown[] {
  const out: unknown[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed: unknown = JSON.parse(m[1].trim());
      const stack: unknown[] = [parsed];
      while (stack.length) {
        const node = stack.pop();
        if (Array.isArray(node)) stack.push(...node);
        else if (node && typeof node === "object") {
          out.push(node);
          const graph = (node as Record<string, unknown>)["@graph"];
          if (graph) stack.push(graph);
        }
      }
    } catch {
      /* invalid JSON-LD is common, skip */
    }
  }
  return out;
}

// Organization, LocalBusiness and their many subtypes (HousePainter,
// Plumber, Dentist, Bakery, Store...). Anything else that carries a postal
// address with a locality is treated as a business too.
const ORG_TYPES = /Organization|Business|Corporation|Store|Shop|Restaurant|Cafe|Bakery|Service|Agency|Office|Clinic|Dentist|Physician|Painter|Plumber|Electrician|Contractor|Locksmith|Salon|Spa|Hotel|Lodging|Brewery|Winery|Gym|Club|Studio/i;

function extractOrg(nodes: unknown[]): { names: string[]; localities: string[] } {
  const names = new Set<string>();
  const localities = new Set<string>();
  for (const node of nodes) {
    const rec = node as Record<string, unknown>;
    const type = rec["@type"];
    const types = Array.isArray(type) ? type.join(" ") : String(type ?? "");
    const address0 = rec.address as Record<string, unknown> | Record<string, unknown>[] | undefined;
    const hasLocality = (Array.isArray(address0) ? address0 : address0 ? [address0] : []).some(
      a => typeof a?.addressLocality === "string",
    );
    if (!ORG_TYPES.test(types) && !hasLocality) continue;
    if (/^(WebSite|WebPage|BreadcrumbList|Person|Product|Offer|ImageObject|SiteNavigationElement)$/i.test(types.trim())) continue;
    if (typeof rec.name === "string" && rec.name.trim()) names.add(rec.name.trim());
    const address = rec.address as Record<string, unknown> | Record<string, unknown>[] | undefined;
    for (const a of Array.isArray(address) ? address : address ? [address] : []) {
      if (typeof a.addressLocality === "string" && a.addressLocality.trim()) localities.add(a.addressLocality.trim());
    }
  }
  return { names: [...names].slice(0, 5), localities: [...localities].slice(0, 5) };
}

function extractHeadings(html: string): string[] {
  const out: string[] = [];
  const re = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && out.length < 8) {
    const text = stripTags(m[1]);
    if (text && text.length < 160) out.push(text);
  }
  return out;
}

export function buildProfile(domain: string, home: RawFetch | null): SiteProfile {
  const html = home?.body ?? "";
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const text = stripTags(html.replace(/<head[\s\S]*?<\/head>/i, " "));
  const org = extractOrg(collectJsonLd(html));
  const langMatch = html.match(/<html[^>]*\slang=["']([a-zA-Z-]+)["']/i);
  return {
    domain,
    finalUrl: home?.url ?? null,
    reachable: !!home && home.status < 400,
    title: stripTags(titleMatch?.[1] ?? "").slice(0, 200),
    description: (metaContent(html, "description") || metaContent(html, "og:description")).slice(0, 400),
    headings: extractHeadings(html),
    lang: langMatch?.[1]?.toLowerCase() ?? null,
    orgNames: org.names,
    localities: org.localities,
    text: text.slice(0, 5_000),
    textLength: text.length,
  };
}

/**
 * Robots directives from meta tags and X-Robots-Tag. A header value may be
 * scoped to a bot ("googlebot: noindex"); only unscoped directives and those
 * scoped to googlebot or bingbot count here.
 */
function hasDirective(value: string, directive: RegExp): boolean {
  return value.split(",").some(raw => {
    let part = raw.trim().toLowerCase();
    const scoped = part.match(/^([a-z0-9_-]+)\s*:\s*(.+)$/);
    if (scoped && !/^max-(snippet|image-preview|video-preview)$/.test(scoped[1])) {
      if (!["googlebot", "bingbot"].includes(scoped[1])) return false;
      part = scoped[2].trim();
    }
    return directive.test(part);
  });
}

const PROBE_BOTS = ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "PerplexityBot"];

function names(bots: AiBot[]): string {
  return bots.map(b => b.token).join(", ");
}

export interface SiteScan {
  profile: SiteProfile;
  checks: TechCheck[];
}

/** Fetch homepage + robots.txt + bot-UA probes in parallel and build checks. */
export async function scanSite(domain: string): Promise<SiteScan> {
  const base = `https://${domain}`;
  const probeBots = AI_BOTS.filter(b => PROBE_BOTS.includes(b.token));

  const [home, robots, ...probes] = await Promise.all([
    fetchRaw(`${base}/`, BROWSER_UA),
    fetchRaw(`${base}/robots.txt`, BROWSER_UA),
    ...probeBots.map(b => fetchRaw(`${base}/`, b.userAgent, false)),
  ]);

  const profile = buildProfile(domain, home);
  const checks: TechCheck[] = [];

  // 1 + 5. robots.txt per purpose
  const robotsBody = robots && robots.status === 200 && !/<html/i.test(robots.body.slice(0, 500)) ? robots.body : null;
  const summary = summarizeByPurpose(evaluateRobotsForBots(robotsBody));
  const blockedSearch = [...summary.search.blocked, ...summary.user.blocked];
  checks.push(
    blockedSearch.length === 0
      ? {
          id: "search_bots_robots",
          status: "pass",
          label: "robots.txt släpper in AI-sökbottarna",
          detail: "OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot och Bingbot får läsa startsidan. Det är dem AI-assistenterna använder när de söker efter svar.",
        }
      : {
          id: "search_bots_robots",
          status: "fail",
          label: `robots.txt blockerar ${names(blockedSearch)}`,
          detail: "Det här är bottarna som hämtar källor till AI-svar. OpenAI skriver uttryckligen att sajter som blockerar OAI-SearchBot inte visas i ChatGPT-sökets svar. Ta bort blockeringen för just de här, du kan fortfarande blockera träningsbottarna.",
        },
  );

  // 2. WAF / CDN blocking by User-Agent
  const baseline = home?.status ?? 0;
  if (!home || baseline >= 400) {
    checks.push({
      id: "search_bots_waf",
      status: "unknown",
      label: "Kunde inte testa brandväggen",
      detail: `Startsidan svarade ${home ? `HTTP ${baseline}` : "inte"} även för en vanlig webbläsare, så vi kan inte avgöra om AI-bottar behandlas annorlunda.`,
    });
  } else {
    const blocked = probeBots.filter((_, i) => {
      const s = probes[i]?.status;
      return s === undefined || s === 401 || s === 403 || s === 406 || s === 451 || s === 503;
    });
    checks.push(
      blocked.length === 0
        ? {
            id: "search_bots_waf",
            status: "pass",
            label: "Brandväggen släpper igenom AI-bottar",
            detail: "Vi låtsades vara OAI-SearchBot, ChatGPT-User, Claude-SearchBot och PerplexityBot och fick samma svar som en vanlig besökare.",
          }
        : {
            id: "search_bots_waf",
            status: "warn",
            label: `Möjlig blockering av ${names(blocked)} i CDN/brandvägg`,
            detail: "En vanlig webbläsare kom in men inte våra anrop med AI-botarnas User-Agent. Vanligaste orsaken är Cloudflares AI-crawlerblockering som är på som standard sedan juli 2025. Obs: vissa brandväggar verifierar riktiga bottar via IP, då kan riktiga OAI-SearchBot släppas in trots att vår test stoppas. Kontrollera inställningen.",
          },
    );
  }

  // 3. noindex / nosnippet
  if (!home || baseline >= 400) {
    checks.push({
      id: "indexable",
      status: "unknown",
      label: "Kunde inte läsa startsidan",
      detail: "Utan startsidan kan vi inte se om den är indexerbar.",
    });
  } else {
    const metaRobots = [metaContent(home.body, "robots"), metaContent(home.body, "googlebot")].join(",");
    const header = home.headers.get("x-robots-tag") ?? "";
    const all = `${metaRobots},${header}`;
    const noindex = hasDirective(all, /^(noindex|none)$/);
    const nosnippet = hasDirective(all, /^(nosnippet|max-snippet:\s*0)$/);
    checks.push(
      noindex
        ? {
            id: "indexable",
            status: "fail",
            label: "Startsidan är markerad noindex",
            detail: "Sidan får inte indexeras av sökmotorer, och därmed inte heller visas i Googles AI Overviews eller AI Mode. Ta bort noindex om det inte är avsiktligt.",
          }
        : nosnippet
          ? {
              id: "indexable",
              status: "warn",
              label: "Startsidan har nosnippet",
              detail: "Google använder inte sidans text i AI Overviews eller AI Mode när nosnippet är satt.",
            }
          : {
              id: "indexable",
              status: "pass",
              label: "Startsidan är indexerbar",
              detail: "Ingen noindex eller nosnippet. Sidan kan användas som källa i Googles AI-svar.",
            },
    );
  }

  // 4. Content without JavaScript
  if (!home || baseline >= 400) {
    checks.push({
      id: "no_js_needed",
      status: "unknown",
      label: "Kunde inte läsa startsidan",
      detail: "Utan startsidan kan vi inte se om innehållet kräver JavaScript.",
    });
  } else {
    const len = profile.textLength;
    checks.push(
      len >= 600
        ? {
            id: "no_js_needed",
            status: "pass",
            label: "Innehållet syns utan JavaScript",
            detail: `Startsidans HTML innehåller ${len.toLocaleString("sv-SE")} tecken text. AI-bottar som inte kör JavaScript ser vad sajten handlar om.`,
          }
        : len >= 150
          ? {
              id: "no_js_needed",
              status: "warn",
              label: "Lite text utan JavaScript",
              detail: `Bara ${len.toLocaleString("sv-SE")} tecken text i rå HTML. De flesta AI-bottar kör inte JavaScript och ser därför en nästan tom sida. Server-rendera huvudinnehållet.`,
            }
          : {
              id: "no_js_needed",
              status: "fail",
              label: "Sajten är tom utan JavaScript",
              detail: "Rå HTML innehåller nästan ingen text. AI-bottar som inte kör JavaScript ser en tom sida och kan inte beskriva er. Server-rendera huvudinnehållet.",
            },
    );
  }

  // 5. Training bots: information only
  checks.push(
    summary.training.blocked.length === 0
      ? {
          id: "training_bots",
          status: "pass",
          label: "Träningsbottar är tillåtna",
          detail: "Ni tillåter att innehållet används för att träna AI-modeller. Det är ett val, inte ett krav. Att blockera träning påverkar inte om ni syns i AI-svar.",
        }
      : {
          id: "training_bots",
          status: "pass",
          label: `Ni blockerar träning (${names(summary.training.blocked)})`,
          detail: "Helt okej. Att blockera träningsbottar påverkar inte om ni syns när någon frågar ChatGPT, Claude eller Perplexity. Det styrs av sökbottarna ovan.",
        },
  );

  return { profile, checks };
}
