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
    "Extract structured API capability signals from developer documentation. Be liberal — if there is any evidence for a signal, mark it true.",
  input_schema: {
    type: "object",
    properties: {
      authMethods: {
        type: "array",
        items: { type: "string" },
        description: "Auth methods found. Allowed values: oauth2, api_key, bearer, jwt, basic, hmac",
      },
      hasM2MAuth: {
        type: "boolean",
        description: "Service account, client_credentials flow, or machine-to-machine auth documented",
      },
      hasTokenRefresh: {
        type: "boolean",
        description: "Token refresh flow, refresh_token, or renew token mentioned",
      },
      hasRateLimits: {
        type: "boolean",
        description: "Rate limits, throttling, request quotas, or calls-per-second documented",
      },
      hasSandbox: {
        type: "boolean",
        description:
          "Sandbox, test environment, staging, test companies, demo accounts, or testbolag mentioned",
      },
      hasWebhooks: {
        type: "boolean",
        description: "Webhooks, event callbacks, or push notifications documented",
      },
      hasErrorCodes: {
        type: "boolean",
        description: "HTTP 4xx/5xx error codes or error descriptions present",
      },
      hasRetry: {
        type: "boolean",
        description: "Retry guidance, idempotency, Retry-After header, or retry-safe operations mentioned",
      },
      hasChangelog: {
        type: "boolean",
        description: "Changelog, release notes, version history, or API versions documented",
      },
      hasStatusPage: {
        type: "boolean",
        description: "Status page, uptime page, system health, or status link present",
      },
      lastUpdatedYear: {
        type: ["integer", "null"],
        description: "Most recent 4-digit year (e.g. 2024) found in the docs, or null if not found",
      },
      hasCodeExamples: {
        type: "boolean",
        description: "Code examples, curl commands, SDK code snippets, or sample requests present",
      },
      openApiSpecUrl: {
        type: ["string", "null"],
        description: "Full URL to an OpenAPI/Swagger spec file if explicitly linked in the docs, or null",
      },
    },
    required: [
      "authMethods", "hasM2MAuth", "hasTokenRefresh", "hasRateLimits",
      "hasSandbox", "hasWebhooks", "hasErrorCodes", "hasRetry",
      "hasChangelog", "hasStatusPage", "lastUpdatedYear",
      "hasCodeExamples", "openApiSpecUrl",
    ],
  },
} as const;

export async function extractApiSignals(
  content: string,
  apiKey: string,
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
        messages: [
          {
            role: "user",
            content: `Extract API capability signals from this developer documentation:\n\n${content.slice(0, 10_000)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) return null;

    const data = await res.json() as {
      content?: Array<{ type: string; name?: string; input?: unknown }>;
    };

    const toolUse = data.content?.find(
      (c) => c.type === "tool_use" && c.name === "extract_api_signals",
    );
    if (!toolUse?.input) return null;

    return toolUse.input as LLMApiSignals;
  } catch {
    return null;
  }
}
