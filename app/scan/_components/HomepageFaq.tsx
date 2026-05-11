// app/scan/_components/HomepageFaq.tsx
//
// Compact, serif-only homepage FAQ. Reads from lib/scan-faqs.ts so the
// JSON-LD FAQPage schema in scan/page.tsx and the rendered DOM share a
// single source. Bilingual via useLang.
//
// Earlier iterations grouped questions, used sans body type, and ate too
// much vertical space. This version is one flat accordion in Instrument
// Serif (matches the rest of the site), no glyphs, tighter rhythm.

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SCAN_FAQS } from "@/lib/scan-faqs";
import { useLang } from "@/lib/language-context";

export function HomepageFaq() {
  const { lang } = useLang();
  const isEn = lang === "en";

  return (
    <section
      aria-labelledby="scan-faq-heading"
      className="mx-auto w-full max-w-[620px] px-6 py-14"
    >
      <h2
        id="scan-faq-heading"
        className="mb-6 font-serif text-[clamp(24px,3.6vw,30px)] font-normal italic leading-tight tracking-[-0.5px]"
      >
        {isEn ? "Common questions" : "Vanliga frågor"}
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {SCAN_FAQS.map((faq, idx) => (
          <AccordionItem
            key={idx}
            value={`scan-faq-${idx}`}
            className="border-b border-border/50 last:border-b-0"
          >
            <AccordionTrigger
              className="py-3.5 text-left font-serif text-[17px] font-normal leading-snug tracking-[-0.2px] hover:no-underline data-[state=open]:text-foreground [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-muted-foreground"
            >
              {isEn ? faq.qEn : faq.q}
            </AccordionTrigger>
            <AccordionContent className="pb-4 pr-6 font-serif text-[15.5px] leading-[1.6] text-foreground/85">
              {isEn ? faq.aEn : faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
