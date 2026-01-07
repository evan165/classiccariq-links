import type { Metadata } from "next";

import { DetourRedirect } from "@/app/components/DetourRedirect";
import { buildDetourTarget } from "@/lib/detour";

export const runtime = "edge";

type Props = {
  params: Promise<{ inviteCode: string }>;
};

/**
 * iOS Share Sheet / Messages preview uses og:image as the main preview.
 * To show the app icon instead of a generated OG image, we use the square
 * app icon (512x512 with dark background) and twitter:card "summary" for
 * square thumbnails. This gives a consistent large app icon in iOS shares.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { inviteCode } = await params;

  const base = "https://links.classiccariq.com";
  const url = `${base}/c/${inviteCode}`;

  // Use square app icon for iOS Share Sheet previews (dark background, 512x512)
  const appIcon = `${base}/android-chrome-512x512.png`;

  return {
    metadataBase: new URL(base),
    title: "Classic Car IQ — Challenge Invite",
    description: "Tap to open this Classic Car IQ challenge in the app.",
    alternates: { canonical: url },
    openGraph: {
      title: "Classic Car IQ — Challenge Invite",
      description: "Tap to open this Classic Car IQ challenge in the app.",
      url,
      type: "website",
      // Square app icon for iOS Share Sheet previews
      images: [{ url: appIcon, width: 512, height: 512, alt: "Classic Car IQ" }],
    },
    twitter: {
      // "summary" card type for square thumbnail (vs "summary_large_image" for rectangular)
      card: "summary",
      title: "Classic Car IQ — Challenge Invite",
      description: "Tap to open this Classic Car IQ challenge in the app.",
      images: [appIcon],
    },
  };
}

export default async function InvitePage({ params }: Props) {
  const { inviteCode } = await params;

  const detourTarget = buildDetourTarget(
    `challenges/${encodeURIComponent(inviteCode)}`,
  );

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <DetourRedirect target={detourTarget} />
      <h1>Classic Car IQ</h1>
      <p>
        Challenge invite: <strong>{inviteCode}</strong>
      </p>
      <p>If you aren’t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
