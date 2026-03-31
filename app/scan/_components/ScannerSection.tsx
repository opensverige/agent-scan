// app/scan/_components/ScannerSection.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ScanResult } from "@/lib/scan-types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ScanState = "idle" | "scanning" | "not_swedish";

// Exactly what the scanner does, in order — honest and specific
const SCAN_MESSAGES = [
  "Kollar åtkomst — robots.txt, sitemap och llms.txt",
  "Kartlägger API-ytor — 40+ sökvägar och subdomäner",
  "Söker developer portal — npm, GitHub och semantisk sökning",
  "Hämtar och renderar dokumentation",
  "AI-analys — extraherar signaler och sätter betyg",
] as const;

// Spread evenly across the ~10s scan duration
const MSG_DELAYS = [0, 2000, 4000, 6000, 8000];

const DEMO_CHIPS = ["fortnox.se", "visma.net", "bokio.se", "spotify.com"];

const CSS = `
  @keyframes ss-spin { to { transform: rotate(360deg); } }
  @keyframes ss-fadeup {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ss-checkin {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function cleanDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
}

function isValidDomain(d: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(d);
}

export default function ScannerSection() {
  const router = useRouter();
  const [state, setState] = useState<ScanState>("idle");
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [activeMsgIdx, setActiveMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  const startProgressAnim = useCallback((ms: number) => {
    const start = Date.now();
    let frameId = 0;
    const tick = () => {
      const p = Math.min(88, ((Date.now() - start) / ms) * 88);
      setProgress(p);
      if (Date.now() - start < ms) {
        frameId = requestAnimationFrame(tick);
        rafRef.current = frameId;
      }
    };
    frameId = requestAnimationFrame(tick);
    rafRef.current = frameId;
    return () => cancelAnimationFrame(frameId);
  }, []);

  async function runScan(rawInput: string) {
    const d = cleanDomain(rawInput);
    if (!isValidDomain(d)) return;

    setDomain(d);
    setState("scanning");
    setActiveMsgIdx(0);
    setProgress(0);

    // Schedule each message to appear at the right time
    const timers = MSG_DELAYS.map((delay, i) =>
      setTimeout(() => setActiveMsgIdx(i), delay)
    );

    // Progress bar animates over the full expected scan duration
    const stopAnim = startProgressAnim(MSG_DELAYS[MSG_DELAYS.length - 1]);
    const start = Date.now();

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d }),
      });

      const elapsed = Date.now() - start;
      if (elapsed < 3500) await new Promise(r => setTimeout(r, 3500 - elapsed));

      stopAnim();
      timers.forEach(clearTimeout);

      if (res.ok) {
        const data: ScanResult = await res.json();
        setProgress(100);
        setTimeout(() => {
          try {
            sessionStorage.setItem(`scan_${d}`, JSON.stringify(data));
          } catch { /* ignore storage errors (private browsing, quota) */ }
          router.push(`/scan/${d}`);
        }, 200);
      } else if (res.status === 400) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        if (body.error?.includes("svenska företag")) {
          setState("not_swedish");
        } else {
          setState("idle");
        }
      } else {
        setState("idle");
      }
    } catch {
      timers.forEach(clearTimeout);
      stopAnim();
      setState("idle");
    }
  }

  const inputDomain = cleanDomain(url);
  const canSubmit = isValidDomain(inputDomain);

  // ── NOT SWEDISH ───────────────────────────────────────────────
  if (state === "not_swedish") {
    return (
      <div>
        <style>{CSS}</style>
        <div className="px-6 pt-14 pb-16 max-w-[580px] mx-auto" style={{ animation: `ss-fadeup 0.35s ${EASE} both` }}>
          <div className="font-mono text-[10px] font-bold text-primary tracking-[3px] mb-4">AGENT READINESS SCANNER</div>
          <h1 className="font-serif text-[clamp(28px,6vw,44px)] font-normal leading-[1.1] tracking-[-1px] mb-4">
            Inte ett svenskt företag
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[420px] mb-6">
            Vi scannar bara svenska företag och internationella bolag grundade i Sverige — som Spotify, IKEA och Klarna.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button type="button" onClick={() => { setUrl(""); setState("idle"); }} size="lg">
              Prova en annan domän →
            </Button>
            <a
              href={`https://discord.gg/CSphbTk8En`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border-2 border-border text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors duration-150"
            >
              Är detta fel? Kontakta oss →
            </a>
          </div>
          <p className="text-xs text-muted-foreground/50 max-w-[400px]">
            Om ditt bolag är grundat i Sverige men inte känns igen — hör av dig på Discord så lägger vi till det.
          </p>
        </div>
      </div>
    );
  }

  // ── IDLE ──────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div>
        <style>{CSS}</style>
        <div className="px-6 pt-14 pb-16 max-w-[580px] mx-auto">
          <div
            className="font-mono text-[10px] font-bold text-primary tracking-[3px] mb-4"
            style={{ animation: `ss-fadeup 0.5s ${EASE} both` }}
          >
            AGENT READINESS SCANNER
          </div>
          <h1
            className="font-serif text-[clamp(32px,7vw,52px)] font-normal leading-[1.08] tracking-[-1.5px] mb-3.5"
            style={{ animation: `ss-fadeup 0.6s ${EASE} 50ms both` }}
          >
            Hur agent-redo<br />är ditt företag?
          </h1>
          <p
            className="text-base text-muted-foreground leading-relaxed max-w-[420px] mb-7"
            style={{ animation: `ss-fadeup 0.5s ${EASE} 100ms both` }}
          >
            Vi scannar din sajt och visar vad AI-agenter ser — 11 checks. Gratis. Öppet.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-2 mb-2"
            style={{ animation: `ss-fadeup 0.5s ${EASE} 140ms both` }}
          >
            <div className="flex flex-1 items-center gap-2 bg-card border-2 border-border rounded-xl px-3.5 py-3 focus-within:border-primary/30 transition-colors duration-150">
              <span className="font-mono text-xs text-muted-foreground shrink-0">https://</span>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && canSubmit && runScan(url)}
                placeholder="dittforetag.se"
                aria-label="Domännamn att scanna"
                autoComplete="url"
                spellCheck={false}
                className="bg-transparent border-none outline-none text-foreground font-mono text-[15px] flex-1 caret-primary font-medium placeholder:text-muted-foreground/40 min-w-0"
              />
            </div>
            <Button
              type="button"
              onClick={() => runScan(url)}
              disabled={!canSubmit}
              size="lg"
              className="w-full sm:w-auto shrink-0"
            >
              Scanna →
            </Button>
          </div>

          <div
            className="flex flex-wrap gap-1.5 mb-9 mt-2"
            style={{ animation: `ss-fadeup 0.4s ${EASE} 180ms both` }}
          >
            <span className="text-[11px] text-muted-foreground self-center">Prova:</span>
            {DEMO_CHIPS.map(chip => (
              <Button
                key={chip}
                type="button"
                variant="outline"
                onClick={() => runScan(chip)}
                aria-label={`Scanna ${chip}`}
                className="font-mono text-[11px] h-11 rounded-lg px-2.5 border-border hover:border-primary/30"
              >
                {chip}
              </Button>
            ))}
          </div>

          <p
            className="text-sm text-muted-foreground leading-relaxed max-w-[460px]"
            style={{ animation: `ss-fadeup 0.4s ${EASE} 220ms both` }}
          >
            AI-agenter börjar interagera med företagssajter. GDPR, EU AI Act och svenska lagar ställer krav på hur. Vi kollar om du är redo.
          </p>
        </div>
      </div>
    );
  }

  // ── SCANNING ──────────────────────────────────────────────────
  return (
    <div>
      <style>{CSS}</style>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        Skannar {domain}: {SCAN_MESSAGES[activeMsgIdx]}
      </div>
      <div
        className="px-6 pt-16 pb-16 max-w-[580px] mx-auto"
        style={{ animation: `ss-fadeup 0.35s ${EASE} both` }}
      >
        <div className="text-sm text-muted-foreground mb-8">
          Kollar <span className="font-mono text-foreground font-semibold">{domain}</span>
        </div>

        <div className="flex flex-col gap-2.5 mb-8">
          {(SCAN_MESSAGES as readonly string[]).slice(0, activeMsgIdx + 1).map((msg, i) => {
            const isCurrent = i === activeMsgIdx;
            return (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{ animation: `ss-fadeup 0.35s ${EASE} both` }}
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {isCurrent ? (
                    <div
                      className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full"
                      style={{ animation: "ss-spin 0.7s linear infinite" }}
                    />
                  ) : (
                    <span
                      className="font-mono text-sm text-success font-bold"
                      style={{ animation: `ss-checkin 0.2s ${EASE} both` }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    isCurrent ? "text-foreground font-semibold" : "text-muted-foreground/50"
                  )}
                >
                  {msg}
                </span>
              </div>
            );
          })}
        </div>

        <Progress value={progress} className="h-[3px] rounded-sm" />
      </div>
    </div>
  );
}
