export const runtime = "edge";

type Props = {
  params: Promise<{ inviteCode: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { inviteCode } = await params;
  const url = `https://links.classiccariq.com/c/${inviteCode}`;
  const image = `https://links.classiccariq.com/api/og/c/${inviteCode}`;

  return {
    title: "Classic Car IQ — Challenge Invite",
    description: "Tap to open this Classic Car IQ challenge in the app.",
    openGraph: {
      title: "Classic Car IQ — Challenge Invite",
      description: "Tap to open this Classic Car IQ challenge in the app.",
      url,
      type: "website",
      images: [
        {
          url: image,
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
  };
}

export default async function InvitePage({ params }: Props) {
  const { inviteCode } = await params;

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
