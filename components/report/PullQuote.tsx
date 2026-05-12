// components/report/PullQuote.tsx
//
// Large serif italic quote between paragraphs. Optimized for screenshot
// + copy-paste sharing. Subtle hover state shows a tiny copy hint —
// click copies the quote text.

"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { MdContentCopy, MdCheck } from "react-icons/md";

interface PullQuoteProps {
  children: ReactNode;
  attribution?: string;
  /** Plain-text fallback for the copy button. If omitted, children must be string */
  copyText?: string;
}

export function PullQuote({ children, attribution, copyText }: PullQuoteProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = useCallback(async () => {
    const text =
      copyText ??
      (typeof children === "string"
        ? children
        : "");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard refused */
    }
  }, [children, copyText]);

  return (
    <figure className="group relative my-14 -mx-2 sm:mx-0">
      <blockquote className="relative border-l-2 border-[hsl(var(--primary))] pl-6 pr-10 sm:pl-10 sm:pr-14">
        <p className="font-serif font-normal italic leading-[1.18] tracking-[-0.015em] text-[hsl(var(--foreground))]">
          <span className="block text-[clamp(28px,3.8vw,40px)]">{children}</span>
        </p>
        {attribution && (
          <figcaption className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
            {attribution}
          </figcaption>
        )}
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Citat kopierat" : "Kopiera citatet"}
          className="absolute right-0 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--hairline))] bg-[hsl(var(--surface-card))] text-[hsl(var(--muted-foreground))] opacity-0 transition-[opacity,color,border-color] duration-150 ease-[var(--ease-out-quint)] hover:text-[hsl(var(--foreground))] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        >
          {copied ? (
            <MdCheck className="h-4 w-4 text-[hsl(var(--success))]" aria-hidden />
          ) : (
            <MdContentCopy className="h-4 w-4" aria-hidden />
          )}
        </button>
        {/* Polite live region so screen readers hear the copy confirmation */}
        <span className="sr-only" role="status" aria-live="polite">
          {copied ? "Citat kopierat till urklipp" : ""}
        </span>
      </blockquote>
    </figure>
  );
}
