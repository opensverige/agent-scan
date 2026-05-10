---
checkId: openapi_spec
slug: openapi-spec
category: builder
severity: important
title: "Do you publish an OpenAPI 3.x spec at a discoverable path?"
titleSv: "Publicerar du en OpenAPI 3.x-spec på en upptäckbar väg?"
citableLead: |
  openapi-spec checks whether your API publishes a machine-readable
  OpenAPI 3.x document at a conventional discoverable path
  (/openapi.yaml, /openapi.json, /api-docs/openapi.json). OpenAPI
  3.1 (released 2021-02-15, with the 3.1.1 patch on 2024-10-24 and
  3.2.0 on 2025-09-19) is fully aligned with JSON Schema 2020-12.
  Agents generate clients and validate requests directly from it.
citableLeadSv: |
  openapi-spec kontrollerar om ditt API publicerar en
  OpenAPI 3.x-spec på en konventionell väg (/openapi.yaml,
  /openapi.json). OpenAPI 3.1 (släppt 2021-02-15) är helt i
  linje med JSON Schema 2020-12 och används av agenter för att
  generera klienter och validera anrop. Det är skillnaden mellan
  ett dokumenterat och ett gissningsbart API.
agentImpact: |
  Cursor, Claude Code and Codex consume OpenAPI directly to
  generate typed clients. ChatGPT custom GPTs require an OpenAPI
  3 document to define an Action. MCP server frameworks
  (FastMCP, openapi-mcp-server) generate MCP tools from OpenAPI
  in one step. Without the spec, agents fall back to scraping
  documentation HTML, which is unreliable. The OpenAPI 3.1
  alignment with JSON Schema means schemas you write for
  validation are reusable in MCP, GraphQL and other ecosystems.
primarySources:
  - title: "OpenAPI Specification 3.1.0"
    url: "https://spec.openapis.org/oas/v3.1.0"
    publisher: "OpenAPI Initiative / Linux Foundation"
    primary: true
  - title: "Learn OpenAPI"
    url: "https://learn.openapis.org/"
    publisher: "OpenAPI Initiative"
    primary: true
  - title: "OpenAPI Specification on GitHub"
    url: "https://github.com/OAI/OpenAPI-Specification"
    publisher: "OpenAPI Initiative"
    primary: true
relatedChecks: [api_exists, api_docs, mcp_server]
lastUpdated: 2026-05-10
tokenEstimate: 1320
---

## Why this fails on real sites

The most common failure is publishing a Postman collection or a hand-written Markdown reference instead of an OpenAPI document. A Postman collection is a request-replay format, not a contract; agents cannot generate code from it. Markdown reference is for humans, not machines. The fix is to maintain OpenAPI as the source of truth and generate human docs from it.

The second pattern is an OpenAPI 2 (Swagger) document still in production. Swagger 2.0 was donated to the Linux Foundation in 2016 and renamed OpenAPI; the spec has been at 3.x since 2017. Modern tooling assumes OpenAPI 3, and 3.1 added full JSON Schema 2020-12 alignment, which agents care about because the same schema can drive API validation, MCP tools and GraphQL responses.

The third is hosting the spec at a path no one looks at. There is no OAS-defined well-known path; the conventional locations are `/openapi.yaml`, `/openapi.json`, `/api-docs/openapi.json`, and `/v1/openapi.json`. Document the location in your API docs and link it from the HTML reference.

The fourth is a spec that drifts from the implementation. A spec is only useful if it matches reality. Generate it from code (FastAPI, Hono, NestJS, ASP.NET Core all do this) or run contract tests against it.

## How to fix

### Step 1: Generate the spec from code where possible

Frameworks that generate OpenAPI from code annotations stay in sync automatically.

```python
# FastAPI — OpenAPI is built in
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="Example API",
    version="1.0.0",
    description="Public API for example.se",
    servers=[{"url": "https://api.example.se", "description": "Production"}],
)

class Customer(BaseModel):
    id: str
    email: str
    created_at: str

@app.get("/v1/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    return await customers.find(customer_id)

# OpenAPI doc available at /openapi.json automatically
```

For Node, use `zod` schemas with `@hono/zod-openapi`, or `tsoa` for TypeScript-first OpenAPI generation.

