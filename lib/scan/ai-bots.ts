// lib/scan/ai-bots.ts
//
// AI crawler taxonomy + RFC 9309 robots.txt evaluation per bot.
//
// Why this exists: the original robots check (lib/scan/robots.ts) lumps every
// AI user-agent together and fails a site that blocks GPTBot or CCBot. Those
// are *training* crawlers. Blocking them is a legitimate choice and does not
// stop a site from appearing in ChatGPT, Claude or Perplexity answers. What
// controls visibility in AI answers are the *search* and *user-triggered*
// agents (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
// PerplexityBot, Perplexity-User) plus the classic search crawlers whose
// indexes the assistants lean on (Googlebot for AI Overviews / AI Mode,
// Bingbot for Copilot). This module keeps the three purposes apart so the
// verdict can say "you block training, fine" vs "you block search, that costs
// you customers".

export type BotPurpose = "training" | "search" | "user";

export interface AiBot {
  /** robots.txt product token, matched case-insensitively. */
  token: string;
  vendor: string;
  /** Assistant or product the bot feeds. */
  product: string;
  purpose: BotPurpose;
  /** User-Agent string used when probing the site for WAF blocking. */
  userAgent: string;
}

export const AI_BOTS: readonly AiBot[] = [
  {
    token: "OAI-SearchBot",
    vendor: "OpenAI",
    product: "ChatGPT-sök",
    purpose: "search",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
  },
  {
    token: "ChatGPT-User",
    vendor: "OpenAI",
    product: "ChatGPT",
    purpose: "user",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
  },
  {
    token: "GPTBot",
    vendor: "OpenAI",
    product: "OpenAI-modellträning",
    purpose: "training",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot",
  },
  {
    token: "Claude-SearchBot",
    vendor: "Anthropic",
    product: "Claude-sök",
    purpose: "search",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)",
  },
  {
    token: "Claude-User",
    vendor: "Anthropic",
    product: "Claude",
    purpose: "user",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +https://www.anthropic.com)",
  },
  {
    token: "ClaudeBot",
    vendor: "Anthropic",
    product: "Anthropic-modellträning",
    purpose: "training",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
  },
  {
    token: "PerplexityBot",
    vendor: "Perplexity",
    product: "Perplexity-sök",
    purpose: "search",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  },
  {
    token: "Perplexity-User",
    vendor: "Perplexity",
    product: "Perplexity",
    purpose: "user",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)",
  },
  {
    token: "Googlebot",
    vendor: "Google",
    product: "Google-sök, AI Overviews och AI Mode",
    purpose: "search",
    userAgent:
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
  {
    token: "Google-Extended",
    vendor: "Google",
    product: "Gemini-modellträning",
    purpose: "training",
    // Google-Extended is a robots.txt token only, it never sends requests.
    userAgent: "",
  },
  {
    token: "Bingbot",
    vendor: "Microsoft",
    product: "Bing och Copilot",
    purpose: "search",
    userAgent:
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  },
  {
    token: "CCBot",
    vendor: "Common Crawl",
    product: "Öppet träningsdataset",
    purpose: "training",
    userAgent: "CCBot/2.0 (https://commoncrawl.org/faq/)",
  },
  {
    token: "Applebot-Extended",
    vendor: "Apple",
    product: "Apple Intelligence-träning",
    purpose: "training",
    // Robots token only, like Google-Extended.
    userAgent: "",
  },
  {
    token: "meta-externalagent",
    vendor: "Meta",
    product: "Meta AI-träning",
    purpose: "training",
    userAgent:
      "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)",
  },
] as const;

interface RobotsRule {
  allow: boolean;
  pattern: string;
}

interface RobotsGroup {
  agents: string[];
  rules: RobotsRule[];
}

/**
 * Parse robots.txt into groups per RFC 9309 § 2.1: one or more consecutive
 * `user-agent` lines start a group, the rules that follow belong to it until
 * the next `user-agent` line that comes after a rule.
 */
export function parseRobotsGroups(body: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }

    if (key === "allow" || key === "disallow") {
      lastWasAgent = false;
      if (!current) continue;
      // An empty Disallow means "allow everything" and adds no rule.
      if (value === "") continue;
      current.rules.push({ allow: key === "allow", pattern: value });
      continue;
    }
    // Other directives (sitemap, crawl-delay, content-signal, ...) do not
    // close a group of user-agent lines in practice, but they do end the
    // "consecutive user-agent" run.
    lastWasAgent = false;
  }
  return groups;
}

/** Convert a robots path pattern with `*` and `$` to a RegExp. */
function patternToRegExp(pattern: string): RegExp {
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const escaped = body
    .split("*")
    .map(part => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${escaped}${anchored ? "$" : ""}`);
}

/**
 * Is `path` allowed for the bot with `token`? RFC 9309 semantics:
 * - use every group whose user-agent equals the token (case-insensitive);
 *   fall back to `*` groups; no group at all means allowed
 * - the longest matching pattern wins; on a tie, Allow wins
 */
export function isPathAllowed(groups: RobotsGroup[], token: string, path = "/"): boolean {
  const t = token.toLowerCase();
  let matching = groups.filter(g => g.agents.includes(t));
  if (matching.length === 0) matching = groups.filter(g => g.agents.includes("*"));
  if (matching.length === 0) return true;

  let best: RobotsRule | null = null;
  for (const group of matching) {
    for (const rule of group.rules) {
      if (!patternToRegExp(rule.pattern).test(path)) continue;
      if (
        !best ||
        rule.pattern.length > best.pattern.length ||
        (rule.pattern.length === best.pattern.length && rule.allow && !best.allow)
      ) {
        best = rule;
      }
    }
  }
  return best ? best.allow : true;
}

export interface BotRobotsVerdict {
  bot: AiBot;
  /** True when robots.txt lets the bot fetch the homepage. */
  allowed: boolean;
  /** True when a group names this bot explicitly (not just `*`). */
  explicit: boolean;
}

/** Evaluate robots.txt for every bot in the taxonomy. */
export function evaluateRobotsForBots(robotsBody: string | null): BotRobotsVerdict[] {
  const groups = robotsBody ? parseRobotsGroups(robotsBody) : [];
  return AI_BOTS.map(bot => ({
    bot,
    allowed: isPathAllowed(groups, bot.token, "/"),
    explicit: groups.some(g => g.agents.includes(bot.token.toLowerCase())),
  }));
}

export interface PurposeSummary {
  purpose: BotPurpose;
  blocked: AiBot[];
  allowed: AiBot[];
}

/** Group robots verdicts by purpose for the result UI. */
export function summarizeByPurpose(verdicts: BotRobotsVerdict[]): Record<BotPurpose, PurposeSummary> {
  const empty = (purpose: BotPurpose): PurposeSummary => ({ purpose, blocked: [], allowed: [] });
  const out: Record<BotPurpose, PurposeSummary> = {
    training: empty("training"),
    search: empty("search"),
    user: empty("user"),
  };
  for (const v of verdicts) {
    (v.allowed ? out[v.bot.purpose].allowed : out[v.bot.purpose].blocked).push(v.bot);
  }
  return out;
}
