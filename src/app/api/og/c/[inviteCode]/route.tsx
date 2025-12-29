import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const img = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0b0b0f",
          color: "#ffffff",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img
            src="https://links.classiccariq.com/logo-square.png"
            width={96}
            height={96}
            alt="Classic Car IQ"
          />
          <div style={{ fontSize: 32, fontWeight: 700, opacity: 0.9 }}>
            Classic Car IQ
          </div>
        </div>

        <div style={{ marginTop: 48 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: 24,
            }}
          >
            You’ve been challenged
          </div>

          <div style={{ fontSize: 34, opacity: 0.85 }}>
            Tap to open this challenge in the app
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
