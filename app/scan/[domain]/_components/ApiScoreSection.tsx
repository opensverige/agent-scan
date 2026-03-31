// app/scan/[domain]/_components/ApiScoreSection.tsx
"use client";

import { useState, useEffect } from "react";
import type { ApiScoreResult, AxisScore, ScoreBand } from "@/lib/api-score";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, CheckCircle2, ChevronRight, XCircle, Zap } from "lucide-react";

// ── Band config ────────────────────────────────────────────────────────────

const BAND_CFG: Record<ScoreBand, { color: string; ring: string; badgeClass: string }> = {
  agent_ready: { color: "text-success",     ring: "hsl(var(--success))",    badgeClass: "bg-success/10 text-success border-success/30" },
  strong:      { color: "text-success",     ring: "hsl(var(--success))",    badgeClass: "bg-success/10 text-success border-success/30" },
  dev_ready:   { color: "text-amber-600",   ring: "#c9a55a",                badgeClass: "bg-amber-50 text-amber-800 border-amber-200" },
  partial:     { color: "text-amber-600",   ring: "#c9a55a",                badgeClass: "bg-amber-50 text-amber-800 border-amber-200" },
  not_ready:   { color: "text-destructive", ring: "hsl(var(--destructive))", badgeClass: "bg-destructive/10 text-destructive border-destructive/30" },
};

// ── Mini score ring (100-point scale) ─────────────────────────────────────

const RING_R = 44;
const RING_CIRC = Math.round(2 * Math.PI * RING_R); // 276

function ApiScoreRing({ score, max, ringColor }: { score: number; max: number; ringColor: string }) {
  const [filled, setFilled] = useState(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const finalFilled = (score / max) * RING_CIRC;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setFilled(finalFilled); setDisplay(score); return; }
    let raf = 0;
    const timer = setTimeout(() => setFilled(finalFilled), 80);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 800, 1);
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(ease * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [score, max]);

  return (
    <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={RING_R} fill="none" stroke="hsl(var(--muted))" strokeWidth={8} />
        <circle
          cx={55} cy={55} r={RING_R} fill="none"
          stroke={ringColor} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${RING_CIRC} ${RING_CIRC}`}
          strokeDashoffset={RING_CIRC - filled}
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-xl leading-none">{display}</span>
        <span className="font-mono text-[10px] text-muted-foreground">/{max}</span>
      </div>
    </div>
  );
}

// ── Axis progress bar ──────────────────────────────────────────────────────

function AxisBar({ axis }: { axis: AxisScore }) {
  const [width, setWidth] = useState(0);
  const pct = axis.maxScore === 0 ? 0 : axis.score / axis.maxScore;
  const barColor = pct >= 0.8 ? "bg-success" : pct >= 0.5 ? "bg-amber-400" : "bg-destructive";

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct * 100), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 items-center gap-y-0.5">
      <div className="text-xs text-foreground/80 truncate">{axis.label}</div>
      <div className="font-mono text-[11px] text-muted-foreground tabular-nums text-right">
        {axis.score}/{axis.limited ? `~${axis.maxScore}` : axis.maxScore}
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden col-span-2">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
          style={{ width: `${width}%`, transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function ApiScoreSection({
  apiScore,
  compact = false,
  showAxes = true,
  className,
}: {
  apiScore: ApiScoreResult;
  compact?: boolean;
  showAxes?: boolean;
  className?: string;
}) {
  const cfg = BAND_CFG[apiScore.band];

  return (
    <section className={cn(
      compact ? "space-y-5" : "mt-8 border rounded-xl p-5 space-y-5 bg-background",
      className
    )}>
      {/* Header: ring + badge + spec info */}
      <div>
        {!compact && (
          <p className="font-mono text-xs font-bold tracking-widest text-muted-foreground mb-3">
            API AGENT-READINESS
          </p>
        )}

        <div className="flex items-center gap-5">
          <ApiScoreRing
            score={apiScore.totalScore}
            max={100}
            ringColor={cfg.ring}
          />
          <div className="space-y-1.5">
            <Badge className={cn("text-xs font-semibold border", cfg.badgeClass)}>
              {apiScore.bandLabel}
            </Badge>
            {!apiScore.hasSpec && (
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[220px]">
                API hittades men ingen OpenAPI-spec. Max möjlig poäng: {apiScore.maxPossibleScore}/100.
              </p>
            )}
            {apiScore.specFormat && (
              <p className="font-mono text-[10px] text-muted-foreground">
                {apiScore.specFormat === "openapi3" ? "OpenAPI 3.x" : "Swagger 2.0"} spec analyserad
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Axis bars — only in full/report view */}
      {showAxes && (
        <div className="space-y-3">
          {apiScore.axes.map(axis => (
            <AxisBar key={axis.axis} axis={axis} />
          ))}
        </div>
      )}

      {/* Blockers */}
      {apiScore.topBlockers.length > 0 && (
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-2">
            BLOCKERARE
          </p>
          <ul className="space-y-1">
            {apiScore.topBlockers.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <span className="text-foreground/70">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fastest fixes */}
      {apiScore.fastestFixes.length > 0 && (
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-2">
            SNABBASTE FIXARNA
          </p>
          <ul className="space-y-1">
            {apiScore.fastestFixes.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No spec alert */}
      {!apiScore.hasSpec && (
        <div className="rounded-md border border-amber-200/60 bg-amber-50 px-3 py-2.5">
          <p className="text-xs text-amber-900 leading-relaxed">
            <Zap className="inline h-3 w-3 mr-1 shrink-0" />
            Utan OpenAPI-spec kunde vi bara analysera {apiScore.maxPossibleScore} av 100 möjliga poäng.
            Publicera en spec på <code className="font-mono text-[10px]">/openapi.json</code> för fullständig analys.
          </p>
        </div>
      )}

      {/* Per-axis details — only in full/report view */}
      {showAxes && (
        <Accordion type="single" collapsible>
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="py-0 text-[11px] font-mono text-muted-foreground hover:no-underline">
              Visa detaljer per axel
            </AccordionTrigger>
            <AccordionContent className="pt-3">
              <div className="space-y-4">
                {apiScore.axes.map(axis => (
                  <div key={axis.axis}>
                    <p className="text-xs font-semibold mb-1.5">
                      {axis.label}
                      {axis.limited && <span className="ml-2 font-mono text-[10px] text-muted-foreground">(begränsad — saknar spec)</span>}
                    </p>
                    <div className="space-y-1 pl-1">
                      {axis.checks.map((check, i) => (
                        <div key={i} className="flex items-start gap-2">
                          {check.score >= check.maxScore
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                            : check.score > 0
                              ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                              : <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                          }
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-foreground/80">{check.name}</span>
                            <span className="font-mono text-[10px] text-muted-foreground ml-2">{check.score}/{check.maxScore}</span>
                            {check.detail && (
                              <p className="text-[11px] text-muted-foreground/70 mt-0.5">{check.detail}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </section>
  );
}
