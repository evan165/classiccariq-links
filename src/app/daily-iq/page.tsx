import type { Metadata } from "next";

import { DetourRedirect } from "@/app/components/DetourRedirect";
import { buildDetourTarget } from "@/lib/detour";

export const runtime = "edge";

const base = "https://links.classiccariq.com";
const ogVersion =
  process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || "dev";
const image = `${base}/api/og/daily-iq?v=${encodeURIComponent(ogVersion)}`;

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: "Classic Car IQ — Daily IQ",
  description: "Take today’s Classic Car IQ Daily IQ challenge.",
  alternates: { canonical: `${base}/daily-iq` },
  openGraph: {
    title: "Classic Car IQ — Daily IQ",
    description: "Take today’s Classic Car IQ Daily IQ challenge.",
    url: `${base}/daily-iq`,
    type: "website",
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: "Classic Car IQ — Daily IQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Classic Car IQ — Daily IQ",
    description: "Take today’s Classic Car IQ Daily IQ challenge.",
    images: [image],
  },
};

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
