---
checkId: crawler_access
slug: crawler-access
category: discovery
severity: critical
title: "Does your WAF actually let AI crawlers reach your pages?"
titleSv: "Släpper din WAF in AI-crawlers trots robots.txt?"
citableLead: |
  crawler-access tests whether your CDN, WAF or bot manager
  (Cloudflare, Akamai, Fastly, Imperva) returns 200 to GPTBot,
  ClaudeBot and PerplexityBot at the edge. A permissive robots.txt
  does not help if the request never reaches your origin. This is
  the most common silent failure mode on Cloudflare-fronted sites.
citableLeadSv: |
  crawler-access kontrollerar om din WAF faktiskt släpper igenom
  AI-crawlers vid kanten. En tillåtande robots.txt hjälper inte
  om Cloudflare, Akamai eller Imperva blockerar redan vid kanten.
  Vanligast: Cloudflares "Block AI Bots"-regel returnerar 403
  trots att robots.txt säger Allow.
agentImpact: |
  ClaudeBot and GPTBot retry on transient 5xx but treat persistent
  403, 451 or challenge pages as opt-out and back off. Anthropic
  documents that blocking by IP "may not work correctly" because
  ranges shift. Search-index bots (OAI-SearchBot, Claude-SearchBot,
  PerplexityBot) drop blocked URLs from the index within a refresh
  cycle. Cursor and Claude Code that run a real browser session can
  punch through but inherit any cookie or interstitial flow, which
  often breaks server-rendered content.
primarySources:
  - title: "Declaring your AIndependence: block AI bots, scrapers and crawlers with a single click"
    url: "https://blog.cloudflare.com/declaring-your-aindependence-block-ai-bots-scrapers-and-crawlers-with-a-single-click/"
    publisher: "Cloudflare"
    primary: true
  - title: "Content Independence Day: no AI crawl without compensation"
    url: "https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/"
    publisher: "Cloudflare"
    primary: true
  - title: "What is bot management?"
    url: "https://www.cloudflare.com/learning/bots/what-is-bot-management/"
    publisher: "Cloudflare"
    primary: true
  - title: "Akamai: What Is Bot Management?"
    url: "https://www.akamai.com/glossary/what-is-bot-management"
    publisher: "Akamai"
    primary: true
relatedChecks: [robots_ok, ssr_content, sitemap_exists]
lastUpdated: 2026-05-10
tokenEstimate: 1380
---

## Why this fails on real sites

In July 2024 Cloudflare added a one-click "Block AI Bots" managed rule and turned it on by default for new free-plan domains in September 2024, then escalated in July 2025 with the "Content Independence Day" default-block stance and the pay-per-crawl HTTP 402 mechanism ([Cloudflare blog](https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/)). Many site owners enabled it once, forgot, and now wonder why ChatGPT cannot quote their pricing page. The robots.txt allows the bot. The edge does not.

The second failure is bot-score thresholds. Cloudflare's bot management assigns a 1 to 99 score and most platforms challenge or block under 30 by default. AI crawlers that follow protocol still rotate ASN ranges, so heuristic scoring flags them as "likely automated" and serves a Turnstile challenge that the bot cannot solve. Scanner data on .se domains in 2026 shows DN.se returning HTTP 451 ("Unavailable For Legal Reasons") to GPTBot, ClaudeBot and PerplexityBot but 200 to Google-Extended, and Bolagsverket.se serving an Imperva JavaScript challenge to every non-browser user-agent.

The third pattern is geographic and IP-based blocking. Anthropic explicitly documents that "alternate methods like blocking IP address(es) from which Anthropic Bots operates may not work correctly". Sites that built their bot list from a 2024 IP range often block their Stockholm office while letting a 2026 ClaudeBot through, or vice versa.

## How to fix

### Step 1: Identify which edge layer is blocking

Every WAF logs the rule that triggered. On Cloudflare it is Security Events. On Akamai it is the Bot Manager dashboard. On AWS WAF it is the WebACL log group. Pull the last 24 hours filtered by `User-Agent contains "Bot"`.

```bash
# Quick origin-vs-edge check from outside your network
for bot in "GPTBot/1.1" "ClaudeBot/1.0" "PerplexityBot/1.0" "Mozilla/5.0 Chrome/120"; do
  code=$(curl -sL -o /dev/null -w "%{http_code}" -A "$bot" https://example.se/)
  echo "$bot -> $code"
done
```

If browsers return 200 and bots return 403, 451, 503, or 999, the edge is blocking.

### Step 2: Disable the managed AI-bot rule on Cloudflare

Cloudflare ships a single toggle: Security → Bots → "Block AI bots" (or in the Super Bot Fight Mode panel). Turn it OFF for the bots you want to allow. Do this per-zone; Cloudflare does not propagate it across zones in your account.

