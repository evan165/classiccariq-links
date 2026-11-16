import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";

import { buildDetourTarget } from "@/lib/detour";
import { getChallengeSummary } from "@/lib/challengeSummary";

export const runtime = "edge";

/**
 * What a friend sees when they tap a shared challenge link.
 *
 * The friend plays first, in the browser, with no download and no sign-up:
 * "Take the challenge" opens the challenge on the website and starts it.
 * People who have the app can open it there instead. Design: direction B,
 * "B · 1 The friend opens the link" on https://claude.ai/artifact/H9puSahjxKGhoUgZP85mBX
 *
 * Wording is a draft pending Evan's approval.
 */

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });
const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const WEB = (process.env.WEB_URL ?? "https://www.classiccariq.com").replace(/\/+$/, "");
const APP_STORE_ID = "6756805269";

type Props = {
  params: Promise<{ inviteCode: string }>;
};

function headline(name: string, score: number | null, count: number) {
  if (score === null) return { top: `${name} challenged you`, bottom: "Can you beat them?" };
  return { top: `${name} scored ${score} out of ${count}`, bottom: `Can you beat ${name}?` };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { inviteCode } = await params;

  const base = "https://links.classiccariq.com";
  const url = `${base}/c/${encodeURIComponent(inviteCode)}`;
  const summary = await getChallengeSummary(inviteCode);
  const h = headline(summary?.challengerName ?? "Your friend", summary?.challengerScore ?? null, summary?.questionCount ?? 10);
  const title = `${h.top}. ${h.bottom}`;
  const description = `${summary?.questionCount ?? 10} classic car questions. Play right in your browser, no download.`;

  const v =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    "dev";

  const image = `${base}/api/og/c/${encodeURIComponent(inviteCode)}?v=${encodeURIComponent(v)}`;

  return {
    metadataBase: new URL(base),
    title,
    description,
    alternates: { canonical: url },
    // iPhone Safari shows Apple's own "Open in the app" banner to people who have it.
    itunes: { appId: APP_STORE_ID, appArgument: buildDetourTarget(`challenges/${encodeURIComponent(inviteCode)}`) },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

const C = {
  bg: "#12110F",
  surface: "#1C1A17",
  text: "#EFE6D2",
  muted: "#A69F92",
  brass: "#D4B05C",
  face: "#EFE6D2",
  ink: "#181715",
  bezel: "#8F8A80",
  rust: "#A04C2F",
  line: "#3A352E",
};

export default async function InvitePage({ params }: Props) {
  const { inviteCode } = await params;
  const summary = await getChallengeSummary(inviteCode);
  const name = summary?.challengerName ?? "Your friend";
  const count = summary?.questionCount ?? 10;
  const h = headline(name, summary?.challengerScore ?? null, count);

  const playUrl = `${WEB}/challenges/${encodeURIComponent(inviteCode)}?play=1`;
  const appUrl = buildDetourTarget(`challenges/${encodeURIComponent(inviteCode)}`);

  return (
    <main
      className={body.className}
      style={{ minHeight: "100dvh", background: C.bg, color: C.text, display: "flex", justifyContent: "center" }}
    >
      <div style={{ width: "100%", maxWidth: 440, padding: "18px 22px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/classic-car-iq-square.png" alt="Classic Car IQ" width={44} height={44} />
            <span className={display.className} style={{ fontWeight: 700, fontSize: 20, letterSpacing: "0.08em" }}>
              CLASSIC CAR IQ
            </span>
          </div>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          <span className={display.className} style={{ fontWeight: 600, fontSize: 15, letterSpacing: "0.2em", color: C.brass }}>
            HEAD-TO-HEAD CHALLENGE
          </span>
          <h1 className={display.className} style={{ fontWeight: 800, fontSize: 46, lineHeight: 0.98, textTransform: "uppercase" }}>
            {h.top}.
          </h1>
          <p className={display.className} style={{ fontWeight: 700, fontSize: 28, lineHeight: 1.05, color: C.brass, textTransform: "uppercase" }}>
            {h.bottom}
          </p>
        </div>

        {summary?.challengerScore !== null && summary?.challengerScore !== undefined ? (
          <div
            aria-label={`${name}'s score: ${summary.challengerScore} out of ${count}`}
            style={{ alignSelf: "flex-start", display: "flex", alignItems: "flex-end", gap: 6, background: C.face, color: C.ink, border: `4px solid ${C.bezel}`, borderRadius: 16, padding: "10px 14px" }}
          >
            <span className={display.className} style={{ fontWeight: 800, fontSize: 44, lineHeight: 1 }}>{summary.challengerScore}</span>
            <span className={display.className} style={{ fontWeight: 700, fontSize: 22, paddingBottom: 4 }}>/{count}</span>
            <span className={display.className} style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.16em", paddingBottom: 6, marginLeft: 8, color: "#4A443B" }}>
              {name.toUpperCase()}&apos;S SCORE
            </span>
          </div>
        ) : null}

        <ul style={{ listStyle: "none", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[`${count} questions`, "About 2 minutes", "No download", "No sign-up"].map((t) => (
            <li
              key={t}
              className={display.className}
              style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 12px", borderRadius: 6, border: `1px solid ${C.line}` }}
            >
              {t}
            </li>
          ))}
        </ul>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {summary?.closed ? (
            <p style={{ color: C.muted, textAlign: "center" }}>This challenge has closed. You can still play today&apos;s Daily IQ.</p>
          ) : null}
          <a
            href={summary?.closed ? `${WEB}/daily-iq` : playUrl}
            className={display.className}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 60, borderRadius: 30, border: `3px solid ${C.bezel}`, background: C.face, color: C.ink, fontWeight: 800, fontSize: 22, letterSpacing: "0.12em", textDecoration: "none" }}
          >
            {summary?.closed ? "PLAY TODAY'S DAILY IQ" : "TAKE THE CHALLENGE"}
          </a>
          <a href={appUrl} style={{ textAlign: "center", color: C.brass, fontWeight: 500, fontSize: 15, padding: "12px 0", textDecoration: "none" }}>
            Have the app? Play it there
          </a>
          <p style={{ textAlign: "center", color: C.muted, fontSize: 13 }}>Plays right here in your browser.</p>
        </div>
      </div>
    </main>
  );
}
