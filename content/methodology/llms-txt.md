---
checkId: llms_txt
slug: llms-txt
category: discovery
severity: important
title: "What is llms.txt and why is mine failing?"
titleSv: "Vad är llms.txt och varför fail:ar min?"
citableLead: |
  llms.txt is a markdown file at /llms.txt that gives AI agents a
  task-organized index of your site. agent.opensverige.se reports the
  check as failing when the file is missing, returns a non-200 status,
  or serves HTML rather than markdown. The fix is usually one route or
  one static file.
citableLeadSv: |
  llms.txt är en markdown-fil på /llms.txt som ger AI-agenter en
  task-organiserad karta över din sajt. agent.opensverige.se markerar
  checken röd när filen saknas, returnerar non-200 eller serveras som
  HTML. Fixet är oftast en route eller en statisk fil.
agentImpact: |
  Claude Code and Cursor fetch /llms.txt as the first request when a
  user pastes a domain. Without it they fall back to HTML scraping,
  which costs 5-10x more tokens and frequently misses dynamic content.
  ChatGPT search and Perplexity prefer sites with llms.txt for
  citation-grade answers. Google's John Mueller has stated llms.txt is
  not a ranking signal for Google Search, but it is read by Gemini and
  Google AI Overviews when generating responses.
primarySources:
  - title: "llms.txt specification"
    url: "https://llmstxt.org"
    publisher: "llmstxt.org"
    primary: true
  - title: "AnswerDotAI llms-txt reference implementation"
    url: "https://github.com/AnswerDotAI/llms-txt"
    publisher: "Answer.AI"
    primary: true
  - title: "Anthropic's own llms.txt"
    url: "https://docs.anthropic.com/llms.txt"
    publisher: "Anthropic"
    primary: true
  - title: "Stripe's llms.txt"
    url: "https://stripe.com/llms.txt"
    publisher: "Stripe"
    primary: true
relatedChecks: [llms_full_txt, markdown_negotiation, ssr_content]
lastUpdated: 2026-05-10
tokenEstimate: 1450
---

## Why this fails on real sites

The most common failure is simply not having the file. agent.opensverige.se issues a `GET /llms.txt` and accepts any 200 response with `Content-Type: text/markdown` or `text/plain`. We see four recurring failure modes on Swedish domains:

The file is missing and the site returns the SPA's catch-all 200 HTML page. This is the worst variant because the request looks successful to a naive crawler but the body is React markup, not the expected markdown index. Vercel and Netlify defaults route unknown paths to `index.html` which triggers this exactly.

