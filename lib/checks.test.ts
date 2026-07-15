// lib/checks.test.ts

import { describe, expect, it } from "vitest";
import { checkMcpWellKnown } from "./checks";

function probe(body: string) {
  return { status: 200, body, contentType: "application/json" };
}

describe("checkMcpWellKnown", () => {
  it("passes on the SEP-1960 draft shape (mcp_version + endpoints)", () => {
    const result = checkMcpWellKnown(probe(JSON.stringify({
      mcp_version: "2026-07-28",
      endpoints: [{ url: "https://example.se/mcp" }],
    })));
    expect(result.pass).toBe(true);
  });

  it("passes on the modelcontextprotocol.io well-known v1 shape (name + version)", () => {
    const result = checkMcpWellKnown(probe(JSON.stringify({
      $schema: "https://modelcontextprotocol.io/schema/well-known/v1.json",
      name: "example-mcp",
      version: "1.0.0",
    })));
    expect(result.pass).toBe(true);
  });

  it("fails on JSON that matches neither manifest shape", () => {
    const result = checkMcpWellKnown(probe(JSON.stringify({ hello: "world" })));
    expect(result.pass).toBe(false);
  });

  it("fails on invalid JSON", () => {
    const result = checkMcpWellKnown(probe("<!doctype html>"));
    expect(result.pass).toBe(false);
  });

  it("fails with a recommendation when the manifest is missing", () => {
    const result = checkMcpWellKnown(null);
    expect(result.pass).toBe(false);
    expect(result.recommendation).toBe(true);
  });
});
