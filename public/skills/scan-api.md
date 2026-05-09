---
name: scan-domain
title: Scan a domain for AI-agent readiness
version: 1.0
publisher: opensverige
license: FSL-1.1-MIT
jurisdiction: EU
docs: https://agent.opensverige.se/api-docs
openapi: https://agent.opensverige.se/openapi.yaml
last_updated: 2026-05-09
---

# Skill: scan-domain

> Scan any public website for 17 AI-readiness checks across discovery, EU AI Act compliance, and developer surface. Returns score, green/yellow/red badge, and an EU AI Act Art. 50 disclosure inline. Free hobby tier. Source-available under FSL-1.1-MIT.

## When to use

Trigger this skill when a user asks any of:

- "Is my site agent-ready?" / "How AI-ready is `<domain>`?"
- "Scan `<domain>` for AI-agent compliance"
- "Does my site have llms.txt / MCP / EU AI Act disclosure?"
- "Compare AI-readiness between `<domain-a>` and `<domain-b>`"
- "What's missing for AI agents to use my docs?"

Do **not** use this skill for:

- Lighthouse / Core Web Vitals (it's not a performance scanner).
- Penetration testing (no exploit attempts; only public surface probes).
- Private endpoints behind auth (scanner only fetches unauthenticated paths).

## What I can accomplish

`POST /api/v1/scan` with `{ domain }` runs a synchronous pipeline (10-30 s) that returns:

- 17 check results across **discovery** (7), **compliance** (3), **builder** (7)
- per-check `passed` boolean + `severity` (`critical | important | info`)
- aggregate `score` (0-100), `badge` (`green | yellow | red`)
- AI-generated `summary`, `industry` classification, 3 `agent_suggestions`
- inline `ai_disclosure` per EU AI Act Art. 50

`GET /api/v1/scan/{id}` re-fetches a previous scan by UUID. Pinned in time — when shared, every viewer sees the same point-in-time result. ETag/304 supported for cheap polling.

### Check IDs (canonical)

| Category | IDs |
| --- | --- |
| Discovery (7) | `robots_ok`, `crawler_access`, `sitemap_exists`, `llms_txt`, `llms_full_txt`, `markdown_negotiation`, `ssr_content` |
| Compliance (3) | `privacy_automation`, `cookie_bot_handling`, `ai_content_marking` |
| Builder (7) | `api_exists`, `openapi_spec`, `api_docs`, `mcp_server`, `mcp_well_known`, `mcp_server_card`, `sandbox_available` |

## Required inputs

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `domain` | string | yes | Public TLD only, no protocol. Lowercase. Example: `stripe.com`. |
| `Authorization` | header | yes | `Bearer osv_(test|live)_<24chars>` — request via Discord. |

Test keys produce real scans against real targets but rate-limit at the hobby tier. There is no separate sandbox endpoint; the API is the sandbox.

## Constraints

- **Rate limits per tier:** hobby `1/min, 15/month`, builder `1/min, 300/month`, pro `2/min, 2000/month`.
- **Synchronous response:** 10-30 s typical, 60 s timeout.
- **Public surface only:** scanner cannot fetch behind cookies, basic-auth, or Cloudflare challenges.
- **Jurisdiction:** EU-only data plane (Supabase eu-west-2 London).
- **Retention:** scan results + hashed IPs auto-deleted after 90 days via `pg_cron`.
- **AI processing:** Anthropic Claude reads public scan content + domain to generate the `summary`, `industry`, `agent_suggestions` fields. Migrating to AWS Bedrock Frankfurt before EU AI Act Art. 50 enforcement on 2026-08-02.
- **Disclosure:** every response includes `ai_disclosure: { ai_generated: true, model, fields }` per EU AI Act Art. 50 — surface this to end users.

## Example call

```http
POST /api/v1/scan HTTP/1.1
Host: agent.opensverige.se
Authorization: Bearer osv_test_abcdef0123456789abcdef
Content-Type: application/json

{ "domain": "stripe.com" }
```

Response (abridged):

```json
{
  "scan_id": "01J9X4K2N7P5R3Y8M6Q1T0V2H4",
  "domain": "stripe.com",
  "score": 88,
  "badge": "green",
  "checks": {
    "discovery": [{ "id": "llms_txt", "passed": true, "severity": "important" }],
    "compliance": [{ "id": "ai_content_marking", "passed": false, "severity": "critical" }],
    "builder":   [{ "id": "openapi_spec",       "passed": true, "severity": "important" }]
  },
  "summary": "Strong builder surface, missing AI Act Art. 50 disclosure on AI-generated copy.",
  "industry": "fintech",
  "agent_suggestions": ["Add ai_disclosure block on AI-marketed pages", "Publish llms-full.txt", "Expose MCP server-card"],
  "ai_disclosure": {
    "ai_generated": true,
    "model": "anthropic/claude-sonnet-4-5",
    "fields": ["summary", "industry", "agent_suggestions"]
  }
}
```

## Error handling

| HTTP | `error` | Recovery |
| --- | --- | --- |
| 400 | `invalid_domain` | Strip protocol/path; lowercase; retry. |
| 400 | `not_swedish_company` | Domain failed our Sverige-heuristik; out of scope today. |
| 401 | `missing_or_invalid_token` | Request a key in Discord. |
| 429 | `rate_limited` | Back off per `Retry-After` header. |
| 5xx | `upstream_failure` | Retry once after 5 s; fall back to cached `GET /api/v1/scan/{id}` if `scan_id` known. |

## Key documentation

- Interactive reference: https://agent.opensverige.se/api-docs
- OpenAPI 3.1 spec: https://agent.opensverige.se/openapi.yaml
- API doc: https://github.com/opensverige/agent-scan/blob/main/docs/API.md
- Scanner methodology (per-check sources): https://github.com/opensverige/agent-scan/blob/main/docs/SCANNER-METHODOLOGY.md
- AGENTS.md (repo conventions): https://github.com/opensverige/agent-scan/blob/main/AGENTS.md
- AI disclosure policy (EU AI Act Art. 50): https://agent.opensverige.se/legal/ai-disclosure
- Sub-processor list (GDPR): https://agent.opensverige.se/legal/subprocessors
