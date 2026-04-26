// app/scan/[domain]/_components/ResultsPage.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ScanResult } from "@/lib/scan-types";
import type { ApiScoreResult } from "@/lib/api-score";
import { ApiScoreSection } from "./ApiScoreSection";
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
import { useLang } from "@/lib/language-context";
import {
  AlertTriangle, Calendar, Check, CheckCircle2, ChevronDown,
  Code2, FileJson, FileText, Github, Globe, Lock, RotateCcw, Search, Share2,
  Shield, XCircle, Zap,
} from "lucide-react";
import { BADGE_RING, API_BAND_RING, API_BADGE_CLASS, CONTEXT_STAT_BOX, CONTEXT_STAT_PRIMARY, CONTEXT_STAT_SECONDARY } from "./constants";
import { ScoreRing } from "./ScoreRing";
import { AISummary } from "./AISummary";
import { SeverityIcon } from "./SeverityIcon";
import { FindingRow } from "./FindingRow";
import { PlanCard } from "./PlanCard";
import { BuilderAvatarStack } from "./BuilderAvatarStack";
import { getBookingCTA, getStepPriority } from "./booking-cta";

function getDefaultTab(_data: ScanResult | null): "sajt" | "api" {
  return "sajt";
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function ResultsPage({ domain, initialData }: { domain: string; initialData: ScanResult | null }) {
  const { t } = useLang();
  const [result, setResult] = useState<ScanResult | null>(initialData);
  const [notFound, setNotFound] = useState(false);
  const [shared, setShared] = useState(false);
  const [teamShared, setTeamShared] = useState(false);
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
        <p className="text-base text-muted-foreground mb-8">{t.results.notFoundText}</p>
        <Button asChild><Link href={`/scan?domain=${encodeURIComponent(domain)}`}>{t.results.scanDomain(domain)}</Link></Button>
      </div>
    );
  }

  const r = result!;
  const badgeLabels = { green: t.results.badgeReady, yellow: t.results.badgePartial, red: t.results.badgeNotReady };
  const cfg = { ...BADGE_RING[r.badge], label: badgeLabels[r.badge] };

  const hasApi = !!(r.api_score && (r.checks.api_exists.pass || r.checks.openapi_spec.pass));
  const apiScore: ApiScoreResult | null = hasApi ? r.api_score! : null;
  const specDetected = r.checks.openapi_spec.pass;
  const apiRingColor = apiScore ? (API_BAND_RING[apiScore.band] ?? "hsl(var(--muted))") : "hsl(var(--muted))";
  const apiBadgeClass = apiScore ? (API_BADGE_CLASS[apiScore.band] ?? "") : "";

  const allChecks = CHECK_DISPLAY_ORDER.map(id => r.checks[id]);
  // Scored failures only — exclude N/A (not applicable) and recommendation-only checks.
  const failedCritical = allChecks.filter(c => !c.pass && !c.na && !c.recommendation && c.severity === "critical");
  const failedImportant = allChecks.filter(c => !c.pass && !c.na && !c.recommendation && c.severity === "important");
  const failedInfo = allChecks.filter(c => !c.pass && !c.na && !c.recommendation && c.severity === "info");
  const passedChecks = allChecks.filter(c => c.pass);
  // Soft suggestions: failed but marked as recommendation-only (e.g. MCP when OpenAPI exists)
  const recommendationChecks = allChecks.filter(c => !c.pass && c.recommendation);
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

  const cta = getBookingCTA(activeTab, r.score, apiScore, domain, t.results);

  function handleTeamShare() {
    const url = `https://agent.opensverige.se/scan/${domain}`;
    const text = t.results.teamShareText(domain, r.score, r.checks_total ?? 11, url);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => setTeamShared(true)).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand("copy"); setTeamShared(true); } catch {}
      document.body.removeChild(ta);
    }
    setTimeout(() => setTeamShared(false), 2500);
  }

  function handleShare() {
    const url = `https://agent.opensverige.se/scan/${domain}`;
    const text = activeTab === "api" && apiScore
      ? t.results.shareApiText(domain, apiScore.totalScore, apiScore.topBlockers.length, url)
      : t.results.shareSiteText(domain, r.score, sc.critical, sc.important, passedChecks.length, url);
    if (navigator.share) {
      navigator.share({ title: `${domain} — AI-readiness`, text, url }).catch(() => {});
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
            <Badge variant="warning" className="shrink-0 mt-0.5">{t.results.demoBadge}</Badge>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.results.demoText}
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
                {isStale ? <span className="text-warning font-medium">{t.results.staleWarning} </span> : null}
                {t.results.scannedAt} {dateStr ?? "—"}
                {daysOld !== null && daysOld > 0 ? ` ${t.results.daysAgo(daysOld)}` : daysOld === 0 ? ` ${t.results.today}` : null}
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={`/api/results/${domain}?format=text`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Raw →
                </a>
                <a
                  href={`/scan?domain=${domain}`}
                  className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.results.scanAgain}
                </a>
              </div>
            </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════
            SCORECARD — allt tab-beroende content inuti
        ═══════════════════════════════════════════════════════ */}
        <Card className="border-2 border-foreground/80 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CardHeader className="pb-3">
            <Badge variant="outline" className="font-mono text-[10px] tracking-widest w-fit">
              {t.results.scanResultsBadge}
            </Badge>
            <CardTitle className="font-serif text-[clamp(28px,5vw,40px)] font-normal leading-[1.12] tracking-[-0.6px] mt-1">
              {t.results.headline}
            </CardTitle>
            <CardDescription className="font-mono">{domain}</CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "sajt" | "api")} className="w-full">
            <div className="px-6 pb-3">
              <TabsList className="w-full h-11">
                <TabsTrigger value="sajt" className="flex-1 font-mono text-xs gap-1.5 h-9">
                  <Globe className="h-3.5 w-3.5" />
                  {t.results.tabSite}
                </TabsTrigger>
                <TabsTrigger value="api" className="flex-1 font-mono text-xs gap-1.5 h-9" disabled>
                  <Code2 className="h-3.5 w-3.5" />
                  {t.results.tabApi}
                  <span className="ml-1 text-[10px] opacity-50">{t.results.comingSoon}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── SAJT-TAB ─────────────────────────────────────── */}
            <TabsContent value="sajt">
              {/* Score + badge + breakdown + summary */}
              <div className="px-6 flex flex-col items-center gap-5 pt-2 pb-6">
                <ScoreRing score={r.score} total={r.checks_total ?? 11} ringColor={cfg.ringColor} />

                <Badge variant={cfg.badgeVariant} className="text-base px-5 py-1.5 font-mono font-bold tracking-wide">
                  {cfg.label}
                </Badge>

                <div className="flex gap-5 text-xs font-mono flex-wrap justify-center">
                  {sc.critical > 0 && (
                    <span className="flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                      {sc.critical} {sc.critical === 1 ? t.results.criticalSingle : t.results.criticalPlural}
                    </span>
                  )}
                  {sc.important > 0 && (
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      {sc.important} {sc.important === 1 ? t.results.warningSingle : t.results.warningPlural}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    {passedChecks.length} ok
                  </span>
                </div>

                {r.summary && (
                  <AISummary
                    text={r.summary}
                    label={t.results.aiSummaryLabel}
                    showMore={t.results.aiSummaryShowMore}
                    showLess={t.results.aiSummaryShowLess}
                  />
                )}
              </div>

              {/* Topphittar */}
              {topSiteFindings.length > 0 && (
                <>
                  <Separator />
                  <div className="px-6 py-5">
                    <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-3">
                      {t.results.topFindings}
                    </p>
                    <Accordion type="multiple" className="space-y-2">
                      {topSiteFindings.map((check, i) => (
                        <FindingRow key={check.id} check={check} index={i} />
                      ))}
                    </Accordion>
                    {allFailed.length > 5 && (
                      <p className="text-xs text-muted-foreground font-mono mt-3 text-center">
                        {t.results.moreFindings(allFailed.length - 5)}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Rekommendationer (inte blockerare) */}
              {recommendationChecks.length > 0 && (
                <>
                  <Separator />
                  <div className="px-6 py-4">
                    <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-3">
                      {t.results.recommendations}
                    </p>
                    <div className="space-y-2">
                      {recommendationChecks.map(check => (
                        <div key={check.id} className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
                          <Zap className="h-4 w-4 text-primary/70 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium leading-snug">{check.label}</p>
                            {check.detail && <p className="text-xs text-muted-foreground leading-relaxed">{check.detail}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Steg-plan */}
              {r.recommendations.length > 0 && (
                <>
                  <Separator />
                  <div className="px-6 py-5">
                    <h3 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-1">
                      {t.results.planHeading}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{t.results.planSubtext}</p>
                    <div className="space-y-3">
                      {r.recommendations.map((rec, i) => (
                        <PlanCard
                          key={i}
                          text={rec}
                          index={i}
                          priority={getStepPriority(i, sc.critical, sc.important)}
                          labelCritical={t.results.priorityCritical}
                          labelImportant={t.results.priorityImportant}
                        />
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/40">
                      <Link
                        href={`/scan?domain=${encodeURIComponent(domain)}`}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t.results.fixedRescan}
                      </Link>
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

                    {!apiScore.hasSpec &&
                      (specDetected ? (
                        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                          <div className="w-full rounded-xl border-2 border-primary/40 bg-primary/10 px-4 py-3.5">
                            <div className="flex items-center justify-center gap-2.5">
                              <FileJson
                                className="h-5 w-5 text-primary shrink-0"
                                aria-hidden
                              />
                              <span className="font-mono text-sm font-bold tracking-tight text-primary">
                                OpenAPI-spec
                              </span>
                            </div>
                            <p className="mt-1.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary/80">
                              Upptäckt
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
                            Kunde inte laddas fullt automatiskt. Max möjlig poäng just nu:{" "}
                            <span className="font-mono text-foreground/90 tabular-nums">
                              {apiScore.maxPossibleScore}/100
                            </span>
                            .
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center max-w-xs">
                          {`API hittades men ingen OpenAPI-spec. Max möjlig poäng: ${apiScore.maxPossibleScore}/100.`}
                        </p>
                      ))}
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
                            <PlanCard key={i} text={step} index={i} priority={null} labelCritical={t.results.priorityCritical} labelImportant={t.results.priorityImportant} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* OpenAPI-spec alert */}
                  {!apiScore.hasSpec && (
                    <div className="px-6 pb-6">
                      <div className="rounded-md border border-border bg-muted/40 px-4 py-3 space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <Zap className="inline h-3 w-3 mr-1 shrink-0" />
                          {specDetected
                            ? <>OpenAPI-spec verkar finnas men kunde inte läsas in automatiskt. Vi analyserade {apiScore.maxPossibleScore} av 100 möjliga poäng.</>
                            : <>Utan OpenAPI-spec analyserades bara {apiScore.maxPossibleScore} av 100 möjliga poäng.</>}
                        </p>
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-mono text-muted-foreground/60 uppercase tracking-wider">
                            {specDetected ? "Vanligaste orsakerna" : "Kortaste vägen dit"}
                          </p>
                          {specDetected ? (
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              <li className="flex gap-2"><span className="shrink-0 opacity-40">—</span>Spec-endpointen kräver auth-token — se till att <code className="font-mono text-[10px]">/openapi.json</code> är publik</li>
                              <li className="flex gap-2"><span className="shrink-0 opacity-40">—</span>CORS-headers saknas — lägg till <code className="font-mono text-[10px]">Access-Control-Allow-Origin: *</code></li>
                              <li className="flex gap-2"><span className="shrink-0 opacity-40">—</span>Spec-filen returnerar HTML vid bot-request — kontrollera Content-Type</li>
                            </ul>
                          ) : (
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              <li className="flex gap-2"><span className="shrink-0 opacity-40">—</span>FastAPI, NestJS och Spring Boot genererar specs automatiskt</li>
                              <li className="flex gap-2"><span className="shrink-0 opacity-40">—</span>Befintligt API utan docs? Verktyg som Speakeasy genererar specs retroaktivt</li>
                              <li className="flex gap-2"><span className="shrink-0 opacity-40">—</span>Publicera på <code className="font-mono text-[10px]">/openapi.json</code> — standard, 0 config i de flesta ramverk</li>
                            </ul>
                          )}
                        </div>
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
            <Button variant="link" className="text-muted-foreground text-sm h-auto py-1" asChild>
              <Link href="/scan"><RotateCcw className="h-3.5 w-3.5 mr-1" /> Scanna en annan sajt</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* ═══════════════════════════════════════════════════════
            ALLT NEDAN: TAB-OBEROENDE
        ═══════════════════════════════════════════════════════ */}

        {/* ── FULLSTÄNDIG RAPPORT ──────────────────────────────── */}
        <Collapsible open={reportOpen} onOpenChange={setReportOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full font-mono justify-between min-h-[44px]">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t.results.viewFullReport}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", reportOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3">
            <Accordion type="multiple" defaultValue={defaultOpenSections} className="space-y-2">

              {failedCritical.length > 0 && (
                <AccordionItem value="brister" className="border rounded-lg border-destructive/20 bg-destructive/[0.03]">
                  <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      <span className="font-medium text-sm">{t.results.criticalSection}</span>
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
                      <span className="font-medium text-sm">{t.results.warningsSection}</span>
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
                      <span className="font-medium text-sm">{t.results.missingSection}</span>
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

              {REGULATORY_UPDATES.length > 0 && (
                <AccordionItem value="regulatorisk" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">{t.results.regulatorySection}</span>
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
                      {t.results.lastUpdated} {REGULATORY_UPDATES[0].date}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {hasApi && apiScore && (
                <AccordionItem value="api-detaljer" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <Code2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">{t.results.apiDetailsSection}</span>
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
                    <span className="font-medium text-sm">{t.results.technicalSection}</span>
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
                            <Badge variant="destructive" className="text-[9px] shrink-0">{t.results.criticalBadge}</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="mcp" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm">{t.results.mcpSection}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-[10px] text-muted-foreground/50 font-mono mb-3">
                    {t.results.mcpNote}
                  </p>
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
                            {t.results.mcpGithubHint}{" "}
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
                            {t.results.mcpGithubVerify}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {passedChecks.length > 0 && (
                <AccordionItem value="godkanda" className="border rounded-lg border-success/20 bg-success/[0.03]">
                  <AccordionTrigger className="px-4 hover:no-underline min-h-[44px]">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span className="font-medium text-sm">{t.results.passedSection}</span>
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

            </Accordion>
          </CollapsibleContent>
        </Collapsible>

        {/* ── BUILDER-PERSPEKTIV ───────────────────────────────── */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5" />
                {t.results.techDataBtn}
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2 bg-muted/30">
              <CardContent className="py-4 font-mono text-xs space-y-2">
                {[
                  ["API",          r.checks.api_exists.pass  ? t.results.apiFound   : t.results.apiNotFound],
                  ["OpenAPI spec", r.checks.openapi_spec.pass ? t.results.found   : t.results.missing,    r.checks.openapi_spec.pass],
                  ["MCP-server",   r.checks.mcp_server.pass  ? t.results.found    : t.results.missing,    r.checks.mcp_server.pass],
                  ["Developer docs",r.checks.api_docs.pass   ? t.results.apiFound   : t.results.apiNotFound],
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
                    {r.checks.robots_ok.pass ? t.results.allowsCrawlers : t.results.blocksCrawlers}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">llms.txt</span>
                  <span className={r.checks.llms_txt.pass ? "text-success" : undefined}>
                    {r.checks.llms_txt.pass ? t.results.found : t.results.missing}
                  </span>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

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
              {t.results.bookingBullets.map(line => (
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

            <BuilderAvatarStack urgency={cta.urgency} label={t.results.builderAvatarLabel} />

            <p className={cn(
              "text-[11px] mt-3 opacity-70 max-w-xs",
              cta.urgency === "high" ? "text-background/80" : "text-muted-foreground"
            )}>
              {t.results.communityMatch}
            </p>
          </CardContent>
        </Card>


        {/* ── DISCLAIMER ──────────────────────────────────────── */}
        <p className="mt-12 text-[11px] text-muted-foreground text-center max-w-md mx-auto leading-relaxed">
          {t.results.disclaimer}
        </p>

        {/* ── DELA / SKICKA / SCANNA EN ANNAN ──────────────────── */}
        <div className="mt-8 space-y-3">
          <Button onClick={handleShare} className="w-full" size="lg">
            <Share2 className="mr-2 h-4 w-4" />
            {shared ? t.results.copied : t.results.shareResult}
          </Button>
          <Button onClick={handleTeamShare} variant="outline" className="w-full" size="lg">
            <Share2 className="mr-2 h-4 w-4" />
            {teamShared ? t.results.copied : t.results.sendToTeam}
          </Button>
          <div className="text-center">
            <Button variant="link" className="text-muted-foreground text-sm" asChild>
              <Link href="/scan">{t.results.scanAnother}</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
