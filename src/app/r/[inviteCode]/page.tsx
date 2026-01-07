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
export async function generateMetadata({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}): Promise<Metadata> {
  const { inviteCode } = await params;

  const base = "https://links.classiccariq.com";
  const url = `${base}/r/${encodeURIComponent(inviteCode)}`;
  const title = "Classic Car IQ — Challenge Result";
  const description = "See how this Classic Car IQ challenge turned out.";

  // Use square app icon for iOS Share Sheet previews (dark background, 512x512)
  const appIcon = `${base}/android-chrome-512x512.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      // Square app icon for iOS Share Sheet previews
      images: [{ url: appIcon, width: 512, height: 512, alt: "Classic Car IQ" }],
    },
    twitter: {
      // "summary" card type for square thumbnail (vs "summary_large_image" for rectangular)
      card: "summary",
      title,
      description,
      images: [appIcon],
    },
  };
}

export default async function ChallengeResultPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;

  const detourTarget = buildDetourTarget(
    `challenges/${encodeURIComponent(inviteCode)}`,
  );

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <DetourRedirect target={detourTarget} />
      <h1>Classic Car IQ</h1>
      <p>
        Challenge result: <strong>{inviteCode}</strong>
      </p>
      <p>If you aren’t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
