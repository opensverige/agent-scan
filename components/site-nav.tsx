// components/site-nav.tsx
// Top bar for /synlighet and /verktyg.

import Image from "next/image";
import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-[100] flex items-center justify-between border-b border-border bg-background/90 px-5 py-3 backdrop-blur-[20px]">
      <Link href="/synlighet" className="flex items-center gap-2 text-foreground hover:opacity-90">
        <Image src="/assets/logo_500x.png" alt="" width={26} height={26} className="rounded-sm" />
        <span className="font-serif text-[17px] tracking-[-0.5px]">
          agent<span className="text-primary">.opensverige</span>
        </span>
      </Link>
      <div className="flex items-center gap-5 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
        <Link href="/verktyg" className="hover:text-foreground">
          Gratis verktyg
        </Link>
        {/* /scan is frozen; on narrow screens the bar only has room for one link. */}
        <Link href="/scan" className="hidden hover:text-foreground sm:inline">
          Teknisk scanner
        </Link>
      </div>
    </nav>
  );
}
