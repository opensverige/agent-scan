// app/integritetspolicy/_components/PrivacyContent.tsx
"use client";

import Link from "next/link";
import { useLang } from "@/lib/language-context";

export default function PrivacyContent() {
  const { t } = useLang();
  return (
    <main className="mx-auto max-w-[680px] px-6 py-14">
      <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-4">
        {t.privacy.lastUpdated.toUpperCase()}
      </p>
      <h1 className="font-serif text-[clamp(32px,6vw,52px)] font-normal leading-[1.05] tracking-[-1.5px] mb-6">
        {t.privacy.title}
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed mb-10">
        {t.privacy.intro}
      </p>
      <div className="space-y-8">
        {t.privacy.sections.map((s) => (
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
          href="/scan"
          className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t.privacy.backLink}
        </Link>
      </div>
    </main>
  );
}
