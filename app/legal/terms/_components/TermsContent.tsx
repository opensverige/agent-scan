// app/legal/terms/_components/TermsContent.tsx
"use client";

import LegalDocument from "../../_components/LegalDocument";
import { useLang } from "@/lib/language-context";

export default function TermsContent() {
  const { t } = useLang();
  return (
    <LegalDocument
      title={t.terms.title}
      lastUpdated={t.terms.lastUpdated}
      intro={t.terms.intro}
      sections={t.terms.sections}
      backLink={t.terms.backLink}
    />
  );
}
