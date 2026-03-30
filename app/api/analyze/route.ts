import { NextRequest } from "next/server";
import { createHash } from "crypto";

type Badge = "green" | "yellow" | "red";
type Point = { pass: boolean; label: string };

interface AnalyzeBody {
  domain: string;
  robots: boolean;
  sitemap: boolean;
  llms: boolean;
}

interface ScanResult {
  badge: Badge;
  summary: string;
  points: Point[];
  recommendations: string[];
  isDemo: boolean;
}

// ── Deterministic scoring ────────────────────────────────────────────────────

function computeBadge(robots: boolean, sitemap: boolean, llms: boolean): Badge {
  const passed = [robots, sitemap, llms].filter(Boolean).length;
  // 4 compliance checks always fail → max total passed = 3 of 7
  // 3 → yellow (3–4 range), 0–2 → red
  return passed >= 3 ? "yellow" : "red";
}

function computePoints(robots: boolean, sitemap: boolean, llms: boolean): Point[] {
  const passing: Point[] = [
    robots && { pass: true, label: "Sajten tillåter AI-agenter att läsa den" },
    sitemap && { pass: true, label: "Sajten har en sitemap som agenter kan följa" },
    llms && { pass: true, label: "Sajten har instruktioner specifikt för AI (llms.txt)" },
  ].filter((p): p is Point => Boolean(p));

  const failCompliance: Point[] = [
    { pass: false, label: "Integritetspolicyn saknar info om automatiserad behandling (GDPR Art. 22)" },
    { pass: false, label: "Cookie-hantering kräver mänsklig consent — blockerar agenter" },
    { pass: false, label: "AI-genererat innehåll är inte märkt enligt EU AI Act Art. 50" },
  ];

  // Show 1 passing check (if any) + 2 most critical compliance fails
  return passing.length > 0
    ? [passing[0], failCompliance[0], failCompliance[1]]
    : [failCompliance[0], failCompliance[1], failCompliance[2]];
}

function computeRecommendations(robots: boolean, sitemap: boolean, llms: boolean): string[] {
  // Priority order from PRD section 6.3
  const all: string[] = [
    "Uppdatera din integritetspolicy med info om automatiserad behandling enligt GDPR Art. 22.",
    "Se över hur din cookielösning hanterar icke-mänskliga besökare.",
    "Förbered för EU AI Act — märk AI-genererat innehåll på din sajt.",
    ...(!llms ? ["Lägg till en /llms.txt-fil som berättar för AI-agenter vad din sajt erbjuder."] : []),
    ...(!robots ? ["Se till att din robots.txt inte blockerar AI-agenter som GPTBot och ClaudeBot."] : []),
    ...(!sitemap ? ["Lägg till en sitemap.xml så att agenter kan navigera din sajt."] : []),
    "Gör dataskyddsombudets kontaktuppgifter maskinläsbara.",
  ];
  return all.slice(0, 3);
}

// ── Claude summary (only when API key present) ───────────────────────────────

async function fetchClaudeSummary(
  domain: string,
  robots: boolean,
  sitemap: boolean,
  llms: boolean,
  apiKey: string
): Promise<string | null> {
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
        max_tokens: 100,
        system:
          "Du är en koncis AI-rådgivare. Svara BARA med EN mening på svenska (max 20 ord). Ingen markdown, inga citattecken.",
        messages: [
          {
            role: "user",
            content: `Sammanfatta AI-agent-beredskapen för ${domain}: robots.txt ${robots ? "tillåter agenter" : "saknas/blockerar"}, sitemap ${sitemap ? "finns" : "saknas"}, llms.txt ${llms ? "finns" : "saknas"}. Compliance-krav saknas genomgående.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return (data.content?.[0]?.text as string | undefined)?.trim() ?? null;
  } catch {
    return null;
  }
}

// ── Supabase save (fire-and-forget, fails silently if table not yet created) ─

async function saveSubmission(
  domain: string,
  badge: Badge,
  robots: boolean,
  sitemap: boolean,
  llms: boolean,
  ipHash: string
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/scan_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        domain,
        badge,
        checks_passed: [robots, sitemap, llms].filter(Boolean).length,
        checks_json: { robots, sitemap, llms },
        has_robots: robots,
        has_sitemap: sitemap,
        has_llms_txt: llms,
        ip_hash: ipHash,
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Silently ignore — table may not exist yet
  }
}

async function isRateLimited(ipHash: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return false;

  try {
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const res = await fetch(
      `${supabaseUrl}/rest/v1/scan_submissions?ip_hash=eq.${encodeURIComponent(ipHash)}&scanned_at=gte.${encodeURIComponent(oneMinuteAgo)}&select=id&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        signal: AbortSignal.timeout(2000),
      }
    );
    if (!res.ok) return false;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: AnalyzeBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { domain, robots, sitemap, llms } = body;

  if (!domain || typeof domain !== "string") {
    return Response.json({ error: "Missing domain" }, { status: 400 });
  }

  // Rate limit check
  const rawIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const ipHash = createHash("sha256").update(rawIp).digest("hex");

  if (await isRateLimited(ipHash)) {
    return Response.json(
      { error: "Vänta en minut mellan scans." },
      { status: 429 }
    );
  }

  const badge = computeBadge(robots, sitemap, llms);
  const points = computePoints(robots, sitemap, llms);
  const recommendations = computeRecommendations(robots, sitemap, llms);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let summary: string;
  let isDemo = true;

  if (apiKey) {
    const claudeSummary = await fetchClaudeSummary(domain, robots, sitemap, llms, apiKey);
    if (claudeSummary) {
      summary = claudeSummary;
      isDemo = false;
    } else {
      summary = buildDemoSummary(domain, badge);
    }
  } else {
    summary = buildDemoSummary(domain, badge);
  }

  // Save asynchronously — don't await, don't block response
  saveSubmission(domain, badge, robots, sitemap, llms, ipHash);

  const result: ScanResult = { badge, summary, points, recommendations, isDemo };
  return Response.json(result);
}

function buildDemoSummary(domain: string, badge: Badge): string {
  return badge === "yellow"
    ? `${domain} har grunderna på plats men saknar viktiga compliance-anpassningar för AI-agenter.`
    : `${domain} saknar de tekniska grunderna för att AI-agenter ska kunna interagera korrekt.`;
}
