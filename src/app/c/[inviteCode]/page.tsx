import type { Metadata } from "next";

export const runtime = "edge";

function pickInviteCode(
  params: { inviteCode?: string },
  searchParams: { inviteCode?: string }
) {
  return params.inviteCode || searchParams.inviteCode || "unknown";
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { inviteCode?: string };
  searchParams: { inviteCode?: string };
}): Promise<Metadata> {
  const inviteCode = pickInviteCode(params, searchParams);

  const url = `https://links.classiccariq.com/c/${encodeURIComponent(inviteCode)}`;
  const title = "Classic Car IQ — Challenge Invite";
  const description = "Tap to open this Classic Car IQ challenge in the app.";
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
  searchParams,
}: {
  params: { inviteCode?: string };
  searchParams: { inviteCode?: string };
}) {
  const inviteCode = pickInviteCode(params, searchParams);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Classic Car IQ</h1>
      <p>
        Challenge invite: <strong>{inviteCode}</strong>
      </p>
      <p>If you aren’t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
