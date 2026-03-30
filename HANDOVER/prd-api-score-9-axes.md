# PRD: API Agent-Readiness Score — 9 axlar
## Utökning av befintlig scanner

**Förutsätter:** Scanner med 11 checks, badge-system, resultat-sida /scan/{domain}, proxy-route, Supabase — allt från PRD v4/v5.

**Denna PRD:** Lägger till djup API-analys när scannern hittar ett API eller OpenAPI-spec. 9 axlar, 100 poäng. Visas som en egen sektion i resultat-sidan.

---

## 1. NÄR DEN TRIGGAS

API-scoren körs BARA om minst ett av dessa är sant:
- `api_exists` = pass (proxy hittade en API-endpoint)
- `openapi_spec` = pass (proxy hittade en OpenAPI/Swagger-spec)

Om inget API hittas → sektionen visas inte. Istället: "Vi hittade inget publikt API. Det är första steget."

Om API hittades men ingen OpenAPI-spec → visa begränsad score (bara axlar 1, 3, 4, 7, 8 — de som inte kräver spec). Notera: "Utan OpenAPI-spec kan vi inte göra en fullständig analys."

---

## 2. DE 9 AXLARNA

### Översikt

| # | Axel | Vikt | Kräver OpenAPI-spec? |
|---|------|------|---------------------|
| 1 | Discoverability | 15 | Nej |
| 2 | Machine-readable structure | 25 | **Ja** |
| 3 | Endpoint clarity | 10 | **Ja** (delvis utan) |
| 4 | Example quality | 10 | Delvis |
| 5 | Consistency & standards | 10 | **Ja** |
| 6 | Quality gates & trustworthiness | 10 | Nej |
| 7 | Authentication usability | 5 | Nej |
| 8 | Error handling & reliability | 5 | Delvis |
| 9 | AI-agent readiness | 10 | **Ja** |
| | **Totalt** | **100** | |

### Axel 1: Discoverability (15p)

*Kan en maskin snabbt förstå vad API:t är och var den börjar?*

| Check | Poäng | Hur |
|-------|-------|-----|
| API har tydlig titel/summary | 2 | OpenAPI `info.title` + `info.description` finns och är >10 tecken |
| Version visas | 2 | `info.version` finns |
| Base URL / server info | 2 | `servers[]` array finns med minst en URL |
| Auth-metod förklarad | 3 | `securityDefinitions` eller `components.securitySchemes` finns |
| Endpoints grupperade | 2 | `tags` används på minst 50% av operationer |
| Changelog / versionsinfo | 2 | Docs-sidan nämner "changelog", "version", "deprecat" |
| Docs sökbara / navigerbara | 2 | Docs-sida har >5 interna länkar eller nav-element |

**Utan spec:** Kolla docs-sida för titel, auth-info, navigation, changelog. Max 8/15 utan spec.

### Axel 2: Machine-readable structure (25p)

*Kan en maskin parsa API:t programmatiskt?*

| Check | Poäng | Hur |
|-------|-------|-----|
| OpenAPI/Swagger spec finns | 5 | Redan verifierat via probe |
| Spec är valid (parsear utan error) | 3 | JSON.parse / YAML.parse lyckas + har `openapi` eller `swagger` nyckel |
| `operationId` på endpoints | 5 | Räkna andel operationer med operationId. 5p = >80%, 3p = >50%, 1p = >20% |
| Typed parameters (`schema` med `type`) | 4 | Räkna andel params med type-definition |
| Request/response schemas finns | 4 | Räkna andel operationer med `requestBody.content.*.schema` och `responses.*.content.*.schema` |
| Reusable components (`$ref`) | 2 | `components.schemas` har ≥3 entries |
| Proper status codes (200, 201, 400, 404, 500) | 2 | Räkna unika status codes i spec — ≥4 = 2p, ≥2 = 1p |

**Utan spec:** 0/25. Denna axel kräver spec.

### Axel 3: Endpoint clarity (10p)

*Kan en agent välja rätt endpoint utan att gissa?*

