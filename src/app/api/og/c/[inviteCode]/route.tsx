import { ImageResponse } from "next/og";
import { renderOg } from "../../../../../../og/renderer";
import { supabaseServer } from "../../../../../lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const OG_HEADERS: HeadersInit = {
  // iOS/Messages is strict: must be a valid image response with correct type.
  "Content-Type": "image/png",
  "X-Content-Type-Options": "nosniff",
  // Cache at the CDN to keep OG fetches fast, but force clients to revalidate.
  // This reduces "slow OG image" timeouts without aggressively caching bad results.
  "Cache-Control":
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
};

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  // Chunk to avoid call stack limits for larger buffers.
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function fetchImageAsDataUrl(
  url: string | null | undefined,
  { timeoutMs = 700, maxBytes = 750_000 } = {},
): Promise<string | undefined> {
  if (!url) return undefined;
  if (!/^https?:\/\//i.test(url)) return undefined;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) return undefined;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("image/")) return undefined;

    const len = res.headers.get("content-length");
    if (len && Number(len) > maxBytes) return undefined;

    const buf = await res.arrayBuffer();
    if (buf.byteLength > maxBytes) return undefined;

    return `data:${contentType.split(";")[0]};base64,${arrayBufferToBase64(buf)}`;
  } catch {
    // Missing/slow avatars should never break OG rendering.
    return undefined;
  } finally {
    clearTimeout(t);
  }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ inviteCode: string }> }
) {
  const site = process.env.SITE_URL ?? "https://links.classiccariq.com";

  const renderFallback = () =>
    new ImageResponse(
      renderOg({
        variant: "invite",
        logoUrl: `${site}/classic-car-iq-square.png`,
      }),
      { width: 1200, height: 630, headers: OG_HEADERS }
    );

  try {
    const { inviteCode } = await context.params;

    // If Supabase env is missing, return safe fallback instead of throwing
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return renderFallback();
    }

    const sb = supabaseServer();

    // 1) Fetch challenge by invite_code
    const { data: challenge, error: chErr } = await withTimeout(
      sb
        .from("challenges")
        .select("challenger_profile_id, opponent_profile_id, invite_code")
        .eq("invite_code", inviteCode)
        .maybeSingle(),
      1200,
    );

    // If not found, render a safe generic invite card (no 500s for scrapers)
    if (chErr || !challenge) {
      return renderFallback();
    }

    // 2) Fetch profiles for avatars/names
    const ids = [challenge.challenger_profile_id, challenge.opponent_profile_id].filter(Boolean) as string[];

    const { data: profiles } = await withTimeout(
      sb
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", ids),
      1200,
    );

    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

    const challenger = byId.get(challenge.challenger_profile_id);
    const opponent = challenge.opponent_profile_id ? byId.get(challenge.opponent_profile_id) : undefined;

    const challengerName = challenger?.display_name || challenger?.username || "Someone";
    const opponentName = opponent?.display_name || opponent?.username || "You";

    // If avatars are slow/unreachable, omit them instead of timing out OG generation.
    const [challengerAvatarUrl, opponentAvatarUrl] = await Promise.all([
      fetchImageAsDataUrl(challenger?.avatar_url),
      fetchImageAsDataUrl(opponent?.avatar_url),
    ]);

    return new ImageResponse(
      renderOg({
        variant: "invite",
        logoUrl: `${site}/classic-car-iq-square.png`,
        challengerName,
        challengerAvatarUrl,
        opponentName,
        opponentAvatarUrl,
      }),
      { width: 1200, height: 630, headers: OG_HEADERS }
    );
  } catch {
    return renderFallback();
  }
}
