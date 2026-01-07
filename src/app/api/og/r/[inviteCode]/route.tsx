import { ImageResponse } from "next/og";
import { renderOg } from "../../../../../../og/renderer";
import { supabaseServer } from "../../../../../lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const OG_HEADERS: HeadersInit = {
  "Content-Type": "image/png",
  "X-Content-Type-Options": "nosniff",
  // Cache at the CDN to keep iOS/Messages OG fetches fast and consistent.
  // Avoid client-side caching of potentially stale/broken renders.
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
    return undefined;
  } finally {
    clearTimeout(t);
  }
}

const fmtScore = (n: number | null | undefined) =>
  typeof n === "number" ? `${n}/10` : undefined;

const fmtTime = (ms: number | null | undefined) => {
  if (typeof ms !== "number" || ms <= 0) return undefined;
  return `${Math.round(ms / 1000)}s`;
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ inviteCode: string }> }
) {
  const site = process.env.SITE_URL ?? "https://links.classiccariq.com";

  const renderFallback = () =>
    new ImageResponse(
      renderOg({
        variant: "result",
        logoUrl: `${site}/classic-car-iq-square.png`,
      }),
      { width: 1200, height: 630, headers: OG_HEADERS }
    );

  try {
    const { inviteCode } = await context.params;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return renderFallback();
    }

    const sb = supabaseServer();

    const { data: challenge, error } = await withTimeout(
      sb
        .from("challenges")
        .select(
          "invite_code, challenger_profile_id, opponent_profile_id, challenger_score, opponent_score, challenger_duration_ms, opponent_duration_ms, winner_profile_id",
        )
        .eq("invite_code", inviteCode)
        .maybeSingle(),
      1200,
    );

    if (error || !challenge) {
      return renderFallback();
    }

    const ids = [
      challenge.challenger_profile_id,
      challenge.opponent_profile_id,
    ].filter(Boolean) as string[];

    const { data: profiles } = await withTimeout(
      sb
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", ids),
      1200,
    );

    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

    const challenger = byId.get(challenge.challenger_profile_id);
    const opponent = challenge.opponent_profile_id
      ? byId.get(challenge.opponent_profile_id)
      : undefined;

    const winner =
      challenge.winner_profile_id === challenge.challenger_profile_id
        ? "challenger"
        : challenge.winner_profile_id === challenge.opponent_profile_id
        ? "opponent"
        : undefined;

    const [challengerAvatarUrl, opponentAvatarUrl] = await Promise.all([
      fetchImageAsDataUrl(challenger?.avatar_url),
      fetchImageAsDataUrl(opponent?.avatar_url),
    ]);

    return new ImageResponse(
      renderOg({
        variant: "result",
        logoUrl: `${site}/classic-car-iq-square.png`,
        challengerName: challenger?.display_name || challenger?.username || "Someone",
        challengerAvatarUrl,
        opponentName: opponent?.display_name || opponent?.username || "You",
        opponentAvatarUrl,
        challengerScore: fmtScore(challenge.challenger_score),
        challengerTime: fmtTime(challenge.challenger_duration_ms),
        opponentScore: fmtScore(challenge.opponent_score),
        opponentTime: fmtTime(challenge.opponent_duration_ms),
        winner,
      }),
      { width: 1200, height: 630, headers: OG_HEADERS }
    );
  } catch {
    return renderFallback();
  }
}