| Check | Poäng | Hur |
|-------|-------|-----|
| Descriptions på endpoints | 3 | Andel operationer med `description` >20 tecken. 3p = >80% |
| Naming consistency | 2 | Alla paths följer samma mönster (t.ex. `/resource/{id}`) — enkel regex-check |
| Parameters documented | 2 | Andel params med `description` |
| Required vs optional markerat | 2 | Params har `required` field |
| Enums/constraints | 1 | Minst 3 params har `enum` eller `minimum`/`maximum` |

**Utan spec:** Claude analyserar docs-sida. Max 5/10 utan spec.

### Axel 4: Example quality (10p)

*Kan en LLM kopiera exempel och lyckas?*

| Check | Poäng | Hur |
|-------|-------|-----|
| Request examples i spec | 3 | `example` eller `examples` finns i request schemas |
| Response examples i spec | 3 | `example` eller `examples` finns i response schemas |
| Auth-exempel | 2 | Docs nämner curl/code-example med auth header |
| Error examples | 2 | Minst en error-response har example |

**Utan spec:** Claude letar efter code-exempel i docs-HTML. Max 4/10 utan spec.

### Axel 5: Consistency & standards (10p)

*Är API:t konsekvent nog att en agent kan lita på mönstren?*

| Check | Poäng | Hur |
|-------|-------|-----|
| Consistent naming (camelCase/snake_case) | 3 | Analysera property-namn i schemas — >90% samma format = 3p |
| Same pagination model | 2 | Om paginering nämns — samma mönster på alla list-endpoints |
| Same error structure | 3 | Alla error-responses har samma schema-ref |
| Same auth style | 2 | Alla endpoints har samma security-requirement |

**Utan spec:** 0/10.

### Axel 6: Quality gates & trustworthiness (10p)

*Kan man lita på att docs stämmer?*

| Check | Poäng | Hur |
|-------|-------|-----|
| Last updated / recent activity | 2 | Docs-sida har datum <6 månader gammalt ELLER changelog visar aktivitet |
| Status page / uptime | 2 | Probe `status.{domain}` eller sök "status" i docs |
| Sandbox / test environment | 3 | Docs nämner "sandbox", "test", "staging" |
| Deprecation policy | 1 | Docs nämner "deprecat" |
| Spec valid (lint-check) | 2 | Spec parsear OK + inga saknade refs |

**Utan spec:** Max 5/10. Changelog + status + sandbox + deprecation.

### Axel 7: Authentication usability (5p)

*Kan en agent realistiskt autentisera sig?*

| Check | Poäng | Hur |
|-------|-------|-----|
| Auth-metod dokumenterad | 1 | `securitySchemes` finns ELLER docs nämner auth |
| Service account / M2M stöd | 2 | OAuth2 `clientCredentials` flow finns ELLER docs nämner "service account", "server-to-server", "machine-to-machine" |
| Rate limits dokumenterade | 1 | Docs nämner "rate limit" ELLER spec har `x-rateLimit` |
| Token refresh förklarat | 1 | Docs nämner "refresh" i auth-kontext |

**Utan spec:** Claude analyserar docs. Max 3/5 utan spec.

### Axel 8: Error handling & reliability (5p)

*Kan en agent hantera fel utan mänsklig intervention?*

| Check | Poäng | Hur |
|-------|-------|-----|
| Documented error codes | 2 | ≥3 error status codes dokumenterade i spec |
| Retry guidance | 1 | Docs nämner "retry", "idempoten", "Retry-After" |
| Rate limit headers | 1 | Docs nämner `X-RateLimit`, `Retry-After` ELLER headers hittas i probe |
| Webhook retry behavior | 1 | Docs nämner webhook + retry/failure |

**Utan spec:** Claude analyserar docs. Max 2/5 utan spec.

### Axel 9: AI-agent readiness (10p)

*Kan en agent använda detta API som ett tool?*

