// app/api/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

// btoa isn't available in all edge envs — roll a safe fallback
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const domain = searchParams.get("domain") ?? "";
  const score = parseInt(searchParams.get("score") ?? "0", 10);
  const max = parseInt(searchParams.get("max") ?? "11", 10) || 11;
  const status = searchParams.get("status") ?? "";

  // Badge thresholds match calculateBadge() in lib/checks.ts
  const isRed = score < 4;
  const isYellow = score >= 4 && score < 8;
  const ringColor = isRed ? "#c4391a" : isYellow ? "#c9a55a" : "#16a34a";
  const statusBg = isRed ? "rgba(196,57,26,0.15)" : isYellow ? "rgba(201,165,90,0.15)" : "rgba(22,163,74,0.15)";

  // Try to load crayfish background (non-fatal if unavailable, e.g. local dev cold-start)
  let bgSrc: string | undefined;
  try {
    const r = await fetch(`${origin}/assets/og-crayfish-bg.png`, {
      signal: AbortSignal.timeout(3_000),
    });
    if (r.ok) {
      bgSrc = `data:image/png;base64,${uint8ToBase64(new Uint8Array(await r.arrayBuffer()))}`;
    }
  } catch { /* fallback to solid bg */ }

  const domainFontSize = domain.length > 24 ? 32 : domain.length > 16 ? 40 : 48;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#060606",
          position: "relative",
        }}
      >
        {/* Crayfish background */}
        {bgSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgSrc}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
            }}
          />
        )}

        {/* Dark overlay for readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "rgba(6,6,6,0.78)",
          }}
        />

        {/* Content layer */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "52px 64px",
          }}
        >
          {/* Top: site label */}
          <div
            style={{
              fontSize: 17,
              color: "#555",
              letterSpacing: "0.08em",
              fontFamily: "monospace",
            }}
          >
            agent.opensverige.se
          </div>

          {/* Middle: ring + domain */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 60,
            }}
          >
            {/* Score ring */}
            <div
              style={{
                width: 164,
                height: 164,
                borderRadius: "50%",
                border: `14px solid ${ringColor}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 62,
                  fontWeight: 800,
                  color: "#f8f7f4",
                  lineHeight: 1,
                  fontFamily: "monospace",
                }}
              >
                {score}
              </div>
              <div style={{ fontSize: 20, color: "#666", fontFamily: "monospace" }}>
                /{max}
              </div>
            </div>

            {/* Domain + status badge */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  fontSize: domainFontSize,
                  fontWeight: 700,
                  color: "#f8f7f4",
                  fontFamily: "monospace",
                  letterSpacing: "-0.02em",
                }}
              >
                {domain}
              </div>
              {status && (
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: ringColor,
                    background: statusBg,
                    border: `2px solid ${ringColor}`,
                    borderRadius: 8,
                    padding: "8px 20px",
                    fontFamily: "monospace",
                    letterSpacing: "0.12em",
                    alignSelf: "flex-start",
                  }}
                >
                  {status.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Bottom: tagline */}
          <div
            style={{
              fontSize: 15,
              color: "#444",
              letterSpacing: "0.04em",
              fontFamily: "monospace",
            }}
          >
            Scanna din sajt gratis → agent.opensverige.se
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