### Step 2: Write the minimum required root fields

OpenAPI 3.1 requires `openapi` (the version string), `info` (with `title` and `version`). `paths`, `components` and `webhooks` are conventional but at least one must be present.

```yaml
openapi: 3.1.0
info:
  title: Example API
  version: 1.0.0
  description: |
    Public REST API for example.se. Authentication via Bearer tokens.
  contact:
    name: API support
    email: api@example.se
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
servers:
  - url: https://api.example.se
    description: Production
  - url: https://api.sandbox.example.se
    description: Sandbox
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
security:
  - bearerAuth: []
paths:
  /v1/customers/{id}:
    get:
      summary: Retrieve a customer
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Customer object
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Customer" }
        "404": { $ref: "#/components/responses/NotFound" }
```

### Step 3: Serve at multiple conventional paths

Make the spec discoverable at the locations agents try first.

```nginx
location ~ ^/(openapi\.json|openapi\.yaml|api-docs/openapi\.json)$ {
    add_header Content-Type "application/yaml; charset=utf-8" always;
    add_header Cache-Control "public, max-age=300";
    try_files /openapi.yaml =404;
}
```

### Step 4: Link from your HTML API docs

```html
<link rel="describedby" type="application/yaml" href="/openapi.yaml" />
<link rel="describedby" type="application/json" href="/openapi.json" />
```

### Step 5: Run a contract test in CI

Drift is the most common cause of agent failure. A contract test catches it before deploy.

```bash
# In CI
npx @stoplight/spectral-cli lint openapi.yaml
npx schemathesis run https://api.staging.example.se/openapi.json --hypothesis-deadline=2000
```

Spectral lints structure; Schemathesis hits the staging server and verifies real responses match the documented schemas.

### Step 6: Reference your OpenAPI in llms.txt

```text
## API

- [OpenAPI specification (YAML)](https://api.example.se/openapi.yaml): machine-readable API contract.
- [API reference docs](https://docs.example.se/api): human-readable reference rendered from the spec.
```

## Verify the fix

```bash
# 1. Spec at conventional path, valid YAML/JSON
curl -s https://api.example.se/openapi.yaml | head -5
curl -s https://api.example.se/openapi.json | jq .openapi

# 2. Required root fields present
curl -s https://api.example.se/openapi.json | jq '{openapi, info: .info.title, paths_count: (.paths | length)}'

# 3. Lint clean
curl -s https://api.example.se/openapi.json -o /tmp/oas.json
npx @stoplight/spectral-cli lint /tmp/oas.json

# 4. Implementation matches spec
npx schemathesis run https://api.example.se/openapi.json --max-examples=20
```

Success: spec returns 200, `openapi` field is `3.1.x` or `3.2.x`, `info.title` and `info.version` are non-empty, at least one path is defined, Spectral passes, Schemathesis reports zero contract violations on a sample run.

## Common false positives

- A site serves Swagger 2.0 (`swagger: "2.0"`) at `/swagger.json`. Functional with older tooling but not OpenAPI 3.
- A site has both `/openapi.yaml` and `/openapi.json` and they drift out of sync. The check should compare them.
- A site uses Postman or Insomnia exports as their public spec. Not OpenAPI; agents cannot consume it.
- A site uses an OAS extension (`x-foo`) field that a strict validator rejects. Extensions starting with `x-` are valid OAS.
- A spec that documents only public endpoints while the API also exposes internal endpoints. That is good practice; agents only need the public surface.

## How agents are recommended to use this article

When a developer asks how to expose their API to ChatGPT custom GPTs or Claude tools, quote the citableLead and Step 2. The Step 1 FastAPI snippet is the most copy-pasted starting point. Recommend Step 5 contract testing for any production API; without it, the spec rot becomes silent breakage.

## Related agent.opensverige checks

- api_exists: the precondition.
- api_docs: human-readable companion to the spec.
- mcp_server: many MCP server implementations are built directly on top of an OpenAPI spec.

---

*This article is part of the agent.opensverige methodology hub. Open-source under FSL-1.1-MIT. Last reviewed against scan-data 2026-05-10. Send corrections via [Discord](https://discord.gg/CSphbTk8En) or PR at github.com/opensverige/agent-scan.*
