// lib/detect-lang.ts
//
// Server-side language detection from request headers. Three-tier
// priority so a manual choice always beats a guess:
//
//   1. `lang` cookie       (manual override — set by LanguageProvider on toggle)
//   2. Accept-Language     (browser preference, sorted by q-value)
//   3. x-vercel-ip-country (Vercel-injected geo signal)
//   4. fallback "sv"
//
// Browser preference beats IP country because language ≠ location:
// a Swedish expat in Berlin still wants Swedish, an English-mac user
// in Stockholm wants English. Country is only consulted when the
// browser tells us nothing useful.
//
// All inputs are plain strings; this module has no Next.js imports
// so it can be unit-tested in isolation.

import type { Lang } from "./i18n";

export const LANG_COOKIE_NAME = "lang";

interface DetectInput {
  cookie?: string;
  acceptLanguage?: string;
  country?: string;
  userAgent?: string;
}

const BOT_UA_PATTERN =
  /bot|crawler|spider|slurp|googlebot|bingbot|yandex|duckduckbot|baiduspider|linkedinbot|twitterbot|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot/i;

export function detectLang({ cookie, acceptLanguage, country, userAgent }: DetectInput): Lang {
  // 1. Manual override via cookie
  const cookieLang = parseCookie(cookie ?? "")[LANG_COOKIE_NAME];
  if (cookieLang === "sv" || cookieLang === "en") return cookieLang;

  // 2. Accept-Language: sorted by q descending, first sv-* or en-* wins
  if (acceptLanguage) {
    let foreignSeen = false;
    for (const tag of parseAcceptLanguage(acceptLanguage)) {
      if (tag.startsWith("sv")) return "sv";
      if (tag.startsWith("en")) return "en";
      foreignSeen = true;
    }
    // Browser sent Accept-Language but neither sv nor en (e.g., de-DE).
    // EN is the best fallback for non-Scandinavian users.
    if (foreignSeen) return "en";
  }

  // 3. No Accept-Language. Two sub-cases:
  //    a) Bot / crawler  → keep canonical SV so Googlebot indexes Swedish on google.se
  //    b) Real user      → use IP country: SE → SV, anything else → EN
  const isBot = userAgent ? BOT_UA_PATTERN.test(userAgent) : false;
  if (!isBot && country && country.toUpperCase() !== "SE") return "en";

  // 4. Default — bots, SE-country users, and unknown geo all land on SV
  return "sv";
}

function parseCookie(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

/** Returns lower-case language tags sorted by q-value, highest first. */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map(s => {
      const [tag, ...params] = s.trim().split(";");
      const qParam = params.find(p => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.split("=")[1]) || 0 : 1;
      return { tag: tag.toLowerCase(), q };
    })
    .sort((a, b) => b.q - a.q)
    .map(x => x.tag);
}
