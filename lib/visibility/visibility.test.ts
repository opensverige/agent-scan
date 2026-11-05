// lib/visibility/visibility.test.ts

import { describe, expect, it } from "vitest";
import { detectMention, type QuestionResult } from "./ask";
import { finalizePlan } from "./plan";
import { buildProfile } from "./site";
import { summarize, wilson } from "./stats";
import { issuePlanToken, verifyPlanToken } from "./token";
import { guardedLookup, isBlockedAddress, safeFetch } from "./safe-fetch";
import { normalizeDomain } from "./domain";

const profile = buildProfile("ceciliasmaleri.se", {
  status: 200,
  url: "https://ceciliasmaleri.se/",
  headers: new Headers(),
  body: `<html lang="sv"><head><title>Cecilias Måleri &amp; Tapet | Göteborg</title>
    <meta name="description" content="Målerifirma i Göteborg för privatpersoner och BRF.">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"HousePainter","name":"Cecilias Måleri","address":{"addressLocality":"Göteborg"}}</script>
    <script type="application/ld+json">{"@graph":[{"@type":"LocalBusiness","name":"Cecilias Måleri AB","address":{"addressLocality":"Göteborg"}}]}</script>
    </head><body><h1>Vi målar om ditt hem</h1><script>var x = 1;</script><p>ROT-avdrag, fasta priser.</p></body></html>`,
});

describe("buildProfile", () => {
  it("extracts title, description, headings and JSON-LD org data", () => {
    expect(profile.title).toBe("Cecilias Måleri & Tapet | Göteborg");
    expect(profile.description).toContain("Målerifirma");
    expect(profile.headings).toEqual(["Vi målar om ditt hem"]);
    expect(profile.orgNames).toContain("Cecilias Måleri AB");
    expect(profile.localities).toEqual(["Göteborg"]);
    expect(profile.lang).toBe("sv");
    expect(profile.text).not.toContain("var x");
  });
});

describe("finalizePlan", () => {
  const raw = {
    company: "Cecilias Måleri",
    name_variants: ["Cecilias Måleri AB", "Cecilias"],
    offering: "målare",
    market: "Göteborg",
    facts: ["Målerifirma i Göteborg"],
    category_questions: [
      "Vilken målerifirma i Göteborg rekommenderar du för en BRF?",
      "Vad kostar det att måla om en lägenhet i Göteborg?",
      "Bästa målaren i Göteborg med ROT-avdrag?",
      "Känner du till Cecilias Måleri?",
      "Hur hittar jag en seriös målare i Göteborg?",
      "En sjätte fråga som ska kapas bort?",
    ],
  };

  it("drops branded questions and caps the count", () => {
    const plan = finalizePlan("ceciliasmaleri.se", raw, profile);
    expect(plan).not.toBeNull();
    expect(plan!.categoryQuestions).toHaveLength(5);
    expect(plan!.categoryQuestions.some(q => q.includes("Cecilias"))).toBe(false);
  });

  it("includes the domain and a distinctive domain root as name variants", () => {
    const plan = finalizePlan("ceciliasmaleri.se", raw, profile)!;
    expect(plan.nameVariants).toContain("ceciliasmaleri.se");
    expect(plan.nameVariants).toContain("ceciliasmaleri");
    expect(plan.entityQuestion).toContain("Cecilias Måleri");
  });

  it("rejects a plan with too few usable questions", () => {
    expect(finalizePlan("x.se", { ...raw, category_questions: ["kort"] }, profile)).toBeNull();
    expect(finalizePlan("x.se", null, profile)).toBeNull();
  });
});

describe("detectMention", () => {
  const variants = ["cecilias måleri", "ceciliasmaleri.se"];
  it("matches a name variant case-insensitively", () => {
    expect(detectMention("Jag rekommenderar CECILIAS MÅLERI eller Måleri Väst.", [], variants, "ceciliasmaleri.se")).toBe(true);
  });
  it("matches a cited URL on the domain", () => {
    expect(detectMention("Se listan.", ["https://www.ceciliasmaleri.se/om"], variants, "ceciliasmaleri.se")).toBe(true);
  });
  it("does not match inside a longer word", () => {
    expect(detectMention("Ceciliasmålerihuset AB", [], ["cecilias"], "x.se")).toBe(false);
  });
  it("does not treat a longer domain as the company's domain", () => {
    expect(detectMention("Se hemkontor.se för tips.", [], [], "kontor.se")).toBe(false);
    expect(detectMention("Se kontor.se för tips.", [], [], "kontor.se")).toBe(true);
  });
  it("returns false when absent", () => {
    expect(detectMention("Måleri Väst och Göteborgs Färg.", ["https://example.se"], variants, "ceciliasmaleri.se")).toBe(false);
  });
});

describe("wilson", () => {
  it("gives a wide interval for small samples", () => {
    const i = wilson(1, 10);
    expect(i.low).toBeGreaterThan(0.01);
    expect(i.low).toBeLessThan(0.03);
    expect(i.high).toBeGreaterThan(0.4);
    expect(i.high).toBeLessThan(0.45);
  });
  it("handles zero successes and empty samples", () => {
    expect(wilson(0, 10).low).toBe(0);
    expect(wilson(0, 0)).toEqual({ low: 0, high: 1 });
  });
});

