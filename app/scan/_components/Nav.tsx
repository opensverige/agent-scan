// app/scan/_components/Nav.tsx
"use client";

import Link from "next/link";
import { PixelDot } from "./PixelBlock";
import { Button } from "@/components/ui/button";

export default function Nav() {
  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b border-border sticky top-0 bg-background/90 backdrop-blur-[20px] z-[100]">
      <Link
        href="/scan"
        className="flex items-center gap-2 rounded-md text-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <PixelDot size={18} />
        <span className="font-serif text-[17px] tracking-[-0.5px]">
          agent<span className="text-primary">.opensverige</span>
        </span>
      </Link>
      <Button asChild size="sm" className="h-11 bg-foreground text-background hover:bg-foreground/90 font-sans font-bold">
        <a href="https://discord.gg/CSphbTk8En">250+ builders →</a>
      </Button>
    </nav>
  );
}
