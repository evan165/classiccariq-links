import { ImageResponse } from "next/og";
import { renderOg } from "../../../../../../og/renderer";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ inviteCode: string }> }
) {
  await context.params;

  const img = new ImageResponse(
  renderOg({
    variant: "invite",
    logoUrl: "https://links.classiccariq.com/classic-car-iq-square.png",
  }),
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
