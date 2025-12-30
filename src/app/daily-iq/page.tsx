import type { Metadata } from "next";

import { DetourRedirect } from "@/app/components/DetourRedirect";

export const runtime = "edge";

const ogVersion =
  process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || "dev";
const image = `https://links.classiccariq.com/api/og/daily-iq?v=${encodeURIComponent(ogVersion)}`;

export const metadata: Metadata = {
  title: "Classic Car IQ — Daily IQ",
  description: "Take today’s Classic Car IQ Daily IQ challenge.",
  openGraph: {
    title: "Classic Car IQ — Daily IQ",
    description: "Take today’s Classic Car IQ Daily IQ challenge.",
    url: "https://links.classiccariq.com/daily-iq",
    type: "website",
    images: [
      {
        url: image,
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
  const detourBase = process.env.DETOUR_BASE_URL || "";
  const normalizedBase = detourBase.replace(/\/+$/, "");
  const detourTarget = normalizedBase ? `${normalizedBase}/daily-iq` : "";

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <DetourRedirect target={detourTarget} />
      <h1>Classic Car IQ</h1>
      <p>Daily IQ Challenge</p>
      <p>If you aren’t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
