# Verification Report: agent.opensverige.se Methodology Articles

Generated: 2026-05-10
Articles covered: 17
Total estimated tokens (sum of frontmatter tokenEstimate fields): ~22,800

## 1. Source Reachability

### Reachable primary sources (verified via curl/fetch)

| URL | Used in | Status |
|---|---|---|
| https://www.rfc-editor.org/rfc/rfc9309.html | robots-ok, crawler-access | 200 OK |
| https://www.robotstxt.org/robotstxt.html | robots-ok | 200 OK |
| https://developers.google.com/search/docs/crawling-indexing/robots/intro | robots-ok | 200 OK |
| https://darkvisitors.com/agents | crawler-access | 200 OK |
| https://platform.openai.com/docs/bots | crawler-access | 200 OK |
| https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-the-web-and-how-can-site-owners-block-the-crawler | crawler-access | 200 OK (replacement for /docs/claude-code/bots) |
| https://docs.perplexity.ai/guides/bots | crawler-access | 200 OK (replacement for developers.perplexity.ai) |
| https://www.sitemaps.org/protocol.html | sitemap-exists | 200 OK |
| https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview | sitemap-exists | 200 OK |
| https://llmstxt.org/ | llms-txt, llms-full-txt | 200 OK |
| https://llmstxt.org/llms.txt | llms-txt | 200 OK |
| https://docs.anthropic.com/llms.txt | llms-txt | 200 OK |
| https://developers.cloudflare.com/llms-full.txt | llms-full-txt | 200 OK (content-type: text/markdown) |
| https://datatracker.ietf.org/doc/html/rfc9110#name-content-negotiation | markdown-negotiation | 200 OK |
| https://datatracker.ietf.org/doc/html/rfc7763 | markdown-negotiation | 200 OK |
| https://web.dev/articles/rendering-on-the-web | ssr-content | 200 OK |
| https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics | ssr-content | 200 OK |
| https://gdpr-info.eu/art-22-gdpr/ | privacy-automation | 200 OK |
| https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en | privacy-automation, cookie-bot-handling | 200 OK |
| https://www.imy.se/en/organisations/data-protection/this-applies-accordning-to-gdpr/automated-decision-making-and-profiling/ | privacy-automation | 200 OK |
| https://eur-lex.europa.eu/eli/dir/2002/58/oj | cookie-bot-handling | 200 OK |
| https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/cookies/ | cookie-bot-handling | 200 OK |
| https://eur-lex.europa.eu/eli/reg/2024/1689/oj | ai-content-marking | 200 OK |
| https://c2pa.org/specifications/specifications/2.1/specs/C2PA_Specification.html | ai-content-marking | 200 OK |
| https://iptc.org/standards/photo-metadata/iptc-standard/ | ai-content-marking | 200 OK |
| https://github.com/OAI/OpenAPI-Specification | api-exists, openapi-spec | 200 OK |
| https://spec.openapis.org/oas/v3.1.0 | openapi-spec | 200 OK |
| https://spec.openapis.org/oas/v3.2.0.html | openapi-spec | 200 OK |
| https://learn.openapis.org/ | api-docs | 200 OK |
| https://modelcontextprotocol.io/specification/2025-11-25 | mcp-server | 200 OK |
| https://github.com/modelcontextprotocol/specification | mcp-server, mcp-well-known, mcp-server-card | 200 OK |
| https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2025-11-25/basic/transports.mdx | mcp-server | 200 OK |
| https://datatracker.ietf.org/doc/html/rfc8615 | mcp-well-known | 200 OK |
| https://datatracker.ietf.org/doc/html/rfc9728 | mcp-well-known | 200 OK |
| https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json | mcp-server-card | 200 OK |
| https://developers.cloudflare.com/.well-known/mcp/server-card.json | mcp-server-card | 200 OK |
| https://docs.stripe.com/keys | sandbox-available | 200 OK |
| https://docs.stripe.com/sandboxes | sandbox-available | 200 OK |

### Replaced sources (original URL inaccessible)

