// components/methodology-code-block.tsx
//
// Helpdesk-grade code block. Renders a header (filename + language chip
// + Copy button) and a body that wraps long lines instead of forcing a
// horizontal scrollbar. Always-visible Copy button — the user came here
// to copy code, not to discover affordances on hover.
//
// Filename is detected from the first line of the snippet when it is a
// comment that names a file or URL (`# vercel.json`, `// scripts/x.ts`,
// `# https://example.se/llms.txt`). When matched, the line is removed
// from the rendered body so the header carries it instead.

"use client";

import {
  Children,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MdCheck, MdContentCopy } from "react-icons/md";

const LANGUAGE_LABEL: Record<string, string> = {
  bash: "shell",
  sh: "shell",
  zsh: "shell",
  shell: "shell",
  js: "javascript",
  ts: "typescript",
  tsx: "typescript",
  jsx: "javascript",
  json: "json",
  jsonc: "json",
  yaml: "yaml",
  yml: "yaml",
  py: "python",
  python: "python",
  txt: "text",
  text: "text",
  html: "html",
  css: "css",
  md: "markdown",
  markdown: "markdown",
  http: "http",
  nginx: "nginx",
  conf: "config",
  diff: "diff",
  sql: "sql",
  toml: "toml",
};

function inspectChildren(children: ReactNode): {
  language: string | null;
  text: string;
} {
  let language: string | null = null;
  const collect = (node: ReactNode): string => {
    if (node == null || typeof node === "boolean") return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(collect).join("");
    if (isValidElement<{ className?: string; children?: ReactNode }>(node)) {
      const cls = node.props.className;
      if (!language && cls) {
        const match = /language-([\w-]+)/.exec(cls);
        if (match) language = match[1].toLowerCase();
      }
      return Children.toArray(node.props.children).map(collect).join("");
    }
    return "";
  };
  return { language, text: collect(children) };
}

const FILENAME_RE =
  /^(?:#|\/\/|<!--)\s*([\w./@-]+\.(?:ts|tsx|js|jsx|mjs|cjs|py|json|jsonc|yaml|yml|sh|bash|nginx|conf|md|markdown|txt|html|css|toml|sql|env|xml|svg)(?:[?#].*)?|https?:\/\/[^\s]+\.(?:txt|md|json|yaml|yml|xml))(?:\s*-->)?\s*$/;

function splitFilename(text: string): { filename: string | null; body: string } {
  const newlineIdx = text.indexOf("\n");
  if (newlineIdx === -1) return { filename: null, body: text };
  const firstLine = text.slice(0, newlineIdx).trim();
  const match = FILENAME_RE.exec(firstLine);
  if (!match) return { filename: null, body: text };
  return {
    filename: match[1],
    body: text.slice(newlineIdx + 1).replace(/^\n+/, ""),
  };
}

export function MethodologyCodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { language, text } = useMemo(() => inspectChildren(children), [children]);
  const { filename, body: visibleBody } = useMemo(
    () => splitFilename(text),
    [text],
  );
  const langLabel = language ? LANGUAGE_LABEL[language] ?? language : null;
  const lineCount = visibleBody.split("\n").length;

  const onCopy = useCallback(async () => {
    const payload = visibleBody.replace(/\n+$/, "");
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard refused (insecure context, denied permission)
    }
  }, [visibleBody]);

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-[hsl(var(--code-border))] bg-[hsl(var(--card))] shadow-[0_1px_2px_hsl(0_0%_0%/0.04)]">
      <figcaption className="flex items-center justify-between gap-3 border-b border-[hsl(var(--code-border))] bg-[hsl(var(--code-bg))] px-4 py-2">
        <div className="flex min-w-0 items-center gap-2 font-mono text-[11px] tracking-wide text-[hsl(var(--muted-foreground))]">
          {langLabel && (
            <span className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--foreground))]">
              {langLabel}
            </span>
          )}
          {filename && (
            <span className="truncate font-medium text-[hsl(var(--foreground))]">
              {filename}
            </span>
          )}
          {!filename && !langLabel && (
            <span className="opacity-0">code</span>
          )}
        </div>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-[hsl(var(--code-border))] bg-[hsl(var(--card))] px-2 font-mono text-[11px] font-medium text-[hsl(var(--muted-foreground))] transition-all hover:border-[hsl(var(--ring))] hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] active:scale-[0.98]"
        >
          {copied ? (
            <>
              <MdCheck className="h-4 w-4 text-[hsl(var(--success))]" aria-hidden />
              <span>Copied</span>
            </>
          ) : (
            <>
              <MdContentCopy className="h-4 w-4" aria-hidden />
              <span>Copy</span>
            </>
          )}
        </button>
      </figcaption>
      <pre className="m-0 px-4 py-3.5 font-mono text-[13.5px] leading-[1.65] text-[hsl(var(--foreground))]">
        {filename ? visibleBody : children}
      </pre>
      {lineCount > 18 && (
        <div className="border-t border-[hsl(var(--code-border))] bg-[hsl(var(--code-bg))] px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          {lineCount} lines
        </div>
      )}
    </figure>
  );
}
