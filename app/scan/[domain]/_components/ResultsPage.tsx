// app/scan/[domain]/_components/ResultsPage.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ScanResult } from "@/lib/scan-types";
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
import { cn } from "@/lib/utils";
import {
  AlertTriangle, Calendar, Check, CheckCircle2, ChevronDown,
  Code2, FileText, Globe, Lock, RotateCcw, Search, Share2,
  Shield, XCircle,
} from "lucide-react";

declare global {
  interface Window {
    Cal?: (...args: unknown[]) => void;
  }
}

// ── Constants ──────────────────────────────────────────────────────────────

const BADGE_CFG = {
  green:  { label: "REDO",        ringColor: "hsl(var(--success))",    badgeVariant: "default"     as const },
  yellow: { label: "DELVIS REDO", ringColor: "#c9a55a",                 badgeVariant: "secondary"   as const },
  red:    { label: "INTE REDO",   ringColor: "hsl(var(--destructive))", badgeVariant: "destructive" as const },
} as const;

const MARKETPLACE_SYSTEMS = [
  { name: "Fortnox", planned: 4 },
  { name: "Visma", planned: 2 },
  { name: "BankID", planned: 1 },
];

/** Regulatory / source stat — soft yellow wash, AA contrast light + dark */
const CONTEXT_STAT_BOX =
  "rounded-md border border-amber-200/60 bg-amber-50 px-3 py-2.5 dark:border-amber-800/45 dark:bg-amber-950/35";
const CONTEXT_STAT_PRIMARY = "text-xs leading-relaxed mb-1 text-amber-950 dark:text-amber-50";
const CONTEXT_STAT_SECONDARY =
  "text-[11px] italic text-amber-900 dark:text-amber-200";

