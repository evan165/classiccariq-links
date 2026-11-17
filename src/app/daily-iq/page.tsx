import type { Metadata } from "next";

import { DetourRedirect } from "@/app/components/DetourRedirect";
import { buildDetourTarget } from "@/lib/detour";
import { dailyResultQuery, parseDailyResult, resultHeadline } from "@/lib/dailyResult";

export const runtime = "edge";

const base = "https://links.classiccariq.com";
const ogVersion =
  process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || "dev";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * A shared Daily IQ link. Plain links show today's generic card. Links shared
 * from a result (?d=…&q=…&r=…) show the sharer's own result: right or wrong,
 * time and streak, over that day's question photo.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const result = parseDailyResult(await searchParams);

  const title = result ? resultHeadline(result).title : "Classic Car IQ — Daily IQ";
  const description = result
    ? resultHeadline(result).description
    : "Take today’s Classic Car IQ Daily IQ challenge.";
  const query = result ? `${dailyResultQuery(result)}&` : "";
  const image = `${base}/api/og/daily-iq?${query}v=${encodeURIComponent(ogVersion)}`;

  return {
    metadataBase: new URL(base),
    title,
    description,
    alternates: { canonical: `${base}/daily-iq` },
    openGraph: {
      title,
      description,
      url: `${base}/daily-iq`,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function DailyIQPage() {
  const detourTarget = buildDetourTarget("daily-iq");

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <DetourRedirect target={detourTarget} />
      <h1>Classic Car IQ</h1>
      <p>Daily IQ Challenge</p>
      <p>If you aren’t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
