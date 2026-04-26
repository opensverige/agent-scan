// app/scan/_components/Footer.tsx
"use client";

import Link from "next/link";
import { useLang } from "@/lib/language-context";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="px-6 py-3.5 border-t border-border flex justify-between items-center font-mono text-[10px] text-muted-foreground flex-wrap gap-2">
      <span>agent.opensverige.se</span>
      <div className="flex items-center gap-3">
        <Link
          href="/integritetspolicy"
          className="hover:text-foreground transition-colors"
        >
          {t.footer.privacy}
        </Link>
        <Link
          href="/legal/subprocessors"
          className="hover:text-foreground transition-colors"
        >
          {t.subprocessors.title}
        </Link>
        <span>{t.footer.tagline}</span>
      </div>
    </footer>
  );
}
