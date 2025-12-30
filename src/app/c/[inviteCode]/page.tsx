import type { Metadata } from "next";

import { DetourRedirect } from "@/app/components/DetourRedirect";

export const runtime = "edge";

type Props = {
  params: Promise<{ inviteCode: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { inviteCode } = await params;

  const base = "https://links.classiccariq.com";
  const url = `${base}/c/${inviteCode}`;

  const v =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    "dev";

  const image = `${base}/api/og/c/${inviteCode}?v=${encodeURIComponent(v)}`;

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
      images: [{ url: image, width: 1200, height: 630, alt: "Classic Car IQ — Challenge Invite" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Classic Car IQ — Challenge Invite",
      description: "Tap to open this Classic Car IQ challenge in the app.",
      images: [image],
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
