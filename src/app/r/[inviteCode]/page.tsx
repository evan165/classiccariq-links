import type { Metadata } from "next";
import { DetourRedirect } from "@/app/components/DetourRedirect";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}): Promise<Metadata> {
  const { inviteCode } = await params;

  const version =
    process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || "dev";

  // Extra cache-buster to prevent scrapers from reusing an old og:image fetch
  const cb = Date.now().toString();

  const url = `https://links.classiccariq.com/r/${encodeURIComponent(inviteCode)}`;
  const title = "Classic Car IQ — Challenge Result";
  const description = "See how this Classic Car IQ challenge turned out.";
  const ogImage = `https://links.classiccariq.com/api/og/r/${encodeURIComponent(
    inviteCode
  )}?v=${encodeURIComponent(version)}&cb=${encodeURIComponent(cb)}`;

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

export default async function ChallengeResultPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;

  const detourBase = process.env.DETOUR_BASE_URL || "";
  const normalizedBase = detourBase.replace(/\/+$/, "");
  const detourTarget = normalizedBase
    ? `${normalizedBase}/r/${encodeURIComponent(inviteCode)}`
    : "";

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
