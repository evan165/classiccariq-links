import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ inviteCode: string }> }
) {
  const { inviteCode } = await context.params;

  const img = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0b0b0f",
          color: "#ffffff",
          fontFamily: "system-ui",
        }}
      >
        {/* Top block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 32, fontWeight: 800, opacity: 0.92 }}>Classic Car IQ</div>
          </div>

          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05 }}>
            You’ve been challenged
          </div>

          <div style={{ fontSize: 34, fontWeight: 500, opacity: 0.85, lineHeight: 1.25 }}>
            Tap to open this challenge in the app
          </div>
        </div>

        {/* Bottom block */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 20, opacity: 0.65, letterSpacing: 1 }}>CHALLENGE</div>
            <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: 1 }}>{inviteCode}</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 10,
              padding: "16px 20px",
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              fontSize: 26,
              fontWeight: 700,
              opacity: 0.95,
              whiteSpace: "nowrap",
            }}
          >
            Open in app →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );

  const buffer = await img.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
