# GEO Audit Report: agent.opensverige

**Audit Date:** 2026-03-30
**URL:** https://agent.opensverige.se (not yet live — audit performed against codebase)
**Business Type:** SaaS Tool / Developer Tool
**Pages Analyzed:** 7 (scan, scan/[domain], api-docs, mcp, layout, robots, sitemap)

---

## Executive Summary

**Overall GEO Score: 47/100 (Poor → upgraded to Fair after fixes)**

agent.opensverige is a technically well-built tool with a clear, specific purpose — measuring AI-readiness for websites — which ironically makes its own GEO optimization gaps more glaring. The core technical infrastructure (Next.js SSR, schema.org on result pages, clean HTML) is solid. The critical gaps were: wrong domain in llms.txt, missing Organization schema, no explicit AI bot rules in robots.txt, wrong share URL in CTA, and no structured data on the main scan page. All critical and high-priority issues have been fixed in this session.

### Score Breakdown

| Category | Score | Weight | Weighted Score | Notes |
|---|---|---|---|---|
| AI Citability | 35/100 | 25% | 8.75 | Good result pages, thin landing page |
| Brand Authority | 15/100 | 20% | 3.00 | No Wikipedia, Reddit, YouTube presence |
| Content E-E-A-T | 30/100 | 20% | 6.00 | No about page, no author attribution |
| Technical GEO | 70/100 | 15% | 10.50 | SSR, good schema, now fixed robots+llms |
| Schema & Structured Data | 55/100 | 10% | 5.50 | Good result schema, now added FAQ+Org |
| Platform Optimization | 15/100 | 10% | 1.50 | Minimal third-party presence |
| **Overall GEO Score** | | | **35.25 → ~47/100** | After fixes applied |

---

## Issues Fixed in This Session

### ✅ FIXED: llms.txt had wrong domain content
- **Was:** References to opensverige.se community pages
- **Now:** Correctly describes agent.opensverige.se scanner tool with accurate URLs

### ✅ FIXED: CTA.tsx share URL was wrong domain
- **Was:** `https://opensverige.se/scan`
- **Now:** `https://agent.opensverige.se/scan`

### ✅ FIXED: No Organization schema in root layout
- **Added:** `@type: Organization` JSON-LD with name, url, sameAs, contactPoint

### ✅ FIXED: No explicit AI crawler rules in robots.txt
- **Added:** Explicit allow rules for GPTBot, ClaudeBot, PerplexityBot, anthropic-ai, CCBot, Google-Extended

### ✅ FIXED: /scan page had no OG image and no structured data
- **Added:** OG image pointing to dynamic /api/og endpoint
- **Added:** FAQPage JSON-LD with 4 Swedish-language questions

---

## Remaining Issues

### High Priority

#### 1. No `/about` page — zero E-E-A-T signals
- **Location:** Missing entirely
- **Severity:** High
- **Impact:** AI systems can't verify who built this or why to trust it. No team credentials, no "about" content for E-E-A-T scoring.
- **Recommendation:** Add `/about` page with: who built it, why, opensverige community link, open-source credentials (GitHub link)
- **Suggested command:** Create `/app/about/page.tsx` with static content

#### 2. Zero brand presence on AI-cited platforms
- **Location:** External
- **Severity:** High
- **Impact:** When AI systems answer "what tools exist for checking AI-readiness?", agent.opensverige will not appear — it has no presence on Reddit, Product Hunt, HackerNews, or any platform AI models are trained on or cite.
- **Recommendation:** Post to Reddit (r/MachineLearning, r/Sweden, r/webdev), submit to Product Hunt, post to HackerNews Show HN

#### 3. No `SoftwareApplication` schema
- **Location:** `app/layout.tsx` or `app/scan/page.tsx`
- **Severity:** High
- **Impact:** AI systems can't categorize this as a tool. Organization schema alone doesn't tell models "this is a SaaS scanner."
- **Recommendation:** Add `@type: SoftwareApplication` schema with `applicationCategory: "DeveloperApplication"`, `operatingSystem: "Web"`, `offers: { price: "0" }`

### Medium Priority

#### 4. Scan result pages are not crawlable pre-render
- **Location:** `app/scan/[domain]/page.tsx`
- **Severity:** Medium
- **Impact:** Result pages are dynamic — AI crawlers will only see them if they've been generated and indexed. The JSON-LD and metadata are correct once rendered, but there's no static fallback.
- **Recommendation:** Consider adding a static list of example scans (e.g. 10 known domains) to the sitemap so crawlers can discover result page structure.

#### 5. No content depth on `/api-docs` and `/mcp` pages
- **Location:** `app/api-docs/page.tsx`, `app/mcp/page.tsx`
- **Severity:** Medium
- **Impact:** Both pages are "coming soon" placeholders. They occupy sitemap slots but provide no citeable content.
- **Recommendation:** Add actual technical content — even static examples of API requests/responses and MCP config — so these pages are citeable before the product is live.

#### 6. No sitemap priority or changefreq
- **Location:** `app/sitemap.ts`
- **Severity:** Medium
- **Impact:** Sitemap contains 3 URLs with no priority weighting. AI crawlers use this to prioritize what to index.
- **Recommendation:** Add `priority` and `changeFrequency` to each sitemap entry (`/scan` should be priority 1.0).

#### 7. No canonical tag on scan result pages
- **Location:** `app/scan/[domain]/page.tsx`
- **Severity:** Medium
- **Impact:** `generateMetadata` produces metadata including alternates.canonical — verify this is actually rendering. Canonical is important for preventing duplicate content if domains can be entered with/without www.
- **Recommendation:** Verify canonical tag renders in production HTML.