describe("summarize", () => {
  const run = (mentioned: boolean, sources: string[] = []) => ({ text: "x", sources, searched: true, mentioned });
  const results: QuestionResult[] = [
    { index: 0, kind: "entity", question: "q0", runs: [run(true)], recommended: [], entity: null, failed: false },
    {
      index: 1, kind: "category", question: "q1", runs: [run(true, ["https://www.reco.se/a"]), run(false, ["https://reco.se/b"])],
      recommended: [{ name: "Måleri Väst", runs: 2, isTarget: false }, { name: "Cecilias Måleri", runs: 1, isTarget: true }],
      entity: null, failed: false,
    },
    {
      index: 2, kind: "category", question: "q2", runs: [run(false), run(false)],
      recommended: [{ name: "måleri väst", runs: 1, isTarget: false }], entity: null, failed: false,
    },
    { index: 3, kind: "category", question: "q3", runs: [], recommended: [], entity: null, failed: true },
  ];

  it("counts only category answers and ignores failed questions", () => {
    const s = summarize(results);
    expect(s.answers).toBe(4);
    expect(s.mentioned).toBe(1);
    expect(s.questionsAnswered).toBe(2);
    expect(s.questionsWithMention).toBe(1);
  });

  it("merges competitors case-insensitively and excludes the target", () => {
    const s = summarize(results);
    expect(s.competitors).toEqual([{ name: "Måleri Väst", answers: 3 }]);
  });

  it("counts each source host once per answer", () => {
    expect(summarize(results).topSources).toEqual([{ host: "reco.se", answers: 2 }]);
  });
});

describe("plan token", () => {
  it("round-trips and rejects tampering", () => {
    const plan = finalizePlan("ceciliasmaleri.se", {
      company: "Cecilias Måleri", name_variants: [], offering: "målare", market: "Göteborg", facts: [],
      category_questions: ["Vilken målare i Göteborg?", "Bästa målerifirman i Göteborg?", "Målare med ROT i Göteborg?"],
    }, profile)!;
    const { token } = issuePlanToken("ceciliasmaleri.se", plan);
    expect(verifyPlanToken(token)?.domain).toBe("ceciliasmaleri.se");
    const [data, sig] = token.split(".");
    const tampered = Buffer.from(Buffer.from(data, "base64url").toString().replace("Göteborg", "Malmö")).toString("base64url");
    expect(verifyPlanToken(`${tampered}.${sig}`)).toBeNull();
    expect(verifyPlanToken("nonsense")).toBeNull();
  });
});

describe("buildProfile org detection", () => {
  it("finds LocalBusiness subtypes without a second JSON-LD block", () => {
    const p = buildProfile("x.se", {
      status: 200, url: "https://x.se/", headers: new Headers(),
      body: `<script type="application/ld+json">{"@type":"Plumber","name":"Rör & Co","address":{"addressLocality":"Umeå"}}</script>`,
    });
    expect(p.orgNames).toEqual(["Rör & Co"]);
    expect(p.localities).toEqual(["Umeå"]);
  });
});

describe("isBlockedAddress", () => {
  it("blocks private, loopback, link-local and mapped addresses", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"]) {
      expect(isBlockedAddress(ip)).toBe(true);
    }
  });
  it("blocks IPv6 forms that embed or map a private IPv4 address", () => {
    for (const ip of ["::ffff:7f00:1", "64:ff9b::7f00:1", "2002:7f00:1::1", "2001:0:4136:e378::1", "::127.0.0.1", "ff02::1", "fe80::1%lo0", "not-an-ip"]) {
      expect(isBlockedAddress(ip)).toBe(true);
    }
  });
  it("allows public addresses", () => {
    for (const ip of ["93.184.216.34", "2606:4700:4700::1111", "8.8.8.8", "::ffff:8.8.8.8"]) {
      expect(isBlockedAddress(ip)).toBe(false);
    }
  });
});

describe("safeFetch", () => {
  it("refuses a hostname that resolves to loopback inside the connecting lookup", async () => {
    const err = await new Promise<NodeJS.ErrnoException | null>(resolve =>
      guardedLookup("localhost", {}, e => resolve(e)),
    );
    expect(err?.code).toBe("EBLOCKEDADDR");
  });
  it("refuses literal private IPs, non-default ports and credentials before connecting", async () => {
    const init = { headers: {}, timeoutMs: 2_000, maxBytes: 1_000, readBody: true };
    for (const url of ["http://127.0.0.1/", "http://[::1]/", "http://169.254.169.254/latest/meta-data/", "http://example.se:8080/", "http://user:pw@example.se/", "file:///etc/passwd"]) {
      expect(await safeFetch(url, init)).toBeNull();
    }
  });
});

describe("normalizeDomain", () => {
  it("strips scheme, path, query, fragment and port", () => {
    expect(normalizeDomain(" HTTPS://Foo.se:8080/a/b?x=1#y ")).toBe("foo.se");
    expect(normalizeDomain("foo.se#frag")).toBe("foo.se");
  });
  it("stays linear on long runs of separators", () => {
    const start = performance.now();
    normalizeDomain("a" + "#".repeat(100_000));
    normalizeDomain("#".repeat(100_000));
    expect(performance.now() - start).toBeLessThan(200);
  });
});

describe("HTML text extraction", () => {
  const p = buildProfile("example.se", {
    status: 200,
    url: "https://example.se/",
    headers: new Headers(),
    body: `<html><head><title>A &amp;lt;b&amp;gt; &#x26; C</title></head><body><p>Synlig</p><script >var hidden = 1;</script ><style>.x{}</style
      ><p>Fem &#8211; sex</p></body></html>`,
  });
  it("decodes entities exactly once", () => {
    expect(p.title).toBe("A &lt;b&gt; & C");
  });
  it("drops script and style blocks whose end tag has whitespace", () => {
    expect(p.text).toContain("Synlig");
    expect(p.text).toContain("Fem \u2013 sex");
    expect(p.text).not.toContain("hidden");
  });
});
