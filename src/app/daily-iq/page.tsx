import type { Metadata } from "next";

import { DetourRedirect } from "@/app/components/DetourRedirect";
import { buildDetourTarget } from "@/lib/detour";

export const runtime = "edge";

/**
 * iOS Share Sheet / Messages preview uses og:image as the main preview.
 * To show the app icon instead of a generated OG image, we use the square
 * app icon (512x512 with dark background) and twitter:card "summary" for
 * square thumbnails. This gives a consistent large app icon in iOS shares.
 */
const base = "https://links.classiccariq.com";
// Use square app icon for iOS Share Sheet previews (dark background, 512x512)
const appIcon = `${base}/android-chrome-512x512.png`;

export const metadata: Metadata = {
  title: "Classic Car IQ — Daily IQ",
  description: "Take today's Classic Car IQ Daily IQ challenge.",
  openGraph: {
    title: "Classic Car IQ — Daily IQ",
    description: "Take today's Classic Car IQ Daily IQ challenge.",
    url: `${base}/daily-iq`,
    type: "website",
    // Square app icon for iOS Share Sheet previews
    images: [
      {
        url: appIcon,
        width: 512,
        height: 512,
        alt: "Classic Car IQ",
      },
    ],
  },
  twitter: {
    // "summary" card type for square thumbnail (vs "summary_large_image" for rectangular)
    card: "summary",
    title: "Classic Car IQ — Daily IQ",
    description: "Take today's Classic Car IQ Daily IQ challenge.",
    images: [appIcon],
  },
};

export default function DailyIQPage() {
  const detourTarget = buildDetourTarget("daily-iq");

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <DetourRedirect target={detourTarget} />
      <h1>Classic Car IQ</h1>
      <p>Daily IQ Challenge</p>
      <p>If you aren&apos;t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
