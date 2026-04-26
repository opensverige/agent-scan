// app/legal/ai-disclosure/_components/AIDisclosureContent.tsx
"use client";

import LegalDocument from "../../_components/LegalDocument";
import { useLang } from "@/lib/language-context";

export default function AIDisclosureContent() {
  const { t } = useLang();
  return (
    <LegalDocument
      title={t.aiDisclosure.title}
      lastUpdated={t.aiDisclosure.lastUpdated}
      intro={t.aiDisclosure.intro}
      sections={t.aiDisclosure.sections}
      backLink={t.aiDisclosure.backLink}
    />
  );
}
