import type { Metadata } from "next";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { inviteCode: string };
}): Promise<Metadata> {
  const inviteCode = params.inviteCode;

  const url = `https://links.classiccariq.com/c/${encodeURIComponent(inviteCode)}`;
  const title = "Classic Car IQ — Challenge Invite";
  const description = "Tap to open this Classic Car IQ challenge in the app.";

  // We'll implement the real dynamic image next. For now this is the intended endpoint.
  const ogImage = `https://links.classiccariq.com/api/og/c/${encodeURIComponent(inviteCode)}`;

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

export default function ChallengeInvitePage({
  params,
}: {
  params: { inviteCode: string };
}) {
  const inviteCode = params.inviteCode;

  // Humans should be redirected by middleware. This page mainly exists for crawlers.
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Classic Car IQ</h1>
      <p>Challenge invite: <strong>{inviteCode}</strong></p>
      <p>If you aren’t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
