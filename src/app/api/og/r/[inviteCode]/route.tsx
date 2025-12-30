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
        variant: "result",
        logoUrl: `${site}/classic-car-iq-square.png`,
      } as any),
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

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return await renderFallback();
    }

    const sb = supabaseServer();

    // 1) Fetch challenge result by invite_code
    const { data: challenge, error: chErr } = await sb
      .from("challenges")
      .select(
        "invite_code, challenger_profile_id, opponent_profile_id, challenger_score, opponent_score, challenger_duration_ms, opponent_duration_ms, winner_profile_id"
      )
      .eq("invite_code", inviteCode)
      .maybeSingle();

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
        variant: "result",
        logoUrl: `${site}/classic-car-iq-square.png`,
        inviteCode: challenge.invite_code,

        challengerName,
        challengerAvatarUrl: challenger?.avatar_url || undefined,
        challengerScore: challenge.challenger_score ?? undefined,
        challengerDurationMs: challenge.challenger_duration_ms ?? undefined,

        opponentName,
        opponentAvatarUrl: opponent?.avatar_url || undefined,
        opponentScore: challenge.opponent_score ?? undefined,
        opponentDurationMs: challenge.opponent_duration_ms ?? undefined,

        winnerProfileId: challenge.winner_profile_id ?? undefined,
        challengerProfileId: challenge.challenger_profile_id ?? undefined,
        opponentProfileId: challenge.opponent_profile_id ?? undefined,
      } as any),
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
