import { MetadataRoute } from "next";

// Explicit allow-list for known AI crawlers and search bots. We want our
// site indexed by every model that powers AI search and coding agents,
// because every citation funnels EU-jurisdiction-aware builders to us.
//
// /api/v1/* is intentionally ALLOWED — the public scanner API is part of
// our builder surface and agents need to discover it via crawling the
// docs. Only internal Next.js paths under /api/_next or /api/internal
// would warrant disallow, and we don't expose those.
const AI_AGENTS = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  // Google
  "Google-Extended",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Common Crawl (used by many LLMs as training input)
  "CCBot",
  // Apple Intelligence
  "Applebot",
  "Applebot-Extended",
  // Mistral
  "MistralAI-User",
  // Cohere
  "cohere-ai",
  "cohere-training-data-crawler",
  // Amazon
  "Amazonbot",
  // Meta
  "FacebookBot",
  "Meta-ExternalAgent",
  // ByteDance / TikTok
  "Bytespider",
  // Diffbot
  "Diffbot",
  // DuckDuckGo
  "DuckAssistBot",
  // You.com
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://agent.opensverige.se/sitemap.xml",
    host: "https://agent.opensverige.se",
  };
}
