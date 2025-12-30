import type { Metadata } from "next";

import { DetourRedirect } from "@/app/components/DetourRedirect";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { inviteCode: string };
}): Promise<Metadata> {
  const inviteCode = params.inviteCode;
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || "dev";

  const url = `https://links.classiccariq.com/r/${encodeURIComponent(inviteCode)}`;
  const title = "Classic Car IQ — Challenge Result";
  const description = "See how this Classic Car IQ challenge turned out.";
  const ogImage = `https://links.classiccariq.com/api/og/r/${encodeURIComponent(
    inviteCode,
  )}?v=${encodeURIComponent(version)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ChallengeResultPage({
  params,
}: {
  params: { inviteCode: string };
}) {
  const inviteCode = params.inviteCode;
  const detourBase = process.env.DETOUR_BASE_URL || "";
  const normalizedBase = detourBase.replace(/\/+$/, "");
  const detourTarget = normalizedBase
    ? `${normalizedBase}/r/${encodeURIComponent(inviteCode)}`
    : "";

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <DetourRedirect target={detourTarget} />
      <h1>Classic Car IQ</h1>
      <p>Challenge result: <strong>{inviteCode}</strong></p>
      <p>If you aren’t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
