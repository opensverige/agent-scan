// app/scan/_components/IntegrationVote.tsx
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const SYSTEMS = [
  { id: "fortnox", name: "Fortnox", desc: "Fakturering, bokföring" },
  { id: "visma", name: "Visma", desc: "eEkonomi, lön" },
  { id: "bankid", name: "BankID", desc: "Identitetsverifiering" },
  { id: "skatteverket", name: "Skatteverket", desc: "Moms, deklaration" },
  { id: "bolagsverket", name: "Bolagsverket", desc: "Företagsinfo" },
  { id: "swish", name: "Swish", desc: "Betalningar" },
  { id: "bankgirot", name: "Bankgirot", desc: "Betalfiler" },
] as const;

type SystemId = (typeof SYSTEMS)[number]["id"];

const LS_COUNTS = "os_iv_counts";
const LS_USER = "os_iv_user";

const ZERO_COUNTS: Record<SystemId, number> = Object.fromEntries(
  SYSTEMS.map((s) => [s.id, 0])
) as Record<SystemId, number>;

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function IntegrationVote() {
  const [counts, setCounts] = useState<Record<SystemId, number>>(ZERO_COUNTS);
  const [userVotes, setUserVotes] = useState<Set<SystemId>>(new Set());

  useEffect(() => {
    setCounts(readLS(LS_COUNTS, ZERO_COUNTS));
    setUserVotes(new Set(readLS<SystemId[]>(LS_USER, [])));
  }, []);

  function toggle(id: SystemId) {
    const voted = userVotes.has(id);
    const newCounts = {
      ...counts,
      [id]: voted ? Math.max(0, counts[id] - 1) : counts[id] + 1,
    };
    const newUser = new Set(userVotes);
    voted ? newUser.delete(id) : newUser.add(id);

    setCounts(newCounts);
    setUserVotes(newUser);
    localStorage.setItem(LS_COUNTS, JSON.stringify(newCounts));
    localStorage.setItem(LS_USER, JSON.stringify([...newUser]));
  }

  const sorted = [...SYSTEMS]
    .map((s) => ({ ...s, count: counts[s.id] }))
    .sort((a, b) => b.count - a.count);

  const topCount = Math.max(1, sorted[0]?.count ?? 1);

  return (
    <section className="px-6 pt-16 pb-8 max-w-[580px] mx-auto">
      <div className="font-mono text-[10px] font-bold text-primary tracking-[3px] mb-1.5">
        VILKA SYSTEM BEHÖVER AGENTER?
      </div>
      <h2 className="font-serif text-[clamp(22px,4vw,30px)] font-normal tracking-[-0.3px] mb-1.5">
        Rösta. Builders bygger det som efterfrågas mest.
      </h2>
      <p className="text-[13px] text-muted-foreground mb-5">
        Klicka på systemet du använder.
      </p>

      <div className="flex flex-col gap-1.5">
        {sorted.map((sys) => {
          const voted = userVotes.has(sys.id);
          const barW = Math.max(6, Math.round((sys.count / topCount) * 100));
          return (
            <button
              key={sys.id}
              type="button"
              onClick={() => toggle(sys.id)}
              aria-pressed={voted}
              aria-label={`${voted ? "Ta bort röst för" : "Rösta för"} ${sys.name}`}
              className={cn(
                "flex items-center gap-3 bg-card rounded-xl px-3.5 py-2.5 relative overflow-hidden cursor-pointer text-left w-full min-h-[44px] border-[1.5px] transition-colors duration-200",
                voted ? "border-primary/30" : "border-border"
              )}
            >
              {/* Background bar */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 transition-[width] duration-400",
                  voted ? "bg-primary/[0.04]" : "bg-background/60"
                )}
                style={{ width: `${barW}%`, transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              />
              {/* Vote count */}
              <div
                className={cn(
                  "flex flex-col items-center min-w-[38px] z-10 relative transition-colors duration-150",
                  voted ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span className="text-[9px]">▲</span>
                <span className="font-mono text-[13px] font-extrabold">{sys.count}</span>
              </div>
              {/* Name + desc */}
              <div className="flex-1 z-10 relative">
                <div className="text-sm font-bold text-foreground">{sys.name}</div>
                <div className="text-xs text-muted-foreground">{sys.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
