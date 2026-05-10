---
checkId: cookie_bot_handling
slug: cookie-bot-handling
category: compliance
severity: important
title: "Does your cookie banner block AI bots from reading content?"
titleSv: "Blockerar din cookie-banner AI-bottar från innehållet?"
citableLead: |
  cookie-bot-handling checks whether your cookie consent gate
  blocks legitimate AI crawlers from reaching content. Bots are
  not data subjects under the GDPR, so ePrivacy Article 5(3)
  consent does not apply to them. Yet many CMPs render a full-page
  consent wall to every visitor, AI bots included, which means
  the body the crawler sees is a banner instead of the article.
citableLeadSv: |
  cookie-bot-handling kontrollerar om din cookie-banner blockerar
  AI-crawlers från innehållet. Bottar är inte registrerade enligt
  GDPR, så ePrivacy art. 5(3) gäller dem inte. Ändå renderar många
  CMP:er en fullskärms-consentvägg som även AI-crawlers ser, vilket
  betyder att de bara hittar bannern istället för artikeln.
agentImpact: |
  CMPs implemented as JavaScript overlays do not affect non-JS
  crawlers (GPTBot, ClaudeBot, PerplexityBot) at all because the
  HTML response below the overlay is intact. CMPs implemented as
  server-side redirects to /consent do break crawler access. The
  EDPB Guidelines 2/2023 confirm Article 5(3) applies to terminal
  equipment of natural persons, not bots. Sites that bypass CMPs
  for verified bot user-agents stay compliant and remain
  agent-readable.
primarySources:
  - title: "Directive 2002/58/EC — ePrivacy Directive (Article 5(3))"
    url: "https://eur-lex.europa.eu/eli/dir/2002/58"
    publisher: "EU Commission / EUR-Lex"
    primary: true
  - title: "EDPB Guidelines 2/2023 on Technical Scope of Art. 5(3) ePrivacy Directive"
    url: "https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-22023-technical-scope-art-53-eprivacy-directive_en"
    publisher: "European Data Protection Board"
    primary: true
  - title: "Regulation (EU) 2016/679 — Article 4(1) (definition of data subject)"
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679"
    publisher: "EU Commission / EUR-Lex"
    primary: true
relatedChecks: [crawler_access, privacy_automation, ssr_content]
lastUpdated: 2026-05-10
tokenEstimate: 1280
---

## Why this fails on real sites

The most common failure is a server-side consent wall: the origin returns 302 to `/consent` for every request lacking a consent cookie, and the consent page itself contains the banner UI rather than the article. Crawlers without cookie support, which is most AI crawlers, loop on the redirect and give up. The HTML body the crawler indexes is the consent page, not the actual content.

The second pattern is a CMP that gates the document with `display: none` on the body until consent is recorded. Non-JS crawlers receive the body but parse it as a banner because the article markup is missing or inert.

The third is geographic over-blocking. Some Swedish news sites (DN.se as of 2026-05) return HTTP 451 to non-EU IP ranges and to AI bot user-agents alike, which is more aggressive than ePrivacy requires. Article 5(3) requires consent for storing or accessing information on terminal equipment; reading public HTML to a non-cookie client does not engage Art. 5(3) at all.

The legal point matters: the EDPB Guidelines 2/2023 frame Art. 5(3) around terminal equipment of natural persons. A bot is not a natural person and has no terminal equipment in the protected sense. The GDPR's Art. 4(1) defines a "data subject" as an identified or identifiable natural person. Bots are neither. They do not need to consent to anything to read public content.

## How to fix

### Step 1: Audit how your CMP serves bot user-agents

```bash
for ua in "GPTBot/1.1" "ClaudeBot/1.0" "PerplexityBot/1.0" "Mozilla/5.0 Chrome"; do
  redirected_to=$(curl -sI -A "$ua" https://example.se/article-1 | grep -i ^location)
  size=$(curl -sL -A "$ua" https://example.se/article-1 | wc -c)
  echo "$ua  redirect=$redirected_to  size=${size}B"
done
```

If bots get smaller body sizes than browsers, or get a 302 to `/consent`, the CMP is gating the content.

### Step 2: Bypass the CMP for verified AI bot user-agents

Cookie consent is a requirement for processing personal data; reading public HTML for a bot is not personal-data processing. Skip the CMP for verified bots at the edge.

