---
checkId: sitemap_exists
slug: sitemap-exists
category: discovery
severity: info
title: "Do you publish a sitemap.xml that agents can actually find?"
titleSv: "Publicerar du en sitemap.xml som agenter kan hitta?"
citableLead: |
  sitemap-exists checks whether you serve an XML sitemap at a
  conventional path (/sitemap.xml or /sitemap_index.xml) and
  reference it from robots.txt with a Sitemap: directive. A sitemap
  is the cheapest signal an AI crawler has for "what URLs exist on
  this domain" and it costs almost nothing to generate.
citableLeadSv: |
  sitemap-exists kontrollerar om du har en XML-sitemap vid
  /sitemap.xml och hänvisar till den från robots.txt. En sitemap
  är den billigaste signalen en AI-crawler har för att förstå
  vilka URL:er din webbplats har. Den kostar nästan ingenting
  att generera.
agentImpact: |
  Search-index crawlers (OAI-SearchBot, Claude-SearchBot,
  PerplexityBot) prioritise sitemap-listed URLs and use lastmod
  to schedule revisits. Without a sitemap, ChatGPT search and
  Perplexity rely on inbound links, which biases coverage to the
  pages other sites already cite. Real-time fetchers (Claude-User,
  ChatGPT-User) do not consume sitemaps directly but benefit
  indirectly via richer search-index coverage. Coding agents
  ignore sitemaps entirely.
primarySources:
  - title: "Sitemaps XML format (sitemaps.org Protocol)"
    url: "https://www.sitemaps.org/protocol.html"
    publisher: "sitemaps.org"
    primary: true
  - title: "Build and submit a sitemap"
    url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview"
    publisher: "Google"
    primary: true
  - title: "RFC 9309: Robots Exclusion Protocol"
    url: "https://www.rfc-editor.org/rfc/rfc9309"
    publisher: "IETF"
    primary: true
relatedChecks: [robots_ok, llms_txt]
lastUpdated: 2026-05-10
tokenEstimate: 1100
---

## Why this fails on real sites

The single most common failure is that the sitemap exists at a non-conventional path that the scanner cannot guess. ICA.se publishes thirteen separate sitemaps at paths like `/sitemap/inspiration/` and `/butiker/sitemap.xml` and lists every one in robots.txt. Klarna.com serves no sitemap at all under `/sitemap.xml` or any obvious variant. The [sitemaps.org protocol](https://www.sitemaps.org/protocol.html) does not mandate a path; the convention is `/sitemap.xml`, but the only authoritative reference is the `Sitemap:` directive in robots.txt.

The second pattern is sitemaps that exceed protocol limits without splitting. The protocol caps a sitemap at 50,000 URLs and 50 MB uncompressed. Past those limits, crawlers truncate or reject. Sites with large product catalogues need a sitemap index file referencing per-section sitemaps. RFC 9309 confirms the `Sitemap:` directive is an extension: "Crawlers MAY interpret other records that are not part of the robots.txt protocol — for example, 'Sitemaps'."

The third pattern is stale `lastmod` values. Many CMS exports set `lastmod` to the build date instead of the content's actual modification date, so every URL appears to change daily and crawlers de-prioritise the signal.

## How to fix

### Step 1: Generate a sitemap.xml at /sitemap.xml

Most frameworks ship a generator: Next.js has `app/sitemap.ts`, WordPress has Yoast, Hugo writes one by default. The minimum valid XML is short.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.se/</loc>
    <lastmod>2026-05-10</lastmod>
  </url>
  <url>
    <loc>https://example.se/om-oss</loc>
    <lastmod>2026-04-22</lastmod>
  </url>
</urlset>
```

The `<urlset>` namespace is mandatory. `<lastmod>` must be W3C Datetime (`YYYY-MM-DD` is acceptable). `<changefreq>` and `<priority>` are optional and ignored by most crawlers.

### Step 2: Reference it from robots.txt

The `Sitemap:` directive sits at the top level of robots.txt and is independent of any User-agent group.

```text
User-agent: *
Allow: /

Sitemap: https://example.se/sitemap.xml
```

You can list multiple sitemaps. Each line takes one absolute URL.

### Step 3: For >50,000 URLs, split into a sitemap index

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.se/sitemaps/products-1.xml</loc>
    <lastmod>2026-05-10</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.se/sitemaps/articles.xml</loc>
    <lastmod>2026-05-09</lastmod>
  </sitemap>
</sitemapindex>
```

Per the protocol, an index file may reference up to 50,000 sitemaps; each referenced sitemap may itself contain up to 50,000 URLs.

### Step 4: Set lastmod from content storage, not build time

Pull `<lastmod>` from the database column that records when the content was last edited, not the deploy timestamp. Build-time lastmod is the most common cause of crawlers ignoring your sitemap.

```typescript
// Next.js app/sitemap.ts — correct lastmod from CMS
import { fetchPosts } from "@/lib/cms";

export default async function sitemap() {
  const posts = await fetchPosts();
  return posts.map((p) => ({
    url: `https://example.se/${p.slug}`,
    lastModified: p.updatedAt,
  }));
}
```

### Step 5: Compress for large sitemaps

Sitemaps may be served gzipped (`.xml.gz`) without changing the directive in robots.txt. Most crawlers send `Accept-Encoding: gzip` and will fetch the compressed variant transparently.

```nginx
location ~* \.xml$ {
    gzip on;
    gzip_types application/xml text/xml;
    add_header Content-Type "application/xml; charset=utf-8";
}
```

## Verify the fix

```bash
# 1. Sitemap directive in robots.txt
curl -s https://example.se/robots.txt | grep -i ^sitemap

