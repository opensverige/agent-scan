// app/scan/_components/Footer.tsx
"use client";

import Link from "next/link";
import { useLang } from "@/lib/language-context";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="px-6 py-4 border-t border-border font-mono text-[10px] text-muted-foreground">
      {/* Credits row — small but distinct, primary-tinted names */}
      <div className="flex items-center justify-center gap-3 flex-wrap mb-3">
        <span className="uppercase tracking-widest">{t.footer.builtBy}</span>
        <a
          href="https://www.linkedin.com/in/gustafgarnow/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-primary transition-colors"
        >
          Gustaf Garnow ↗
        </a>
        <span aria-hidden className="opacity-60">·</span>
        <a
          href="https://www.linkedin.com/in/felipe-otarola/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-primary transition-colors"
        >
          Felipe Otarola ↗
        </a>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-2">
        <span>agent.opensverige.se</span>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <Link
            href="/integritetspolicy"
            className="hover:text-foreground transition-colors"
          >
            {t.footer.privacy}
          </Link>
          <Link
            href="/legal/terms"
            className="hover:text-foreground transition-colors"
          >
            {t.terms.title}
          </Link>
          <Link
            href="/legal/aup"
            className="hover:text-foreground transition-colors"
          >
            {t.aup.title}
          </Link>
          <Link
            href="/legal/ai-disclosure"
            className="hover:text-foreground transition-colors"
          >
            {t.aiDisclosure.title}
          </Link>
          <Link
            href="/legal/subprocessors"
            className="hover:text-foreground transition-colors"
          >
            {t.subprocessors.title}
          </Link>
          <span>{t.footer.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
