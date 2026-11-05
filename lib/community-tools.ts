// lib/community-tools.ts
//
// Free, open-source tools built in the OpenSverige community, shown on
// /verktyg and as a next step in /synlighet results.
//
// The only bar for a listing: an OSI-approved licence in the repository and
// free to use. "Free" alone is not enough: a repo without a LICENSE file is
// all rights reserved, so it waits until the author adds one.
//
// Every claim here must be checkable on the tool's own site or README. Do not
// add usage numbers or quality claims we have not verified.

export interface CommunityTool {
  id: string;
  name: string;
  /** One sentence, Swedish: what it checks. */
  checks: string;
  /** One sentence, Swedish: who it is for. */
  forWho: string;
  /** How you start it, as shown to the reader. */
  start: string;
  licence: string;
  url: string;
  repo: string;
  /** Short Swedish facts shown as tags. */
  tags: string[];
}

export const COMMUNITY_TOOLS: CommunityTool[] = [
  {
    id: "openaudit",
    name: "openaudit",
    checks:
      "Granskar kod och sajt: säkerhetshål, läckta nycklar, långsamma sidor, tillgänglighet och beroenden.",
    forWho: "För dig som bygger sajten eller appen själv, gärna med AI.",
    start: "Klistra in en mening i Claude Code, Cursor, Codex eller Copilot.",
    licence: "MIT",
    url: "https://openaudit.se",
    repo: "https://github.com/wezter96/openaudit",
    tags: ["Gratis", "Körs på din dator", "Ingen inloggning"],
  },
  {
    id: "nackensec-scan",
    name: "NäckenSec Scan",
    checks:
      "Skannar AI-agenter och skills efter personnummer, bankuppgifter, hemligheter och EU AI Act-risker.",
    forWho: "För dig som bygger AI-agenter som hanterar svenska persondata.",
    start: "Installera med pip och kör nackensec-scan mot agentens mapp.",
    licence: "AGPL-3.0",
    url: "https://github.com/opensverige/nackenScan#readme",
    repo: "https://github.com/opensverige/nackenScan",
    tags: ["Gratis", "Körs på din dator", "Svenska fynd"],
  },
];

export function toolById(id: string): CommunityTool | undefined {
  return COMMUNITY_TOOLS.find(t => t.id === id);
}