| Check | Poäng | Hur |
|-------|-------|-----|
| operationIds lämpliga för function calling | 3 | operationIds finns + är deskriptiva (inte `get_1`, `post_2`) — check med regex |
| Descriptions tillräckligt tydliga för LLM-val | 2 | >80% av operationer har description >30 tecken |
| Workflows som kan kedjas | 2 | ≥2 endpoints där output-schema matchar input-schema av annan endpoint |
| MCP-server / tool definitions | 2 | GitHub-search: `mcp-server-{domain}` ELLER `mcp {domain}` — hittas? |
| Spec-kvalitet tillräcklig för auto-tool-gen | 1 | operationIds + schemas + descriptions alla >80% täckning |

**Utan spec:** Max 2/10 (MCP-search + docs-analys).

---

## 3. SCORE-BANDS

| Poäng | Band | Label |
|-------|------|-------|
| 0–39 | 🔴 | **Inte agent-redo** — Hög friktion, agenter kan inte använda detta |
| 40–59 | 🟠 | **Delvis användbart** — Funkar med manuellt arbete |
| 60–74 | 🟡 | **Developer-redo, inte agent-redo** — Bra docs men saknar maskinläsbarhet |
| 75–89 | 🟢 | **Stark grund** — Agenter kan använda detta med viss konfiguration |
| 90–100 | 💚 | **Agent-redo / tool-ready** — Agenter kan använda detta direkt |

---

## 4. IMPLEMENTATION

### 4.1 Ny modul

```
packages/
  scanner/
    api-score/
      types.ts          # AxisScore, ApiScoreResult, ScoreBand
      parse-spec.ts     # OpenAPI-parsning (JSON + YAML)
      axis-1-discovery.ts
      axis-2-structure.ts
      axis-3-clarity.ts
      axis-4-examples.ts
      axis-5-consistency.ts
      axis-6-quality.ts
      axis-7-auth.ts
      axis-8-errors.ts
      axis-9-agent.ts
      scorer.ts         # Summera alla axlar → total score + band
      index.ts          # Exporterar scoreApi(spec, probes, docsHtml)
```

### 4.2 Huvudfunktion

```typescript
interface ApiScoreInput {
  spec: object | null;          // Parsead OpenAPI spec (JSON)
  specRaw: string | null;       // Rå spec-text
  docsHtml: string | null;      // HTML från developer-portal (via probe/Firecrawl)
  docsUrl: string | null;       // URL till docs
  probes: ProbeResult[];        // Alla probe-resultat
  domain: string;
}

interface AxisScore {
  axis: string;                 // "discoverability", "machine_structure", etc.
  label: string;                // "Discoverability"
  score: number;                // 0-max för denna axel
  maxScore: number;             // Max poäng (15, 25, etc.)
  checks: {
    name: string;
    score: number;
    maxScore: number;
    detail: string;             // "operationId finns på 85% av endpoints"
  }[];
  limited: boolean;             // true om poängen begränsas av saknad spec
}

interface ApiScoreResult {
  totalScore: number;           // 0-100
  maxPossibleScore: number;     // <100 om spec saknas
  band: "not_ready" | "partial" | "dev_ready" | "strong" | "agent_ready";
  bandLabel: string;
  axes: AxisScore[];
  hasSpec: boolean;
  specFormat: "openapi3" | "openapi2" | "swagger" | null;
  topBlockers: string[];        // Top 5 saker som drar ner scoren
  fastestFixes: string[];       // Top 5 snabba förbättringar
}

export async function scoreApi(input: ApiScoreInput): Promise<ApiScoreResult> {
  const spec = input.spec;
  const axes: AxisScore[] = [];
  
  axes.push(scoreDiscoverability(spec, input.docsHtml, input.probes));
  axes.push(scoreMachineStructure(spec));
  axes.push(scoreEndpointClarity(spec, input.docsHtml));
  axes.push(scoreExampleQuality(spec, input.docsHtml));
  axes.push(scoreConsistency(spec));
  axes.push(scoreQualityGates(spec, input.docsHtml, input.probes, input.domain));
  axes.push(scoreAuthUsability(spec, input.docsHtml));
  axes.push(scoreErrorHandling(spec, input.docsHtml));
  axes.push(scoreAgentReadiness(spec, input.docsHtml, input.domain));
  
  const totalScore = axes.reduce((sum, a) => sum + a.score, 0);
  const maxPossible = axes.reduce((sum, a) => sum + (a.limited ? a.score : a.maxScore), 0);
  
  return {
    totalScore,
    maxPossibleScore: spec ? 100 : maxPossible,
    band: getBand(totalScore),
    bandLabel: getBandLabel(totalScore),
    axes,
    hasSpec: !!spec,
    specFormat: detectSpecFormat(spec),
    topBlockers: generateBlockers(axes),
    fastestFixes: generateFixes(axes),
  };
}
```

