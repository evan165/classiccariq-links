import { ImageResponse } from "next/og";
import { renderOg } from "../../../../../../og/renderer";
import { supabaseServer } from "../../../../../lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const isPng = (buf: ArrayBuffer) => {
  const u8 = new Uint8Array(buf);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  return (
    u8.length >= 8 &&
    u8[0] === 0x89 &&
    u8[1] === 0x50 &&
    u8[2] === 0x4e &&
    u8[3] === 0x47 &&
    u8[4] === 0x0d &&
    u8[5] === 0x0a &&
    u8[6] === 0x1a &&
    u8[7] === 0x0a
  );
};

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

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return await renderFallback();
    }

    const sb = supabaseServer();

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

    const buf = await img.arrayBuffer();

    // If anything weird returns non-PNG bytes, don’t poison scrapers — return safe fallback PNG.
    if (!isPng(buf)) {
      return await renderFallback();
    }

    return new Response(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (_err) {
    return await renderFallback();
  }
}
