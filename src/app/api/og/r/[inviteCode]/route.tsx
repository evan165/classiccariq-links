import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  const img = new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: 800,
          background: "#000",
          color: "#fff",
        }}
      >
        OG ROUTE ALIVE
      </div>
    ),
    { width: 1200, height: 630 }
  );

  return new Response(await img.arrayBuffer(), {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