const RING_R = 60;
const RING_CIRC = Math.round(2 * Math.PI * RING_R); // 377

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
          <span className="text-sm font-medium">{check.label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-8 pb-1 space-y-2.5">
          {check.detail && (
            <p className="text-sm text-muted-foreground">{check.detail}</p>
          )}
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
            <span className="text-muted-foreground/35 px-1.5" aria-hidden>
              ·
            </span>
            <span className="capitalize">{check.severity}</span>
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ── Booking CTA logic ───────────────────────────────────────────────────────

function getBookingCTA(score: number, domain: string) {
  if (score <= 3) {
    return {
      headline: "AI-agenter ser er knappt.",
      subtext: `Builder från communityn hjälper ${domain} bli agent-redo.`,
      buttonText: "Boka 15 min gratis med en builder →",
      urgency: "high" as const,
    };
  }
  if (score <= 6) {
    return {
      headline: "Grund finns — fler steg kvar.",
      subtext: `En builder visar vad ${domain} behöver för agent-integration.`,
      buttonText: "Boka 15 min gratis med en builder →",
      urgency: "medium" as const,
    };
  }
  return {
    headline: "Du ligger före de flesta.",
    subtext: `Nästa steg för ${domain} som plattform för agenter.`,
    buttonText: "Boka 15 min gratis →",
    urgency: "low" as const,
  };
}

const BOOKING_BULLETS = [
  "Personlig builder",
  "Samma data som din scan",
  "Konkreta nästa steg",
] as const;

/** Illustrativa porträtt — community builders (dekorativ grupp) */
const BUILDER_AVATAR_URLS = [
  "https://randomuser.me/api/portraits/women/65.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
] as const;

function BuilderAvatarStack({ urgency }: { urgency: "high" | "medium" | "low" }) {
  const avatarBorder =
    urgency === "high" ? "border-background" : "border-border";
  return (
    <div
      className="mt-4 flex justify-center"
      role="img"
      aria-label="Exempel på builders i communityn"
    >
      <div className="flex items-center">
        {BUILDER_AVATAR_URLS.map((src, i) => (
          <span
            key={src}
            className={cn(
              "relative inline-block h-10 w-10 overflow-hidden rounded-full border-2 bg-muted shadow-sm",
              avatarBorder,
              i > 0 && "-ml-3"
            )}
            style={{ zIndex: i + 1 }}
          >
            <img
              src={src}
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

function shortenPlanLine(text: string, maxChars: number): { display: string; full: string } {
  const t = text.trim();
  if (t.length <= maxChars) return { display: t, full: t };
  return { display: `${t.slice(0, maxChars - 1).trimEnd()}…`, full: t };
}

// ── Step priority helper ────────────────────────────────────────────────────

function getStepPriority(i: number, criticalCount: number, importantCount: number): "high" | "medium" | null {
  if (criticalCount > 0 && i < Math.min(criticalCount, 3)) return "high";
  if (importantCount > 0 && i < criticalCount + Math.min(importantCount, 2)) return "medium";
  return null;
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function ResultsPage({ domain, initialData }: { domain: string; initialData: ScanResult | null }) {
  const [result, setResult] = useState<ScanResult | null>(initialData);
  const [notFound, setNotFound] = useState(false);
  const [shared, setShared] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (result) return;
    try {
      const stored = sessionStorage.getItem(`scan_${domain}`);
      if (stored) { setResult(JSON.parse(stored) as ScanResult); return; }
    } catch { /* ignore */ }
    setNotFound(true);
  }, [domain, result]);

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (!result && !notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Card>
          <CardContent className="py-8 space-y-5">
            <div className="flex justify-center">
              <Skeleton className="h-[150px] w-[150px] rounded-full" />
            </div>
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

  // ── Not found ──────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <p className="font-mono text-sm text-muted-foreground mb-4">{domain}</p>
        <p className="text-base text-muted-foreground mb-8">Ingen scan hittad för den här domänen.</p>
        <Button asChild>
          <Link href="/scan">Scanna {domain} →</Link>
        </Button>
      </div>
    );
  }

  const r = result!;
  const cfg = BADGE_CFG[r.badge];

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
  const topFindings = allFailed.slice(0, 5);

  const defaultOpenSections: string[] = [];
  if (failedCritical.length > 0) defaultOpenSections.push("brister");
  else if (failedImportant.length > 0) defaultOpenSections.push("varningar");

  const cta = getBookingCTA(r.score, domain);

  function handleShare() {
    const statusEmoji = r.score <= 3 ? "🔴" : r.score <= 6 ? "🟡" : "🟢";
    const url = `https://agent.opensverige.se/scan/${domain}`;
    const text =
      `${statusEmoji} ${domain} fick ${r.score}/11 i AI-readiness.\n\n` +
      `● ${sc.critical} brister ● ${sc.important} varningar ● ${passedChecks.length} ok\n\n` +
      `Hur redo är din sajt för AI-agenter?\n${url}`;
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

  function handleBooking() {
    const topIssues = allFailed.slice(0, 3).map(c => c.label);
    if (window.Cal) {
      window.Cal("ui", {
        styles: { branding: { brandColor: "#c4391a" } },
        hideEventTypeDetails: false,
      });
      window.Cal("openModal", {
        calLink: "opensverige/ai-readiness",
        config: {
          notes: `Scan: ${domain} — Score: ${r.score}/11\nBrister: ${topIssues.join(", ")}`,
          name: domain,
        },
      });
    } else {
      window.open(
        `https://cal.com/opensverige/ai-readiness?notes=${encodeURIComponent(`Scan: ${domain} - Score: ${r.score}/11`)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  return (
    <div className="pb-20">
      <div className="max-w-2xl mx-auto px-4 space-y-5 pt-6">

        {/* ── DEMO BANNER ────────────────────────────────────────── */}
        {r.isDemo && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5 flex items-start gap-3">
            <Badge variant="warning" className="shrink-0 mt-0.5">DEMO</Badge>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tekniska checks är riktiga. Analystexten är generisk tills <code className="font-mono">ANTHROPIC_API_KEY</code> läggs till.
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            LAGER 1 — SCORECARD
        ═══════════════════════════════════════════════════════ */}
        <Card className="border-2 border-foreground/80 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CardHeader className="pb-2">
            <Badge variant="outline" className="font-mono text-[10px] tracking-widest w-fit">
              SCAN RESULTAT
            </Badge>
            <CardDescription className="font-mono">{domain}</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-5 py-6">
            <ScoreRing score={r.score} total={11} ringColor={cfg.ringColor} />

            <Badge
              variant={cfg.badgeVariant}
              className="text-base px-5 py-1.5 font-mono font-bold tracking-wide"
            >
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
          </CardContent>

          <CardFooter className="flex flex-col gap-2 px-6 pb-6">
            <Button className="w-full" size="lg" onClick={handleShare}>
              {shared
                ? <><Check className="h-4 w-4" /> Kopierat</>
                : <><Share2 className="h-4 w-4" /> Dela din score</>
              }
            </Button>
            <Button variant="link" className="text-muted-foreground text-sm h-auto py-1" asChild>
              <Link href="/scan">
                <RotateCcw className="h-3.5 w-3.5" /> Scanna en annan sajt
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* ═══════════════════════════════════════════════════════
            LAGER 2 — TOPPHITTAR
        ═══════════════════════════════════════════════════════ */}
        {topFindings.length > 0 && (
          <div>
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-3 px-1">
              TOPPHITTAR
            </p>
            <Accordion type="multiple" className="space-y-2">
              {topFindings.map((check, i) => (
                <FindingRow key={check.id} check={check} index={i} />
              ))}
            </Accordion>
            {allFailed.length > 5 && (
              <p className="text-xs text-muted-foreground font-mono mt-3 text-center">
                +{allFailed.length - 5} fler fynd i rapporten nedan
              </p>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            LAGER 3 — STEG-FÖR-STEG PLAN (synlig)
        ═══════════════════════════════════════════════════════ */}
        {r.recommendations.length > 0 && (
          <div className="mt-8">
            <h3 className="font-mono text-xs font-bold tracking-widest text-muted-foreground mb-2">
              DIN PLAN
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Viktigast först.
            </p>

            <div className="space-y-3">
              {r.recommendations.map((rec, i) => {
                const priority = getStepPriority(i, sc.critical, sc.important);
                const { display, full } = shortenPlanLine(rec, 110);
                return (
                  <Card
                    key={i}
                    className={cn(
                      "transition-all",
                      i === 0 && "border-2 border-foreground"
                    )}
                  >
                    <CardContent className="flex gap-4 items-start py-4 px-4">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-mono text-sm font-bold",
                        i === 0
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold leading-snug"
                          title={display !== full ? full : undefined}
                        >
                          {display}
                        </p>
                      </div>
                      {priority === "high" && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          Kritisk
                        </Badge>
                      )}
                      {priority === "medium" && (
                        <Badge className="text-xs shrink-0 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                          Viktig
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            LAGER 4 — DYNAMISK CTA: CALENDAR BOOKING
        ═══════════════════════════════════════════════════════ */}
        <Card className={cn(
          "mt-8",
          cta.urgency === "high" && "border-2 border-foreground bg-foreground text-background",
          cta.urgency === "medium" && "border-2 border-foreground",
          cta.urgency === "low" && "border"
        )}>
          <CardHeader className="text-center pb-2">
            <CardTitle
              className={cn(
                "text-xl font-bold tracking-tight",
                cta.urgency === "high" && "text-background"
              )}
            >
              {cta.headline}
            </CardTitle>
            <CardDescription
              className={cn(
                "max-w-md mx-auto text-base",
                cta.urgency === "high" ? "text-background/85" : "text-muted-foreground"
              )}
            >
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
              onClick={handleBooking}
              className="px-8"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {cta.buttonText}
            </Button>

            <BuilderAvatarStack urgency={cta.urgency} />

            <p
              className={cn(
                "text-[11px] mt-3 opacity-70 max-w-xs",
                cta.urgency === "high" ? "text-background/80" : "text-muted-foreground"
              )}
            >
              Matchning med rätt builder i communityn.
            </p>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════════════
            LAGER 5 — FULLSTÄNDIG RAPPORT (Collapsible)
        ═══════════════════════════════════════════════════════ */}
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
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {SEVERITY_CONTEXT.info.text}
                    </p>
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
                            <p className={cn("text-sm", check.pass ? "text-muted-foreground" : "text-foreground")}>
                              {check.label}
                            </p>
                            {!check.pass && (
                              <p className="text-xs text-muted-foreground/70 mt-0.5">{CHECK_CONTEXT[id].action}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </CollapsibleContent>
        </Collapsible>

        {/* ═══════════════════════════════════════════════════════
            LAGER 6 — BUILDER-PERSPEKTIV (teknisk data)
        ═══════════════════════════════════════════════════════ */}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API</span>
                  <span>{r.checks.api_exists.pass ? "Hittad" : "Ej hittad"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OpenAPI spec</span>
                  <span>{r.checks.openapi_spec.pass
                    ? <span className="text-success">Finns</span>
                    : "Saknas"
                  }</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MCP-server</span>
                  <span>{r.checks.mcp_server.pass
                    ? <span className="text-success">Finns</span>
                    : "Saknas"
                  }</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Developer docs</span>
                  <span>{r.checks.api_docs.pass ? "Hittad" : "Ej hittad"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">robots.txt</span>
                  <span>{r.checks.robots_ok.pass
                    ? <span className="text-success">Tillåter AI-crawlers</span>
                    : <span className="text-destructive">Blockerar AI-crawlers</span>
                  }</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">llms.txt</span>
                  <span>{r.checks.llms_txt.pass
                    ? <span className="text-success">Finns</span>
                    : "Saknas"
                  }</span>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* ═══════════════════════════════════════════════════════
            LAGER 6.5 — API AGENT-READINESS SCORE
            (visas bara om API eller OpenAPI-spec hittades)
        ═══════════════════════════════════════════════════════ */}
        {r.api_score && (r.checks.api_exists.pass || r.checks.openapi_spec.pass) && (
          <ApiScoreSection apiScore={r.api_score} />
        )}

        {/* ═══════════════════════════════════════════════════════
            LAGER 7 — AVSLUTANDE CTAs
        ═══════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════
            AGENT-KATALOGEN — sekundär sektion (under avslutande CTA)
        ═══════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════
            DISCLAIMER
        ═══════════════════════════════════════════════════════ */}
        <p className="mt-12 text-[11px] text-muted-foreground text-center max-w-md mx-auto leading-relaxed">
          Det här är en teknisk observation, inte juridisk rådgivning.
          Compliance-resultaten är generella och baseras inte på en granskning
          av era specifika policier.
        </p>

      </div>
    </div>
  );
}
