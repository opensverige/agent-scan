// app/legal/aup/_components/AupContent.tsx
"use client";

import LegalDocument from "../../_components/LegalDocument";
import { useLang } from "@/lib/language-context";

export default function AupContent() {
  const { t } = useLang();
  return (
    <LegalDocument
      title={t.aup.title}
      lastUpdated={t.aup.lastUpdated}
      intro={t.aup.intro}
      sections={t.aup.sections}
      backLink={t.aup.backLink}
    />
  );
}
