// lib/methodology/types.ts
//
// Shape of every methodology article. The .md frontmatter must match
// MethodologyFrontmatter exactly. Loader rejects files that don't.

import type { CheckId, CheckCategory, CheckSeverity } from "../checks";

export interface PrimarySource {
  title: string;
  url: string;
  publisher: string;
  /**
   * true = official spec, RFC, regulator document, or first-party vendor docs.
   * false = community blog post, secondary source. We only render `primary: true`
   * sources in the article footer; secondary sources go inline.
   */
  primary: boolean;
}

export interface MethodologyFrontmatter {
  checkId: CheckId;
  slug: string;
  category: CheckCategory;
  severity: CheckSeverity;
  title: string;
  titleSv?: string;
  citableLead: string;
  citableLeadSv?: string;
  agentImpact: string;
  primarySources: PrimarySource[];
  relatedChecks: CheckId[];
  lastUpdated: string;
  tokenEstimate: number;
}

export interface MethodologyArticle {
  frontmatter: MethodologyFrontmatter;
  /** Raw markdown body, post-frontmatter. This is what we serve to AI agents. */
  body: string;
}

export interface MethodologyIndexEntry {
  slug: string;
  title: string;
  titleSv?: string;
  category: CheckCategory;
  severity: CheckSeverity;
  citableLead: string;
  tokenEstimate: number;
  lastUpdated: string;
}