### 4.3 OpenAPI-parsning

```typescript
// packages/scanner/api-score/parse-spec.ts

import yaml from "js-yaml";

export function parseSpec(raw: string): { spec: object; format: string } | null {
  // Försök JSON först
  try {
    const parsed = JSON.parse(raw);
    if (parsed.openapi || parsed.swagger) {
      return { spec: parsed, format: parsed.openapi ? "openapi3" : "swagger" };
    }
  } catch {}
  
  // Försök YAML
  try {
    const parsed = yaml.load(raw) as any;
    if (parsed?.openapi || parsed?.swagger) {
      return { spec: parsed, format: parsed.openapi ? "openapi3" : "swagger" };
    }
  } catch {}
  
  return null;
}

// Hjälpfunktioner för att traversera spec
export function getAllOperations(spec: any): Operation[] {
  const ops: Operation[] = [];
  const paths = spec.paths || {};
  
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, op] of Object.entries(methods as any)) {
      if (["get","post","put","patch","delete"].includes(method)) {
        ops.push({ path, method, ...(op as any) });
      }
    }
  }
  return ops;
}

export function getAllSchemas(spec: any): Record<string, any> {
  // OpenAPI 3
  if (spec.components?.schemas) return spec.components.schemas;
  // Swagger 2
  if (spec.definitions) return spec.definitions;
  return {};
}

export function getAllParams(spec: any): any[] {
  const params: any[] = [];
  const ops = getAllOperations(spec);
  for (const op of ops) {
    if (op.parameters) params.push(...op.parameters);
  }
  return params;
}
```

### 4.4 Exempel: Axel 2 (Machine-readable structure)

```typescript
// packages/scanner/api-score/axis-2-structure.ts

export function scoreMachineStructure(spec: any): AxisScore {
  const checks = [];
  
  if (!spec) {
    return {
      axis: "machine_structure", label: "Maskinläsbar struktur",
      score: 0, maxScore: 25, checks: [], limited: true,
    };
  }
  
  // 1. Spec finns (5p) — redan verifierat
  checks.push({ name: "OpenAPI/Swagger spec", score: 5, maxScore: 5, 
                 detail: `${spec.openapi || spec.swagger} hittad` });
  
  // 2. Spec valid (3p)
  const isValid = !!(spec.paths && (spec.info || spec.swagger));
  checks.push({ name: "Spec valid", score: isValid ? 3 : 0, maxScore: 3,
                 detail: isValid ? "Spec parsear utan fel" : "Spec har strukturfel" });
  
  // 3. operationId (5p)
  const ops = getAllOperations(spec);
  const withOpId = ops.filter(o => o.operationId);
  const opIdPct = ops.length > 0 ? withOpId.length / ops.length : 0;
  const opIdScore = opIdPct > 0.8 ? 5 : opIdPct > 0.5 ? 3 : opIdPct > 0.2 ? 1 : 0;
  checks.push({ name: "operationId", score: opIdScore, maxScore: 5,
                 detail: `${Math.round(opIdPct * 100)}% av endpoints har operationId` });
  
  // 4. Typed parameters (4p)
  const allParams = getAllParams(spec);
  const typedParams = allParams.filter(p => p.schema?.type || p.type);
  const typedPct = allParams.length > 0 ? typedParams.length / allParams.length : 0;
  const typedScore = typedPct > 0.8 ? 4 : typedPct > 0.5 ? 2 : typedPct > 0.2 ? 1 : 0;
  checks.push({ name: "Typed parameters", score: typedScore, maxScore: 4,
                 detail: `${Math.round(typedPct * 100)}% av parametrar har type-definition` });
  
  // 5. Request/response schemas (4p)
  const withReqSchema = ops.filter(o => 
    o.requestBody?.content?.["application/json"]?.schema || 
    o.parameters?.some((p: any) => p.in === "body" && p.schema)
  );
  const withResSchema = ops.filter(o => {
    const responses = o.responses || {};
    return Object.values(responses).some((r: any) => 
      r.content?.["application/json"]?.schema || r.schema
    );
  });
  const schemaPct = ops.length > 0 
    ? (withReqSchema.length + withResSchema.length) / (ops.length * 2) 
    : 0;
  const schemaScore = schemaPct > 0.7 ? 4 : schemaPct > 0.4 ? 2 : schemaPct > 0.1 ? 1 : 0;
  checks.push({ name: "Request/response schemas", score: schemaScore, maxScore: 4,
                 detail: `${withResSchema.length}/${ops.length} endpoints har response-schema` });
  
  // 6. Reusable components (2p)
  const schemas = getAllSchemas(spec);
  const schemaCount = Object.keys(schemas).length;
  const reuseScore = schemaCount >= 3 ? 2 : schemaCount >= 1 ? 1 : 0;
  checks.push({ name: "Reusable components", score: reuseScore, maxScore: 2,
                 detail: `${schemaCount} schemas i components` });
  
  // 7. Status codes (2p)
  const allStatusCodes = new Set<string>();
  for (const op of ops) {
    if (op.responses) {
      Object.keys(op.responses).forEach(code => allStatusCodes.add(code));
    }
  }
  const codeScore = allStatusCodes.size >= 4 ? 2 : allStatusCodes.size >= 2 ? 1 : 0;
  checks.push({ name: "Status codes", score: codeScore, maxScore: 2,
                 detail: `${allStatusCodes.size} unika status codes: ${[...allStatusCodes].join(", ")}` });
  
  const totalScore = checks.reduce((s, c) => s + c.score, 0);
  
  return {
    axis: "machine_structure", label: "Maskinläsbar struktur",
    score: totalScore, maxScore: 25, checks, limited: false,
  };
}
```

