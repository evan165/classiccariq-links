import { ImageResponse } from "next/og";

import { renderOg } from "../../../../../og/renderer";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const site = process.env.SITE_URL ?? "https://links.classiccariq.com";

  const renderFallback = async () => {
    const img = new ImageResponse(
      renderOg({
        variant: "invite",
        logoUrl: `${site}/classic-car-iq-square.png`,
        dayLabel: "Daily IQ",
        question: "Today’s challenge is live",
        category: "Classic Cars",
        difficulty: 3,
        cta: "One shot, every day. Choose wisely.",
      }),
      { width: 1200, height: 630 }
    );

    return new Response(await img.arrayBuffer(), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  };

  try {
    return await renderFallback();
  } catch (_err) {
    return await renderFallback();
  }
}
