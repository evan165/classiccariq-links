import { ImageResponse } from "next/og";
import { renderOg } from "../../../../../../og/renderer";
import { supabaseServer } from "../../../../../lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ inviteCode: string }> }
) {
  const site = process.env.SITE_URL ?? "https://links.classiccariq.com";

  const renderFallback = async () => {
    const img = new ImageResponse(
      renderOg({
        variant: "invite",
        logoUrl: `${site}/classic-car-iq-square.png`,
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
    const { inviteCode } = await context.params;

    // If Supabase env is missing, return safe fallback instead of throwing
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return await renderFallback();
    }

    const sb = supabaseServer();

    // 1) Fetch challenge by invite_code
    const { data: challenge, error: chErr } = await sb
      .from("challenges")
      .select("challenger_profile_id, opponent_profile_id, invite_code")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    // If not found, render a safe generic invite card (no 500s for scrapers)
    if (chErr || !challenge) {
      return await renderFallback();
    }

    // 2) Fetch profiles for avatars/names
    const ids = [challenge.challenger_profile_id, challenge.opponent_profile_id].filter(Boolean) as string[];

    const { data: profiles } = await sb
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", ids);

    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

    const challenger = byId.get(challenge.challenger_profile_id);
    const opponent = challenge.opponent_profile_id ? byId.get(challenge.opponent_profile_id) : undefined;

    const challengerName = challenger?.display_name || challenger?.username || "Someone";
    const opponentName = opponent?.display_name || opponent?.username || "You";

    const img = new ImageResponse(
      renderOg({
        variant: "invite",
        logoUrl: `${site}/classic-car-iq-square.png`,
        challengerName,
        challengerAvatarUrl: challenger?.avatar_url || undefined,
        opponentName,
        opponentAvatarUrl: opponent?.avatar_url || undefined,
      }),
      { width: 1200, height: 630 }
    );

    return new Response(await img.arrayBuffer(), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    return await renderFallback();
  }
}
