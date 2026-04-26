// app/scan/[domain]/_components/constants.ts
//
// Visual constants shared across results-page sub-components.
// Pure data — no React, no client-side. Safe to import from server components
// if we ever render badges in metadata or OG images.

export const BADGE_RING = {
  green:  { ringColor: "hsl(var(--success))",    badgeVariant: "default"     as const },
  yellow: { ringColor: "#c9a55a",                 badgeVariant: "secondary"   as const },
  red:    { ringColor: "hsl(var(--destructive))", badgeVariant: "destructive" as const },
} as const;

export const API_BAND_RING: Record<string, string> = {
  agent_ready: "hsl(var(--success))",
  strong:      "hsl(var(--success))",
  dev_ready:   "#c9a55a",
  partial:     "#c9a55a",
  not_ready:   "hsl(var(--destructive))",
};

export const API_BADGE_CLASS: Record<string, string> = {
  agent_ready: "bg-success/10 text-success border-success/30",
  strong:      "bg-success/10 text-success border-success/30",
  dev_ready:   "bg-amber-50 text-amber-800 border-amber-200",
  partial:     "bg-amber-50 text-amber-800 border-amber-200",
  not_ready:   "bg-destructive/10 text-destructive border-destructive/30",
};

/** Class names for the amber stat-context box used in finding rows + report cards. */
export const CONTEXT_STAT_BOX =
  "rounded-md border border-amber-200/60 bg-amber-50 px-3 py-2.5 dark:border-amber-800/45 dark:bg-amber-950/35";
export const CONTEXT_STAT_PRIMARY = "text-xs leading-relaxed mb-1 text-amber-950 dark:text-amber-50";
export const CONTEXT_STAT_SECONDARY = "text-[11px] italic text-amber-900 dark:text-amber-200";

export const RING_R = 60;
export const RING_CIRC = Math.round(2 * Math.PI * RING_R);
