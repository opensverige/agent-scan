// app/scan/[domain]/page.tsx
import type { Metadata } from "next";
import type { ScanResult } from "@/lib/scan-types";
import type { AllChecks } from "@/lib/checks";
import { computeSeverityCounts } from "@/lib/checks";
import { getLocalLatestScan } from "@/lib/local-scan-store";
import Nav from "../_components/Nav";
import ResultsPage from "./_components/ResultsPage";

interface PageProps {
  params: Promise<{ domain: string }>;
}

async function getLatestScan(domain: string): Promise<ScanResult | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const local = getLocalLatestScan(domain);
    if (!local) return null;
    return {
      company: local.domain.split(".")[0] ?? local.domain,
      industry: "",
      summary: local.claude_summary ?? "",
      agent_suggestions: [],
      badge: local.badge as ScanResult["badge"],
      score: local.checks_passed,
      checks: local.checks_json,
      recommendations: local.recommendations,
      severity_counts: computeSeverityCounts(local.checks_json),
      scan_id: local.scan_id,
      isDemo: false,
      scanned_at: local.scanned_at ?? new Date(0).toISOString(),
    };
  }

  const stripped = domain.replace(/^www\./, "");
  const candidates = Array.from(new Set([
    domain,
    stripped,
    `www.${stripped}`,
  ]));

  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const modernSelect = "badge,checks_passed,checks_json,claude_summary,recommendations,scanned_at";
  const legacySelect = "badge,checks_passed,checks_json,scanned_at";

  const toScanResult = (
    candidateDomain: string,
    row: {
      badge: string;
      checks_passed: number;
      checks_json: AllChecks;
      claude_summary?: string | null;
      recommendations?: unknown;
      scanned_at?: string | null;
    },
  ): ScanResult => ({
    company: candidateDomain.split(".")[0] ?? candidateDomain,
    industry: "",
    summary: row.claude_summary ?? "",
    agent_suggestions: [],
    badge: row.badge as ScanResult["badge"],
    score: row.checks_passed,
    checks: row.checks_json,
    recommendations: Array.isArray(row.recommendations)
      ? row.recommendations.filter((v): v is string => typeof v === "string")
      : [],
    severity_counts: computeSeverityCounts(row.checks_json),
    scan_id: null,
    isDemo: false,
    scanned_at: row.scanned_at ?? new Date(0).toISOString(),
  });

  try {
    for (const candidate of candidates) {
      const modernRes = await fetch(
        `${url}/rest/v1/scan_submissions?domain=eq.${encodeURIComponent(candidate)}&order=scanned_at.desc&limit=1&select=${modernSelect}`,
        { headers, next: { revalidate: 60 } }
      );
      if (modernRes.ok) {
        const modernRows = await modernRes.json() as Array<{
          badge: string;
          checks_passed: number;
          checks_json: AllChecks;
          claude_summary: string | null;
          recommendations: unknown;
          scanned_at: string | null;
        }>;
        if (modernRows.length) return toScanResult(candidate, modernRows[0]);
        continue;
      }

      // Backward-compat: older schema missing claude_summary/recommendations.
      const legacyRes = await fetch(
        `${url}/rest/v1/scan_submissions?domain=eq.${encodeURIComponent(candidate)}&order=scanned_at.desc&limit=1&select=${legacySelect}`,
        { headers, next: { revalidate: 60 } }
      );
      if (!legacyRes.ok) continue;
      const legacyRows = await legacyRes.json() as Array<{
        badge: string;
        checks_passed: number;
        checks_json: AllChecks;
        scanned_at: string | null;
      }>;
      if (legacyRows.length) return toScanResult(candidate, legacyRows[0]);
    }
    const local = getLocalLatestScan(domain);
    if (!local) return null;
    return {
      company: local.domain.split(".")[0] ?? local.domain,
      industry: "",
      summary: local.claude_summary ?? "",
      agent_suggestions: [],
      badge: local.badge as ScanResult["badge"],
      score: local.checks_passed,
      checks: local.checks_json,
      recommendations: local.recommendations,
      severity_counts: computeSeverityCounts(local.checks_json),
      scan_id: local.scan_id,
      isDemo: false,
      scanned_at: local.scanned_at ?? new Date(0).toISOString(),
    };
  } catch { return null; }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain } = await params;
  const data = await getLatestScan(domain);

  if (!data) {
    return {
      title: `${domain} — Scanna din sajt | OpenSverige`,
      description: "Scanna din sajt och se hur redo du är för AI-agenter.",
    };
  }

  const badgeLabel = data.badge === "green" ? "REDO" : data.badge === "yellow" ? "DELVIS REDO" : "INTE REDO";
  const sc = data.severity_counts;
  const description = `${domain} fick ${data.score}/11 i AI-readiness. ${sc.critical} brister, ${sc.important} varningar, ${data.score} ok. Scanna din sajt gratis.`;
  const ogImageUrl = `https://agent.opensverige.se/api/og?domain=${encodeURIComponent(domain)}&score=${data.score}&max=11&status=${encodeURIComponent(badgeLabel)}`;

  return {
    title: `${domain} — ${badgeLabel} (${data.score}/11) | agent.opensverige`,
    description,
    openGraph: {
      title: `${domain} fick ${data.score}/11 i AI-readiness`,
      description: data.summary || description,
      url: `https://agent.opensverige.se/scan/${domain}`,
      siteName: "agent.opensverige",
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${domain} — ${data.score}/11 AI Readiness`,
      description: data.summary || description,
      images: [ogImageUrl],
    },
  };
}

export default async function ScanResultPage({ params }: PageProps) {
  const { domain } = await params;
  const initialData = await getLatestScan(domain);

  const jsonLd = initialData ? {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `AI Readiness Scan: ${domain}`,
    "description": initialData.summary || `AI-readiness scan av ${domain}`,
    "author": {
      "@type": "Organization",
      "name": "OpenSverige",
      "url": "https://opensverige.se",
    },
    "mainEntity": {
      "@type": "Rating",
      "ratingValue": initialData.score,
      "bestRating": 11,
      "worstRating": 0,
      "ratingExplanation": initialData.summary,
    },
    "about": {
      "@type": "WebSite",
      "name": domain,
      "url": `https://${domain}`,
    },
  } : null;

  return (
    <>
      <Nav />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ResultsPage domain={domain} initialData={initialData} />
      <footer className="px-6 py-3.5 border-t border-border flex justify-between items-center font-mono text-[10px] text-muted-foreground flex-wrap gap-2">
        <span>agent.opensverige.se</span>
        <span>opensverige.se — öppen källkod</span>
      </footer>
    </>
  );
}
