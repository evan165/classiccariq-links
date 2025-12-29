import type { Metadata } from "next";

import { DetourRedirect } from "@/app/components/DetourRedirect";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { profileId: string };
}): Promise<Metadata> {
  const profileId = params.profileId;

  const url = `https://links.classiccariq.com/p/${encodeURIComponent(profileId)}`;
  const title = "Classic Car IQ — Player Profile";
  const description = "View this Classic Car IQ player profile.";
  // Temporary placeholder; a dedicated static OG image can be swapped in later
  // without changing the page code.
  const ogImage = "https://links.classiccariq.com/favicon.ico";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
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

export default function PlayerProfilePage({
  params,
}: {
  params: { profileId: string };
}) {
  const profileId = params.profileId;
  const detourBase = process.env.DETOUR_BASE_URL || "";
  const normalizedBase = detourBase.replace(/\/+$/, "");
  const detourTarget = normalizedBase
    ? `${normalizedBase}/p/${encodeURIComponent(profileId)}`
    : "";

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <DetourRedirect target={detourTarget} />
      <h1>Classic Car IQ</h1>
      <p>Player profile: <strong>{profileId}</strong></p>
      <p>If you aren’t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
