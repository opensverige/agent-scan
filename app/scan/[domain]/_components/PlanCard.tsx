// app/scan/[domain]/_components/PlanCard.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PLAN_DISCORD_PHRASE = "Fråga i vår Discord";
const DISCORD_INVITE_URL = "https://discord.gg/CSphbTk8En";

/**
 * Renders plan-card text with the Discord phrase auto-linked to the community
 * invite. Used in the "Din plan" section to point builders to the Discord.
 */
function PlanCardRichText({ text }: { text: string }) {
  if (!text.includes(PLAN_DISCORD_PHRASE)) {
    return <>{text}</>;
  }
  const [before, after] = text.split(PLAN_DISCORD_PHRASE);
  return (
    <>
      {before}
      <a
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary underline decoration-primary/40 underline-offset-[3px] transition-[color,text-decoration-color] duration-200 hover:text-primary/90 hover:decoration-primary"
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {PLAN_DISCORD_PHRASE}
      </a>
      {after}
    </>
  );
}

/**
 * Numbered step in the recommendations plan. The first step (index 0) is
 * highlighted with a darker border to anchor attention. Critical/important
 * priority is shown as a coloured badge to the right.
 */
export function PlanCard({
  text,
  index,
  priority,
  labelCritical,
  labelImportant,
}: {
  text: string;
  index: number;
  priority: "high" | "medium" | null;
  labelCritical: string;
  labelImportant: string;
}) {
  return (
    <Card className={cn("transition-all", index === 0 && "border-2 border-foreground")}>
      <CardContent className="flex gap-4 items-start py-4 px-4">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-mono text-sm font-bold",
          index === 0 ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
        )}>
          {index + 1}
        </div>
        <p className="text-base font-semibold leading-relaxed flex-1 min-w-0 self-center" style={{ lineHeight: 1.6 }}>
          <PlanCardRichText text={text} />
        </p>
        {priority === "high" && (
          <Badge variant="destructive" className="text-xs shrink-0">{labelCritical}</Badge>
        )}
        {priority === "medium" && (
          <Badge className="text-xs shrink-0 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">{labelImportant}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