### 4.5 MCP-check (Axel 9)

```typescript
// GitHub-search via proxy eller server-side

async function checkMcpServer(domain: string): Promise<{ found: boolean; url?: string; stars?: number }> {
  // Sök GitHub för MCP-server
  const searchTerms = [
    `mcp-server-${domain.replace(".se","").replace(".com","").replace(".net","")}`,
    `mcp ${domain}`,
  ];
  
  // Använd GitHub search API (inga auth krävs för public search)
  for (const term of searchTerms) {
    try {
      const res = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(term)}&sort=stars&per_page=3`,
        { headers: { "User-Agent": "OpenSverige-Scanner" }, signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      if (data.items?.length > 0) {
        const repo = data.items[0];
        return { found: true, url: repo.html_url, stars: repo.stargazers_count };
      }
    } catch {}
  }
  
  return { found: false };
}
```

**OBS:** GitHub search API har rate limit (10 req/min unauthenticated). Cache resultat per domän i Supabase. Visa cached resultat om <24h gammalt.

---

## 5. SCAN PIPELINE — UTÖKAD

```
Befintlig pipeline:
  1. Probe URLs (robots, sitemap, llms.txt, API-paths)  ← finns
  2. Basic checks (11 st)                                ← finns
  3. Firecrawl (startsida)                               ← finns/byggs
  4. Claude-analys                                       ← finns

Nytt steg (mellan 1 och 2):
  1b. OM OpenAPI-spec hittades i steg 1:
      → Fetcha spec-body (redan i probe-resultaten)
      → Parsa spec (JSON/YAML)
      → Kör 9-axlars scoring
      → Spara i Supabase
```

API-scoren körs **parallellt** med Firecrawl och Claude-anrop. Den behöver inte vänta på Claude.

---

## 6. UI PÅ RESULTAT-SIDAN

### 6.1 Placering

I resultat-sidans layout (PRD v5, sektion 11), infoga efter "Builder"-sektionens checks:

```
...befintliga checks...

7. API AGENT-READINESS SCORE (NY — visas bara om API hittades)
   Score-cirkel + 9 axlar + top blockers + fastest fixes

