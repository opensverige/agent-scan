// lib/scan/robots.ts
//
// robots.txt parser focused on AI-agent allow/deny + sitemap discovery.
// Based on RFC 9309. We only check whether known AI crawlers (or wildcard *)
// are blocked from the root path — finer-grained access control is a future
// check (G-04 from research).

const AI_AGENTS = [
  "gptbot", "claudebot", "anthropic-ai", "ccbot",
  "google-extended", "omgilibot",
];

export interface RobotsParseResult {
  allowed: boolean;
  sitemapUrl: string | null;
}

export function parseRobots(body: string): RobotsParseResult {
  const lines = body.split("\n");
  let groupUAs: string[] = [];
  let inGroup = false;
  let blocked = false;
  let sitemapUrl: string | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const lower = line.toLowerCase();

    if (lower.startsWith("user-agent:")) {
      const ua = lower.replace("user-agent:", "").trim();
      if (!inGroup) { groupUAs = [ua]; inGroup = true; }
      else { groupUAs.push(ua); }
    } else if (lower.startsWith("disallow:")) {
      const path = lower.replace("disallow:", "").trim();
      if (path === "/" && groupUAs.some(ua => AI_AGENTS.includes(ua) || ua === "*")) {
        blocked = true;
      }
      inGroup = false;
    } else if (lower.startsWith("sitemap:")) {
      const url = line.slice(8).trim();
      if (url) sitemapUrl = url;
    } else if (line === "") {
      groupUAs = [];
      inGroup = false;
    }
  }

  return { allowed: !blocked, sitemapUrl };
}
