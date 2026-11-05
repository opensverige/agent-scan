// lib/visibility/anthropic.ts
//
// Minimal Messages API client for the AI-visibility check. Raw fetch, same as
// lib/claude.ts: the repo has no Anthropic SDK dependency and AGENTS.md asks
// for confirmation before adding deps.
//
// Model: VISIBILITY_MODEL env, default claude-opus-5-5 at low effort. Low
// effort keeps latency and cost down for chat-style answers. Switch to a
// cheaper model via the env var if spend matters more than answer quality.

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

export const VISIBILITY_MODEL = process.env.VISIBILITY_MODEL || "claude-opus-5-5";

export interface Citation {
  type: string;
  url?: string;
  title?: string;
  cited_text?: string;
}

export interface TextBlock {
  type: "text";
  text: string;
  citations?: Citation[] | null;
}

export interface WebSearchResult {
  type: "web_search_result";
  url: string;
  title?: string;
}

export interface WebSearchToolResultBlock {
  type: "web_search_tool_result";
  content: WebSearchResult[] | { type: string; error_code?: string };
}

export interface GenericBlock {
  type: string;
  [key: string]: unknown;
}

export type ContentBlock = TextBlock | WebSearchToolResultBlock | GenericBlock;

export interface MessagesResponse {
  content: ContentBlock[];
  stop_reason: string | null;
}

interface MessageParam {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

export interface CreateMessageArgs {
  system?: string;
  messages: MessageParam[];
  maxTokens: number;
  tools?: Record<string, unknown>[];
  /** JSON schema for structured output. Not combinable with web search. */
  jsonSchema?: Record<string, unknown>;
  timeoutMs: number;
}

function isText(block: ContentBlock): block is TextBlock {
  return block.type === "text" && typeof (block as TextBlock).text === "string";
}

/** Concatenate the text blocks of a response. */
export function responseText(content: ContentBlock[]): string {
  return content.filter(isText).map(b => b.text).join("").trim();
}

/** URLs the model cited in its answer text. */
export function responseCitedSources(content: ContentBlock[]): string[] {
  const cited = new Set<string>();
  for (const block of content) {
    if (isText(block)) {
      for (const c of block.citations ?? []) if (c.url) cited.add(c.url);
    }
  }
  return [...cited];
}

/** Cited URLs, falling back to every search result URL (for display only). */
export function responseSources(content: ContentBlock[]): string[] {
  const cited = responseCitedSources(content);
  if (cited.length > 0) return cited;
  const found = new Set<string>();
  for (const block of content) {
    if (block.type !== "web_search_tool_result") continue;
    const results = (block as WebSearchToolResultBlock).content;
    if (Array.isArray(results)) for (const r of results) if (r.url) found.add(r.url);
  }
  return [...found];
}

/** Did the model run at least one web search in this response? */
export function responseSearched(content: ContentBlock[]): boolean {
  return content.some(b => b.type === "web_search_tool_result");
}

async function post(
  body: Record<string, unknown>,
  apiKey: string,
  withFallbacks: boolean,
  signal: AbortSignal,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": API_VERSION,
  };
  if (withFallbacks) headers["anthropic-beta"] = FALLBACK_BETA;
  return fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(withFallbacks ? { ...body, fallbacks: "default" } : body),
    signal,
  });
}

/**
 * Create a message. Returns null on network error, HTTP error, timeout or
 * refusal, callers degrade gracefully. Resumes `pause_turn` (server-tool
 * loop limit) up to twice.
 */
export async function createMessage(args: CreateMessageArgs): Promise<MessagesResponse | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const outputConfig: Record<string, unknown> = { effort: "low" };
  if (args.jsonSchema) outputConfig.format = { type: "json_schema", schema: args.jsonSchema };

  const messages: MessageParam[] = [...args.messages];
  const signal = AbortSignal.timeout(args.timeoutMs);
  let withFallbacks = process.env.VISIBILITY_FALLBACKS !== "off";
  const collected: ContentBlock[] = [];

  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const body: Record<string, unknown> = {
        model: VISIBILITY_MODEL,
        max_tokens: args.maxTokens,
        messages,
        output_config: outputConfig,
      };
      if (args.system) body.system = args.system;
      if (args.tools) body.tools = args.tools;

      let res = await post(body, apiKey, withFallbacks, signal);
      if (res.status === 400 && withFallbacks) {
        // Account without access to the fallback beta: retry plain once.
        const errText = await res.text().catch(() => "");
        if (/fallback/i.test(errText)) {
          withFallbacks = false;
          res = await post(body, apiKey, false, signal);
        } else {
          console.error(`[visibility] API 400: ${errText.slice(0, 300)}`);
          return null;
        }
      }
      if (res.status === 429 || res.status === 529) {
        // One short retry: a check fires ~11 answer requests at once.
        await res.text().catch(() => "");
        await new Promise(r => setTimeout(r, 1_500 + Math.random() * 1_500));
        res = await post(body, apiKey, withFallbacks, signal);
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error(`[visibility] API ${res.status}: ${errText.slice(0, 300)}`);
        return null;
      }

      const data = (await res.json()) as MessagesResponse;
      collected.push(...(data.content ?? []));
      if (data.stop_reason === "refusal") return null;
      if (data.stop_reason !== "pause_turn") {
        return { content: collected, stop_reason: data.stop_reason };
      }
      // Resume: the paused assistant turn goes back unchanged. On a second
      // pause, extend that same assistant message instead of adding another.
      const last = messages[messages.length - 1];
      if (last && last.role === "assistant" && Array.isArray(last.content)) {
        last.content = [...last.content, ...(data.content ?? [])];
      } else {
        messages.push({ role: "assistant", content: data.content ?? [] });
      }
    }
    return { content: collected, stop_reason: "pause_turn" };
  } catch (err) {
    console.error("[visibility] request failed:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

/** Parse a structured-output response into T, or null. */
export function parseJson<T>(res: MessagesResponse | null): T | null {
  if (!res || res.stop_reason === "max_tokens") return null;
  const text = responseText(res.content);
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
