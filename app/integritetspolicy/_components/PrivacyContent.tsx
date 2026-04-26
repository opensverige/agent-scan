// app/integritetspolicy/_components/PrivacyContent.tsx
"use client";

import LegalDocument from "../../legal/_components/LegalDocument";
import { useLang } from "@/lib/language-context";

export default function PrivacyContent() {
  const { t } = useLang();
  return (
    <LegalDocument
      title={t.privacy.title}
      lastUpdated={t.privacy.lastUpdated}
      intro={t.privacy.intro}
      sections={t.privacy.sections}
      backLink={t.privacy.backLink}
      backHref="/scan"
    />
  );
}
