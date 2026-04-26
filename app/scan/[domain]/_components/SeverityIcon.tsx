// app/scan/[domain]/_components/SeverityIcon.tsx
"use client";

import { AlertTriangle, CheckCircle2, Search, XCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckResult } from "@/lib/checks";

/**
 * Picks the right icon + colour for a check result based on its status.
 * Order of precedence: pass > N/A > recommendation > severity (critical, important, info).
 */
export function SeverityIcon({ result, size = "h-5 w-5" }: { result: CheckResult; size?: string }) {
  if (result.pass) return <CheckCircle2 className={cn(size, "text-success shrink-0")} />;
  if (result.na) return <Search className={cn(size, "text-muted-foreground/40 shrink-0")} />;
  if (result.recommendation) return <Zap className={cn(size, "text-primary/70 shrink-0")} />;
  if (result.severity === "critical") return <XCircle className={cn(size, "text-destructive shrink-0")} />;
  if (result.severity === "important") return <AlertTriangle className={cn(size, "text-amber-500 shrink-0")} />;
  return <Search className={cn(size, "text-muted-foreground shrink-0")} />;
}
