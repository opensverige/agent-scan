// app/api/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain") ?? "";
  const score = searchParams.get("score") ?? "0";
  const status = searchParams.get("status") ?? "";

  const scoreNum = parseInt(score, 10);
  const color = scoreNum <= 3 ? "#c4391a" : scoreNum <= 6 ? "#c9a55a" : "#16a34a";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#F8F7F4",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          padding: "48px",
        }}
      >
        <div style={{ fontSize: 18, color: "#888", marginBottom: 16, letterSpacing: "0.1em" }}>
          agent.opensverige.se
        </div>
        <div
          style={{
            fontSize: 104,
            fontWeight: 800,
            color,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {score}/11
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginTop: 8,
            color: "#111",
            letterSpacing: "0.15em",
          }}
        >
          {status.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: 28,
            marginTop: 24,
            color: "#111",
            fontWeight: 600,
          }}
        >
          {domain}
        </div>
        <div
          style={{
            fontSize: 15,
            color: "#888",
            marginTop: 40,
            letterSpacing: "0.05em",
          }}
        >
          Scanna din sajt → agent.opensverige.se
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
