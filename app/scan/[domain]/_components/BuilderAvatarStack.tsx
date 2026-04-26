// app/scan/[domain]/_components/BuilderAvatarStack.tsx
"use client";

import { cn } from "@/lib/utils";

// Neutral abstract avatars — generated as deterministic SVG circles with
// varying hues. Better than stock photos of strangers presented as community
// members (which was misleading social proof). When we have real builder
// profiles to show, replace with actual avatars + opt-in consent.
const AVATAR_COUNT = 4;
const AVATAR_HUES = [12, 34, 188, 220];

function AbstractAvatar({ hue }: { hue: number }) {
  // Each avatar is a flat-tone circle with a slightly darker inner ring —
  // visually rhythmic but explicitly non-photographic. No identity claims.
  return (
    <svg
      viewBox="0 0 40 40"
      width={40}
      height={40}
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={`avatar-grad-${hue}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 60% 70%)`} />
          <stop offset="100%" stopColor={`hsl(${hue} 50% 55%)`} />
        </linearGradient>
      </defs>
      <circle cx={20} cy={20} r={20} fill={`url(#avatar-grad-${hue})`} />
      <circle cx={20} cy={16} r={6} fill={`hsl(${hue} 55% 80%)`} opacity={0.55} />
      <path
        d="M 8 36 Q 20 22 32 36 Z"
        fill={`hsl(${hue} 55% 80%)`}
        opacity={0.45}
      />
    </svg>
  );
}

/**
 * Avatar stack shown under the booking CTA. Visual social proof.
 * Border colour adapts to urgency (high = light on dark BG, others = neutral).
 */
export function BuilderAvatarStack({ urgency, label }: { urgency: "high" | "medium" | "low"; label: string }) {
  return (
    <div className="mt-4 flex justify-center" role="img" aria-label={label}>
      <div className="flex items-center">
        {Array.from({ length: AVATAR_COUNT }, (_, i) => i).map((i) => (
          <span
            key={i}
            className={cn(
              "relative inline-block h-10 w-10 overflow-hidden rounded-full border-2 bg-muted shadow-sm",
              urgency === "high" ? "border-background" : "border-border",
              i > 0 && "-ml-3",
            )}
            style={{ zIndex: i + 1 }}
          >
            <AbstractAvatar hue={AVATAR_HUES[i]} />
          </span>
        ))}
      </div>
    </div>
  );
}
