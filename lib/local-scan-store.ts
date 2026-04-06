import type { AllChecks } from "@/lib/checks";

export interface LocalScanRow {
  domain: string;
  badge: string;
  checks_passed: number;
  checks_json: AllChecks;
  claude_summary: string | null;
  recommendations: string[];
  scanned_at: string | null;
  scan_id: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __openSverigeLocalScanStore: Map<string, LocalScanRow> | undefined;
}

function store(): Map<string, LocalScanRow> {
  if (!globalThis.__openSverigeLocalScanStore) {
    globalThis.__openSverigeLocalScanStore = new Map<string, LocalScanRow>();
  }
  return globalThis.__openSverigeLocalScanStore;
}

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function domainAliases(domain: string): string[] {
  const normalized = normalizeDomain(domain);
  const stripped = normalized.replace(/^www\./, "");
  return Array.from(new Set([normalized, stripped, `www.${stripped}`]));
}

export function saveLocalLatestScan(input: Omit<LocalScanRow, "scan_id">): string {
  const id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const row: LocalScanRow = { ...input, scan_id: id };
  const kv = store();
  for (const key of domainAliases(input.domain)) kv.set(key, row);
  return id;
}

export function getLocalLatestScan(domain: string): LocalScanRow | null {
  const kv = store();
  for (const key of domainAliases(domain)) {
    const row = kv.get(key);
    if (row) return row;
  }
  return null;
}

