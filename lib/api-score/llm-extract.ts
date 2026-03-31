// lib/api-score/llm-extract.ts — LLM-based signal extraction via Claude tool use

export interface LLMApiSignals {
  authMethods: string[];       // e.g. ["oauth2", "api_key", "bearer"]
  hasM2MAuth: boolean;         // client_credentials / service account
  hasTokenRefresh: boolean;
  hasRateLimits: boolean;
  hasSandbox: boolean;
  hasWebhooks: boolean;
  hasErrorCodes: boolean;
  hasRetry: boolean;
  hasChangelog: boolean;
  hasStatusPage: boolean;
  lastUpdatedYear: number | null;
  hasCodeExamples: boolean;
  openApiSpecUrl: string | null;
}

const TOOL_SCHEMA = {
  name: "extract_api_signals",
  description:
    "Extract API capability signals from developer documentation. " +
    "Only mark a signal true when you see clear, direct evidence — a specific keyword, " +
    "code block, or explicit description. Do not infer from vague context. " +
    "The docs may be in Swedish or English.",
  input_schema: {
    type: "object",
    properties: {
      authMethods: {
        type: "array",
        items: { type: "string" },
        description:
          "Auth methods explicitly documented. Allowed values: oauth2, api_key, bearer, jwt, basic, hmac. " +
          "Include oauth2 if you see OAuth, OAuth2, authorization_code, or client_credentials.",
      },
      hasM2MAuth: {
        type: "boolean",
        description:
          "True only if service-to-service auth is explicitly documented: " +
          "client_credentials flow, service account, M2M, server-to-server, or API key for automated systems.",
      },
      hasTokenRefresh: {
        type: "boolean",
        description: "True if token refresh, refresh_token, or token renewal is explicitly described.",
      },
      hasRateLimits: {
        type: "boolean",
        description:
          "True if rate limits, request throttling, quotas, or requests-per-second/minute/hour are documented.",
      },
      hasSandbox: {
        type: "boolean",
        description:
          "True if a sandbox, test environment, staging environment, demo account, " +
          "test companies (testbolag), or test credentials are explicitly offered.",
      },
      hasWebhooks: {
        type: "boolean",
        description: "True if webhooks, event callbacks, or push notifications are documented.",
      },
      hasErrorCodes: {
        type: "boolean",
        description:
          "True if HTTP 4xx or 5xx error codes are listed, or specific error messages/codes are described.",
      },
      hasRetry: {
        type: "boolean",
        description:
          "True if retry guidance, idempotency, Retry-After header, or retry-safe operations are mentioned.",
      },
      hasChangelog: {
        type: "boolean",
        description: "True if a changelog, release notes, version history, or breaking changes log exists.",
      },
      hasStatusPage: {
        type: "boolean",
        description: "True if a status page, uptime page, or system health dashboard is linked or mentioned.",
      },
      lastUpdatedYear: {
        type: ["integer", "null"],
        description:
          "The most recent 4-digit year (e.g. 2024) found anywhere in the docs indicating a real update, or null.",
      },
      hasCodeExamples: {
        type: "boolean",
        description:
          "True if there are curl commands, code snippets, SDK examples, or sample request/response payloads.",
      },
      openApiSpecUrl: {
        type: ["string", "null"],
        description:
          "Full URL to an OpenAPI or Swagger spec file if explicitly linked (e.g. /openapi.json, /swagger.yaml), or null.",
      },
    },
    required: [
      "authMethods", "hasM2MAuth", "hasTokenRefresh", "hasRateLimits",
      "hasSandbox", "hasWebhooks", "hasErrorCodes", "hasRetry",
      "hasChangelog", "hasStatusPage", "lastUpdatedYear",
      "hasCodeExamples", "openApiSpecUrl",
    ],
  },
};

function buildPrompt(docsContent: string, specContext?: string): string {
  const parts: string[] = [];
  if (specContext) {
    parts.push(`## OpenAPI spec (may be partial or truncated)\n\n${specContext.slice(0, 5_000)}`);
  }
  parts.push(`## Developer documentation\n\n${docsContent.slice(0, specContext ? 30_000 : 40_000)}`);
  return `Extract API capability signals from the following content:\n\n${parts.join("\n\n---\n\n")}`;
}

export async function extractApiSignals(
  docsContent: string,
  apiKey: string,
  specContext?: string,
): Promise<LLMApiSignals | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "tool", name: "extract_api_signals" },
        messages: [{ role: "user", content: buildPrompt(docsContent, specContext) }],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return null;

    const data = await res.json() as {
      content?: Array<{ type: string; name?: string; input?: unknown }>;
    };

    const toolUse = data.content?.find(
      (c) => c.type === "tool_use" && c.name === "extract_api_signals",
    );
    if (!toolUse?.input) return null;

    // Sanitize — Claude may return partial or malformed shapes
    const raw = toolUse.input as Record<string, unknown>;
    return {
      authMethods: Array.isArray(raw.authMethods) ? (raw.authMethods as string[]) : [],
      hasM2MAuth: raw.hasM2MAuth === true,
      hasTokenRefresh: raw.hasTokenRefresh === true,
      hasRateLimits: raw.hasRateLimits === true,
      hasSandbox: raw.hasSandbox === true,
      hasWebhooks: raw.hasWebhooks === true,
      hasErrorCodes: raw.hasErrorCodes === true,
      hasRetry: raw.hasRetry === true,
      hasChangelog: raw.hasChangelog === true,
      hasStatusPage: raw.hasStatusPage === true,
      lastUpdatedYear: typeof raw.lastUpdatedYear === "number" ? raw.lastUpdatedYear : null,
      hasCodeExamples: raw.hasCodeExamples === true,
      openApiSpecUrl: typeof raw.openApiSpecUrl === "string" ? raw.openApiSpecUrl : null,
    };
  } catch {
    return null;
  }
}