```text
# Cloudflare Worker route — skip consent for bots
addEventListener("fetch", (event) => {
  const ua = event.request.headers.get("user-agent") ?? "";
  const botRegex = /GPTBot|ClaudeBot|PerplexityBot|OAI-SearchBot|Claude-User|ChatGPT-User|Google-Extended/i;
  if (botRegex.test(ua)) {
    event.respondWith(fetch(event.request, { headers: { "x-bypass-consent": "1" } }));
    return;
  }
  // normal CMP flow for humans
});
```

### Step 3: Implement the CMP as a non-blocking overlay, not a wall

For the human path, render the article in the HTTP response and overlay the CMP via JavaScript. Non-JS clients (AI bots, accessibility readers, plain-text browsers) get the article. Human users see the consent UI before any non-essential cookies are set.

```html
<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>Artikel</title>
</head>
<body>
  <article>
    <h1>Artikelrubrik</h1>
    <p>Hela artikeln finns här i HTML-svaret.</p>
  </article>

  <!-- CMP loaded last, opt-in for non-essential cookies only -->
  <script src="/cmp.js" defer></script>
</body>
</html>
```

### Step 4: Block only non-essential cookies before consent

Article 5(3) exempts cookies "strictly necessary in order to provide an information society service explicitly requested by the subscriber or user". Session cookies for login, CSRF tokens and language preferences usually qualify. Analytics, advertising and personalisation cookies do not. Configure your CMP to block only the latter category.

```javascript
// Pre-consent: only essential cookies
window.cmp = {
  preConsent: ["session_id", "csrf", "lang"],
  postConsent: ["_ga", "_fbp", "personalisation"],
};
```

### Step 5: Document the bot-bypass in your privacy policy

Transparency under Art. 12 GDPR favours disclosing the bypass.

```markdown
### AI crawlers

We do not require consent from automated agents (such as GPTBot, ClaudeBot,
PerplexityBot) to access our public content. Such agents are not data
subjects under the GDPR (Art. 4(1)) and ePrivacy Article 5(3) does not
apply to them. We continue to honour robots.txt directives.
```

## Verify the fix

```bash
# 1. Bot user-agent receives the actual article body
curl -s -A "ClaudeBot/1.0" https://example.se/article-1 | grep -oE "<article.*</article>" | head -1 | wc -c

# 2. No redirect chain
curl -sI -A "ClaudeBot/1.0" https://example.se/article-1 | grep -E "HTTP|location"

# 3. No tracking cookies set on bot requests
curl -sI -A "ClaudeBot/1.0" https://example.se/article-1 | grep -i set-cookie
```

Success: bot fetch returns 200 with the full article body inline, no redirect to `/consent` or `/cookie-banner`, no `Set-Cookie` headers other than purely functional ones (session, CSRF).

## Common false positives

- A site sets a session cookie via `Set-Cookie` even on bot requests. Session cookies are exempt under Art. 5(3); the check should not flag this.
- A site uses Cloudflare's `__cf_bm` (bot-management) cookie. That cookie is purely operational and does not require consent.
- A site shows a consent UI in the HTML but it is rendered behind the article via z-index. Visually overlapping is fine if the article markup is intact.
- A site is geographically EU-only and returns 451 to non-EU IPs. That is GDPR-territorial-scope behaviour, not a cookie-handling failure.
- A site uses Server-Side Tag Manager and respects IAB TCF v2.2. The TCF signal still does not apply to bots.

## How agents are recommended to use this article

When a developer asks why ChatGPT cannot read their news site even though robots.txt is permissive, quote the citableLead and recommend Step 1 first. The Step 2 worker is the lowest-friction fix for Cloudflare-fronted sites. Step 3 is the cleanest long-term architecture. Do not recommend removing the CMP entirely; ePrivacy Art. 5(3) still binds you for human visitors.

## Related agent.opensverige checks

- crawler_access: a CMP that blocks bots is functionally a WAF block from the agent's perspective.
- privacy_automation: the broader transparency regime under GDPR.
- ssr_content: confirms the article is in the HTML body once the CMP is bypassed.

---

*This article is part of the agent.opensverige methodology hub. Open-source under FSL-1.1-MIT. Last reviewed against scan-data 2026-05-10. Send corrections via [Discord](https://discord.gg/CSphbTk8En) or PR at github.com/opensverige/agent-scan.*
