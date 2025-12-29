import type { Metadata } from "next";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Classic Car IQ — Daily IQ",
  description: "Take today’s Classic Car IQ Daily IQ challenge.",
  openGraph: {
    title: "Classic Car IQ — Daily IQ",
    description: "Take today’s Classic Car IQ Daily IQ challenge.",
    url: "https://links.classiccariq.com/daily-iq",
    type: "website",
    images: [
      {
        url: "https://links.classiccariq.com/api/og/daily-iq",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Classic Car IQ — Daily IQ",
    description: "Take today’s Classic Car IQ Daily IQ challenge.",
    images: ["https://links.classiccariq.com/api/og/daily-iq"],
  },
};

export default function DailyIQPage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Classic Car IQ</h1>
      <p>Daily IQ Challenge</p>
      <p>If you aren’t redirected automatically, open the Classic Car IQ app.</p>
    </main>
  );
}
