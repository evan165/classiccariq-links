import { playerCard } from "../../../../../../og/cards";
import { avatarDataUrl, cardResponse, withTimeout } from "../../../../../../og/respond";
import { supabaseServer } from "../../../../../lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** The picture in a shared player link. IQ and points only when their stats are public. */
export async function GET(_req: Request, context: { params: Promise<{ profileId: string }> }) {
  const site = process.env.SITE_URL ?? "https://links.classiccariq.com";
  const { profileId } = await context.params;
  let name = "A Classic Car IQ player";
  let avatar: string | undefined;
  let iq: number | null = null;
  let points: number | null = null;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data: p } = await withTimeout(
        supabaseServer()
          .from("profiles")
          .select("username, display_name, avatar_url, current_iq, garage_points, is_public")
          .eq("id", profileId)
          .maybeSingle(),
        1200,
      );
      if (p) {
        name = p.display_name || p.username || name;
        avatar = await avatarDataUrl(p.avatar_url);
        if (p.is_public) {
          iq = typeof p.current_iq === "number" ? Math.round(p.current_iq) : null;
          points = typeof p.garage_points === "number" ? p.garage_points : null;
        }
      }
    } catch {
      // generic card
    }
  }
  return cardResponse(() => playerCard({ logoUrl: `${site}/classic-car-iq-square.png`, name, avatar, iq, points }), site);
}
