// app/scan/[domain]/_components/ShareBlock.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Linkedin } from "lucide-react";

interface ShareBlockProps {
  domain: string;
  score: number;
  total: number;
  passedChecks: Array<{ id: string; label: string }>;
  failedChecks: Array<{ id: string; label: string }>;
  scanId: string;
  shareLabel: string;
  nudgeLabel: string;
  copyLabel: string;
  copiedLabel: string;
  linkedinLabel: string;
  xLabel: string;
}

/**
 * Builds the canonical share text used across all share targets.
 *
 * Pattern from research (docs/strategy/research): Wordle-style visual bar
 * + check summary + permanent /r/ URL. Designed to be self-explanatory in
 * a LinkedIn feed where links get suppressed and only the first ~210 chars
 * render before truncation.
 */
function buildShareText(args: { domain: string; score: number; total: number; scanId: string }): string {
  const { domain, score, total, scanId } = args;
  const filled = Math.round((score / total) * 14);
  const bar = "■".repeat(Math.max(0, filled)) + "□".repeat(Math.max(0, 14 - filled));
  const url = `https://agent.opensverige.se/r/${scanId}`;
  return `agent.opensverige.se · skannade ${domain}\n${bar}  ${score}/${total}\n\nÄr din sajt agent-redo? → ${url}`;
}

/** Hero-zone share block. Shown directly under the score badge — the
 *  emotional peak when users want to share.
 *
 *  Visual prominence + mount-pulse + identity microcopy together lift
 *  share-rate; pattern from Wordle (auto share-prompt) and Spotify
 *  Wrapped (always-prominent share CTA). The pulse is one-shot — it
 *  draws the eye on first render, then settles into a calm card. */
export function ShareBlock({
  domain, score, total, scanId,
  shareLabel, nudgeLabel, copyLabel, copiedLabel, linkedinLabel, xLabel,
}: ShareBlockProps) {
  const [copied, setCopied] = useState(false);
  const [pulsing, setPulsing] = useState(true);

  // One-shot attention grab. Server + first-paint render with pulse on,
  // client fades it off after ~2s. transition-all duration-700 animates
  // the fade-out so it never feels like an abrupt state change.
  useEffect(() => {
    const t = setTimeout(() => setPulsing(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const shareText = buildShareText({ domain, score, total, scanId });
  const url = `https://agent.opensverige.se/r/${scanId}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(
        () => { setCopied(true); setTimeout(() => setCopied(false), 2200); },
        () => {},
      );
    } else {
      const ta = document.createElement("textarea");
      ta.value = shareText;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
      document.body.removeChild(ta);
    }
  }

  const containerClass = `w-full rounded-lg border p-5 mt-6 transition-all duration-700 ${
    pulsing
      ? "border-primary/40 ring-4 ring-primary/15 bg-primary/[0.04]"
      : "border-border bg-foreground/[0.025]"
  }`;

  return (
    <div className={containerClass} style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
      <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70 mb-2 uppercase">
        {shareLabel}
      </p>
      <p className="text-sm text-foreground/85 mb-4 leading-snug">
        {nudgeLabel}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          onClick={handleCopy}
          variant="default"
          size="lg"
          className="flex-1 font-mono"
          aria-label={copyLabel}
        >
          {copied
            ? <><Check className="h-4 w-4 mr-2" /> {copiedLabel}</>
            : <><Copy className="h-4 w-4 mr-2" /> {copyLabel}</>}
        </Button>
        <Button asChild variant="outline" size="lg" className="flex-1">
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
            <Linkedin className="h-4 w-4 mr-2" />
            {linkedinLabel}
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="flex-1">
          <a href={xUrl} target="_blank" rel="noopener noreferrer">
            <span className="font-bold mr-2 text-base leading-none" aria-hidden>𝕏</span>
            {xLabel}
          </a>
        </Button>
      </div>
      <p className="mt-3 font-mono text-[10px] text-muted-foreground/50 truncate">
        {url}
      </p>
    </div>
  );
}

/**
 * Sticky scroll-anchored share toolbar. Always-visible bottom-right pill
 * with three independent actions: copy DM-text, open LinkedIn share,
 * open X share. Catches users who read the full report before deciding
 * to share — they'd otherwise miss the hero ShareBlock.
 *
 * Mini-toolbar layout: primary "Copy" button with text on the left,
 * two icon-only fan-outs to LinkedIn and X on the right. Each direct
 * action lands in the same place as the corresponding hero button.
 */
export function StickyShareButton({
  scanId,
  domain,
  score,
  total,
  copyLabel,
  copiedLabel,
  linkedinLabel,
  xLabel,
}: {
  scanId: string;
  domain: string;
  score: number;
  total: number;
  copyLabel: string;
  copiedLabel: string;
  linkedinLabel: string;
  xLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const shareText = buildShareText({ domain, score, total, scanId });
  const url = `https://agent.opensverige.se/r/${scanId}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(
        () => { setCopied(true); setTimeout(() => setCopied(false), 2200); },
        () => {},
      );
    }
  }

  const easing = { transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" } as const;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex items-center gap-1 rounded-full border border-border bg-background/95 backdrop-blur-md p-1 font-mono text-xs shadow-lg sm:bottom-6 sm:right-6"
      style={easing}
    >
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-2 rounded-full px-3 py-2 text-foreground transition-colors hover:bg-foreground hover:text-background"
        style={easing}
        aria-label={copyLabel}
      >
        {copied
          ? <><Check className="h-4 w-4" /> {copiedLabel}</>
          : <><Copy className="h-4 w-4" /> {copied ? copiedLabel : copyLabel}</>}
      </button>
      <span className="h-5 w-px bg-border/70" aria-hidden />
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground hover:text-background"
        style={easing}
        aria-label={linkedinLabel}
        title={linkedinLabel}
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground hover:text-background"
        style={easing}
        aria-label={xLabel}
        title={xLabel}
      >
        <span className="font-bold text-base leading-none" aria-hidden>𝕏</span>
      </a>
    </div>
  );
}
