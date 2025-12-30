import { ImageResponse } from "next/og";
import { renderOg } from "../../../../../../og/renderer";
import { supabaseServer } from "../../../../../lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const site = process.env.SITE_URL ?? "https://links.classiccariq.com";
    const { inviteCode } = await context.params;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response("Missing Supabase env", { status: 500 });
    }

    const sb = supabaseServer();

    const { data: challenge, error } = await sb
      .from("challenges")
      .select("*")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (error) {
      throw new Error(`Challenge query error: ${error.message}`);
    }
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    const img = new ImageResponse(
      renderOg({ variant: "result" } as any),
      { width: 1200, height: 630 }
    );

    const buf = await img.arrayBuffer();

    return new Response(buf, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (err: any) {
    return new Response(
      `OG RESULT ERROR:\n${err?.stack || err?.message || String(err)}`,
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }
}
