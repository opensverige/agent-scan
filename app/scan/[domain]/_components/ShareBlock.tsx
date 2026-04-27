// app/scan/[domain]/_components/ShareBlock.tsx
"use client";

import { useState } from "react";
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
 *  emotional peak when users want to share. */
export function ShareBlock({
  domain, score, total, scanId,
  shareLabel, copyLabel, copiedLabel, linkedinLabel, xLabel,
}: ShareBlockProps) {
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

  return (
    <div className="w-full border-t border-border/50 pt-5 mt-2">
      <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70 mb-3 uppercase">
        {shareLabel}
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
 * Sticky scroll-anchored share pill. Appears bottom-right after the user
 * has scrolled past the hero. Catches users who read the full report
 * before deciding to share — they'd otherwise miss the hero share block.
 */
export function StickyShareButton({
  scanId,
  domain,
  score,
  total,
  shareLabel,
  copiedLabel,
}: {
  scanId: string;
  domain: string;
  score: number;
  total: number;
  shareLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = buildShareText({ domain, score, total, scanId });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => { setCopied(true); setTimeout(() => setCopied(false), 2200); },
        () => {},
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-border bg-background/95 backdrop-blur-md px-4 py-2.5 font-mono text-xs text-foreground shadow-lg transition-all hover:bg-foreground hover:text-background sm:bottom-6 sm:right-6"
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      aria-label={shareLabel}
    >
      {copied
        ? <><Check className="h-4 w-4" /> {copiedLabel}</>
        : <><Copy className="h-4 w-4" /> {shareLabel} →</>}
    </button>
  );
}
