// lib/scan/openapi-extractor.ts
//
// Extracts an OpenAPI/Swagger spec from inline JavaScript in HTML pages.
// Many developer portals (Redoc, Swagger UI in some configurations) embed
// the full spec as a `window.__redoc_state = { ... }` JSON assignment rather
// than serving it as a separate static file. This module brace-matches that
// JSON to recover the spec for downstream scoring.

/**
 * Look for `__redoc_state = { ... }` in body and return the embedded spec
 * as a JSON string. Returns null if the marker isn't found or parsing fails.
 *
 * Handles strings + escapes correctly so braces inside strings don't confuse
 * the depth counter.
 */
export function extractRedocSpec(body: string): string | null {
  const marker = "__redoc_state";
  const idx = body.indexOf(marker);
  if (idx === -1) return null;

  const eq = body.indexOf("=", idx);
  if (eq === -1) return null;

  const start = body.indexOf("{", eq);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = -1;
  for (let i = start; i < body.length; i++) {
    const ch = body[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === "\"") inString = false;
      continue;
    }
    if (ch === "\"") {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;

  try {
    const state = JSON.parse(body.slice(start, end + 1)) as Record<string, unknown>;
    const spec = state.spec as Record<string, unknown> | undefined;
    const data = spec?.data;
    return data ? JSON.stringify(data) : null;
  } catch {
    return null;
  }
}

/**
 * Validate that an llms.txt response is a real text file, not an HTML page
 * returned by a CMS catch-all. Many sites return 200 with HTML for any
 * unknown path (Next.js, WordPress, etc.).
 */
export function isValidLlmsTxt(body: string, contentType: string | null): boolean {
  const ct = contentType?.toLowerCase() ?? "";
  // Reject HTML regardless of what the body says
  if (ct.includes("text/html") || body.trimStart().startsWith("<!DOCTYPE") || body.trimStart().startsWith("<html")) {
    return false;
  }
  // Accept explicit text/plain or text/markdown
  if (ct.includes("text/plain") || ct.includes("text/markdown")) return true;
  // Accept if body looks like an llms.txt file: starts with # heading or > blockquote
  const start = body.trimStart().slice(0, 50);
  return start.startsWith("#") || start.startsWith(">");
}
