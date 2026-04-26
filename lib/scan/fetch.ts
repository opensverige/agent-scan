// lib/scan/fetch.ts
//
// HTTP fetcher for scan probes — keeps both head and tail of large responses
// so we don't miss markers (e.g. Redoc state, OpenAPI download links) that
// developer portals append late in the document.

const SCANNER_UA = "OpenSverige-Scanner/1.0 (https://opensverige.se/scan)";
const FETCH_TIMEOUT_MS = 5_000;
const BODY_WINDOW = 1_000_000;

export interface FetchedResponse {
  status: number;
  body: string;
  contentType: string | null;
}

/** Fetch with timeout + redirect-follow. Returns null on network failure. */
export async function fetchSafe(url: string): Promise<FetchedResponse | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": SCANNER_UA },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const fullBody = await res.text();
    // For oversized responses, keep first + last BODY_WINDOW bytes.
    // Important for SPAs that lazy-load content into the document tail.
    const body = fullBody.length <= BODY_WINDOW * 2
      ? fullBody
      : `${fullBody.slice(0, BODY_WINDOW)}\n<!-- snip -->\n${fullBody.slice(-BODY_WINDOW)}`;
    return { status: res.status, body, contentType: res.headers.get("content-type") };
  } catch {
    return null;
  }
}
