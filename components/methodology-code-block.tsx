// components/methodology-code-block.tsx
//
// Client wrapper for <pre> in methodology articles. Renders a copy
// button revealed on hover (always-visible on touch). Walks React
// children to extract plain text without re-rendering.

"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, Copy } from "lucide-react";

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return Children.toArray(node.props.children).map(extractText).join("");
  }
  return "";
}

export function MethodologyCodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = useCallback(async () => {
    const text = extractText(children).replace(/\n+$/, "");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard refused (insecure context, denied permission)
    }
  }, [children]);

  return (
    <div className="group relative my-6">
      <pre className="overflow-x-auto rounded-xl border border-border/50 bg-muted/40 p-4 pr-14 font-mono text-sm leading-relaxed">
        {children}
      </pre>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-all hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-500" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
        <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
