// lib/scan/firecrawl.ts
//
// Firecrawl integration — used to scrape JS-rendered content (homepage,
// developer portals like Redoc/Swagger UI). Falls back gracefully when the
// FIRECRAWL_API_KEY env var isn't set.
//
// Calls the REST endpoint directly instead of @mendable/firecrawl-js: we only
// need one markdown scrape, and the 1.x SDK pinned zod 3 (GHSA-mrhx-c7xc-m3w5)
// while 4.x moves scrapeUrl to /v2 with cached results by default.

const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape";
const FIRECRAWL_TIMEOUT_MS = 20_000;

interface FirecrawlScrapeResponse {
  success?: boolean;
  error?: string;
  data?: { markdown?: string };
}

/**
 * Scrape a URL via Firecrawl. Returns markdown trimmed to maxChars.
 * - onlyMain=true: strip nav/sidebar (good for homepage content)
 * - onlyMain=false: keep everything (good for Redoc/Swagger UI sidebars)
 *
 * Logs misses + errors to stdout for production debugging.
 */
export async function firecrawlScrape(
  url: string,
  apiKey: string,
  maxChars = 8000,
  onlyMain = true,
): Promise<string | null> {
  try {
    const res = await fetch(FIRECRAWL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: onlyMain,
        // Give JS-heavy pages (Redoc, Swagger UI) time to initialize
        ...(onlyMain ? {} : { waitFor: 2000 }),
      }),
      signal: AbortSignal.timeout(FIRECRAWL_TIMEOUT_MS),
    });
    const body = (await res.json().catch(() => null)) as FirecrawlScrapeResponse | null;
    const markdown = body?.data?.markdown;
    if (!res.ok || !body?.success || !markdown) {
      console.log(`[firecrawl] miss url=${url} status=${res.status} success=${body?.success} len=${markdown ? markdown.length : 0}`);
      return null;
    }
    console.log(`[firecrawl] ok url=${url} chars=${markdown.length}`);
    return markdown.slice(0, maxChars);
  } catch (e) {
    console.log(`[firecrawl] error url=${url}`, String(e).slice(0, 120));
    return null;
  }
}

/** Homepage scrape — onlyMainContent=true strips navigation noise. */
export async function fetchFirecrawlContent(domain: string, apiKey: string): Promise<string | null> {
  return firecrawlScrape(`https://${domain}`, apiKey, 8000, true);
}
