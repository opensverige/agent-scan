// app/scan/_components/ScannerSection.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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

const CSS = `
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

// Swedish flag colours — blue + yellow, weighted toward blue to feel flag-like
const SE_COLS = ["#006AA7", "#006AA7", "#006AA7", "#FECC02", "#FECC02", "#005B8E", "#F0C000", "#004F80"];

function SwedishPixelLoader({ size = 20 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const g = 5;
    const px = size / g;
    const cells: string[] = Array.from({ length: g * g }, () =>
      SE_COLS[Math.floor(Math.random() * SE_COLS.length)]
    );
    for (let j = 0; j < cells.length; j++) {
      ctx.fillStyle = cells[j];
      ctx.fillRect((j % g) * px, Math.floor(j / g) * px, px, px);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let f: number;
    function tick() {
      for (let j = 0; j < cells.length; j++) {
        if (Math.random() < 0.18) {
          cells[j] = SE_COLS[Math.floor(Math.random() * SE_COLS.length)];
          ctx!.fillStyle = cells[j];
          ctx!.fillRect((j % g) * px, Math.floor(j / g) * px, px, px);
        }
      }
      f = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(f);
  }, [size]);
  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      aria-hidden="true"
      style={{ imageRendering: "pixelated", display: "block", borderRadius: 2 }}
    />
  );
}

function cleanDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
}

function isValidDomain(d: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(d);
}

export default function ScannerSection({ initialDomain }: { initialDomain?: string }) {
  const router = useRouter();
  const [state, setState] = useState<ScanState>("idle");
  const [url, setUrl] = useState(initialDomain ?? "");
  const [domain, setDomain] = useState("");
  const [activeMsgIdx, setActiveMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const set = () => { v.playbackRate = 0.2; };
    v.addEventListener("canplay", set, { once: true });
    if (v.readyState >= 3) set();
    return () => v.removeEventListener("canplay", set);
  }, []);

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

        {/* ── Hero — video loops natively (forward+reverse encoded in file) ── */}
        <div className="relative min-h-[min(44vh,380px)] overflow-hidden">
          <video
            ref={videoRef}
            src="/assets/hero-video-loop.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full min-h-full w-full object-cover opacity-30"
          />
          {/* Lätt scrim: video syns; text läses via starkare ton under rubrik + brödtext */}
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background: [
                "linear-gradient(180deg, hsl(var(--background) / 0.52) 0%, hsl(var(--background) / 0.22) 48%, hsl(var(--background) / 0.12) 100%)",
                "linear-gradient(0deg, hsl(var(--background)) 0%, hsl(var(--background) / 0.55) 28%, transparent 62%)",
              ].join(", "),
            }}
          />

          {/* Hero content */}
          <div className="relative z-[2] mx-auto max-w-[580px] px-6 pb-12 pt-16 sm:pb-14">
            <h1
              className="mb-5 text-center font-serif text-[clamp(32px,7vw,52px)] font-normal leading-[1.12] tracking-[-1.5px] text-foreground"
              style={{
                animation: `ss-fadeup 0.6s ${EASE} 50ms both`,
                textShadow:
                  "0 0 28px hsl(var(--background) / 0.95), 0 1px 3px hsl(var(--background) / 0.9), 0 2px 12px hsl(var(--foreground) / 0.08)",
              }}
            >
              Hur agent-redo är ditt företag?
            </h1>

            <div
              className="mx-auto max-w-[520px]"
              style={{ animation: `ss-fadeup 0.5s ${EASE} 100ms both` }}
            >
              <div className="overflow-hidden rounded-2xl border-2 border-border/70 bg-background shadow-lg">
                <p className="px-4 pb-3 pt-4 text-center text-base leading-relaxed text-foreground sm:px-5 sm:pb-4 sm:pt-5">
                  AI-agenter försöker redan nå ditt system.
                  <br />
                  Vi visar vad de ser — och vad som stoppar dem.
                </p>
                <div className="border-t border-border/55 bg-card px-3 py-3 sm:flex sm:flex-row sm:items-stretch sm:gap-2.5 sm:px-4 sm:pb-4">
                  <div className="flex flex-1 items-center gap-2 rounded-xl border-2 border-border bg-background px-3.5 py-2.5 transition-colors duration-150 focus-within:border-primary/30">
                    <span className="font-mono text-xs text-muted-foreground shrink-0">https://</span>
                    <input
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && canSubmit && runScan(url)}
                      placeholder="dittforetag.se"
                      aria-label="Domännamn att scanna"
                      autoComplete="url"
                      spellCheck={false}
                      className="min-w-0 flex-1 border-none bg-transparent font-mono text-[15px] font-medium text-foreground caret-primary outline-none placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => runScan(url)}
                    disabled={!canSubmit}
                    size="lg"
                    className="mt-2 w-full shrink-0 sm:mt-0 sm:w-auto"
                  >
                    Scanna →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Under hero: Varför ── */}
        <div className="relative z-[4] mx-auto max-w-[580px] px-6 pb-16 pt-8">
          <h2
            className="mx-auto mb-3 max-w-[460px] text-center font-serif text-[clamp(28px,5.5vw,40px)] font-normal tracking-[-0.45px] text-foreground"
            style={{ animation: `ss-fadeup 0.4s ${EASE} 210ms both` }}
          >
            Varför
          </h2>
          <p
            className="mx-auto max-w-[460px] text-center text-base leading-relaxed text-muted-foreground"
            style={{ animation: `ss-fadeup 0.4s ${EASE} 220ms both` }}
          >
            Företag som inte syns för agenter blir ointegrerbara. Builders väljer system med öppna API:er — vi visar var ditt står.
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
                    <SwedishPixelLoader size={20} />
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
