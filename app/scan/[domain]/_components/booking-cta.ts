// app/scan/[domain]/_components/booking-cta.ts
//
// Selects the right CTA copy (headline + subtext) based on which tab is active
// and how well (or poorly) the site scored. The action is always the same:
// join the Discord community and talk to other builders. Pure utility — no React.

import type { ApiScoreResult } from "@/lib/api-score";
import type { Translations } from "@/lib/i18n";

export interface BookingCTAResult {
  headline: string;
  subtext: string;
  buttonText: string;
  urgency: "high" | "medium" | "low";
}

/**
 * Pick CTA emphasis (headline + subtext + urgency styling) based on:
 *  - API tab + low score (< 30) → high urgency
 *  - API tab + decent score → medium urgency
 *  - Site tab + score <= 3 → high urgency
 *  - Site tab + score 4-6 → medium
 *  - Site tab + score 7+ → low (you're already ahead)
 * The button always points to Discord.
 */
export function getBookingCTA(
  activeTab: "sajt" | "api",
  siteScore: number,
  apiScore: ApiScoreResult | null | undefined,
  domain: string,
  tr: Translations["results"],
): BookingCTAResult {
  if (activeTab === "api" && apiScore) {
    if (apiScore.totalScore < 30) {
      return {
        headline: tr.ctaHighApiHeadline,
        subtext: tr.ctaHighApiSubtext(domain),
        buttonText: tr.ctaDiscord,
        urgency: "high",
      };
    }
    return {
      headline: tr.ctaMedApiHeadline,
      subtext: tr.ctaMedApiSubtext(domain),
      buttonText: tr.ctaDiscord,
      urgency: "medium",
    };
  }
  if (siteScore <= 3) {
    return {
      headline: tr.ctaHighSiteHeadline,
      subtext: tr.ctaHighSiteSubtext(domain),
      buttonText: tr.ctaDiscord,
      urgency: "high",
    };
  }
  if (siteScore <= 6) {
    return {
      headline: tr.ctaMedSiteHeadline,
      subtext: tr.ctaMedSiteSubtext(domain),
      buttonText: tr.ctaDiscord,
      urgency: "medium",
    };
  }
  return {
    headline: tr.ctaLowHeadline,
    subtext: tr.ctaLowSubtext(domain),
    buttonText: tr.ctaDiscord,
    urgency: "low",
  };
}

/**
 * Determine which plan steps get a priority badge.
 * Top N critical steps get "high", next M important steps get "medium", rest get null.
 */
export function getStepPriority(i: number, criticalCount: number, importantCount: number): "high" | "medium" | null {
  if (criticalCount > 0 && i < Math.min(criticalCount, 3)) return "high";
  if (importantCount > 0 && i < criticalCount + Math.min(importantCount, 2)) return "medium";
  return null;
}
