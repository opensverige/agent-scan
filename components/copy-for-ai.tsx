// components/copy-for-ai.tsx
//
// Small client component that lets a human copy the current page as the
// markdown body our middleware serves to AI agents (Accept: text/markdown).
// Pasting the result into ChatGPT, Claude or Cursor gives the model the
// same compact, citable view that crawlers see — useful for "summarize
// this", "what does this site do" or "quote this in my doc" prompts.
//
// We hit the current pathname (not a static asset) so the response goes
// through middleware.ts and respects per-path negotiation. The fallback
// is /llms-full.txt — guaranteed to exist site-wide.

"use client";

import { useState, useCallback } from "react";
import { useLang } from "@/lib/language-context";

const FALLBACK_URL = "/llms-full.txt";

const COPY = {
  sv: {
    idle: "Kopiera för AI ↗",
    copying: "Hämtar markdown...",
    copied: "Kopierat ✓",
    error: "Misslyckades",
    aria:
      "Kopiera den här sidans markdown-version till urklipp så att du kan klistra in den i ChatGPT, Claude eller Cursor",
  },
  en: {
    idle: "Copy for AI ↗",
    copying: "Fetching markdown...",
    copied: "Copied ✓",
    error: "Failed",
    aria:
      "Copy this page's markdown version to your clipboard so you can paste it into ChatGPT, Claude or Cursor",
  },
} as const;

type State = "idle" | "copying" | "copied" | "error";

export function CopyForAI() {
  const { lang } = useLang();
  const [state, setState] = useState<State>("idle");
  const labels = COPY[lang];

  const onClick = useCallback(async () => {
    if (state === "copying") return;
    setState("copying");

    const path = typeof window !== "undefined" ? window.location.pathname : "/";

    try {
      let body = await fetchMarkdown(path);
      if (!body) body = await fetchMarkdown(FALLBACK_URL);
      if (!body) throw new Error("no markdown body");

      await navigator.clipboard.writeText(body);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }, [state]);

  const label =
    state === "copying"
      ? labels.copying
      : state === "copied"
        ? labels.copied
        : state === "error"
          ? labels.error
          : labels.idle;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={labels.aria}
      className="inline-flex items-center gap-1 font-mono uppercase tracking-widest text-[10px] text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
    </button>
  );
}

async function fetchMarkdown(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "text/markdown" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const ctype = res.headers.get("content-type") ?? "";
    if (!ctype.includes("markdown") && !ctype.includes("text/plain")) {
      return null;
    }
    const body = await res.text();
    return body.trim().length > 0 ? body : null;
  } catch {
    return null;
  }
}
