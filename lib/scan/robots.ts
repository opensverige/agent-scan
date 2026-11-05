// lib/scan/robots.ts
//
// robots.txt parser focused on AI-agent allow/deny + sitemap discovery.
// `allowed` is false only when a *search* or *user-triggered* AI bot is shut
// out of the homepage (OAI-SearchBot, ChatGPT-User, Claude-SearchBot,
// PerplexityBot, Googlebot, ...). Blocking training crawlers such as GPTBot,
// CCBot or Google-Extended is a legitimate choice that does not remove a
// site from AI answers, so it no longer fails the check. RFC 9309 group and
// longest-match semantics live in ./ai-bots.ts.

import { evaluateRobotsForBots } from "./ai-bots";

export interface RobotsParseResult {
  allowed: boolean;
  sitemapUrl: string | null;
}

export function parseRobots(body: string): RobotsParseResult {
  const lines = body.split("\n");
  let sitemapUrl: string | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const lower = line.toLowerCase();

    if (lower.startsWith("sitemap:")) {
      const url = line.slice(8).trim();
      if (url) sitemapUrl = url;
    }
  }

  const searchBlocked = evaluateRobotsForBots(body).some(v => v.bot.purpose !== "training" && !v.allowed);
  return { allowed: !searchBlocked, sitemapUrl };
}
