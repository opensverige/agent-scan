// middleware.ts
//
// Markdown content negotiation per llmstxt.org spec + Cloudflare's
// agent-readiness recommendation. When an AI agent or coding assistant
// (Claude Code, Cursor, OpenCode) sends `Accept: text/markdown`, we
// serve the markdown variant of the page directly — typically ~80%
// smaller than rendered HTML, much friendlier to LLM context windows.
//
// Implementation: when Accept contains text/markdown on a known route,
// rewrite to /llms-full.txt and force Content-Type: text/markdown.
// We don't have per-page markdown files yet; the unified llms-full.txt
// is the canonical agent-context document for the whole site.

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

export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept") ?? "";
  // Only act when the client is asking for markdown specifically. Browsers
  // send text/html;q=0.9,*/*;q=0.8 — they won't trip this.
  const wantsMarkdown =
    accept.toLowerCase().includes("text/markdown") &&
    !accept.toLowerCase().includes("text/html");

  if (!wantsMarkdown) return NextResponse.next();

  // Only intercept on known content routes — leave /api/* and assets alone.
  if (!NEGOTIATED_PATHS.has(req.nextUrl.pathname)) return NextResponse.next();

  // Rewrite to the static llms-full.txt and force markdown content-type.
  // The static file is plain text, but Markdown is a strict superset so
  // any client expecting Markdown can parse it without issue.
  const url = req.nextUrl.clone();
  url.pathname = "/llms-full.txt";
  const response = NextResponse.rewrite(url);
  response.headers.set("Content-Type", "text/markdown; charset=utf-8");
  response.headers.set("X-Content-Negotiation", "markdown");
  return response;
}

export const config = {
  // Match exact routes we negotiate on; skip /api, /_next, and static assets.
  matcher: [
    "/",
    "/scan",
    "/integritetspolicy",
    "/api-docs",
    "/legal/:path*",
  ],
};
