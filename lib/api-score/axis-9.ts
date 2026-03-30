// lib/api-score/axis-9.ts — AI-agent readiness (10p)

import type { AxisScore } from "./types";
import { getAllOperations, pct } from "./parse-spec";

const GENERIC_OP_ID = /^(get|post|put|patch|delete|list|create|update|remove)_?\d+$/i;

async function checkMcpServer(domain: string): Promise<{ found: boolean; url?: string }> {
  const slug = domain.replace(/\.(se|com|net|io|org|dev)$/, "");
  const terms = [`mcp-server-${slug}`, `mcp ${domain}`];
  for (const term of terms) {
    try {
      const res = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(term)}&sort=stars&per_page=3`,
        { headers: { "User-Agent": "OpenSverige-Scanner/1.0" }, signal: AbortSignal.timeout(3000) },
      );
      if (!res.ok) continue;
      const data = await res.json() as { items?: Array<{ html_url: string }> };
      if ((data.items?.length ?? 0) > 0) return { found: true, url: data.items![0].html_url };
    } catch {}
  }
  return { found: false };
}

export async function scoreAgentReadiness(
  spec: Record<string, unknown> | null,
  docsHtml: string | null,
  domain: string,
): Promise<AxisScore> {
  const docs = (docsHtml ?? "").toLowerCase();
  const checks = [];

  // 4. MCP server (2p) — check regardless of spec
  const mcpResult = await checkMcpServer(domain);
  const hasMcpInDocs = /mcp.server|model.context.protocol|mcp tool/.test(docs);
  checks.push({ name: "MCP-server / tool definitions", score: (mcpResult.found || hasMcpInDocs) ? 2 : 0, maxScore: 2,
    detail: mcpResult.found ? `MCP-server hittad: ${mcpResult.url}` : hasMcpInDocs ? "MCP nämnt i docs" : "Ingen MCP-server hittad" });

  if (!spec) {
    // Without spec: only MCP check
    return { axis: "agent_readiness", label: "Agent-readiness", score: checks[0].score, maxScore: 10, checks, limited: true };
  }

  const ops = getAllOperations(spec);

  // 1. operationIds suitable for function calling (3p)
  const opsWithId = ops.filter(o => o.operationId);
  const opsWithDescriptiveId = opsWithId.filter(o => o.operationId && !GENERIC_OP_ID.test(o.operationId));
  const opIdPct = pct(opsWithId.length, ops.length);
  const descriptivePct = pct(opsWithDescriptiveId.length, ops.length);
  const opIdScore = descriptivePct > 0.8 ? 3 : descriptivePct > 0.5 ? 2 : opIdPct > 0.5 ? 1 : 0;
  checks.unshift({ name: "operationIds lämpliga för function calling", score: opIdScore, maxScore: 3,
    detail: `${Math.round(descriptivePct * 100)}% av endpoints har deskriptiva operationIds` });

  // 2. Descriptions sufficient for LLM tool selection (2p)
  const opsWithLongDesc = ops.filter(o =>
    (typeof o.description === "string" && o.description.length > 30) ||
    (typeof o.summary === "string" && o.summary.length > 30)
  );
  const descPct = pct(opsWithLongDesc.length, ops.length);
  checks.splice(1, 0, { name: "Descriptions tillräckliga för LLM-val", score: descPct > 0.8 ? 2 : descPct > 0.5 ? 1 : 0, maxScore: 2,
    detail: `${Math.round(descPct * 100)}% av endpoints har description >30 tecken` });

  // 3. Chainable workflows (2p) — ≥2 endpoints where output schema could feed another
  // Simplified: check if there are endpoints with both request and response schemas
  const opsWithSchemas = ops.filter(o => {
    const hasReq = o.requestBody || o.parameters?.some(p => (p as { in?: string }).in === "body");
    const hasRes = Object.values(o.responses ?? {}).some(r => {
      const res = r as Record<string, unknown>;
      return res.schema || (res.content as Record<string, unknown> | undefined)?.["application/json"];
    });
    return hasReq && hasRes;
  });
  checks.splice(2, 0, { name: "Workflows som kan kedjas", score: opsWithSchemas.length >= 2 ? 2 : opsWithSchemas.length >= 1 ? 1 : 0, maxScore: 2,
    detail: `${opsWithSchemas.length} endpoints har både request- och response-schema (kedjas)` });

  // 5. Spec quality for auto-tool-gen (1p)
  const allGood = opIdPct > 0.8 && descPct > 0.8;
  checks.push({ name: "Spec-kvalitet för auto-tool-gen", score: allGood ? 1 : 0, maxScore: 1,
    detail: allGood ? "operationIds + descriptions täcker >80% — klar för auto-tool-generering" : "Otillräcklig täckning för auto-tool-generering" });

  const total = checks.reduce((s, c) => s + c.score, 0);
  return { axis: "agent_readiness", label: "Agent-readiness", score: total, maxScore: 10, checks, limited: false };
}