# 2. Sitemap fetches as XML, valid, under limits
curl -s https://example.se/sitemap.xml | head -5
curl -sI https://example.se/sitemap.xml | grep -i content-type

# 3. URL count below 50,000
curl -s https://example.se/sitemap.xml | grep -c "<loc>"

# 4. lastmod within last 90 days for actively edited pages
curl -s https://example.se/sitemap.xml | grep -oE "<lastmod>[^<]+" | sort -u | tail -5
```

Success: robots.txt contains a `Sitemap:` line, the sitemap returns 200 with `application/xml` or `text/xml`, the URL count is under 50,000 per file, and recent content shows recent `lastmod` values.

## Common false positives

- A site has a perfectly valid sitemap at `/sitemap_index.xml` (WordPress + Yoast convention) and references it from robots.txt, but the scanner only checked `/sitemap.xml`.
- A staging environment's robots.txt leaks into production with `Disallow: /` and a Sitemap directive that points to staging. The directive is correct; the Disallow makes the file pointless.
- A site uses Atom or RSS feeds instead of sitemap.xml. AI crawlers do not parse RSS as a sitemap surrogate.
- A site lists 100,000 URLs in a single 80 MB sitemap. The file exists but exceeds protocol limits; crawlers truncate after 50,000 entries or 50 MB.
- A sitemap URL points to a redirected target. Per Google's docs, sitemap URLs should be canonical, not redirects.

## How agents are recommended to use this article

When a developer asks why their pages are not indexed by ChatGPT search or Perplexity, quote the citableLead and the Step 2 robots.txt directive. Step 1 covers 80% of fresh implementations; Step 4 fixes the silent "lastmod is build time" bug that affects most CI/CD-deployed sites. Recommend a sitemap index (Step 3) only when the developer mentions content volume above 10,000 URLs.

## Related agent.opensverige checks

- robots_ok: the Sitemap directive lives in robots.txt, so both must be valid.
- llms_txt: complementary, agent-optimised content index served as Markdown rather than XML.

---

*This article is part of the agent.opensverige methodology hub. Open-source under FSL-1.1-MIT. Last reviewed against scan-data 2026-05-10. Send corrections via [Discord](https://discord.gg/CSphbTk8En) or PR at github.com/opensverige/agent-scan.*
