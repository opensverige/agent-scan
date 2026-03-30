// lib/api-score/parse-spec.ts

export interface ParsedSpec {
  spec: Record<string, unknown>;
  format: "openapi3" | "swagger";
}

export interface Operation {
  path: string;
  method: string;
  operationId?: string;
  description?: string;
  summary?: string;
  parameters?: Parameter[];
  requestBody?: unknown;
  responses?: Record<string, unknown>;
  tags?: string[];
  security?: unknown[];
}

export interface Parameter {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  schema?: { type?: string; enum?: unknown[]; minimum?: number; maximum?: number };
  type?: string;        // Swagger 2.0
  enum?: unknown[];     // Swagger 2.0
}

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete"]);

export async function parseSpec(raw: string): Promise<ParsedSpec | null> {
  // Try JSON first (most common)
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.openapi || parsed.swagger) {
      return { spec: parsed, format: parsed.openapi ? "openapi3" : "swagger" };
    }
  } catch {}

  // Try YAML
  try {
    const { load } = await import("js-yaml");
    const parsed = load(raw) as Record<string, unknown>;
    if (parsed?.openapi || parsed?.swagger) {
      return { spec: parsed, format: parsed.openapi ? "openapi3" : "swagger" };
    }
  } catch {}

  return null;
}

export function getAllOperations(spec: Record<string, unknown>): Operation[] {
  const ops: Operation[] = [];
  const paths = (spec.paths ?? {}) as Record<string, Record<string, unknown>>;
  for (const [path, methods] of Object.entries(paths)) {
    if (!methods || typeof methods !== "object") continue;
    for (const [method, op] of Object.entries(methods)) {
      if (!HTTP_METHODS.has(method)) continue;
      if (!op || typeof op !== "object") continue;
      ops.push({ path, method, ...(op as Omit<Operation, "path" | "method">) });
    }
  }
  return ops;
}

export function getAllSchemas(spec: Record<string, unknown>): Record<string, unknown> {
  // OpenAPI 3
  const components = spec.components as Record<string, unknown> | undefined;
  if (components?.schemas) return components.schemas as Record<string, unknown>;
  // Swagger 2
  if (spec.definitions) return spec.definitions as Record<string, unknown>;
  return {};
}

export function getAllParams(spec: Record<string, unknown>): Parameter[] {
  return getAllOperations(spec).flatMap(op => (op.parameters ?? []) as Parameter[]);
}

export function pct(count: number, total: number): number {
  return total === 0 ? 0 : count / total;
}
