// app/scan/[domain]/_components/FindingRow.tsx
"use client";

import { AccordionItem, AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import type { CheckResult } from "@/lib/checks";
import { CHECK_CONTEXT } from "@/lib/check-context";
import { SeverityIcon } from "./SeverityIcon";
import { CONTEXT_STAT_BOX, CONTEXT_STAT_PRIMARY, CONTEXT_STAT_SECONDARY } from "./constants";

/**
 * Accordion row for a single failing check, used in the "top findings" list.
 * Shows label + severity icon, expands to reveal stat (with citation),
 * actionable next step, and metadata (category + severity).
 */
export function FindingRow({ check, index }: { check: CheckResult; index: number }) {
  const ctx = CHECK_CONTEXT[check.id];
  return (
    <AccordionItem
      value={`finding-${check.id}`}
      className="border rounded-lg px-4 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
    >
      <AccordionTrigger className="hover:no-underline py-3 min-h-[44px]">
        <div className="flex items-center gap-3 text-left">
          <SeverityIcon result={check} />
          <span className="text-base font-medium">{check.label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-8 pb-1 space-y-2.5">
          {check.detail && <p className="text-sm text-muted-foreground">{check.detail}</p>}
          <div className={CONTEXT_STAT_BOX}>
            <p className={CONTEXT_STAT_PRIMARY}>{ctx.stat}</p>
            <p className={CONTEXT_STAT_SECONDARY}>— {ctx.source}</p>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-primary font-bold text-xs shrink-0 mt-0.5">→</span>
            <span className="text-xs text-foreground/70 leading-snug">{ctx.action}</span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/55 leading-tight">
            <span className="capitalize">{check.category}</span>
            <span className="text-muted-foreground/35 px-1.5" aria-hidden>·</span>
            <span className="capitalize">{check.severity}</span>
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
