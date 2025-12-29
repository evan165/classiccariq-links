import { ImageResponse } from "next/og";

export const runtime = "edge";

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
              background: "rgba(255,255,255,0.06)",
              width: "fit-content",
            }}
          >
            {inviteCode}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );

  // Materialize to bytes so we can send Content-Length (some crawlers are picky).
  const arrayBuffer = await img.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  return new Response(bytes, {
    status: 200,
    headers: {
      "content-type": "image/png",
      "content-length": String(bytes.byteLength),
      // Crawler-friendly caching (and helps iMessage/Facebook cache the image)
      "cache-control": "public, immutable, max-age=31536000",
      // Avoid any chance of compression/transform surprises
      "content-disposition": 'inline; filename="og.png"',
    },
  });
}
