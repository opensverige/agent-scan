// lib/visibility/domain.ts
// Same normalisation and validation rules as app/api/scan/route.ts.

const PRIVATE_TLDS = [".local", ".internal", ".localdomain", ".localhost"] as const;
const DOMAIN_REGEX = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/;

export function normalizeDomain(input: unknown): string {
  return String(input ?? "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();
}

export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  if (!DOMAIN_REGEX.test(domain)) return false;
  if (domain.includes("..")) return false;
  if (PRIVATE_TLDS.some(tld => domain.endsWith(tld))) return false;
  return true;
}
