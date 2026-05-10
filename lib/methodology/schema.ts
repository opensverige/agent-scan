// lib/methodology/schema.ts
//
// JSON-LD generators for methodology articles. Three schemas per article:
// - TechArticle (the canonical type for technical reference content)
// - HowTo (parsed from the body's "## How to fix" → "### Step N" structure)
// - BreadcrumbList (navigation context)
//
// All schemas reference the canonical Organization @id at
// https://opensverige.se/#organization so AI Knowledge Graph collapses
// these into our parent entity.

import type { MethodologyArticle, MethodologyIndexEntry } from "./types";

const SITE = "https://agent.opensverige.se";
const ORG_ID = "https://opensverige.se/#organization";

export function buildTechArticleSchema(article: MethodologyArticle) {
  const url = `${SITE}/methodology/${article.frontmatter.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: article.frontmatter.title,
    alternativeHeadline: article.frontmatter.titleSv,
    name: article.frontmatter.title,
    description: article.frontmatter.citableLead,
    url,
    mainEntityOfPage: url,
    inLanguage: ["en-US", ...(article.frontmatter.titleSv ? ["sv-SE"] : [])],
    datePublished: article.frontmatter.lastUpdated,
    dateModified: article.frontmatter.lastUpdated,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isAccessibleForFree: true,
    license: "https://github.com/opensverige/agent-scan/blob/main/LICENSE",
    proficiencyLevel: "Expert",
    keywords: [
      article.frontmatter.checkId,
      article.frontmatter.category,
      ...article.frontmatter.relatedChecks,
      "AI agent",
      "EU AI Act",
      "Agentic Engine Optimization",
    ],
    citation: article.frontmatter.primarySources
      .filter((s) => s.primary)
      .map((s) => ({
        "@type": "CreativeWork",
        name: s.title,
        url: s.url,
        publisher: s.publisher,
      })),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-citable-lead]", "[data-agent-impact]"],
    },
    about: {
      "@type": "Thing",
      name: `agent.opensverige check ${article.frontmatter.checkId}`,
      identifier: article.frontmatter.checkId,
    },
  };
}

export function buildHowToSchema(article: MethodologyArticle) {
  const steps = parseHowToSteps(article.body);
  if (steps.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${SITE}/methodology/${article.frontmatter.slug}#howto`,
    name: `How to fix ${article.frontmatter.checkId}`,
    description: article.frontmatter.citableLead,
    inLanguage: "en-US",
    totalTime: "PT30M",
    step: steps.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: step.name,
      text: step.text,
      url: `${SITE}/methodology/${article.frontmatter.slug}#step-${idx + 1}`,
    })),
  };
}

export function buildBreadcrumbSchema(article: MethodologyArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "agent.opensverige",
        item: SITE,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Methodology",
        item: `${SITE}/methodology`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.frontmatter.title,
        item: `${SITE}/methodology/${article.frontmatter.slug}`,
      },
    ],
  };
}

export function buildHubCollectionSchema(entries: MethodologyIndexEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE}/methodology#collection`,
    name: "agent.opensverige methodology",
    description:
      "Per-check deep-dives behind every signal the agent.opensverige.se EU-jurisdiction AI-readiness scanner measures. Authoritative reference for builders and AI agents.",
    url: `${SITE}/methodology`,
    inLanguage: ["en-US", "sv-SE"],
    isPartOf: { "@id": `${SITE}/#website` },
    publisher: { "@id": ORG_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: entries.length,
      itemListElement: entries.map((e, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE}/methodology/${e.slug}`,
        name: e.title,
      })),
    },
  };
}

/**
 * Parse the HowTo steps out of the markdown body. We look for the
 * "## How to fix" heading then collect every "### Step N: <name>"
 * sub-heading and the prose under it. Stops at the next H2.
 */
function parseHowToSteps(body: string): { name: string; text: string }[] {
  const lines = body.split("\n");
  const steps: { name: string; text: string }[] = [];

  let inHowTo = false;
  let currentName: string | null = null;
  let currentBuffer: string[] = [];

  const flush = () => {
    if (currentName !== null) {
      steps.push({
        name: currentName,
        text: currentBuffer.join("\n").trim().slice(0, 500),
      });
    }
    currentName = null;
    currentBuffer = [];
  };

  for (const line of lines) {
    if (/^##\s+How to fix/i.test(line)) {
      inHowTo = true;
      continue;
    }
    if (inHowTo && /^##\s+/.test(line)) {
      flush();
      inHowTo = false;
      continue;
    }
    if (!inHowTo) continue;

    const stepMatch = line.match(/^###\s+(?:Step\s+\d+[:\.]?\s*)?(.+)$/i);
    if (stepMatch) {
      flush();
      currentName = stepMatch[1].trim();
      continue;
    }

    if (currentName !== null) currentBuffer.push(line);
  }

  flush();
  return steps;
}
