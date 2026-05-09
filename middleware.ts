// middleware.ts
//
// Markdown content negotiation per llmstxt.org spec + Cloudflare's
// agent-readiness pattern (G-02). When an AI agent or coding assistant
// (Claude Code, Cursor, OpenCode) sends `Accept: text/markdown`, we
// serve a concise markdown response inline instead of HTML — typically
// ~80% smaller, much friendlier to LLM context windows.
//
// We return the body inline (rather than rewriting to /llms-full.txt)
// because Edge middleware can override Content-Type on its own
// responses but cannot reliably override Content-Type when rewriting
// to a static asset (Vercel's static handler wins).

import { NextResponse, type NextRequest } from "next/server";

const NEGOTIATED_PATHS = new Set([
  "/",
  "/scan",
  "/mcp",
  "/integritetspolicy",
  "/api-docs",
  "/legal/terms",
  "/legal/aup",
  "/legal/ai-disclosure",
  "/legal/subprocessors",
]);

// Inline markdown body. Mirrors public/llms.txt — the navigation index for
// AI agents that prefer markdown over HTML. Keep this file and llms.txt in
// sync; we deliberately don't read from disk because Edge middleware has
// no fs access.
//
// EU-jurisdiction is leading because that's our positioning vs Cloudflare's
// global isitagentready.com, and it's what an AI search citation needs to
// know about us in one breath.
const MARKDOWN_BODY = `# agent.opensverige

> EU-jurisdiction AI-agent-readiness scanner. Free. Open source under FSL-1.1-MIT. 17 checks across discovery, EU AI Act Art. 50 compliance, and developer surface. The Swedish/Nordic alternative to Cloudflare's isitagentready.com.

## Scan

- [Scanner UI](https://agent.opensverige.se/scan): Paste a domain, get 17 checks back in 10-30 s. No signup. Pinned, shareable result URL.
- [POST /api/v1/scan](https://agent.opensverige.se/api/v1/scan): Synchronous JSON. Bearer auth. EU-only data plane.
- [Skill manifest](https://agent.opensverige.se/skills/scan-api.md): When-to-use, inputs, constraints, error table.

## Integrate

- [API reference (Scalar)](https://agent.opensverige.se/api-docs): Interactive OpenAPI 3.1.
- [OpenAPI 3.1 spec](https://agent.opensverige.se/openapi.yaml): Machine-readable.
- [MCP server card (planned)](https://agent.opensverige.se/.well-known/mcp.json)
- [OpenAI plugin manifest](https://agent.opensverige.se/.well-known/ai-plugin.json)
- [Per-bot policy](https://agent.opensverige.se/.well-known/agent-permissions.json)

## Methodology

- [Scanner methodology](https://github.com/opensverige/agent-scan/blob/main/docs/SCANNER-METHODOLOGY.md): All 17 checks with sources.
- [llms-full.txt](https://agent.opensverige.se/llms-full.txt): Long-form context for this site.

## EU compliance posture

- [Privacy policy](https://agent.opensverige.se/integritetspolicy): What we store, why, how long (90 days). HMAC-hashed IPs only.
- [Terms](https://agent.opensverige.se/legal/terms)
- [AUP](https://agent.opensverige.se/legal/aup)
- [AI Disclosure](https://agent.opensverige.se/legal/ai-disclosure): EU AI Act Art. 50, machine-readable.
- [Sub-processors](https://agent.opensverige.se/legal/subprocessors): Anthropic, Supabase, Vercel — EU-data-plane mappings.

## Source

- [GitHub](https://github.com/opensverige/agent-scan): FSL-1.1-MIT.
- [LICENSE](https://github.com/opensverige/agent-scan/blob/main/LICENSE): 2-year non-compete, then MIT.
- [COMMERCIAL](https://github.com/opensverige/agent-scan/blob/main/COMMERCIAL.md): Buy a commercial license to bypass FSL non-compete.
- [AGENTS.md](https://github.com/opensverige/agent-scan/blob/main/AGENTS.md): Repo conventions for any agent (Claude, Cursor, Codex).

## Talk to humans

- [Discord](https://discord.gg/CSphbTk8En): 300+ Swedish builders. Where API keys are issued.
- [opensverige.se](https://opensverige.se): Community hub.
- info@opensverige.se

For full context: https://agent.opensverige.se/llms-full.txt
`;

// Cheap heuristic: ~4 chars per token for English/Swedish. Surfaced to
// agents so they can budget context windows without re-counting on their
// side. See addyosmani.com/blog/agentic-engine-optimization for why.
const APPROX_TOKEN_COUNT = Math.ceil(MARKDOWN_BODY.length / 4);

export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept") ?? "";
  const lower = accept.toLowerCase();
  // Only intervene when the client is asking for markdown specifically.
  // Browsers send `text/html;q=0.9,*/*;q=0.8` — they won't trip this.
  // Cursor, Claude Code, OpenCode send `Accept: text/markdown` directly.
  const wantsMarkdown =
    lower.includes("text/markdown") && !lower.includes("text/html");
  if (!wantsMarkdown) return NextResponse.next();

  if (!NEGOTIATED_PATHS.has(req.nextUrl.pathname)) return NextResponse.next();

  return new NextResponse(MARKDOWN_BODY, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Content-Negotiation": "markdown",
      "X-Token-Count": String(APPROX_TOKEN_COUNT),
      "X-Robots-Tag": "all",
      // Cache for an hour at the edge — the document changes rarely.
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/scan",
    "/mcp",
    "/integritetspolicy",
    "/api-docs",
    "/legal/:path*",
  ],
};
