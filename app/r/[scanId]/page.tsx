// app/r/[scanId]/page.tsx
//
// Permanent unique-URL route for a specific scan, addressed by UUID.
// Unlike /scan/[domain] (which always shows the latest scan for a
// domain), /r/[scanId] pins to the exact scan that was created.
//
// Use this URL when DM-ing or sharing a result — it survives re-scans
// of the same domain. Format: agent.opensverige.se/r/<uuid>.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ScanResult } from "@/lib/scan-types";
import type { AllChecks } from "@/lib/checks";
import { computeSeverityCounts } from "@/lib/checks";
import Nav from "../../scan/_components/Nav";
import Footer from "../../scan/_components/Footer";
import ResultsPage from "../../scan/[domain]/_components/ResultsPage";

interface PageProps {
  params: Promise<{ scanId: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ScanRow {
  id: string;
  domain: string;
  badge: ScanResult["badge"];
  checks_passed: number;
  checks_total: number;
  checks_json: AllChecks;
  claude_summary: string | null;
  recommendations: unknown;
  scanned_at: string | null;
}

async function getScanById(scanId: string): Promise<{ row: ScanRow; data: ScanResult } | null> {
  if (!UUID_REGEX.test(scanId)) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(
      `${url}/rest/v1/scan_submissions?id=eq.${encodeURIComponent(scanId)}&limit=1&select=id,domain,badge,checks_passed,checks_total,checks_json,claude_summary,recommendations,scanned_at`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const rows = await res.json() as ScanRow[];
    const row = rows[0];
    if (!row) return null;

    const data: ScanResult = {
      company: row.domain.split(".")[0] ?? row.domain,
      industry: "",
      summary: row.claude_summary ?? "",
      agent_suggestions: [],
      badge: row.badge,
      score: row.checks_passed,
      checks_total: row.checks_total,
      checks: row.checks_json,
      recommendations: Array.isArray(row.recommendations)
        ? row.recommendations.filter((v): v is string => typeof v === "string")
        : [],
      severity_counts: computeSeverityCounts(row.checks_json),
      scan_id: row.id,
      isDemo: false,
      scanned_at: row.scanned_at ?? new Date(0).toISOString(),
    };
    return { row, data };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { scanId } = await params;
  const result = await getScanById(scanId);
  if (!result) {
    return {
      title: "Scan hittades inte | agent.opensverige",
      description: "Den här scan-länken är ogiltig eller har raderats.",
      robots: { index: false, follow: false },
    };
  }
  const { data } = result;
  const badgeLabel = data.badge === "green" ? "REDO" : data.badge === "yellow" ? "DELVIS REDO" : "INTE REDO";
  const sc = data.severity_counts;
  const total = data.checks_total ?? 11;
  const description = `${result.row.domain} fick ${data.score}/${total} i AI-readiness. ${sc.critical} brister, ${sc.important} varningar, ${data.score} ok.`;
  const ogImageUrl = `https://agent.opensverige.se/api/og?domain=${encodeURIComponent(result.row.domain)}&score=${data.score}&max=${total}&status=${encodeURIComponent(badgeLabel)}`;

  return {
    title: `${result.row.domain} — ${badgeLabel} (${data.score}/${total}) | agent.opensverige`,
    description,
    openGraph: {
      title: `${result.row.domain} fick ${data.score}/${total} i AI-readiness`,
      description: data.summary || description,
      url: `https://agent.opensverige.se/r/${scanId}`,
      siteName: "agent.opensverige",
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${result.row.domain} — ${data.score}/${total} AI Readiness`,
      description: data.summary || description,
      images: [ogImageUrl],
    },
  };
}

export default async function ScanByIdPage({ params }: PageProps) {
  const { scanId } = await params;
  const result = await getScanById(scanId);
  if (!result) notFound();

  const { row, data } = result;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `AI Readiness Scan: ${row.domain}`,
    "description": data.summary || `AI-readiness scan av ${row.domain}`,
    "author": { "@type": "Organization", "name": "OpenSverige", "url": "https://opensverige.se" },
    "mainEntity": {
      "@type": "Rating",
      "ratingValue": data.score,
      "bestRating": data.checks_total ?? 11,
      "worstRating": 0,
      "ratingExplanation": data.summary,
    },
    "about": { "@type": "WebSite", "name": row.domain, "url": `https://${row.domain}` },
  };

  return (
    <>
      <Nav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ResultsPage domain={row.domain} initialData={data} />
      <Footer />
    </>
  );
}