...resten av sidan...
```

### 6.2 Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  API AGENT-READINESS                                         │
│                                                              │
│        ┌─────────┐                                           │
│        │   68    │                                           │
│        │  / 100  │                                           │
│        └─────────┘                                           │
│   Developer-redo, inte agent-redo                            │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ Discoverability          ████████████░░░  12/15       │   │
│  │ Maskinläsbar struktur    ██████████░░░░░  14/25       │   │
│  │ Endpoint clarity         ████████░░░░░░░   8/10       │   │
│  │ Exempelkvalitet          ███████░░░░░░░░   7/10       │   │
│  │ Konsistens               ████████░░░░░░░   8/10       │   │
│  │ Kvalitet & tillit        █████░░░░░░░░░░   5/10       │   │
│  │ Auth-användbarhet        ████░░░░░░░░░░░   4/5        │   │
│  │ Felhantering             ████░░░░░░░░░░░   4/5        │   │
│  │ Agent-readiness          ██████░░░░░░░░░   6/10       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  BLOCKERARE                                                  │
│  ✗ Ingen nedladdningsbar OpenAPI-spec                        │
│  ✗ operationIds saknas på 60% av endpoints                   │
│  ✗ Error-schemas inkonsistenta                               │
│  ✗ Ingen webhook/event-dokumentation                         │
│  ✗ 40% av endpoints saknar schema                            │
│                                                              │
│  SNABBASTE FIXARNA                                           │
│  → Publicera OpenAPI-spec på /openapi.json                   │
│  → Lägg till operationIds och typade schemas                 │
│  → Standardisera error-responser                             │
│  → Lägg till request/response-exempel                        │
│  → Dokumentera rate limits och auth scopes                   │
│                                                              │
│  ⓘ Utan OpenAPI-spec kunde vi bara analysera 45 av           │
│    100 möjliga poäng. Publicera en spec för full analys.     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Staplarna

Varje axel-rad: label → progress bar → score/max.

Bar-färger baserat på procent:
- ≥80%: `--success` (grön)
- ≥50%: `--status-wip` (gul)
- <50%: `--fail-red` (röd)

### 6.4 Om spec saknas

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  API AGENT-READINESS                                         │
│                                                              │
│        ┌─────────┐                                           │
│        │   23    │                                           │
│        │ / ~45   │  ← max possible utan spec                │
│        └─────────┘                                           │
│   Ofullständig analys — ingen OpenAPI-spec hittad            │
│                                                              │
│  Vi hittade ett API men ingen maskinläsbar spec.             │
│  Publicera en OpenAPI-spec på /openapi.json för              │
│  att få en fullständig analys med alla 9 axlar.              │
│                                                              │
│  (begränsade axlar visas)                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. BLOCKERARE & FIXES — GENERATION

```typescript
function generateBlockers(axes: AxisScore[]): string[] {
  const blockers: { text: string; severity: number }[] = [];
  
  for (const axis of axes) {
    for (const check of axis.checks) {
      if (check.score < check.maxScore * 0.5) {
        blockers.push({
          text: `${check.name}: ${check.detail}`,
          severity: check.maxScore - check.score, // Större gap = värre
        });
      }
    }
  }
  
  return blockers
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 5)
    .map(b => b.text);
}

