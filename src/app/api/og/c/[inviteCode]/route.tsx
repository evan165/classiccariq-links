import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ inviteCode: string }> }
) {
  await context.params;

  const img = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 48,
          padding: 96,
          background: "#0b0b0f",
          color: "#ffffff",
          fontFamily: "system-ui",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <img
            src="https://links.classiccariq.com/classic-car-iq-square.png"
            width={96}
            height={96}
            style={{ borderRadius: 20 }}
          />
          <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: -0.5 }}>
            Classic Car IQ
          </div>
        </div>

        {/* Headline */}
        <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.05 }}>
          You’ve been challenged
        </div>

        {/* Subhead */}
        <div style={{ fontSize: 36, fontWeight: 500, opacity: 0.85 }}>
          Think you know classic cars?
        </div>

        {/* CTA */}
        <div
          style={{
            alignSelf: "flex-start",
            marginTop: 16,
            padding: "18px 28px",
            borderRadius: 999,
            border: "2px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.06)",
            fontSize: 28,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          Open challenge →
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
