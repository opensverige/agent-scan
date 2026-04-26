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
const MARKDOWN_BODY = `# agent.opensverige

> Sveriges öppna AI-agent-readiness scanner. 17 checks. EU-jurisdiktion. Open source under FSL-1.1-MIT.

## Web

- [Scanner](https://agent.opensverige.se/scan): Klistra in en domän, få tillbaka 17 strukturerade checks. Gratis.

## API

- [API reference](https://agent.opensverige.se/api-docs): Interaktiv OpenAPI 3.1
- [OpenAPI 3.1 spec](https://agent.opensverige.se/openapi.yaml)
- [API documentation](https://github.com/opensverige/agent-scan/blob/main/docs/API.md)

## Methodology

- [Scanner methodology](https://github.com/opensverige/agent-scan/blob/main/docs/SCANNER-METHODOLOGY.md): Alla 17 checks med källor

## Open source

- [GitHub](https://github.com/opensverige/agent-scan): FSL-1.1-MIT
- [LICENSE](https://github.com/opensverige/agent-scan/blob/main/LICENSE)
- [COMMERCIAL](https://github.com/opensverige/agent-scan/blob/main/COMMERCIAL.md): Köp kommersiell licens

## Legal

- [Privacy](https://agent.opensverige.se/integritetspolicy)
- [Terms](https://agent.opensverige.se/legal/terms)
- [AUP](https://agent.opensverige.se/legal/aup)
- [AI Disclosure](https://agent.opensverige.se/legal/ai-disclosure): EU AI Act Art. 50
- [Sub-processors](https://agent.opensverige.se/legal/subprocessors)

## Community

- [Discord](https://discord.gg/CSphbTk8En): 300+ svenska builders
- info@opensverige.se

For full context: https://agent.opensverige.se/llms-full.txt
`;

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
      // Cache for an hour at the edge — the document changes rarely.
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/scan",
    "/integritetspolicy",
    "/api-docs",
    "/legal/:path*",
  ],
};