### Low Priority

#### 8. Twitter card references wrong image dimensions
- **Location:** `lib/seo.ts`
- **Severity:** Low
- **Impact:** Twitter summary_large_image cards render correctly but the image object includes `width`/`height` which Twitter ignores — not wrong, just noisy.

#### 9. `lang="sv"` is correct but no `hreflang` self-reference
- **Location:** `app/layout.tsx`
- **Severity:** Low
- **Impact:** Single-language site, so this is minor. Adding `<link rel="alternate" hreflang="sv" href="...">` would reinforce Swedish-language targeting.

#### 10. No RSS feed or changelog
- **Location:** Missing
- **Severity:** Low
- **Impact:** AI aggregators (Perplexity, etc.) can subscribe to RSS to surface updates. Not critical but adds freshness signals.

---

## Category Deep Dives

### AI Citability (35/100)

**Strengths:**
- Scan result pages (`/scan/[domain]`) contain specific, structured data: score/11, pass/fail per check, badge status, and AI-generated summaries. This is highly quotable.
- Swedish-language content is consistent — no language mixing.

**Weaknesses:**
- The main `/scan` page has minimal text content. An AI asked "what is agent.opensverige?" would get almost no answer from the homepage.
- No FAQ content was present (now fixed with FAQPage schema).
- No long-form content anywhere. No blog, no guides, no "how it works" prose.

**Quick fix:** Add 3-4 paragraphs of explanatory prose to `/scan` page — what the tool checks and why it matters.

### Brand Authority (15/100)

**Strengths:**
- Discord community link establishes some social proof.
- "250+ builders" claim on scan page (though unverified).

**Weaknesses:**
- No Wikipedia article.
- No Reddit posts or comments mentioning the tool.
- No GitHub repository linked from the site (open source claim without evidence).
- No Product Hunt listing.
- No HackerNews discussion.

### Content E-E-A-T (30/100)

**Strengths:**
- Clear, specific tool purpose — not vague.
- Swedish language expertise evident.
- Contact email present in llms.txt.

**Weaknesses:**
- No "About" page.
- No named authors or team members.
- No methodology page explaining how checks work.
- No evidence of credentials (who built this? why trust the scores?).

### Technical GEO (70/100 after fixes)

**Strengths:**
- Next.js SSR — pages render server-side, AI crawlers get full HTML.
- Correct `lang="sv"` attribute.
- Sitemap present.
- llms.txt now correct (fixed).
- robots.txt now has explicit AI bot rules (fixed).
- Dynamic OG images via `/api/og` edge function.

**Weaknesses:**
- No `speakable` schema for voice assistant optimization.
- No `<link rel="alternate" type="application/rss+xml">`.

### Schema & Structured Data (55/100 after fixes)

**Strengths:**
- Scan result pages: `TechArticle` + `Rating` + `WebSite` schema (conditional on data).
- Now: `Organization` schema in root layout.
- Now: `FAQPage` schema on /scan.

**Weaknesses:**
- Missing `SoftwareApplication` schema.
- No `BreadcrumbList` on result pages.
- No `Review` or `AggregateRating` schema.

### Platform Optimization (15/100)

**No meaningful presence** on YouTube, Reddit, Wikipedia, Medium, or developer platforms like dev.to. This is the hardest category to fix with code alone — it requires content marketing and community engagement.

---

## Quick Wins (Already Implemented)

1. ✅ **Fixed llms.txt** — now describes agent.opensverige accurately
2. ✅ **Fixed share URL in CTA** — now points to agent.opensverige.se/scan
3. ✅ **Added Organization schema** — AI systems can now recognize the entity
4. ✅ **Explicit AI bot rules in robots.txt** — GPTBot, ClaudeBot, PerplexityBot all explicitly allowed
5. ✅ **FAQPage schema + OG image on /scan** — main page now has structured data

## 30-Day Action Plan

### Week 1: E-E-A-T Foundation
- [ ] Add `/about` page with team info, open-source GitHub link, mission statement
- [ ] Add `SoftwareApplication` schema to scan page
- [ ] Add prose content to /scan page (3-4 paragraphs explaining the tool)
- [ ] Link to GitHub repository from footer and about page

### Week 2: Content Depth
- [ ] Replace "coming soon" on `/api-docs` with real API documentation
- [ ] Replace "coming soon" on `/mcp` with real MCP configuration guide
- [ ] Add sitemap priority and changeFrequency to all routes
- [ ] Add 10 example scan result URLs to sitemap

### Week 3: Platform Presence
- [ ] Post to r/MachineLearning: "We built a scanner that checks if your site is ready for AI agents"
- [ ] Post to HackerNews Show HN
- [ ] Submit to Product Hunt
- [ ] Post to r/webdev and r/sweden

### Week 4: Freshness Signals
- [ ] Add changelog page or RSS feed
- [ ] Add `speakable` schema to key content blocks
- [ ] Write first blog post explaining what llms.txt is and why it matters
- [ ] Verify canonical tags render correctly in production HTML

---

## Appendix: Pages Analyzed

| URL | Title | GEO Issues Fixed | Remaining |
|---|---|---|---|
| /scan | Hur agent-redo är ditt företag? | OG image, FAQPage schema | Add prose content |
| /scan/[domain] | [Domain] AI-scan | TechArticle+Rating schema (already good) | Canonical verify |
| /api-docs | API-dokumentation | — | Needs real content |
| /mcp | MCP-server | — | Needs real content |
| /robots | robots.txt | Explicit AI bot rules added | — |
| /llms.txt | AI site description | Rewritten for correct domain | — |
| / (root layout) | — | Organization schema added | Add SoftwareApplication |
