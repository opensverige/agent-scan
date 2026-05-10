// lib/methodology/load.ts
//
// fs-based loader for methodology articles. Server-side only.
// Files live at content/methodology/<slug>.md. Frontmatter is parsed
// via gray-matter and validated against MethodologyFrontmatter.
//
// We deliberately re-read on every request in dev (Next.js caches in
// prod via Turbopack). Articles change rarely; cache misses are
// acceptable for editorial latency.

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type {
  MethodologyArticle,
  MethodologyFrontmatter,
  MethodologyIndexEntry,
} from "./types";
import type { CheckId } from "../checks";

const ARTICLES_DIR = path.join(process.cwd(), "content", "methodology");

/**
 * Read and validate a single article by slug. Returns null if the file
 * is missing or the frontmatter doesn't validate. We log the validation
 * error to stderr so authors see what's wrong without crashing the page.
 */
export async function loadArticle(
  slug: string,
): Promise<MethodologyArticle | null> {
  if (!isSafeSlug(slug)) return null;

  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const parsed = matter(raw);
  const frontmatter = validateFrontmatter(parsed.data, slug);
  if (!frontmatter) return null;

  return {
    frontmatter,
    body: parsed.content.trim(),
  };
}

/**
 * List every article that exists on disk, sorted by category then severity.
 * Skips files prefixed with `_` (templates, drafts) and any with invalid
 * frontmatter so the hub never shows a broken row.
 */
export async function listArticles(): Promise<MethodologyIndexEntry[]> {
  let files: string[];
  try {
    files = await fs.readdir(ARTICLES_DIR);
  } catch {
    return [];
  }

  const slugs = files
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => f.replace(/\.md$/, ""));

  const articles = await Promise.all(slugs.map(loadArticle));

  return articles
    .filter((a): a is MethodologyArticle => a !== null)
    .map((a) => ({
      slug: a.frontmatter.slug,
      title: a.frontmatter.title,
      titleSv: a.frontmatter.titleSv,
      category: a.frontmatter.category,
      severity: a.frontmatter.severity,
      citableLead: a.frontmatter.citableLead,
      tokenEstimate: a.frontmatter.tokenEstimate,
      lastUpdated: a.frontmatter.lastUpdated,
    }))
    .sort((a, b) => {
      const categoryOrder = { discovery: 0, compliance: 1, builder: 2 };
      const severityOrder = { critical: 0, important: 1, info: 2 };
      const c = categoryOrder[a.category] - categoryOrder[b.category];
      if (c !== 0) return c;
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
}

/** Slug must be kebab-case, lowercase, no path traversal. */
function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

const VALID_CATEGORIES = new Set(["discovery", "compliance", "builder"]);
const VALID_SEVERITIES = new Set(["critical", "important", "info"]);
const VALID_CHECK_IDS = new Set<CheckId>([
  "robots_ok",
  "sitemap_exists",
  "llms_txt",
  "privacy_automation",
  "cookie_bot_handling",
  "ai_content_marking",
  "api_exists",
  "openapi_spec",
  "api_docs",
  "mcp_server",
  "sandbox_available",
  "llms_full_txt",
  "markdown_negotiation",
  "ssr_content",
  "crawler_access",
  "mcp_well_known",
  "mcp_server_card",
]);

function validateFrontmatter(
  data: Record<string, unknown>,
  slug: string,
): MethodologyFrontmatter | null {
  const errors: string[] = [];
  const fail = (msg: string) => errors.push(msg);

  if (typeof data.checkId !== "string" || !VALID_CHECK_IDS.has(data.checkId as CheckId)) {
    fail(`checkId must be one of ${[...VALID_CHECK_IDS].join(", ")}`);
  }
  if (data.slug !== slug) fail(`slug "${data.slug}" must match filename "${slug}"`);
  if (typeof data.category !== "string" || !VALID_CATEGORIES.has(data.category)) {
    fail(`category must be discovery|compliance|builder`);
  }
  if (typeof data.severity !== "string" || !VALID_SEVERITIES.has(data.severity)) {
    fail(`severity must be critical|important|info`);
  }
  if (typeof data.title !== "string" || data.title.length === 0) fail(`title is required`);
  if (typeof data.citableLead !== "string" || data.citableLead.length < 30) {
    fail(`citableLead must be at least 30 chars`);
  }
  if (typeof data.agentImpact !== "string" || data.agentImpact.length === 0) {
    fail(`agentImpact is required`);
  }
  if (!Array.isArray(data.primarySources) || data.primarySources.length < 2) {
    fail(`primarySources must be an array with at least 2 entries`);
  }
  if (!Array.isArray(data.relatedChecks)) fail(`relatedChecks must be an array`);
  // YAML auto-parses unquoted ISO dates (`2026-05-10`) into JS Date objects.
  // Accept both forms and normalise to a string downstream.
  const normalisedLastUpdated = normaliseIsoDate(data.lastUpdated);
  if (!normalisedLastUpdated) {
    fail(`lastUpdated must be ISO date YYYY-MM-DD`);
  } else {
    data.lastUpdated = normalisedLastUpdated;
  }
  if (typeof data.tokenEstimate !== "number") fail(`tokenEstimate must be a number`);

  if (errors.length > 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[methodology] Skipping ${slug}.md:\n  ${errors.join("\n  ")}`);
    }
    return null;
  }

  return data as unknown as MethodologyFrontmatter;
}

function normaliseIsoDate(value: unknown): string | null {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  return null;
}
