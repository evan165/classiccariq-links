import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { renderOg } from "../../../../../../og/renderer";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ inviteCode: string }> }
) {
  const { inviteCode } = await context.params;

  // TEMP: data loader is not present in this repo yet (no og/data.ts).
  // We’ll re-wire the Supabase query after the build is green.
  const element = renderOg({
    variant: "result",
    inviteCode,
  } as any);

  return new ImageResponse(element, { width: 1200, height: 630 });
}
