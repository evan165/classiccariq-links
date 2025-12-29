import type { Metadata } from "next";

import { DetourRedirect } from "@/app/components/DetourRedirect";

export const runtime = "edge";

type Props = {
  params: Promise<{ inviteCode: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { inviteCode } = await params;

  const url = `https://links.classiccariq.com/c/${inviteCode}`;
  // Use the existing OG endpoint so crawlers fetch a predictable image without
  // needing a new binary asset inside this repo. Middleware stays out of the
  // way, so bots see a normal 200 HTML response with this URL in the tags.
  const image = `https://links.classiccariq.com/api/og/c/${encodeURIComponent(
    inviteCode,
  )}`;

  return {
    metadataBase: new URL("https://links.classiccariq.com"),
    title: "Classic Car IQ — Challenge Invite",
    description: "Tap to open this Classic Car IQ challenge in the app.",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Classic Car IQ — Challenge Invite",
      description: "Tap to open this Classic Car IQ challenge in the app.",
      url,
      type: "website",
      images: [
        {
          url: image,
          secureUrl: image,
          type: "image/png",
          width: 1200,
          height: 630,
          alt: "Classic Car IQ — Challenge Invite",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Classic Car IQ — Challenge Invite",
      description: "Tap to open this Classic Car IQ challenge in the app.",
      images: [image],
    },
    other: {
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:type": "image/png",
      "og:image:secure_url": image,
    },
  };
}

export default async function InvitePage({ params }: Props) {
  const { inviteCode } = await params;
  const detourBase = process.env.DETOUR_BASE_URL || "";
  const normalizedBase = detourBase.replace(/\/+$/, "");
  const detourTarget = normalizedBase
    ? `${normalizedBase}/c/${encodeURIComponent(inviteCode)}`
    : "";

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
