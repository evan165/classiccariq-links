import type { Metadata } from "next";
import { DetourRedirect } from "@/app/components/DetourRedirect";
import { buildDetourTarget } from "@/lib/detour";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}): Promise<Metadata> {
  const { inviteCode } = await params;

  const url = `https://links.classiccariq.com/r/${encodeURIComponent(inviteCode)}`;
  const title = "Classic Car IQ — Challenge Result";
  const description = "See how this Classic Car IQ challenge turned out.";

  // Single query param only (prevents &amp; escaping issues)
  const cb = Date.now().toString();
  const ogImage = `https://links.classiccariq.com/api/og/r/${encodeURIComponent(inviteCode)}?cb=${encodeURIComponent(cb)}`;

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
