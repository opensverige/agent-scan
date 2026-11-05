// lib/scan/ai-bots.test.ts

import { describe, expect, it } from "vitest";
import {
  evaluateRobotsForBots,
  isPathAllowed,
  parseRobotsGroups,
  summarizeByPurpose,
} from "./ai-bots";

function verdictFor(robots: string, token: string) {
  const v = evaluateRobotsForBots(robots).find(x => x.bot.token === token);
  if (!v) throw new Error(`no bot ${token}`);
  return v;
}

describe("parseRobotsGroups", () => {
  it("groups consecutive user-agent lines and their rules", () => {
    const groups = parseRobotsGroups([
      "User-agent: GPTBot",
      "User-agent: CCBot",
      "Disallow: /",
      "",
      "User-agent: *",
      "Allow: /",
    ].join("\n"));
    expect(groups).toHaveLength(2);
    expect(groups[0].agents).toEqual(["gptbot", "ccbot"]);
    expect(groups[0].rules).toEqual([{ allow: false, pattern: "/" }]);
  });

  it("ignores comments and an empty Disallow", () => {
    const groups = parseRobotsGroups("User-agent: * # everyone\nDisallow:\n");
    expect(groups[0].rules).toEqual([]);
  });
});

describe("isPathAllowed", () => {
  it("allows everything when there is no robots.txt", () => {
    expect(isPathAllowed([], "OAI-SearchBot")).toBe(true);
  });

  it("falls back to the * group when the bot has no group", () => {
    const groups = parseRobotsGroups("User-agent: *\nDisallow: /");
    expect(isPathAllowed(groups, "OAI-SearchBot")).toBe(false);
  });

  it("uses the specific group instead of * when one exists", () => {
    const groups = parseRobotsGroups("User-agent: *\nDisallow: /\n\nUser-agent: OAI-SearchBot\nAllow: /");
    expect(isPathAllowed(groups, "OAI-SearchBot")).toBe(true);
  });

  it("lets the longest match win and Allow win ties", () => {
    const groups = parseRobotsGroups("User-agent: *\nDisallow: /private\nAllow: /");
    expect(isPathAllowed(groups, "x", "/")).toBe(true);
    expect(isPathAllowed(groups, "x", "/private/a")).toBe(false);
    const tie = parseRobotsGroups("User-agent: *\nDisallow: /a\nAllow: /a");
    expect(isPathAllowed(tie, "x", "/a")).toBe(true);
  });

  it("supports * and $ in patterns", () => {
    const groups = parseRobotsGroups("User-agent: *\nDisallow: /*.pdf$");
    expect(isPathAllowed(groups, "x", "/file.pdf")).toBe(false);
    expect(isPathAllowed(groups, "x", "/file.pdf?x=1")).toBe(true);
    expect(isPathAllowed(groups, "x", "/")).toBe(true);
  });
});

describe("evaluateRobotsForBots", () => {
  it("does not penalise a site that only blocks training crawlers", () => {
    const robots = [
      "User-agent: GPTBot",
      "User-agent: CCBot",
      "User-agent: Google-Extended",
      "User-agent: ClaudeBot",
      "Disallow: /",
      "",
      "User-agent: *",
      "Allow: /",
    ].join("\n");
    const summary = summarizeByPurpose(evaluateRobotsForBots(robots));
    expect(summary.training.blocked.map(b => b.token)).toEqual(
      expect.arrayContaining(["GPTBot", "CCBot", "Google-Extended", "ClaudeBot"]),
    );
    expect(summary.search.blocked).toEqual([]);
    expect(summary.user.blocked).toEqual([]);
  });

  it("flags a site that blocks the search bots that feed AI answers", () => {
    const robots = "User-agent: OAI-SearchBot\nUser-agent: PerplexityBot\nDisallow: /";
    expect(verdictFor(robots, "OAI-SearchBot").allowed).toBe(false);
    expect(verdictFor(robots, "OAI-SearchBot").explicit).toBe(true);
    expect(verdictFor(robots, "PerplexityBot").allowed).toBe(false);
    expect(verdictFor(robots, "Googlebot").allowed).toBe(true);
  });

  it("matches tokens case-insensitively", () => {
    expect(verdictFor("user-agent: oai-searchbot\ndisallow: /", "OAI-SearchBot").allowed).toBe(false);
  });

  it("treats a missing robots.txt as allow-all", () => {
    expect(evaluateRobotsForBots(null).every(v => v.allowed)).toBe(true);
  });
});