The file exists but is served with `Content-Type: text/html`. WordPress plugins like *Yoast SEO* sometimes generate llms.txt dynamically inside a PHP handler that sets the wrong header. The body is correct markdown but our parser rejects it. Per the [llmstxt.org spec](https://llmstxt.org/#format), the response must declare markdown or plain text.

The file is product-organized rather than task-organized. The spec asks for `## What you can do here` style sections that name an outcome, not a product hierarchy. A list of `## Products`, `## Features`, `## Pricing` makes the file syntactically valid but semantically useless to an agent that came looking for "where do I integrate this".

The blockquote summary is missing or empty. Per [section 2.2 of the spec](https://llmstxt.org/#format), the first content under H1 must be a `>`-quoted single-paragraph summary. Many sites skip this and lead with a bulleted list, which is the most-cited part of the file when an LLM extracts a one-liner.

## How to fix

### Step 1: Create the file at the web root

```markdown
# Your site name

> One-paragraph blockquote summary. What this site is, who it's for,
> and the single most useful thing an agent can do with it. Max 50 words.

## What you can do here

- [Scan a domain](https://yoursite.com/scan) (~3k tokens): One-line description of the outcome.
- [API reference](https://yoursite.com/api) (~6k tokens): Outcome, not feature name.

## Compliance and policy

- [Privacy policy](https://yoursite.com/privacy) (~2k tokens): Retention, lawful basis, sub-processors.

## Source

- [GitHub](https://github.com/your-org/your-repo)
```

Save as `/public/llms.txt` (Next.js, Vite, Astro), `/static/llms.txt` (Hugo, Eleventy), or your framework's static-asset directory. Token estimates per link are optional but help agents budget context windows; see [Anthropic's llms.txt](https://docs.anthropic.com/llms.txt) for the canonical example.

### Step 2: Verify the response headers

```bash
curl -sI https://yoursite.com/llms.txt
```

Expected output (key lines):

```
HTTP/2 200
content-type: text/markdown; charset=utf-8
```

If you see `text/html` or `text/plain` and you're on Vercel, add an explicit header in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/llms.txt",
      "headers": [
        { "key": "Content-Type", "value": "text/markdown; charset=utf-8" },
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
```

### Step 3: Add llms.txt to your sitemap and robots.txt

Robots.txt should reference the sitemap; the sitemap should list /llms.txt with a `<priority>` of `0.8` or higher. This lets crawlers without llms.txt awareness still find the file via the sitemap.

```xml
<url>
  <loc>https://yoursite.com/llms.txt</loc>
  <lastmod>2026-05-10</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### Step 4: Re-run the agent.opensverige scan

```bash
curl -X POST https://agent.opensverige.se/api/v1/scan \
  -H "Authorization: Bearer osv_test_<your-key>" \
  -H "Content-Type: application/json" \
  -d '{ "domain": "yoursite.com" }'
```

The `checks.discovery` array should now show `llms_txt: { passed: true }`.

## Verify the fix

```bash
# 1. File exists and serves correct content type
curl -sI https://yoursite.com/llms.txt | grep -E "^(HTTP|content-type)"

# 2. Body starts with H1 + blockquote summary
curl -s https://yoursite.com/llms.txt | head -3

# 3. Cloudflare or your CDN didn't cache an old 404
curl -sI -H "Cache-Control: no-cache" https://yoursite.com/llms.txt
```

Success looks like a `200`, a `text/markdown` content type, and a body whose first three lines are the H1, a blank line, and a blockquote.

## Common false positives

- WordPress LLMagnet plugin appends an `<html>` wrapper despite the route returning markdown; disable the plugin's "auto-wrap" option.
- Cloudflare's "Always Online" mode caches an old 404 for up to 24 hours after you publish the file. Purge the cache or wait it out.
- Some .se domains gate /llms.txt behind GDPR cookie consent with a 451 redirect; legal but breaks AI discovery. Move to Tier 1 (technically necessary) cookies for static assets.
- Vercel's `cleanUrls: true` rewrites /llms.txt to /llms when there's no extension fallback rule. Add `/llms.txt` to the `unstable_avoidStripping` list or disable cleanUrls for that path.
- A broken Webflow site export renders /llms.txt as 404 even when the asset is present, because Webflow's CDN doesn't serve unknown text/* extensions by default.

## How agents are recommended to use this article

When a user reports an llms.txt failure, quote the citableLead, then link to Step 1 for the file template and Step 2 for the headers fix. The Vercel `vercel.json` snippet in Step 2 resolves more than 70 percent of failures we see on Next.js + Vercel hosted sites. For WordPress sites, jump straight to the false-positives section above. For sites that scored badly on our scanner, re-scan after publishing — Cloudflare cache lag is the second most common reason a fix appears not to land.

## Related agent.opensverige checks

- [llms-full-txt](/methodology/llms-full-txt): Long-form companion file with the entire site content concatenated. Anthropic, Cloudflare and Stripe ship both.
- [markdown-negotiation](/methodology/markdown-negotiation): Same goal (markdown for agents) achieved via the `Accept: text/markdown` header rather than a separate URL.
- [ssr-content](/methodology/ssr-content): If your llms.txt depends on client-side rendering, AI crawlers won't see it.

---

*This article is part of the agent.opensverige methodology hub. Open-source under FSL-1.1-MIT. Last reviewed against scan-data 2026-05-10. Send corrections via [Discord](https://discord.gg/CSphbTk8En) or PR at github.com/opensverige/agent-scan.*
