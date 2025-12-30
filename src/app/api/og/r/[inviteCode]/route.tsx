import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { renderOg } from "../../../../../../og/renderer";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const { inviteCode } = await context.params;

    const element = renderOg({
      variant: "result",
      inviteCode,
    } as any);

    return new ImageResponse(element, { width: 1200, height: 630 });
  } catch (err: any) {
    const msg =
      typeof err?.stack === "string"
        ? err.stack
        : typeof err?.message === "string"
        ? err.message
        : String(err);

    return new Response(`OG ERROR:\n${msg}\n`, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
