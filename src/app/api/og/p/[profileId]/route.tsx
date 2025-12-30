import { ImageResponse } from "next/og";

import { renderOg } from "../../../../../../og/renderer";
import { supabaseServer } from "../../../../../lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ profileId: string }> }
) {
  const site = process.env.SITE_URL ?? "https://links.classiccariq.com";

  const renderFallback = async () => {
    const img = new ImageResponse(
      renderOg({
        variant: "profile",
        logoUrl: `${site}/classic-car-iq-square.png`,
        headline: "Player Profile",
        cta: "View stats in the app",
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
    const { profileId } = await context.params;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return await renderFallback();
    }

    const sb = supabaseServer();

    const { data: profile, error } = await sb
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .eq("id", profileId)
      .maybeSingle();

    if (error || !profile) {
      return await renderFallback();
    }

    const username = profile.display_name || profile.username || "Player";

    const img = new ImageResponse(
      renderOg({
        variant: "profile",
        logoUrl: `${site}/classic-car-iq-square.png`,
        headline: username,
        cta: "View stats in the app",
        username,
        avatarUrl: profile.avatar_url || undefined,
      }),
      { width: 1200, height: 630 }
    );

    return new Response(await img.arrayBuffer(), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (_err) {
    return await renderFallback();
  }
}
