// app/legal/_components/LegalDocument.tsx
"use client";

import Link from "next/link";

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: ReadonlyArray<LegalSection>;
  backLink: string;
  backHref?: string;
}

/**
 * Shared layout for legal pages (privacy, terms, AUP, AI disclosure,
 * subprocessors). Pure presentation — content comes from i18n.
 */
export default function LegalDocument({
  title,
  lastUpdated,
  intro,
  sections,
  backLink,
  backHref = "/integritetspolicy",
}: LegalDocumentProps) {
  return (
    <main className="mx-auto max-w-[680px] px-6 py-14">
      <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-4">
        {lastUpdated.toUpperCase()}
      </p>
      <h1 className="font-serif text-[clamp(32px,6vw,52px)] font-normal leading-[1.05] tracking-[-1.5px] mb-6">
        {title}
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed mb-10">
        {intro}
      </p>
      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-serif text-[22px] font-normal tracking-[-0.5px] mb-2">
              {s.heading}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {s.body}
            </p>
          </section>
        ))}
      </div>
      <div className="mt-12">
        <Link
          href={backHref}
          className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {backLink}
        </Link>
      </div>
    </main>
  );
}
