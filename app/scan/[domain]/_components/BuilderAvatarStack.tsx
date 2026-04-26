// app/scan/[domain]/_components/BuilderAvatarStack.tsx
"use client";

import { cn } from "@/lib/utils";

// TODO(stage-0-cleanup): replace with actual community builder avatars (or remove entirely).
// Using random faces from randomuser.me as "community builders" is misrepresentation —
// see docs/strategy/CHECKLIST.md Stage 0 cleanup item.
const BUILDER_AVATAR_URLS = [
  "https://randomuser.me/api/portraits/women/65.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
] as const;

/**
 * Avatar stack shown under the booking CTA. Visual social proof.
 * Border colour adapts to urgency (high = light on dark BG, others = neutral).
 */
export function BuilderAvatarStack({ urgency, label }: { urgency: "high" | "medium" | "low"; label: string }) {
  return (
    <div className="mt-4 flex justify-center" role="img" aria-label={label}>
      <div className="flex items-center">
        {BUILDER_AVATAR_URLS.map((src, i) => (
          <span
            key={src}
            className={cn(
              "relative inline-block h-10 w-10 overflow-hidden rounded-full border-2 bg-muted shadow-sm",
              urgency === "high" ? "border-background" : "border-border",
              i > 0 && "-ml-3",
            )}
            style={{ zIndex: i + 1 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" width={40} height={40} className="h-full w-full object-cover" loading="lazy" decoding="async" />
          </span>
        ))}
      </div>
    </div>
  );
}