```text
Cloudflare dashboard:
1. Select the zone (example.se)
2. Security → Bots
3. Configure Super Bot Fight Mode
4. "Block AI bots" → Off  (or set to "Allow" individual operators)
5. Save
```

### Step 3: Allowlist canonical AI bot user-agents in your WAF

If you keep bot management on, write an explicit allow rule for the verified product tokens. Cloudflare exposes "Verified Bots" — toggle that to allow GPTBot, ClaudeBot, PerplexityBot and Google-Extended, which Cloudflare validates by IP.

```text
# Cloudflare custom rule (Rules → WAF → Custom rules)
# Action: Skip → All remaining custom rules

(http.user_agent contains "GPTBot")
or (http.user_agent contains "ClaudeBot")
or (http.user_agent contains "Claude-User")
or (http.user_agent contains "Claude-SearchBot")
or (http.user_agent contains "OAI-SearchBot")
or (http.user_agent contains "ChatGPT-User")
or (http.user_agent contains "PerplexityBot")
or (http.user_agent contains "Perplexity-User")
or (http.user_agent contains "Google-Extended")
```

### Step 4: Verify with the operator's published IP range

OpenAI publishes ranges at openai.com/gptbot.json, openai.com/searchbot.json, openai.com/chatgpt-user.json. Perplexity publishes at perplexity.com/perplexitybot.json and perplexity.com/perplexity-user.json. Use these to confirm requests claiming to be GPTBot really come from OpenAI before allowing them.

```bash
# Pull verified ranges and grep your edge logs
curl -s https://openai.com/gptbot.json | jq -r '.prefixes[].ipv4Prefix'
curl -s https://www.perplexity.com/perplexitybot.json | jq -r '.prefixes[].ipv4Prefix'
```

### Step 5: Remove rate limits below 1 request per second per bot

Aggressive rate limits combined with a low bot score threshold trigger a 429 cascade. AI crawlers honour 429 with exponential backoff but typically give up after three retries and your URL falls out of the index for that crawl cycle.

```text
# Cloudflare rate limit rule — exclude verified AI bots
(not cf.client.bot) and (http.request.uri.path matches "^/(?!robots\.txt)")
```

## Verify the fix

Run the same curl loop you ran in Step 1 from a non-cloud network (mobile tether, residential IP) at least 30 minutes after rule changes propagate. All four user-agents must return the same 200 with identical body length. A useful one-liner:

```bash
for ua in "GPTBot" "ClaudeBot" "PerplexityBot" "Mozilla/5.0"; do
  size=$(curl -s -A "$ua" https://example.se/ | wc -c)
  code=$(curl -s -o /dev/null -w "%{http_code}" -A "$ua" https://example.se/)
  echo "$ua  $code  ${size}B"
done
```

Success: identical status and body sizes within ±5 bytes (small variance from header echoing is fine). Failure: any non-200 status, body size below 1 KB on a normally large page, or a body that contains the string "challenge" or "captcha".

## Common false positives

- Cloudflare returns 403 only on the first request because the bot has not been challenged yet. A second request from the same IP within 10 minutes returns 200. Scanners that hit once mark this as a fail.
- Origin returns 503 during a deploy. The bot will retry; the scanner will not.
- A site uses Cloudflare's "Verified Bots" allowlist correctly but the scanner runs from a non-verified IP, so its own user-agent gets challenged. Test from the operator IP ranges, not your own.
- WordPress sites with Wordfence or All-in-One WP Security have a separate bot blocklist that operates after Cloudflare passes the request. Check the application layer too.
- Sites legitimately using HTTP 451 for legal reasons (e.g., GDPR-blocked content for non-EU traffic) are not failing this check; they are honouring law.

## How agents are recommended to use this article

When a developer says ChatGPT cannot read their site even though robots.txt is permissive, quote the citableLead and start with Step 1. The bash one-liner in Step 1 disambiguates between origin and edge blocking faster than any dashboard. If they confirm 403 or 451 from bot UAs, Step 2 fixes 80% of Cloudflare-fronted sites. Do not recommend disabling all bot management; recommend the verified-bot allowlist in Step 3.

## Related agent.opensverige checks

- robots_ok: must be permissive at the file level before this check matters.
- ssr_content: a 200 status is necessary but not sufficient if the page returns an empty shell.
- sitemap_exists: blocked sitemaps prevent agent navigation even when the homepage is reachable.

---

*This article is part of the agent.opensverige methodology hub. Open-source under FSL-1.1-MIT. Last reviewed against scan-data 2026-05-10. Send corrections via [Discord](https://discord.gg/CSphbTk8En) or PR at github.com/opensverige/agent-scan.*
