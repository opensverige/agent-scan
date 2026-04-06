// app/scan/_components/Nav.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Nav() {
  return (
    <nav className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3 border-b border-border sticky top-0 bg-background/90 backdrop-blur-[20px] z-[100]">
      <div className="min-w-0" aria-hidden="true" />
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
        <Button asChild size="sm" className="h-11 bg-foreground text-background hover:bg-foreground/90 font-sans font-bold">
          <a href="https://discord.gg/CSphbTk8En">250+ builders →</a>
        </Button>
      </div>
    </nav>
  );
}
