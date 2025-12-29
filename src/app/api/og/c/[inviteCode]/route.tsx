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
          padding: 64,
          background: "#0b0b0f",
          color: "#ffffff",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 28, opacity: 0.85 }}>Classic Car IQ</div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>
            You’ve been challenged
          </div>
          <div style={{ fontSize: 30, opacity: 0.9 }}>
            Tap to open this challenge in the app
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 22, opacity: 0.7 }}>Invite Code</div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: 2,
              padding: "18px 22px",
              borderRadius: 18,
              border: "2px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",}}
          >
            {inviteCode}
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
      "Content-Length": buffer.byteLength.toString(),
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