function generateFixes(axes: AxisScore[]): string[] {
  // Fixes = checks som ger mest poäng med minst arbete
  const FIX_MAP: Record<string, string> = {
    "OpenAPI/Swagger spec": "Publicera OpenAPI-spec på /openapi.json",
    "operationId": "Lägg till operationIds på alla endpoints",
    "Typed parameters": "Definiera type och schema på alla parametrar",
    "Request/response schemas": "Lägg till JSON schemas i request/response",
    "Status codes": "Dokumentera alla relevanta HTTP status codes",
    "Reusable components": "Extrahera gemensamma schemas till components",
    "Auth-metod dokumenterad": "Dokumentera auth-metod i securitySchemes",
    "Error examples": "Lägg till exempel på error-responses",
    // ... etc
  };
  
  const fixes: { text: string; gain: number }[] = [];
  for (const axis of axes) {
    for (const check of axis.checks) {
      const gap = check.maxScore - check.score;
      if (gap > 0 && FIX_MAP[check.name]) {
        fixes.push({ text: FIX_MAP[check.name], gain: gap });
      }
    }
  }
  
  return fixes
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 5)
    .map(f => f.text);
}
```

---

## 8. SUPABASE

```sql
-- Ny tabell för API-scores
CREATE TABLE api_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scan_submissions(id),
  domain TEXT NOT NULL,
  
  total_score INTEGER NOT NULL,
  max_possible_score INTEGER NOT NULL DEFAULT 100,
  band TEXT NOT NULL,
  has_spec BOOLEAN NOT NULL DEFAULT false,
  spec_format TEXT,                   -- 'openapi3', 'openapi2', 'swagger', null
  
  -- Per-axel scores
  axis_scores JSONB NOT NULL,         -- Array av AxisScore
  
  -- Aggregerade insikter
  top_blockers TEXT[],
  fastest_fixes TEXT[],
  
  -- Spec-metadata
  endpoint_count INTEGER,
  operation_id_coverage REAL,         -- 0.0-1.0
  schema_coverage REAL,
  
  scored_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_api_score_domain ON api_scores (domain, scored_at DESC);
CREATE INDEX idx_api_score_scan ON api_scores (scan_id);
```

---

## 9. DEPENDENCIES

```
js-yaml          — för YAML-parsning av OpenAPI-specs
```

Det är den enda nya dependency. Allt annat är ren JSON-traversering.

---

## 10. IMPLEMENTATION ORDER

```
Steg 1: OpenAPI-parser
  ├── packages/scanner/api-score/parse-spec.ts
  ├── parseSpec(raw) → parsed object
  ├── getAllOperations(spec), getAllSchemas(spec), getAllParams(spec)
  └── Testa mot Fortnox och Stripe OpenAPI-specs

Steg 2: Axel-scorers (börja med 2, 3, 9 — de viktigaste)
  ├── axis-2-structure.ts (25p — störst vikt)
  ├── axis-3-clarity.ts (10p)
  ├── axis-9-agent.ts (10p — unik vinkel)
  └── Testa mot kända specs

Steg 3: Resterande axlar
  ├── axis-1-discovery.ts
  ├── axis-4-examples.ts
  ├── axis-5-consistency.ts
  ├── axis-6-quality.ts
  ├── axis-7-auth.ts
  └── axis-8-errors.ts

Steg 4: Scorer + blockers/fixes
  ├── scorer.ts
  ├── getBand(), generateBlockers(), generateFixes()
  └── index.ts — exportera scoreApi()

Steg 5: Integration i scan-pipeline
  ├── Kör scoreApi() efter probe om spec hittades
  ├── Spara i Supabase (api_scores tabell)
  └── Skicka till resultat-sida

Steg 6: MCP-check (axel 9)
  ├── GitHub search API
  ├── Cache i Supabase
  └── Rate limit-hantering

Steg 7: UI — API score-sektion
  ├── Score-cirkel
  ├── 9 progress bars
  ├── Blockerare-lista
  ├── Snabbaste fixar
  └── "Utan spec"-meddelande

Steg 8: Supabase
  ├── api_scores tabell
  └── RLS policies
```

---

## 11. EDGE CASES

| Case | Hantering |
|------|-----------|
| Spec hittad men ogiltig JSON/YAML | Visa "Spec hittades men kunde inte parsas" — 0/25 på axel 2, resten körs |
| Spec är Swagger 2.0, inte OpenAPI 3 | Stöd båda — alla hjälpfunktioner hanterar båda formaten |
| Spec är enorm (>1MB) | Trunkera till 500KB före parsning |
| Spec kräver auth att ladda ner | Notera "Spec bakom auth — kunde inte analyseras" |
| Inget API alls | Sektionen visas inte. Inga axlar. |
| API finns men inga docs | Begränsad score (max ~35/100). Tydligt meddelande. |
| GitHub rate limit (MCP-check) | Cache aggressivt. Visa cached resultat. Fail gracefully. |
