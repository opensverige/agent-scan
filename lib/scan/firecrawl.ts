// lib/scan/firecrawl.ts
//
// Firecrawl integration — used to scrape JS-rendered content (homepage,
// developer portals like Redoc/Swagger UI). Falls back gracefully when the
// FIRECRAWL_API_KEY env var isn't set.

const FIRECRAWL_TIMEOUT_MS = 20_000;

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
    // eslint-disable-next-line
    const { default: FirecrawlApp } = await import("@mendable/firecrawl-js");
    const app = new FirecrawlApp({ apiKey });
    const deadline = new Promise<null>(resolve => setTimeout(() => resolve(null), FIRECRAWL_TIMEOUT_MS));
    const result = await Promise.race([
      app.scrapeUrl(url, {
        formats: ["markdown"],
        onlyMainContent: onlyMain,
        // Give JS-heavy pages (Redoc, Swagger UI) time to initialize
        ...(onlyMain ? {} : { waitFor: 2000 }),
      }),
      deadline,
    ]);
    if (!result || !("success" in result) || !result.success || !result.markdown) {
      const r = result as unknown as Record<string, unknown> | null;
      console.log(`[firecrawl] miss url=${url} success=${r?.success} len=${r?.markdown ? String(r.markdown).length : 0}`);
      return null;
    }
    console.log(`[firecrawl] ok url=${url} chars=${result.markdown.length}`);
    return result.markdown.slice(0, maxChars);
  } catch (e) {
    console.log(`[firecrawl] error url=${url}`, String(e).slice(0, 120));
    return null;
  }
}

/** Homepage scrape — onlyMainContent=true strips navigation noise. */
export async function fetchFirecrawlContent(domain: string, apiKey: string): Promise<string | null> {
  return firecrawlScrape(`https://${domain}`, apiKey, 8000, true);
}
