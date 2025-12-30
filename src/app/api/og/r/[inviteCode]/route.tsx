import { ImageResponse } from "next/og";
import { renderOg } from "../../../../../../og/renderer";
import { supabaseServer } from "../../../../../lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const isPng = (buf: ArrayBuffer) => {
  const u8 = new Uint8Array(buf);
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

const fmtScore = (n: number | null | undefined) => (typeof n === "number" ? `${n}/10` : undefined);

const fmtTime = (ms: number | null | undefined) => {
  if (typeof ms !== "number" || ms <= 0) return undefined;
  const s = Math.round(ms / 1000);
  return `${s}s`;
};

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
        subtitle: "Think you can do better?",
        cta: "Tap to play this challenge in the app",
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

    const winner: "challenger" | "opponent" | undefined =
      challenge.winner_profile_id &&
      challenge.winner_profile_id === challenge.challenger_profile_id
        ? "challenger"
        : challenge.winner_profile_id &&
          challenge.opponent_profile_id &&
          challenge.winner_profile_id === challenge.opponent_profile_id
        ? "opponent"
        : undefined;

    const img = new ImageResponse(
      renderOg({
        variant: "result",
        logoUrl: `${site}/classic-car-iq-square.png`,
        challengerName,
        challengerAvatarUrl: challenger?.avatar_url || undefined,
        opponentName,
        opponentAvatarUrl: opponent?.avatar_url || undefined,
        challengerScore: fmtScore(challenge.challenger_score),
        challengerTime: fmtTime(challenge.challenger_duration_ms),
        opponentScore: fmtScore(challenge.opponent_score),
        opponentTime: fmtTime(challenge.opponent_duration_ms),
        winner,
      } as any),
      { width: 1200, height: 630 }
    );

    const buf = await img.arrayBuffer();
    if (!isPng(buf)) return await renderFallback();

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
