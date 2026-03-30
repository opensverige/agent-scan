// lib/api-score/axis-6.ts — Quality gates & trustworthiness (10p)

import type { AxisScore } from "./types";

export async function scoreQualityGates(
  spec: Record<string, unknown> | null,
  docsHtml: string | null,
  domain: string,
): Promise<AxisScore> {
  const docs = (docsHtml ?? "").toLowerCase();
  const checks = [];

  // 1. Last updated / recent activity (2p)
  const datePattern = /202[3-9]|202[4-9]|last updated|recently updated/;
  const hasRecent = datePattern.test(docs);
  checks.push({ name: "Senast uppdaterad / aktiv", score: hasRecent ? 2 : 0, maxScore: 2,
    detail: hasRecent ? "Nyligen uppdaterat datum hittad i docs" : "Inget datum hittad i docs" });

  // 2. Status page (2p)
  let hasStatus = /status\.(${domain}|page|io)|uptime|status page|statuspage/.test(docs);
  if (!hasStatus) {
    // Quick probe for status subdomain
    try {
      const res = await fetch(`https://status.${domain}`, {
        signal: AbortSignal.timeout(3000),
        headers: { "User-Agent": "OpenSverige-Scanner/1.0" },
      });
      hasStatus = res.status === 200;
    } catch {}
  }
  checks.push({ name: "Status-sida / uptime", score: hasStatus ? 2 : 0, maxScore: 2,
    detail: hasStatus ? "Status-sida hittad" : "Ingen status-sida hittad" });

  // 3. Sandbox (3p)
  const hasSandbox = /sandbox|test.?environment|staging|testbed|playground|test.?compan|demo.?env|testmilj|testbolag|developer.?portal|test.?account/.test(docs);
  checks.push({ name: "Sandbox / testmiljö", score: hasSandbox ? 3 : 0, maxScore: 3,
    detail: hasSandbox ? "Testmiljö nämnd i docs" : "Ingen testmiljö nämnd i docs" });

  // 4. Deprecation policy (1p)
  const hasDeprecation = /deprecat|sunset|end.of.life|eol/.test(docs);
  checks.push({ name: "Deprecation policy", score: hasDeprecation ? 1 : 0, maxScore: 1,
    detail: hasDeprecation ? "Deprecation-policy hittad" : "Ingen deprecation-policy hittad" });

  // 5. Spec valid / no broken refs (2p) — requires spec
  if (spec) {
    const paths = spec.paths as Record<string, unknown> | undefined;
    const hasRefs = JSON.stringify(paths ?? {}).includes('"$ref"');
    const schemas = (spec.components as Record<string, unknown> | undefined)?.schemas ?? spec.definitions ?? {};
    const schemaCount = Object.keys(schemas as Record<string, unknown>).length;
    const specValid = !!(spec.info && paths);
    const refScore = specValid ? (hasRefs && schemaCount > 0 ? 2 : 1) : 0;
    checks.push({ name: "Spec valid / inga brutna refs", score: refScore, maxScore: 2,
      detail: specValid ? (hasRefs ? `Spec OK, ${schemaCount} schemas definierade` : "Spec OK, inga $ref-referenser") : "Spec har strukturfel" });
  } else {
    checks.push({ name: "Spec valid / inga brutna refs", score: 0, maxScore: 2,
      detail: "Kräver OpenAPI-spec" });
  }

  const total = checks.reduce((s, c) => s + c.score, 0);
  const limited = !spec;
  return { axis: "quality_gates", label: "Kvalitet & tillit", score: total, maxScore: 10, checks, limited };
}
