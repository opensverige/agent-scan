// app/scan/_components/HomepageFaq.tsx
//
// Visible FAQ accordion grouped into "Snabbstart / Säkerhet & data /
// Använd resultatet" so users scan three short sections instead of one
// long list. Reads from lib/scan-faqs.ts so the JSON-LD schema in
// scan/page.tsx and the rendered DOM never drift.

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SCAN_FAQ_GROUPS } from "@/lib/scan-faqs";

export function HomepageFaq() {
  return (
    <section
      aria-labelledby="scan-faq-heading"
      className="mx-auto w-full max-w-[680px] px-6 py-20"
    >
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        FAQ
      </p>
      <h2
        id="scan-faq-heading"
        className="mb-12 font-serif text-[clamp(32px,5.5vw,44px)] font-normal italic leading-[1.05] tracking-tight"
      >
        Frågor du nog har
      </h2>

      {SCAN_FAQ_GROUPS.map((group, gi) => (
        <div key={group.id} className="mb-10 last:mb-0">
          <div className="mb-4 flex items-baseline gap-2">
            <span aria-hidden className="font-serif text-base text-foreground/40">
              {group.glyph}
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {group.label}
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {group.questions.map((faq, idx) => (
              <AccordionItem
                key={faq.q}
                value={`scan-faq-${gi}-${idx}`}
                className="border-b border-border/40 last:border-b-0"
              >
                <AccordionTrigger className="group py-5 text-left font-serif text-[19px] font-normal leading-snug tracking-tight hover:no-underline data-[state=open]:text-foreground [&_svg]:text-foreground/50">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 pr-8 text-[15px] leading-[1.65] text-foreground/75">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </section>
  );
}
