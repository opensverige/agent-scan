# agent.opensverige API

Public REST API for the AI-agent-readiness scanner. Currently invite-only alpha (Stage 2A).

Live reference: [agent.opensverige.se/api-docs](https://agent.opensverige.se/api-docs)
OpenAPI 3.1 spec: [agent.opensverige.se/openapi.yaml](https://agent.opensverige.se/openapi.yaml)
Methodology: [SCANNER-METHODOLOGY.md](SCANNER-METHODOLOGY.md)

---

## Quickstart

```bash
# 1. Get a key (alpha — DM in Discord https://discord.gg/CSphbTk8En)
export OSV_KEY=osv_test_xxxxxxxxxxxxxxxxxxxxxxxx

# 2. Scan a domain
curl -X POST https://agent.opensverige.se/api/v1/scan \
  -H "Authorization: Bearer $OSV_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domain":"klarna.com"}'

# 3. Look up the scan later
curl -H "Authorization: Bearer $OSV_KEY" \
  https://agent.opensverige.se/api/v1/scan/<scan_id>
```

Typical response time: 10–30 seconds (synchronous). Stage 2B will add async submission + webhook delivery.

---

## Authentication

All `/api/v1/*` endpoints require an API key in the `Authorization` header:

```
Authorization: Bearer osv_(test|live)_<24chars>
```

Keys are SHA-256-hashed at rest — we never store plaintext. We see the prefix (first 16 chars) for log correlation. If you lose your key, we cannot recover it; we'll issue a new one.

---

## Endpoints

### `POST /api/v1/scan`

Run a new scan. Synchronous — returns the full result when done.

**Request:**

```json
{ "domain": "klarna.com" }
```

`domain` is bare (no protocol, no path). `https://example.com/foo` and `example.com` are equivalent — both stripped to `example.com`.

**Response 200:**

```json
{
  "scan_id": "574840f0-376b-4d49-9803-6c95a142429b",
  "company": "Klarna",
  "industry": "Fintech, betalningar",
  "summary": "Klarna har sitemap, robots.txt och en stor developer portal …",
  "agent_suggestions": [...],
  "badge": "yellow",
  "score": 10,
  "checks_total": 14,
  "checks": {
    "robots_ok":     { "id": "robots_ok",     "pass": true,  "label": "...", "category": "discovery", "severity": "important" },
    "sitemap_exists":{ "id": "sitemap_exists","pass": true,  "label": "...", "category": "discovery", "severity": "info"      },
    "...":           "(17 checks total)"
  },
  "recommendations": ["Lägg till /llms-full.txt …", "..."],
  "severity_counts": { "critical": 1, "important": 3, "info": 0 },
  "scanned_at": "2026-04-26T13:42:01.234Z",
  "ai_disclosure": {
    "ai_generated": true,
    "model": "anthropic/claude-sonnet-4-5",
    "fields": ["summary", "industry", "agent_suggestions"]
  }
}
```

**Errors:**

| Status | Code | Meaning |
|---|---|---|
| 400 | `invalid_json` | Request body not parseable |
| 400 | `invalid_domain` | Domain failed validation (private TLD, malformed) |
| 401 | `missing_auth` | No `Authorization` header |
| 401 | `invalid_format` | Header doesn't match `Bearer osv_(test\|live)_*` |
| 401 | `invalid_key` | Key not in DB or revoked |
| 429 | `rate_limit_per_minute` | Too many requests in last 60s |
| 429 | `rate_limit_per_month` | Tier monthly quota reached |
| 500 | `server_error` | Internal — retry with backoff |

429 responses include a `Retry-After` header in seconds.

### `GET /api/v1/scan/{id}`

Look up a previously-submitted scan. Any valid key can read any scan_id (scans are public-by-URL).

Supports `If-None-Match` for ETag-based polling — useful for the upcoming Stage 2B async pattern.

**Response 200:** Same shape as `POST /api/v1/scan` (minus `agent_suggestions` and `company`).

**Errors:**

| Status | Code | Meaning |
|---|---|---|
| 400 | `invalid_id` | Not a UUID |
| 401 | `missing_auth` / `invalid_key` | (as above) |
| 404 | `not_found` | No scan with this ID |
| 500 | `server_error` | Internal |

---

## Rate limits

| Tier | Per minute | Per month |
|---|---|---|
| **hobby** | 1 | 15 |
| **builder** | 1 | 300 |
| **pro** | 2 | 2 000 |

Limits enforced per API key. Counted from successful scans persisted to `scan_submissions`. Failed scans (network errors, 5xx) don't count.

Monthly quota resets at 00:00 UTC on the 1st.

---

## EU AI Act Art. 50 disclosure

Every response includes an `ai_disclosure` object. When the response contains AI-generated text:

```json
{
  "ai_generated": true,
  "model": "anthropic/claude-sonnet-4-5",
  "fields": ["summary", "industry", "agent_suggestions"]
}
```

Per [Art. 50(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689) (effective 2 Aug 2026), AI-generated content must be marked machine-readably. If you embed our `summary` in a UI, you should disclose it as AI-generated to your end users — your own Art. 50 obligation as deployer.

In demo mode (no Anthropic key configured server-side) `ai_generated: false`.

---

## Versioning

Path-versioned: `/api/v1`. Breaking changes to schema or auth land in `/api/v2`. `v1` will be supported for at least 12 months after a `v2` is released.

Non-breaking additions (new fields, new check IDs) ship continuously to `v1`.

---

## Issues + feedback

- Discord: <https://discord.gg/CSphbTk8En>
- GitHub: <https://github.com/opensverige/agent-scan/issues>
- Email (responsible disclosure for security): info@opensverige.se

This is alpha software. Expect bugs. Please report them.
