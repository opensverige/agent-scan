// app/scan/_components/CTA.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/language-context";

export default function CTA() {
  const { t } = useLang();

  function handleShare() {
    const url = "https://agent.opensverige.se/scan";
    const text =
      "Sveriges första öppna AI-readiness scanner för företag — agent.opensverige.se";
    if (navigator.share) {
      navigator.share({ title: "agent.opensverige", text, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
    }
  }

  return (
    <section className="py-12 px-6 pb-16 text-center max-w-[480px] mx-auto">
      <div className="flex justify-center mb-6">
        <Image src="/assets/logo_500x.png" alt="" width={80} height={80} className="rounded-md" aria-hidden="true" />
      </div>
      <h2 className="font-serif text-[clamp(24px,5vw,36px)] font-normal leading-[1.15] tracking-[-0.5px] mb-2">
        {t.cta.heading1}
        <br />
        {t.cta.heading2}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {t.cta.subtext}
      </p>
      <Button asChild size="lg" className="shadow-[0_4px_20px_hsl(var(--primary)/0.1)]">
        <a href="https://discord.gg/CSphbTk8En">{t.cta.discordBtn}</a>
      </Button>
      <div className="mt-4">
        <button
          type="button"
          onClick={handleShare}
          className="text-xs font-semibold text-primary bg-transparent border-none cursor-pointer underline underline-offset-2 min-h-[44px] inline-flex items-center"
        >
          {t.cta.shareBtn}
        </button>
      </div>
    </section>
  );
}
