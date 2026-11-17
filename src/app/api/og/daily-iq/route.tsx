import { ImageResponse } from "next/og";

import { renderOg } from "../../../../../og/renderer";
import { renderDailyResult } from "../../../../../og/dailyResult";
import { dayLabel, parseDailyResult, secondsLabel } from "@/lib/dailyResult";
import { getDailyResultPhoto } from "@/lib/dailyResultPhoto";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function loadFonts() {
  const load = (file: string) => fetch(new URL(`../../../../../og/fonts/${file}`, import.meta.url)).then((r) => r.arrayBuffer());
  const [w600, w700, w800] = await Promise.all([
    load("BarlowCondensed_600SemiBold.ttf"),
    load("BarlowCondensed_700Bold.ttf"),
    load("BarlowCondensed_800ExtraBold.ttf"),
  ]);
  return [
    { name: "Barlow Condensed", data: w600, weight: 600 as const, style: "normal" as const },
    { name: "Barlow Condensed", data: w700, weight: 700 as const, style: "normal" as const },
    { name: "Barlow Condensed", data: w800, weight: 800 as const, style: "normal" as const },
  ];
}

export async function GET(req: Request) {
  const site = process.env.SITE_URL ?? "https://links.classiccariq.com";
  const logoUrl = `${site}/classic-car-iq-square.png`;

  const headers: HeadersInit = {
    "Content-Type": "image/png",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control":
      "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  };

  const renderFallback = () =>
    new ImageResponse(
      renderOg({
        variant: "daily",
        logoUrl,
        subtitle: "Today’s Daily IQ is ready",
        cta: "One shot, every day. Choose wisely.",
      }),
      { width: 1200, height: 630, headers }
    );

  // A player's own result, when the shared link carries one.
  const result = parseDailyResult(new URL(req.url).searchParams);
  if (!result) return renderFallback();

  try {
    const [photo, fonts] = await Promise.all([getDailyResultPhoto(result), loadFonts()]);
    if (!photo) return renderFallback();
    return new ImageResponse(
      renderDailyResult({
        dayLabel: dayLabel(result.day),
        right: result.right,
        seconds: result.right && result.tenths !== null ? secondsLabel(result.tenths) : null,
        streak: result.streak,
        photoUrl: photo.photoUrl,
        logoUrl,
      }),
      { width: 1200, height: 630, headers, fonts }
    );
  } catch {
    return renderFallback();
  }
}
