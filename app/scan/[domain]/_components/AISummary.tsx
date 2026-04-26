// app/scan/[domain]/_components/AISummary.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * AI-generated summary block with collapsible "show more / show less" toggle.
 *
 * Default state shows ~3 lines with a gradient fade that masks the cut-off.
 * Truncation is detected by comparing scrollHeight to clientHeight on mount.
 *
 * Per EU AI Act Art. 50 (applies 2 Aug 2026), AI-generated text must be
 * disclosed to users. The `label` prop is the visible disclosure (e.g.
 * "Sammanfattad av AI (Claude)") shown above the text.
 */
export function AISummary({
  text,
  label,
  showMore,
  showLess,
}: {
  text: string;
  label: string;
  showMore: string;
  showLess: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setNeedsTruncation(el.scrollHeight > el.clientHeight + 2);
  }, [text]);

  return (
    <div className="w-full border-t border-border/50 pt-4 mt-1">
      <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70 mb-2">
        {label.toUpperCase()}
      </p>
      <div className="relative">
        <p
          ref={textRef}
          className={cn(
            "text-sm text-muted-foreground leading-relaxed overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            expanded ? "max-h-[1000px]" : "max-h-[4.5rem]",
          )}
        >
          {text}
        </p>
        {!expanded && needsTruncation && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
            style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--card)))" }}
          />
        )}
      </div>
      {needsTruncation && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="mt-1 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? showLess : showMore} {expanded ? "↑" : "↓"}
        </button>
      )}
    </div>
  );
}
