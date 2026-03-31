// app/scan/[domain]/_components/ResultsPage.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ScanResult } from "@/lib/scan-types";
import type { ApiScoreResult } from "@/lib/api-score";
import { ApiScoreSection } from "./ApiScoreSection";
import type { CheckResult } from "@/lib/checks";
import { CHECK_DISPLAY_ORDER } from "@/lib/checks";
import { CHECK_CONTEXT, SEVERITY_CONTEXT } from "@/lib/check-context";
import { REGULATORY_UPDATES } from "@/lib/regulatory-updates";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, Calendar, Check, CheckCircle2, ChevronDown,
  Code2, FileText, Github, Globe, Lock, RotateCcw, Search, Share2,
  Shield, XCircle, Zap,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────

const BADGE_CFG = {
  green:  { label: "REDO",        ringColor: "hsl(var(--success))",    badgeVariant: "default"     as const },
  yellow: { label: "DELVIS REDO", ringColor: "#c9a55a",                 badgeVariant: "secondary"   as const },
  red:    { label: "INTE REDO",   ringColor: "hsl(var(--destructive))", badgeVariant: "destructive" as const },
} as const;

const API_BAND_RING: Record<string, string> = {
  agent_ready: "hsl(var(--success))",
  strong:      "hsl(var(--success))",
  dev_ready:   "#c9a55a",
  partial:     "#c9a55a",
  not_ready:   "hsl(var(--destructive))",
};

const API_BADGE_CLASS: Record<string, string> = {
  agent_ready: "bg-success/10 text-success border-success/30",
  strong:      "bg-success/10 text-success border-success/30",
  dev_ready:   "bg-amber-50 text-amber-800 border-amber-200",
  partial:     "bg-amber-50 text-amber-800 border-amber-200",
  not_ready:   "bg-destructive/10 text-destructive border-destructive/30",
};

const MARKETPLACE_SYSTEMS = [
  { name: "Fortnox", planned: 4 },
  { name: "Visma", planned: 2 },
  { name: "BankID", planned: 1 },
];

const CONTEXT_STAT_BOX =
  "rounded-md border border-amber-200/60 bg-amber-50 px-3 py-2.5 dark:border-amber-800/45 dark:bg-amber-950/35";
const CONTEXT_STAT_PRIMARY = "text-xs leading-relaxed mb-1 text-amber-950 dark:text-amber-50";
const CONTEXT_STAT_SECONDARY = "text-[11px] italic text-amber-900 dark:text-amber-200";

const RING_R = 60;
const RING_CIRC = Math.round(2 * Math.PI * RING_R);

// ── Score Ring ──────────────────────────────────────────────────────────────

