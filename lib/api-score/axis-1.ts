// lib/api-score/axis-1.ts — Discoverability (15p)

import type { AxisScore } from "./types";
import { getAllOperations } from "./parse-spec";

export function scoreDiscoverability(
  spec: Record<string, unknown> | null,
  docsHtml: string | null,
): AxisScore {
  const docs = (docsHtml ?? "").toLowerCase();
  const checks = [];

  if (!spec) {
    // Limited analysis from docs only — max 8/15
    const hasApiRef = docs.includes("api") && docs.length > 200;
    checks.push({ name: "API-titel / summary", score: hasApiRef ? 1 : 0, maxScore: 2,
      detail: hasApiRef ? "API-referens hittad i docs" : "Ingen API-titel hittad" });

    const hasAuth = /auth|api key|bearer|oauth|apikey/.test(docs);
    checks.push({ name: "Auth-metod förklarad", score: hasAuth ? 2 : 0, maxScore: 3,
      detail: hasAuth ? "Auth-info hittad i docs" : "Ingen auth-dokumentation hittad" });

    const hasChangelog = /changelog|change log|version history|deprecat/.test(docs);
    checks.push({ name: "Changelog / versionsinfo", score: hasChangelog ? 2 : 0, maxScore: 2,
      detail: hasChangelog ? "Versionsinfo hittad" : "Ingen versionsinfo hittad" });

    const linkCount = (docs.match(/href=/g) ?? []).length;
    checks.push({ name: "Docs navigerbara", score: linkCount > 5 ? 3 : linkCount > 0 ? 1 : 0, maxScore: 3,
      detail: `${linkCount} interna länkar hittade` });

    const total = checks.reduce((s, c) => s + c.score, 0);
    return { axis: "discoverability", label: "Discoverability", score: total, maxScore: 15, checks, limited: true };
  }

  const ops = getAllOperations(spec);
  const info = spec.info as Record<string, unknown> | undefined;
  const servers = spec.servers as unknown[] | undefined;
  const basePath = spec.basePath as string | undefined;
  const secSchemes = (spec.components as Record<string, unknown> | undefined)?.securitySchemes;
  const secDefs = spec.securityDefinitions;

  // 1. Title + description (2p)
  const hasTitle = typeof info?.title === "string" && (info.title as string).length > 10;
  const hasDesc = typeof info?.description === "string" && (info.description as string).length > 10;
  checks.push({ name: "API-titel / summary", score: (hasTitle ? 1 : 0) + (hasDesc ? 1 : 0), maxScore: 2,
    detail: hasTitle ? `"${info?.title}"${hasDesc ? " + beskrivning" : ""}` : "Ingen titel" });

  // 2. Version (2p)
  const hasVersion = typeof info?.version === "string" && (info.version as string).length > 0;
  checks.push({ name: "Version angivet", score: hasVersion ? 2 : 0, maxScore: 2,
    detail: hasVersion ? `v${info?.version}` : "Ingen version angiven" });

  // 3. Server/base URL (2p)
  const hasServers = (Array.isArray(servers) && servers.length > 0) || !!basePath;
  checks.push({ name: "Base URL / servers", score: hasServers ? 2 : 0, maxScore: 2,
    detail: hasServers ? `${servers?.length ?? 1} server(s) konfigurerade` : "Ingen server-URL angiven" });

  // 4. Auth documented (3p)
  const hasAuth = !!(secSchemes || secDefs);
  checks.push({ name: "Auth-metod förklarad", score: hasAuth ? 3 : 0, maxScore: 3,
    detail: hasAuth ? "securitySchemes dokumenterade" : "Ingen securitySchemes hittad" });

  // 5. Tags on ≥50% of operations (2p)
  const opsWithTags = ops.filter(o => Array.isArray(o.tags) && o.tags.length > 0);
  const tagPct = ops.length > 0 ? opsWithTags.length / ops.length : 0;
  checks.push({ name: "Endpoints grupperade med tags", score: tagPct >= 0.5 ? 2 : tagPct > 0 ? 1 : 0, maxScore: 2,
    detail: `${Math.round(tagPct * 100)}% av endpoints har tags` });

  // 6. Changelog in docs (2p)
  const hasChangelog = /changelog|change log|version history|deprecat/.test(docs);
  checks.push({ name: "Changelog / versionsinfo", score: hasChangelog ? 2 : 0, maxScore: 2,
    detail: hasChangelog ? "Versionsinfo hittad i docs" : "Ingen versionsinfo hittad i docs" });

  // 7. Navigable docs (2p)
  const linkCount = (docs.match(/href=/g) ?? []).length;
  checks.push({ name: "Docs sökbara / navigerbara", score: linkCount > 5 ? 2 : linkCount > 0 ? 1 : 0, maxScore: 2,
    detail: `${linkCount} interna länkar i docs` });

  const total = checks.reduce((s, c) => s + c.score, 0);
  return { axis: "discoverability", label: "Discoverability", score: total, maxScore: 15, checks, limited: false };
}
