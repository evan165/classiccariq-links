import { resultCard } from "../../../../../../og/cards";
import { avatarDataUrl, cardResponse, withTimeout } from "../../../../../../og/respond";
import { firstName } from "../../../../../lib/challengeSummary";
import { supabaseServer } from "../../../../../lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const fmtTime = (ms: number | null | undefined) => {
  if (typeof ms !== "number" || ms <= 0) return undefined;
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
};

type Line = { name: string; avatar?: string; score: number | null; time?: string };

async function load(inviteCode: string) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const sb = supabaseServer();
    const { data: ch } = await withTimeout(
      sb
        .from("challenges")
        .select("challenger_profile_id, opponent_profile_id, challenger_score, opponent_score, challenger_duration_ms, opponent_duration_ms, winner_profile_id, question_ids")
        .eq("invite_code", inviteCode)
        .maybeSingle(),
      1200,
    );
    if (!ch) return null;
    const ids = [ch.challenger_profile_id, ch.opponent_profile_id].filter(Boolean) as string[];
    const { data: profiles } = await withTimeout(sb.from("profiles").select("id, username, display_name, avatar_url").in("id", ids), 1200);
    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
    const pa = byId.get(ch.challenger_profile_id);
    const pb = ch.opponent_profile_id ? byId.get(ch.opponent_profile_id) : undefined;
    const [aa, ab] = await Promise.all([avatarDataUrl(pa?.avatar_url), avatarDataUrl(pb?.avatar_url)]);
    const a: Line = { name: firstName(pa?.display_name || pa?.username || ""), avatar: aa, score: ch.challenger_score ?? null, time: fmtTime(ch.challenger_duration_ms) };
    const b: Line | null = pb
      ? { name: firstName(pb.display_name || pb.username || ""), avatar: ab, score: ch.opponent_score ?? null, time: fmtTime(ch.opponent_duration_ms) }
      : null;
    const winner = ch.winner_profile_id && ch.winner_profile_id === ch.challenger_profile_id ? "a" : ch.winner_profile_id && ch.winner_profile_id === ch.opponent_profile_id ? "b" : null;
    const total = Array.isArray(ch.question_ids) && ch.question_ids.length ? ch.question_ids.length : 10;
    return { a, b, winner: winner as "a" | "b" | null, total };
  } catch {
    return null;
  }
}

/** The picture in a shared result link: both scores, and who won. */
export async function GET(_req: Request, context: { params: Promise<{ inviteCode: string }> }) {
  const site = process.env.SITE_URL ?? "https://links.classiccariq.com";
  const { inviteCode } = await context.params;
  const r = await load(inviteCode);
  return cardResponse(
    () =>
      resultCard({
        logoUrl: `${site}/classic-car-iq-square.png`,
        total: r?.total ?? 10,
        a: r?.a ?? { name: "A friend", score: null },
        b: r?.b ?? null,
        winner: r?.winner ?? null,
      }),
    site,
  );
}
