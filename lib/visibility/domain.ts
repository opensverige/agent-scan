// lib/visibility/domain.ts
// Same normalisation and validation rules as app/api/scan/route.ts.

const PRIVATE_TLDS = [".local", ".internal", ".localdomain", ".localhost"] as const;
const DOMAIN_REGEX = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/;

// Longer than any valid domain plus scheme and path; cut first so the
// regexes below never see unbounded user input.
const MAX_INPUT = 2048;

export function normalizeDomain(input: unknown): string {
  const s = String(input ?? "").slice(0, MAX_INPUT).trim().replace(/^https?:\/\//i, "");
  // Linear cut at the first path/query/fragment character. A regex like
  // /[/?#].*$/ backtracks quadratically on inputs such as "####...".
  const end = s.search(/[/?#]/);
  return (end === -1 ? s : s.slice(0, end)).replace(/:\d+$/, "").toLowerCase();
}

export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  if (!DOMAIN_REGEX.test(domain)) return false;
  if (domain.includes("..")) return false;
  if (PRIVATE_TLDS.some(tld => domain.endsWith(tld))) return false;
  return true;
}
