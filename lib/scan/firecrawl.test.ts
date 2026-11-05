import { afterEach, describe, expect, it, vi } from "vitest";
import { firecrawlScrape } from "./firecrawl";

interface CapturedRequest {
  url: string;
  init: RequestInit;
}

function mockFetch(status: number, body: unknown): CapturedRequest[] {
  const calls: CapturedRequest[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit): Promise<Response> => {
      calls.push({ url, init });
      return new Response(JSON.stringify(body), { status });
    }),
  );
  return calls;
}

describe("firecrawlScrape", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts a v1 markdown scrape and returns trimmed markdown", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const calls = mockFetch(200, { success: true, data: { markdown: "abcdefghij" } });

    const result = await firecrawlScrape("https://example.se", "fc-key", 4, false);

    expect(result).toBe("abcd");
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.firecrawl.dev/v1/scrape");
    expect(calls[0].init.method).toBe("POST");
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe("Bearer fc-key");
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      url: "https://example.se",
      formats: ["markdown"],
      onlyMainContent: false,
      waitFor: 2000,
    });
  });

  it("omits waitFor for main-content scrapes", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const calls = mockFetch(200, { success: true, data: { markdown: "x" } });

    await firecrawlScrape("https://example.se", "fc-key");

    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      url: "https://example.se",
      formats: ["markdown"],
      onlyMainContent: true,
    });
  });

  it("returns null on API errors and unsuccessful responses", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);

    mockFetch(402, { success: false, error: "Payment required" });
    expect(await firecrawlScrape("https://example.se", "fc-key")).toBeNull();

    mockFetch(200, { success: true, data: {} });
    expect(await firecrawlScrape("https://example.se", "fc-key")).toBeNull();
  });

  it("returns null when the request throws", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("timeout"))));

    expect(await firecrawlScrape("https://example.se", "fc-key")).toBeNull();
  });
});
