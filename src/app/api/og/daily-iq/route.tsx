import { ImageResponse } from "next/og";

import { renderOg } from "../../../../../og/renderer";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const site = process.env.SITE_URL ?? "https://links.classiccariq.com";

  const headers: HeadersInit = {
    "Content-Type": "image/png",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control":
      "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  };

  const renderFallback = () =>
    new ImageResponse(
      renderOg({
        variant: "daily",
        logoUrl: `${site}/classic-car-iq-square.png`,
        subtitle: "Today’s Daily IQ is ready",
        cta: "One shot, every day. Choose wisely.",
      }),
      { width: 1200, height: 630, headers }
    );

  try {
    return renderFallback();
  } catch {
    return renderFallback();
  }
}