function ScoreRing({ score, total, ringColor }: { score: number; total: number; ringColor: string }) {
  const [filled, setFilled] = useState(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const finalFilled = (score / total) * RING_CIRC;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setFilled(finalFilled); setDisplay(score); return; }
    let raf = 0;
    const timer = setTimeout(() => setFilled(finalFilled), 50);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 700, 1);
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(ease * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [score, total]);

  return (
    <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
      <svg width={150} height={150} viewBox="0 0 150 150">
        <circle cx={75} cy={75} r={RING_R} fill="none" className="stroke-muted" strokeWidth={8} />
        <circle
          cx={75} cy={75} r={RING_R} fill="none"
          stroke={ringColor} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${filled} ${RING_CIRC - filled}`}
          className="transition-[stroke-dasharray] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          transform="rotate(-90 75 75)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-mono text-5xl font-extrabold leading-none">{display}</span>
        <span className="font-mono text-sm text-muted-foreground mt-1">/{total}</span>
      </div>
    </div>
  );
}

// ── Severity icon ───────────────────────────────────────────────────────────

function SeverityIcon({ result, size = "h-5 w-5" }: { result: CheckResult; size?: string }) {
  if (result.pass) return <CheckCircle2 className={cn(size, "text-success shrink-0")} />;
  if (result.severity === "critical") return <XCircle className={cn(size, "text-destructive shrink-0")} />;
  if (result.severity === "important") return <AlertTriangle className={cn(size, "text-amber-500 shrink-0")} />;
  return <Search className={cn(size, "text-muted-foreground shrink-0")} />;
}

// ── Finding accordion row ───────────────────────────────────────────────────

function FindingRow({ check, index }: { check: CheckResult; index: number }) {
  const ctx = CHECK_CONTEXT[check.id];
  return (
    <AccordionItem
      value={`finding-${check.id}`}
      className="border rounded-lg px-4 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
    >
      <AccordionTrigger className="hover:no-underline py-3 min-h-[44px]">
        <div className="flex items-center gap-3 text-left">
          <SeverityIcon result={check} />
          <span className="text-base font-medium">{check.label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-8 pb-1 space-y-2.5">
          {check.detail && <p className="text-sm text-muted-foreground">{check.detail}</p>}
          <div className={CONTEXT_STAT_BOX}>
            <p className={CONTEXT_STAT_PRIMARY}>{ctx.stat}</p>
            <p className={CONTEXT_STAT_SECONDARY}>— {ctx.source}</p>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-primary font-bold text-xs shrink-0 mt-0.5">→</span>
            <span className="text-xs text-foreground/70 leading-snug">{ctx.action}</span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/55 leading-tight">
            <span className="capitalize">{check.category}</span>
            <span className="text-muted-foreground/35 px-1.5" aria-hidden>·</span>
            <span className="capitalize">{check.severity}</span>
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ── Plan step card ──────────────────────────────────────────────────────────

function PlanCard({ text, index, priority }: { text: string; index: number; priority: "high" | "medium" | null }) {
  return (
    <Card className={cn("transition-all", index === 0 && "border-2 border-foreground")}>
      <CardContent className="flex gap-4 items-start py-4 px-4">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-mono text-sm font-bold",
          index === 0 ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
        )}>
          {index + 1}
        </div>
        <p className="text-base font-semibold leading-relaxed flex-1 min-w-0 self-center" style={{ lineHeight: 1.6 }}>
          {text}
        </p>
        {priority === "high" && (
          <Badge variant="destructive" className="text-xs shrink-0">Kritisk</Badge>
        )}
        {priority === "medium" && (
          <Badge className="text-xs shrink-0 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Viktig</Badge>
        )}
      </CardContent>
    </Card>
  );
}

// ── Booking CTA ─────────────────────────────────────────────────────────────

function getBookingCTA(
  activeTab: "sajt" | "api",
  siteScore: number,
  apiScore: ApiScoreResult | null | undefined,
  domain: string
) {
  if (activeTab === "api" && apiScore) {
    if (apiScore.totalScore < 30) {
      return {
        headline: "Ditt API pratar inte med agenter.",
        subtext: `En builder från communityn visar vad ${domain} behöver för att AI-agenter ska kunna koppla in sig.`,
        buttonText: "Boka 15 min gratis med en builder →",
        urgency: "high" as const,
      };
    }
    return {
      headline: "Ditt API har potential — men brister kvar.",
      subtext: `Prata med en builder om hur ${domain} kan bli en plattform som agenter bygger mot.`,
      buttonText: "Boka 15 min med en builder →",
      urgency: "medium" as const,
    };
  }
  if (siteScore <= 3) {
    return {
      headline: "AI-agenter ser er knappt.",
      subtext: `Builder från communityn hjälper ${domain} bli agent-redo.`,
      buttonText: "Boka 15 min gratis med en builder →",
      urgency: "high" as const,
    };
  }
  if (siteScore <= 6) {
    return {
      headline: "Grund finns — fler steg kvar.",
      subtext: `En builder visar vad ${domain} behöver för agent-integration.`,
      buttonText: "Boka 15 min gratis med en builder →",
      urgency: "medium" as const,
    };
  }
  return {
    headline: "Du ligger före de flesta. Vad är nästa steg?",
    subtext: `Prata med en builder om vad agenter kan bygga mot ${domain}.`,
    buttonText: "Boka samtal →",
    urgency: "low" as const,
  };
}

const BOOKING_BULLETS = ["Personlig builder", "Samma data som din scan", "Konkreta nästa steg"] as const;

const BUILDER_AVATAR_URLS = [
  "https://randomuser.me/api/portraits/women/65.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
] as const;

function BuilderAvatarStack({ urgency }: { urgency: "high" | "medium" | "low" }) {
  return (
    <div className="mt-4 flex justify-center" role="img" aria-label="Exempel på builders i communityn">
      <div className="flex items-center">
        {BUILDER_AVATAR_URLS.map((src, i) => (
          <span
            key={src}
            className={cn(
              "relative inline-block h-10 w-10 overflow-hidden rounded-full border-2 bg-muted shadow-sm",
              urgency === "high" ? "border-background" : "border-border",
              i > 0 && "-ml-3"
            )}
            style={{ zIndex: i + 1 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" width={40} height={40} className="h-full w-full object-cover" loading="lazy" decoding="async" />
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStepPriority(i: number, criticalCount: number, importantCount: number): "high" | "medium" | null {
  if (criticalCount > 0 && i < Math.min(criticalCount, 3)) return "high";
  if (importantCount > 0 && i < criticalCount + Math.min(importantCount, 2)) return "medium";
  return null;
}

function getDefaultTab(data: ScanResult | null): "sajt" | "api" {
  if (!data?.api_score) return "sajt";
  const hasApi = data.checks.api_exists.pass || data.checks.openapi_spec.pass;
  return hasApi && data.api_score.totalScore < 70 ? "api" : "sajt";
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function ResultsPage({ domain, initialData }: { domain: string; initialData: ScanResult | null }) {
  const [result, setResult] = useState<ScanResult | null>(initialData);
  const [notFound, setNotFound] = useState(false);
  const [shared, setShared] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"sajt" | "api">(() => getDefaultTab(initialData));

  useEffect(() => {
    if (result) return;
    try {
      const stored = sessionStorage.getItem(`scan_${domain}`);
      if (stored) {
        const parsed = JSON.parse(stored) as ScanResult;
        setResult(parsed);
        if (!initialData) setActiveTab(getDefaultTab(parsed));
        return;
      }
    } catch { /* ignore */ }
    setNotFound(true);
  }, [domain, result, initialData]);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (!result && !notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Card>
          <CardContent className="py-8 space-y-5">
            <div className="flex justify-center"><Skeleton className="h-[150px] w-[150px] rounded-full" /></div>
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <p className="font-mono text-sm text-muted-foreground mb-4">{domain}</p>
        <p className="text-base text-muted-foreground mb-8">Ingen scan hittad för den här domänen.</p>
        <Button asChild><Link href="/scan">Scanna {domain} →</Link></Button>
      </div>
    );
  }

  const r = result!;
  const cfg = BADGE_CFG[r.badge];

  const hasApi = !!(r.api_score && (r.checks.api_exists.pass || r.checks.openapi_spec.pass));
  const apiScore: ApiScoreResult | null = hasApi ? r.api_score! : null;
  const specDetected = r.checks.openapi_spec.pass;
  const apiRingColor = apiScore ? (API_BAND_RING[apiScore.band] ?? "hsl(var(--muted))") : "hsl(var(--muted))";
  const apiBadgeClass = apiScore ? (API_BADGE_CLASS[apiScore.band] ?? "") : "";

  const allChecks = CHECK_DISPLAY_ORDER.map(id => r.checks[id]);
  const failedCritical = allChecks.filter(c => !c.pass && c.severity === "critical");
  const failedImportant = allChecks.filter(c => !c.pass && c.severity === "important");
  const failedInfo = allChecks.filter(c => !c.pass && c.severity === "info");
  const passedChecks = allChecks.filter(c => c.pass);
  const sc = r.severity_counts ?? {
    critical: failedCritical.length,
    important: failedImportant.length,
    info: failedInfo.length,
  };

  const allFailed = [...failedCritical, ...failedImportant, ...failedInfo];
  const topSiteFindings = allFailed.slice(0, 5);

  const defaultOpenSections: string[] = [];
  if (failedCritical.length > 0) defaultOpenSections.push("brister");
  else if (failedImportant.length > 0) defaultOpenSections.push("varningar");

  const cta = getBookingCTA(activeTab, r.score, apiScore, domain);

  function handleShare() {
    let text: string;
    const url = `https://agent.opensverige.se/scan/${domain}`;
    if (activeTab === "api" && apiScore) {
      const em = apiScore.totalScore < 30 ? "🔴" : apiScore.totalScore < 70 ? "🟡" : "🟢";
      text = `${em} ${domain} fick ${apiScore.totalScore}/100 i API agent-readiness.\n\n${apiScore.topBlockers.length} blockerare hittade.\n\nHur redo är ditt API? → ${url}`;
    } else {
      const em = r.score <= 3 ? "🔴" : r.score <= 6 ? "🟡" : "🟢";
      text = `${em} ${domain} fick ${r.score}/11 i AI-readiness.\n\n● ${sc.critical} brister ● ${sc.important} varningar ● ${passedChecks.length} ok\n\nHur redo är din sajt? → ${url}`;
    }
    if (navigator.share) {
      navigator.share({ title: `${domain} — AI-beredskap`, text, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => setShared(true)).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand("copy"); setShared(true); } catch {}
      document.body.removeChild(ta);
    }
  }

  return (
    <div className="pb-20">
      <div className="max-w-2xl mx-auto px-4 space-y-5 pt-6">

        {/* DEMO BANNER */}
        {r.isDemo && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5 flex items-start gap-3">
            <Badge variant="warning" className="shrink-0 mt-0.5">DEMO</Badge>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tekniska checks är riktiga. Analystexten är generisk tills <code className="font-mono">ANTHROPIC_API_KEY</code> läggs till.
            </p>
          </div>
        )}

        {/* TIMESTAMP + STALE WARNING */}
        {(() => {
          const scannedAt = r.scanned_at ? new Date(r.scanned_at) : null;
          const daysOld = scannedAt ? Math.floor((Date.now() - scannedAt.getTime()) / 86_400_000) : null;
          const isStale = daysOld !== null && daysOld > 30;
          const dateStr = scannedAt?.toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" });
          return (
            <div className={`rounded-lg border px-4 py-2.5 flex items-center justify-between gap-3 ${isStale ? "border-warning/40 bg-warning/5" : "border-border/40"}`}>
              <p className="text-xs text-muted-foreground">
                {isStale ? <span className="text-warning font-medium">Föråldrat resultat — </span> : null}
                Scannades {dateStr ?? "okänt datum"}
                {daysOld !== null && daysOld > 0 ? ` (${daysOld} dagar sedan)` : daysOld === 0 ? " (idag)" : null}
              </p>
              <a
                href={`/scan?domain=${domain}`}
                className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                Skanna igen →
              </a>
            </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════
            SCORECARD — allt tab-beroende content inuti
        ═══════════════════════════════════════════════════════ */}
        <Card className="border-2 border-foreground/80 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CardHeader className="pb-3">
            <Badge variant="outline" className="font-mono text-[10px] tracking-widest w-fit">
              SCAN RESULTAT
            </Badge>
            <CardTitle className="font-serif text-[clamp(20px,5vw,28px)] font-normal leading-[1.1] tracking-[-0.5px] mt-1">
              Hur agent-redo<br />är ditt företag?
            </CardTitle>
            <CardDescription className="font-mono">{domain}</CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "sajt" | "api")} className="w-full">
            <div className="px-6 pb-3">
              <TabsList className="w-full h-11">
                <TabsTrigger value="sajt" className="flex-1 font-mono text-xs gap-1.5 h-9">
                  <Globe className="h-3.5 w-3.5" />
                  Sajt
                </TabsTrigger>
                <TabsTrigger value="api" className="flex-1 font-mono text-xs gap-1.5 h-9" disabled={!hasApi}>
                  <Code2 className="h-3.5 w-3.5" />
                  API
                  {!hasApi && <span className="ml-1 text-[10px] opacity-50">(ej hittat)</span>}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── SAJT-TAB ─────────────────────────────────────── */}
            <TabsContent value="sajt">
              {/* Score + badge + breakdown + summary */}
              <div className="px-6 flex flex-col items-center gap-5 pt-2 pb-6">
                <ScoreRing score={r.score} total={11} ringColor={cfg.ringColor} />

                <Badge variant={cfg.badgeVariant} className="text-base px-5 py-1.5 font-mono font-bold tracking-wide">
                  {cfg.label}
                </Badge>

                <div className="flex gap-5 text-xs font-mono flex-wrap justify-center">
                  {sc.critical > 0 && (
                    <span className="flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                      {sc.critical} {sc.critical === 1 ? "brist" : "brister"}
                    </span>
                  )}
                  {sc.important > 0 && (
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      {sc.important} {sc.important === 1 ? "varning" : "varningar"}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    {passedChecks.length} ok
                  </span>
                </div>

                {r.summary && (
                  <p className="text-sm text-muted-foreground leading-relaxed w-full border-t border-border/50 pt-4 mt-1">
                    {r.summary}
                  </p>
                )}
              </div>

              {/* Topphittar */}
              {topSiteFindings.length > 0 && (
                <>
                  <Separator />
                  <div className="px-6 py-5">
                    <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-3">
                      TOPPHITTAR
                    </p>
                    <Accordion type="multiple" className="space-y-2">
                      {topSiteFindings.map((check, i) => (
                        <FindingRow key={check.id} check={check} index={i} />
                      ))}
                    </Accordion>
                    {allFailed.length > 5 && (
                      <p className="text-xs text-muted-foreground font-mono mt-3 text-center">
                        +{allFailed.length - 5} fler fynd i rapporten nedan
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Steg-plan */}
              {r.recommendations.length > 0 && (
                <>
                  <Separator />
                  <div className="px-6 py-5">
                    <h3 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-1">
                      DIN PLAN
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Viktigast först.</p>
                    <div className="space-y-3">
                      {r.recommendations.map((rec, i) => (
                        <PlanCard
                          key={i}
                          text={rec}
                          index={i}
                          priority={getStepPriority(i, sc.critical, sc.important)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ── API-TAB ──────────────────────────────────────── */}
            <TabsContent value="api">
              {apiScore ? (
                <>
                  {/* Score + badge + spec info */}
                  <div className="px-6 flex flex-col items-center gap-5 pt-2 pb-6">
                    <ScoreRing
                      score={apiScore.totalScore}
                      total={100}
                      ringColor={apiRingColor}
                    />

                    <Badge className={cn("text-base px-5 py-1.5 font-mono font-bold tracking-wide border", apiBadgeClass)}>
                      {apiScore.bandLabel}
                    </Badge>

                    {!apiScore.hasSpec && (
                      <p className="text-sm text-muted-foreground text-center max-w-xs">
                        {specDetected
                          ? `OpenAPI-spec upptäckt men kunde inte laddas fullt automatiskt. Max möjlig poäng just nu: ${apiScore.maxPossibleScore}/100.`
                          : `API hittades men ingen OpenAPI-spec. Max möjlig poäng: ${apiScore.maxPossibleScore}/100.`}
                      </p>
                    )}
                    {apiScore.specFormat && (
                      <p className="font-mono text-xs text-muted-foreground">
                        {apiScore.specFormat === "openapi3" ? "OpenAPI 3.x" : "Swagger 2.0"} spec analyserad
                      </p>
                    )}
                  </div>

                  {/* Blockerare */}
                  {apiScore.topBlockers.length > 0 && (
                    <>
                      <Separator />
                      <div className="px-6 py-5">
                        <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-3">
                          BLOCKERARE
                        </p>
                        <ul className="space-y-2">
                          {apiScore.topBlockers.map((b, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                              <span className="text-base text-foreground/80 leading-snug">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {/* Steg-plan API */}
                  {apiScore.fastestFixes.length > 0 && (
                    <>
                      <Separator />
                      <div className="px-6 py-5">
                        <h3 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-1">
                          DIN PLAN — API
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Så blir ditt API agent-redo.</p>
                        <div className="space-y-3">
                          {apiScore.fastestFixes.map((step, i) => (
                            <PlanCard key={i} text={step} index={i} priority={null} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* OpenAPI-spec alert */}
                  {!apiScore.hasSpec && (
                    <div className="px-6 pb-6">
                      <div className="rounded-md border border-amber-200/60 bg-amber-50 px-3 py-2.5">
                        <p className="text-xs text-amber-900 leading-relaxed">
                          <Zap className="inline h-3 w-3 mr-1 shrink-0" />
                          {specDetected ? (
                            <>OpenAPI-spec verkar finnas, men vi kunde inte läsa in hela spec-filen automatiskt i den här körningen. Vi analyserade därför {apiScore.maxPossibleScore} av 100 möjliga poäng.</>
                          ) : (
                            <>Utan OpenAPI-spec kunde vi bara analysera {apiScore.maxPossibleScore} av 100 möjliga poäng.
                            Publicera en spec på <code className="font-mono text-[10px]">/openapi.json</code> för fullständig analys.</>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-6 py-12 text-center">
                  <Code2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">Inget publikt API hittat</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Vi hittade ingen developer portal, OpenAPI-spec eller publika API-endpoints för {domain}.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Feedback-länk */}
          <div className="text-center py-3 px-6">
            <a
              href="https://discord.gg/CSphbTk8En"
              className="text-xs text-muted-foreground hover:text-foreground underline font-mono transition-colors"
            >
              Stämmer inte detta? Rapportera i vår Discord →
            </a>
          </div>

          {/* Footer — tab-oberoende */}
          <CardFooter className="flex flex-col gap-2 px-6 pb-6 border-t border-border/50 pt-4 mt-1">
            <Button className="w-full" size="lg" onClick={handleShare}>
              {shared
                ? <><Check className="h-4 w-4 mr-2" /> Kopierat</>
                : <><Share2 className="h-4 w-4 mr-2" /> Dela din score</>
              }
            </Button>
            <Button variant="link" className="text-muted-foreground text-sm h-auto py-1" asChild>
              <Link href="/scan"><RotateCcw className="h-3.5 w-3.5 mr-1" /> Scanna en annan sajt</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* ═══════════════════════════════════════════════════════
            ALLT NEDAN: TAB-OBEROENDE
        ═══════════════════════════════════════════════════════ */}

        {/* ── DYNAMISK CTA ─────────────────────────────────────── */}
        <Card className={cn(
          "mt-8",
          cta.urgency === "high" && "border-2 border-foreground bg-foreground text-background",
          cta.urgency === "medium" && "border-2 border-foreground",
          cta.urgency === "low" && "border"
        )}>
          <CardHeader className="text-center pb-2">
            <CardTitle className={cn("text-xl font-bold tracking-tight", cta.urgency === "high" && "text-background")}>
              {cta.headline}
            </CardTitle>
            <CardDescription className={cn(
              "max-w-md mx-auto text-base",
              cta.urgency === "high" ? "text-background/85" : "text-muted-foreground"
            )}>
              {cta.subtext}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-0 pb-8 text-center">
            <ul
              className={cn(
                "flex flex-col items-center gap-3 mb-6 text-xs font-mono max-w-sm mx-auto",
                cta.urgency === "high" ? "text-background/80" : "text-muted-foreground"
              )}
              aria-label="Vad du får på samtalet"
            >
              {BOOKING_BULLETS.map(line => (
                <li key={line} className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              variant={cta.urgency === "high" ? "secondary" : "default"}
              className="px-8"
              data-cal-link="gustaf-garnow-3u8eg5/opensverige"
              data-cal-namespace="opensverige"
              data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
            >
              <Calendar className="mr-2 h-4 w-4" />
              {cta.buttonText}
            </Button>

            <BuilderAvatarStack urgency={cta.urgency} />

            <p className={cn(
              "text-[11px] mt-3 opacity-70 max-w-xs",
              cta.urgency === "high" ? "text-background/80" : "text-muted-foreground"
            )}>
              Matchning med rätt builder i communityn.
            </p>
          </CardContent>
        </Card>

        {/* ── FULLSTÄNDIG RAPPORT ──────────────────────────────── */}
        <Collapsible open={reportOpen} onOpenChange={setReportOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full font-mono justify-between min-h-[44px]">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Visa fullständig rapport
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", reportOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3">
            <Accordion type="multiple" defaultValue={defaultOpenSections} className="space-y-2">

              {REGULATORY_UPDATES.length > 0 && (
                <AccordionItem value="regulatorisk" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">Regulatorisk spelplan</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {REGULATORY_UPDATES.map((u, i) => (
                        <div key={i} className="flex gap-2">
                          <span className={cn("text-sm shrink-0", u.severity === "important" ? "text-amber-500" : "text-muted-foreground")}>•</span>
                          <span className="text-xs text-muted-foreground leading-relaxed">{u.text}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-3 italic">
                      Senast uppdaterad: {REGULATORY_UPDATES[0].date}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {failedCritical.length > 0 && (
                <AccordionItem value="brister" className="border rounded-lg border-destructive/20 bg-destructive/[0.03]">
                  <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      <span className="font-medium text-sm">Kritiska brister</span>
                      <Badge variant="destructive" className="ml-1 text-[10px] font-mono">{failedCritical.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {SEVERITY_CONTEXT.critical.text}{" "}
                      <span className="opacity-60">— {SEVERITY_CONTEXT.critical.source}</span>
                    </p>
                    <div className="space-y-1">
                      {failedCritical.map(check => {
                        const ctx = CHECK_CONTEXT[check.id];
                        return (
                          <div key={check.id} className="rounded-md border border-border/50 p-3 space-y-2">
                            <p className="text-sm font-medium">{check.label}</p>
                            {check.detail && <p className="text-xs text-muted-foreground">{check.detail}</p>}
                            <div className={CONTEXT_STAT_BOX}>
                              <p className={CONTEXT_STAT_PRIMARY}>{ctx.stat}</p>
                              <p className={CONTEXT_STAT_SECONDARY}>— {ctx.source}</p>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-primary font-bold text-xs shrink-0">→</span>
                              <span className="text-xs text-foreground/70">{ctx.action}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {failedImportant.length > 0 && (
                <AccordionItem value="varningar" className="border rounded-lg border-amber-500/20 bg-amber-50/40">
                  <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-sm">Varningar</span>
                      <Badge className="ml-1 text-[10px] font-mono bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">{failedImportant.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {SEVERITY_CONTEXT.important.text}{" "}
                      <span className="opacity-60">— {SEVERITY_CONTEXT.important.source}</span>
                    </p>
                    <div className="space-y-1">
                      {failedImportant.map(check => {
                        const ctx = CHECK_CONTEXT[check.id];
                        return (
                          <div key={check.id} className="rounded-md border border-border/50 p-3 space-y-2">
                            <p className="text-sm font-medium">{check.label}</p>
                            {check.detail && <p className="text-xs text-muted-foreground">{check.detail}</p>}
                            <div className={CONTEXT_STAT_BOX}>
                              <p className={CONTEXT_STAT_PRIMARY}>{ctx.stat}</p>
                              <p className={CONTEXT_STAT_SECONDARY}>— {ctx.source}</p>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-primary font-bold text-xs shrink-0">→</span>
                              <span className="text-xs text-foreground/70">{ctx.action}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {failedInfo.length > 0 && (
                <AccordionItem value="info" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">Saknade delar</span>
                      <Badge variant="outline" className="ml-1 text-[10px] font-mono">{failedInfo.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{SEVERITY_CONTEXT.info.text}</p>
                    <div className="space-y-2">
                      {failedInfo.map(check => (
                        <div key={check.id} className="flex items-start gap-2.5">
                          <Search className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-foreground">{check.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{CHECK_CONTEXT[check.id].action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {hasApi && apiScore && (
                <AccordionItem value="api-detaljer" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <Code2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">API-axlar (detaljer)</span>
                      <Badge variant="outline" className="ml-1 text-[10px] font-mono">
                        {apiScore.totalScore}/100
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <ApiScoreSection apiScore={apiScore} specDetected={specDetected} compact />
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="tekniska" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                  <div className="flex items-center gap-3">
                    <Code2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm">Tekniska resultat</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {CHECK_DISPLAY_ORDER.map(id => {
                      const check = r.checks[id];
                      return (
                        <div key={id} className="flex items-center gap-2.5">
                          {check.pass
                            ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            : <XCircle className="h-4 w-4 text-destructive shrink-0" />
                          }
                          <span className={cn("text-sm flex-1", check.pass ? "text-muted-foreground line-through opacity-60" : "text-foreground")}>
                            {check.label}
                          </span>
                          {!check.pass && check.severity === "critical" && (
                            <Badge variant="destructive" className="text-[9px] shrink-0">KRITISK</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {passedChecks.length > 0 && (
                <AccordionItem value="godkanda" className="border rounded-lg border-success/20 bg-success/[0.03]">
                  <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span className="font-medium text-sm">Godkända</span>
                      <Badge variant="outline" className="ml-1 text-[10px] font-mono border-success/40 text-success">{passedChecks.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {passedChecks.map(check => (
                        <div key={check.id} className="flex items-center gap-2.5">
                          <Check className="h-4 w-4 text-success shrink-0" />
                          <span className="text-sm text-success/80">{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="mcp" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm">MCP-readiness</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {(["mcp_server", "sandbox_available", "openapi_spec", "api_exists", "api_docs"] as const).map(id => {
                      const check = r.checks[id];
                      return (
                        <div key={id} className="flex items-start gap-2.5">
                          <SeverityIcon result={check} size="h-4 w-4" />
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm", check.pass ? "text-muted-foreground" : "text-foreground")}>{check.label}</p>
                            {!check.pass && <p className="text-xs text-muted-foreground/70 mt-0.5">{CHECK_CONTEXT[id].action}</p>}
                          </div>
                        </div>
                      );
                    })}
                    {r.mcp_github_hint && !r.checks.mcp_server.pass && (
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-start gap-2.5">
                        <Github className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Möjlig MCP-server hittad på GitHub —{" "}
                            <a
                              href={r.mcp_github_hint.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline underline-offset-2 hover:text-foreground transition-colors"
                            >
                              {r.mcp_github_hint.full_name}
                            </a>
                            {r.mcp_github_hint.stars > 0 && (
                              <span className="ml-1 opacity-60">({r.mcp_github_hint.stars} stars)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground/50 mt-0.5">
                            Kan vara officiell eller community-skapad. Verifiera med leverantören.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </CollapsibleContent>
        </Collapsible>

        {/* ── BUILDER-PERSPEKTIV ───────────────────────────────── */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5" />
                Teknisk data (för builders)
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2 bg-muted/30">
              <CardContent className="py-4 font-mono text-xs space-y-2">
                {[
                  ["API",          r.checks.api_exists.pass  ? "Hittad"   : "Ej hittad"],
                  ["OpenAPI spec", r.checks.openapi_spec.pass ? "Finns"   : "Saknas",    r.checks.openapi_spec.pass],
                  ["MCP-server",   r.checks.mcp_server.pass  ? "Finns"    : "Saknas",    r.checks.mcp_server.pass],
                  ["Developer docs",r.checks.api_docs.pass   ? "Hittad"   : "Ej hittad"],
                ].map(([label, value, green], i) => (
                  <div key={i}>
                    {i > 0 && <Separator className="my-2" />}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={green ? "text-success" : undefined}>{value}</span>
                    </div>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">robots.txt</span>
                  <span className={r.checks.robots_ok.pass ? "text-success" : "text-destructive"}>
                    {r.checks.robots_ok.pass ? "Tillåter AI-crawlers" : "Blockerar AI-crawlers"}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">llms.txt</span>
                  <span className={r.checks.llms_txt.pass ? "text-success" : undefined}>
                    {r.checks.llms_txt.pass ? "Finns" : "Saknas"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* ── AVSLUTANDE CTAs ──────────────────────────────────── */}
        <div className="mt-8 space-y-3">
          <Button onClick={handleShare} className="w-full" size="lg">
            <Share2 className="mr-2 h-4 w-4" />
            {shared ? "Kopierat!" : "Dela ditt resultat"}
          </Button>
          <Button variant="outline" className="w-full" size="lg" asChild>
            <a href="https://discord.gg/CSphbTk8En" target="_blank" rel="noopener noreferrer">
              250+ builders i Discord →
            </a>
          </Button>
          <div className="text-center">
            <Button variant="link" className="text-muted-foreground text-sm" asChild>
              <Link href="/scan">← Scanna en annan sajt</Link>
            </Button>
          </div>
        </div>

        {/* ── AGENT-KATALOGEN ──────────────────────────────────── */}
        <Card className="mt-10 border-dashed bg-muted/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-mono text-xs font-bold tracking-widest text-muted-foreground">
              AGENT-KATALOGEN — KOMMER SNART
            </CardTitle>
            <CardDescription className="text-sm">
              Öppen katalog för agenter mot svenska affärssystem.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-2 pb-8">
            {MARKETPLACE_SYSTEMS.map(sys => (
              <Badge key={sys.name} variant="secondary" className="font-mono text-xs">
                {sys.name} · {sys.planned} planerade
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* ── DISCLAIMER ──────────────────────────────────────── */}
        <p className="mt-12 text-[11px] text-muted-foreground text-center max-w-md mx-auto leading-relaxed">
          Det här är en teknisk observation, inte juridisk rådgivning.
          Compliance-resultaten är generella och baseras inte på en granskning av era specifika policier.
        </p>

      </div>
    </div>
  );
}
