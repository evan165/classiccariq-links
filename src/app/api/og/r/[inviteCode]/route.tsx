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
  const hasEnv = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  const renderFallback = async () => {
    const img = new ImageResponse(
      renderOg({
        variant: "result",
        logoUrl: `${site}/classic-car-iq-square.png`,
        subtitle: "Think you can do better?",
        cta: "Tap to play this challenge in the app",
      }),
      { width: 1200, height: 630 }
    );

    return new Response(await img.arrayBuffer(), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "x-debug-has-sb-env": String(hasEnv),
      },
    });
  };

  try {
    const { inviteCode } = await context.params;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return await renderFallback();
    }

    const sb = supabaseServer();

    const { data: challenge, error: chErr } = await sb
      .from("challenges")
      .select("challenger_profile_id, opponent_profile_id, invite_code, challenger_score, opponent_score, challenger_duration_ms, opponent_duration_ms, winner_profile_id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (chErr || !challenge) {
      return await renderFallback();
    }

    const ids = [challenge.challenger_profile_id, challenge.opponent_profile_id].filter(Boolean) as string[];

    const { data: profiles } = await sb
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", ids);

    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

    const challenger = byId.get(challenge.challenger_profile_id);
    const opponent = challenge.opponent_profile_id ? byId.get(challenge.opponent_profile_id) : undefined;

    const challengerName = challenger?.display_name || challenger?.username || "Someone";
    const challengerScore = challenge.challenger_score != null ? `${challenge.challenger_score}/10` : undefined;
    const opponentScore = challenge.opponent_score != null ? `${challenge.opponent_score}/10` : undefined;

    const challengerTime =
      challenge.challenger_duration_ms != null
        ? `${Math.round(challenge.challenger_duration_ms / 1000)}s`
        : undefined;

    const opponentTime =
      challenge.opponent_duration_ms != null
        ? `${Math.round(challenge.opponent_duration_ms / 1000)}s`
        : undefined;

    const winner =
      challenge.winner_profile_id === challenge.challenger_profile_id
        ? "challenger"
        : challenge.winner_profile_id === challenge.opponent_profile_id
        ? "opponent"
        : undefined;

    const opponentName = opponent?.display_name || opponent?.username || "Opponent";

    const img = new ImageResponse(
      renderOg({
        variant: "result",
        logoUrl: `${site}/classic-car-iq-square.png`,
        subtitle: "Think you can do better?",
        cta: "Tap to play this challenge in the app",
        challengerName,
        challengerAvatarUrl: challenger?.avatar_url || undefined,
        opponentName,
        opponentAvatarUrl: opponent?.avatar_url || undefined,
        challengerScore,
        challengerTime,
        opponentScore,
        opponentTime,
        winner,
      }),
      { width: 1200, height: 630 }
    );

    return new Response(await img.arrayBuffer(), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "x-debug-has-sb-env": String(hasEnv),
      },
    });
  } catch (_err) {
    return await renderFallback();
  }
}