| Original URL | Status | Replacement |
|---|---|---|
| https://docs.anthropic.com/en/docs/claude-code/bots | 404 | https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-the-web-and-how-can-site-owners-block-the-crawler |
| https://developers.perplexity.ai/guides/bots | DNS fail | https://docs.perplexity.ai/guides/bots |
| https://platform.openai.com/docs/actions/sending-files | wrong page | https://platform.openai.com/docs/guides/tools-web-search |
| https://docs.anthropic.com/en/docs/build-with-claude/agents/web-fetch | moved | https://docs.claude.com/en/docs/agents-and-tools/tool-use/web-fetch-tool |
| https://docs.fastly.com/en/guides/bot-management | 404 | dropped; Akamai + Cloudflare bot-management docs used instead |
| https://swagger.io/blog/api-design/openapi-vs-swagger/ | 404 | https://github.com/OAI/OpenAPI-Specification |
| https://mintlify.com/blog/llmstxt | 404 | dropped; llmstxt.org used as canonical |
| https://mintlify.com/blog/the-value-of-llms-txt | 404 | dropped |
| https://modelcontextprotocol.io/specification/server-discovery | 404 (SEP-1960 not ratified) | GitHub PR / spec discussion link |
| https://modelcontextprotocol.io/specification/server-card | 404 (SEP-1649 not ratified) | static.modelcontextprotocol.io schema + Cloudflare live example |
| https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679 | robots-blocked to non-browser UA | citation kept; text confirmed via gdpr-info.eu mirror |
| https://www.edpb.europa.eu/.../guidelines-082020-targeting-social-media-users | 502 | dropped; consent guideline 05/2020 used instead |

## 2. Real-World Probes (Swedish .se domains and reference sites)

Confirmed via live curl on 2026-05-10:

- **svt.se/robots.txt**: allows retrieval-class bots (PerplexityBot, OAI-SearchBot); blocks GPTBot, ClaudeBot, Google-Extended, anthropic-ai, CCBot under training-class disallow. Cited in robots-ok and crawler-access.
- **aftonbladet.se/robots.txt**: explicit User-agent blocks for AI2Bot, Amazonbot, anthropic-ai, Applebot-Extended, Bytespider, CCBot, ClaudeBot, cohere-ai, Diffbot, FacebookBot, FriendlyCrawler, GPTBot, Google-Extended, ICC-Crawler, ImagesiftBot, Meta-ExternalAgent, OmgiliBot, PerplexityBot, Timpibot, YouBot. Cited in crawler-access.
- **dn.se**: returns HTTP 451 (Unavailable for Legal Reasons) to identified AI training agents. Cited in crawler-access.
- **ica.se/robots.txt**: GPTBot disallowed from `/butiker/*` and `/recept/*`. Cited in robots-ok.
- **bolagsverket.se**: serves Imperva JS challenge (HTTP 202 + Incapsula iframe) to all non-browser UAs. Cited in ssr-content as a real-world failure mode for agents.
- **developers.cloudflare.com/llms-full.txt**: 200 OK, content-type `text/markdown; charset=utf-8`. Cited in llms-full-txt.
- **docs.anthropic.com/llms.txt**: 200 OK, plain text index of doc URLs. Cited in llms-txt.
- **developers.cloudflare.com/.well-known/mcp/server-card.json**: 200 OK, valid JSON conforming to v1 schema; only public deployment found. Cited in mcp-server-card.
- **mcp.cloudflare.com / mcp.notion.com / mcp.linear.app /.well-known/oauth-protected-resource**: 200 OK with RFC 9728 metadata. Cited in mcp-well-known as evidence that OAuth discovery (RFC 9728) is shipping today, while SEP-1960 (`/.well-known/mcp`) is not.
- **developers.cloudflare.com**, **api.stripe.com**, **api.anthropic.com /.well-known/mcp**: all 404. Cited in mcp-well-known to document SEP-1960 non-adoption.

## 3. Factual Claims Omitted for Lack of Primary Source

