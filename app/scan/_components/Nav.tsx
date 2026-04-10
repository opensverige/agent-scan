// app/scan/_components/Nav.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/language-context";
import type { Lang } from "@/lib/i18n";

export default function Nav() {
  const { lang, setLang, t } = useLang();

  return (
    <nav className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3 border-b border-border sticky top-0 bg-background/90 backdrop-blur-[20px] z-[100]">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={() => setLang(lang === "sv" ? "en" : "sv" as Lang)}
          className="font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded border border-border/50 hover:border-border"
          aria-label={lang === "sv" ? "Switch to English" : "Byt till svenska"}
        >
          {t.langToggle}
        </button>
      </div>
      <Link
        href="/scan"
        className="justify-self-center flex items-center gap-2 rounded-md text-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Image src="/assets/logo_500x.png" alt="agent.opensverige" width={28} height={28} className="rounded-sm" />
        <span className="font-serif text-[17px] tracking-[-0.5px]">
          agent<span className="text-primary">.opensverige</span>
        </span>
      </Link>
      <div className="flex justify-end">
        <Button asChild size="sm" className="h-7 px-2.5 text-xs bg-foreground text-background hover:bg-foreground/90 font-sans font-bold">
          <a href="https://discord.gg/CSphbTk8En">{t.nav.discord}</a>
        </Button>
      </div>
    </nav>
  );
}
