import type { Metadata } from "next";

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

  const ogImage = `https://links.classiccariq.com/api/og/p/${encodeURIComponent(profileId)}`;

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

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Classic Car IQ</h1>
      <p>Player profile: <strong>{profileId}</strong></p>
      <p>If you aren’t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
