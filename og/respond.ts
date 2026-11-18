import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { OG_SIZE, loadCardFonts } from "./cards";

export const OG_HEADERS: Record<string, string> = {
  // iOS/Messages is strict: must be a valid image response with correct type.
  "Content-Type": "image/png",
  "X-Content-Type-Options": "nosniff",
  // Cached at the CDN for a day so link previews stay fast.
  "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
};

/**
 * Draws the card completely before answering. next/og streams its PNG, so a
 * drawing error after the headers went out used to send an empty file (the
 * result card did exactly that, Nov 2026). If anything fails, the fixed
 * branded picture in /public is sent instead.
 */
export async function cardResponse(card: () => ReactElement, site: string): Promise<Response> {
  try {
    const fonts = await loadCardFonts();
    const png = await new ImageResponse(card(), { ...OG_SIZE, fonts }).arrayBuffer();
    if (png.byteLength < 1000) throw new Error("empty card");
    return new Response(png, { headers: OG_HEADERS });
  } catch {
    try {
      const res = await fetch(`${site}/og-fallback.png`);
      if (res.ok) return new Response(await res.arrayBuffer(), { headers: OG_HEADERS });
    } catch {
      // fall through
    }
    return new Response(null, { status: 404 });
  }
}

export function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
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

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** A player's photo as a data URL, or undefined if it is missing, slow or too big. */
export async function avatarDataUrl(url: string | null | undefined): Promise<string | undefined> {
  if (!url || !/^https?:\/\//i.test(url)) return undefined;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 700);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/^image\/(png|jpe?g)/i.test(type)) return undefined;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 750_000) return undefined;
    return `data:${type.split(";")[0]};base64,${toBase64(buf)}`;
  } catch {
    return undefined;
  } finally {
    clearTimeout(t);
  }
}