The following claims appeared in research drafts but were removed from articles because no primary source could be located:

- Specific percentage figures for AI-bot share of crawler traffic on European sites. Cloudflare publishes aggregate "AI crawler" charts at radar.cloudflare.com but does not publish a stable Swedish-domain breakdown.
- Predictions of EU AI Act Article 50 enforcement intensity. The articles state only the application date (2 August 2026, AI Act Art. 113) and the obligations text (Art. 50). No projections.
- Adoption counts for `/llms.txt` ("how many sites have one"). The directory at directory.llmstxt.cloud is community-maintained and not a primary source; cited only as descriptive context.
- Adoption counts for OpenAPI vs. alternative API description formats. OpenAPI Initiative does not publish such figures.
- Specific MCP server counts. The Anthropic blog and modelcontextprotocol.io list integrations but do not publish a maintained total.
- Stripe sandbox quota wording: only the `25 sandboxes per account` and `100 live-mode operations` figures that appear in Stripe's published docs are used. Internal rate-limit numbers are not cited.

## 4. Article Token Estimates

| Slug | tokenEstimate (frontmatter) |
|---|---|
| robots-ok | 1320 |
| crawler-access | 1480 |
| sitemap-exists | 1180 |
| llms-txt | 1420 |
| llms-full-txt | 1280 |
| markdown-negotiation | 1340 |
| ssr-content | 1520 |
| privacy-automation | 1620 |
| cookie-bot-handling | 1380 |
| ai-content-marking | 1480 |
| api-exists | 1080 |
| openapi-spec | 1380 |
| api-docs | 1240 |
| mcp-server | 1580 |
| mcp-well-known | 1440 |
| mcp-server-card | 1380 |
| sandbox-available | 1280 |
| **Total** | **~22,800** |

## 5. Editorial Decisions Worth Flagging

- **MCP `/.well-known/` (SEP-1960) and `server-card.json` (SEP-1649)** are framed as **closed-draft proposals, not ratified spec**. Articles describe what shipping implementations do (Cloudflare for server-card, OAuth RFC 9728 for discovery), not what the proposals would mandate. Severity is set to `info` rather than `warn` to reflect that these are not yet required.
- **HTTP+SSE transport** is described as deprecated in MCP revision 2025-03-26 (PR #206), with **Streamable HTTP** as the current transport. Latest revision pinned to **2025-11-25**.
- **EU AI Act Article 50** obligations are cited with the **2 August 2026** application date (Art. 113). Article does not claim enforcement has begun before that date.
- **GDPR Article 22** wording follows the regulation text and IMY's Swedish-language guidance ("automatiserat individuellt beslutsfattande"). Article does not extend Art. 22 to AI-agent transactions where a human end-user has given specific consent; it flags the question as open and points to IMY guidance.
- **Swedish-language fields** were drafted natively (not machine-translated): "AI-agent" with hyphen, "MCP-server", "Du"-form, ≤12 words per `citableLeadSv` sentence, no em-dashes.
- **No em-dashes** used anywhere in prose. Colons, commas, and full stops only.
- **No numbered lists** in body prose. Bullets and H3 sub-headings only.
- **No "Conclusion"** section. Each article ends at "Related agent.opensverige checks" followed by the FSL-1.1-MIT footer linking discord.gg/CSphbTk8En and github.com/opensverige/agent-scan.

## 6. Open Items for Future Revision

- When SEP-1960 and SEP-1649 are ratified or formally rejected, `mcp-well-known.md` and `mcp-server-card.md` should be re-graded (severity, primarySources).
- When EU AI Act Article 50 enforcement begins (post-2026-08-02), `ai-content-marking.md` should be updated with regulator guidance from the AI Office.
- IMY has not yet published Swedish-specific guidance on AI-agent consent flows under PUL/cookielagen; `cookie-bot-handling.md` should be revisited when that lands.
- OpenAPI 3.2.0 (2025-09-19) is cited as current; `openapi-spec.md` should be reviewed when 3.3 ships.
