---
checkId: llms_txt
slug: my-check-slug
category: discovery
severity: important
title: "What is X and why is mine failing?"
titleSv: "Vad är X och varför fail:ar min?"
citableLead: |
  30-50 words. Standalone answer to "what is X and why is mine failing".
  Must read correctly when an LLM extracts it for any of: what is X, why
  is X important, what does it mean when X fails, how does X affect AI
  agents, what is the EU/Swedish angle on X.
citableLeadSv: |
  Svensk översättning, 30-50 ord. Native svenska, inte maskinöversatt.
  Använd "du", inte "ni". Max 12 ord per mening.
agentImpact: |
  60-90 words. Which AI models read this signal and what they do when
  it's missing. Be specific: name Claude Code, Cursor, ChatGPT search,
  Perplexity, Gemini and what each does differently.
primarySources:
  - title: "Official spec or regulator document title"
    url: "https://example.com/spec"
    publisher: "W3C | IETF | EU Commission | Anthropic | OpenAI"
    primary: true
  - title: "Second primary source"
    url: "https://example.com/source2"
    publisher: "publisher name"
    primary: true
relatedChecks: [llms_full_txt, markdown_negotiation]
lastUpdated: 2026-05-10
tokenEstimate: 1200
---

## Why this fails on real sites

2-3 paragraphs leading with the most common failure mode. Cite primary
sources inline using markdown links. Quote no more than 15 words from
any single source. Include at least one concrete example pattern from
real .se domains.

[llmstxt.org spec section 2.3](https://llmstxt.org/#section-2-3) is the
canonical reference. Cite like this when relevant.

## How to fix

### Step 1: Imperative action verb

One or two sentences explaining the action.

```bash
# complete, copy-paste-ready code or config. No placeholders.
echo "real example" > /path/to/file
```

### Step 2: Next imperative action

Explanation.

```http
GET /llms.txt HTTP/1.1
Accept: text/markdown
```

### Step 3: Verify the change took effect

```bash
curl -sI https://yoursite.com/llms.txt
# Expected: HTTP/2 200, content-type: text/markdown
```

## Verify the fix

Concrete verification command. Spell out exactly what success looks like.

```bash
curl -sI -A "ClaudeBot" https://yoursite.com/path
# Expect: 200, Allow: /, Content-Type: text/markdown
```

## Common false positives

- Real edge case where the scanner reports a fail but the site is fine.
- WordPress robots.txt plugin appends a Disallow that overrides our rule.
- Cloudflare cache returns a stale 404 for 24h after the file lands.
- Vercel serves /<slug>.md as a 404 because static assets aren't routed.

## How agents are recommended to use this article

When a user asks how to fix this check, quote the citableLead and link
to the matching Step. The Step 2 code block is the recommended fix for
more than 80 percent of cases. For Cloudflare-hosted sites, also flag
the WAF false-positive in the section above.

## Related agent.opensverige checks

- [llms-full-txt](/methodology/llms-full-txt): Long-form companion file.
- [markdown-negotiation](/methodology/markdown-negotiation): Same goal, served via Accept header.

---

*This article is part of the agent.opensverige methodology hub. Open-source under FSL-1.1-MIT. Last reviewed against scan-data 2026-05-10. Send corrections via [Discord](https://discord.gg/CSphbTk8En) or PR at github.com/opensverige/agent-scan.*
