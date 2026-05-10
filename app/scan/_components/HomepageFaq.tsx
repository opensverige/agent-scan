// app/scan/_components/HomepageFaq.tsx
//
// Visible FAQ accordion below the live counter. Reads from
// lib/scan-faqs.ts so the FAQPage JSON-LD schema in scan/page.tsx and
// the rendered DOM share a single source. Built on shadcn Accordion
// (Radix primitives). Single-open, collapsible.

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SCAN_FAQS } from "@/lib/scan-faqs";

export function HomepageFaq() {
  return (
    <section
      aria-labelledby="scan-faq-heading"
      className="mx-auto w-full max-w-[640px] px-6 py-16"
    >
      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Frequently asked
      </p>
      <h2
        id="scan-faq-heading"
        className="mb-8 font-serif text-[clamp(28px,5vw,40px)] font-normal leading-tight tracking-tight"
      >
        Vanliga frågor
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {SCAN_FAQS.map((faq, idx) => (
          <AccordionItem key={faq.q} value={`scan-faq-${idx}`}>
            <AccordionTrigger className="text-left text-base leading-snug">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-foreground/80">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
