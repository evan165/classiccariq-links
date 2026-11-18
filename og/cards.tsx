/**
 * Share pictures (1200 x 630) in the 1.3.0 gauge style: dark ground, the cream
 * card from the app's "What they'll see", condensed type, scores on odometer
 * tiles and the real logo. Replaces the generic layout-map renderer, whose
 * result card came back as an empty file (Nov 18 2026).
 *
 * Sized to read as an iMessage / WhatsApp thumbnail (about a quarter size):
 * headlines are 80px and up, nothing that matters is under 30px.
 *
 * Everything here must stay inside what next/og (satori) draws: every box with
 * more than one child is display:flex, text sits in spans, no line clamping.
 */
import type { ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 } as const;

const BG = "#0E0D0B";
const CREAM = "#EFE6D2";
const INK = "#181715";
const INK_MUTED = "#6B6558";
const BRASS = "#D4B05C";
const AMBER = "#E0A33A";
const RUST = "#A04C2F";
const TEXT_MUTED = "#A69F92";
const LINE = "#CFC4AC";

const DISPLAY = "CCIQ Display";
const BODY = "CCIQ Text";

// ---------------------------------------------------------------- pieces

function Ground({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BG,
        position: "relative",
        fontFamily: BODY,
      }}
    >
      {/* the rust and brass stripes from the store pictures, top right */}
      <div style={{ position: "absolute", top: -40, right: 30, width: 34, height: 760, background: RUST, transform: "rotate(24deg)", display: "flex" }} />
      <div style={{ position: "absolute", top: -40, right: -14, width: 14, height: 760, background: BRASS, transform: "rotate(24deg)", display: "flex" }} />
      {children}
    </div>
  );
}

function Card({ children, tilt = -1.6 }: { children: ReactNode; tilt?: number }) {
  return (
    <div
      style={{
        width: 1036,
        height: 486,
        display: "flex",
        flexDirection: "column",
        background: CREAM,
        borderRadius: 44,
        padding: "36px 52px 40px",
        transform: `rotate(${tilt}deg)`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
        color: INK,
      }}
    >
      {children}
    </div>
  );
}

function Brand({ logoUrl, label }: { logoUrl: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoUrl} width={92} height={92} alt="" />
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, letterSpacing: 5, color: INK }}>{label}</span>
    </div>
  );
}

/** A score on an odometer tile: dark tile, cream digits, "/10" beside it. */
function Odo({ value, total, size = 150 }: { value: string; total?: number; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: INK,
          color: CREAM,
          borderRadius: 18,
          height: size,
          minWidth: size * 0.72,
          padding: "0 18px",
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: size * 0.84,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {total ? (
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: size * 0.34, color: INK_MUTED, marginBottom: 6 }}>{`/${total}`}</span>
      ) : null}
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: INK,
        color: CREAM,
        borderRadius: 999,
        height: 84,
        padding: "0 56px",
        fontFamily: BODY,
        fontWeight: 600,
        fontSize: 34,
      }}
    >
      {label}
    </div>
  );
}

function Headline({ children, size = 92 }: { children: ReactNode; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.95,
        textTransform: "uppercase",
        color: INK,
      }}
    >
      {children}
    </div>
  );
}

function Avatar({ name, src, size = 92, letter: forced }: { name: string; src?: string; size?: number; letter?: string }) {
  const letter = forced ?? (name.trim()[0] ?? "?").toUpperCase();
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={size} height={size} alt="" style={{ borderRadius: size, objectFit: "cover" }} />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: INK,
        color: CREAM,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size * 0.5,
      }}
    >
      {letter}
    </div>
  );
}

function fit(text: string, max: number) {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

// ---------------------------------------------------------------- invite

export type InviteCard = {
  logoUrl: string;
  name: string; // the sender, first name
  score: number | null; // null when they haven't finished their round
  total: number;
};

export function inviteCard({ logoUrl, name, score, total }: InviteCard) {
  const who = fit(name, 14);
  return (
    <Ground>
      <Card>
        <Brand logoUrl={logoUrl} label="CLASSIC CAR IQ CHALLENGE" />
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", gap: 40 }}>
          {score === null ? (
            <Headline size={104}>
              <span>{`${who} challenged you`}</span>
              <span style={{ color: RUST }}>{`${total} questions`}</span>
            </Headline>
          ) : (
            <>
              <Headline size={124}>
                <span>Can you</span>
                <span style={{ color: RUST }}>{`beat ${who}?`}</span>
              </Headline>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, letterSpacing: 5, color: INK_MUTED, textTransform: "uppercase" }}>{`${who} scored`}</span>
                <Odo value={String(score)} total={total} size={170} />
              </div>
            </>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 32, color: INK_MUTED }}>Plays in your browser. No download.</span>
          <Pill label="Take the challenge" />
        </div>
      </Card>
    </Ground>
  );
}

// ---------------------------------------------------------------- result

export type ResultLine = { name: string; avatar?: string; score: number | null; time?: string };

export type ResultCard = {
  logoUrl: string;
  total: number;
  a: ResultLine; // the challenger
  b: ResultLine | null; // the friend, if anyone has taken it
  winner: "a" | "b" | null;
};

function Line({ l, total, winner }: { l: ResultLine; total: number; winner: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, height: 140 }}>
      <Avatar name={l.name} src={l.avatar} size={96} letter={l.score === null && !l.avatar && l.name === "A friend" ? "?" : undefined} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, textTransform: "uppercase" }}>{fit(l.name, 16)}</span>
          {winner ? (
            <span
              style={{
                display: "flex",
                background: INK,
                color: AMBER,
                borderRadius: 10,
                padding: "4px 14px",
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: 3,
              }}
            >
              WINNER
            </span>
          ) : null}
        </div>
        <span style={{ fontSize: 30, color: INK_MUTED }}>{l.score === null ? "Hasn't played yet" : l.time ? `in ${l.time}` : " "}</span>
      </div>
      {l.score === null ? (
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 80, color: INK_MUTED }}>–</span>
      ) : (
        <Odo value={String(l.score)} total={total} size={112} />
      )}
    </div>
  );
}

export function resultCard({ logoUrl, total, a, b, winner }: ResultCard) {
  const done = !!b && b.score !== null && a.score !== null;
  const title = done
    ? winner === "a"
      ? `${fit(a.name, 12)} wins`
      : winner === "b"
        ? `${fit(b!.name, 12)} wins`
        : "Dead heat"
    : "Head to head";
  return (
    <Ground>
      <Card tilt={-1.2}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Brand logoUrl={logoUrl} label="CLASSIC CAR IQ" />
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, textTransform: "uppercase", color: RUST }}>{title}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <Line l={a} total={total} winner={winner === "a"} />
          <div style={{ display: "flex", height: 2, background: LINE, margin: "6px 0" }} />
          <Line l={b ?? { name: "A friend", score: null }} total={total} winner={winner === "b"} />
        </div>
        <span style={{ fontSize: 30, color: INK_MUTED }}>{`Same ${total} classic car questions. Best score wins; a tie goes to the faster time.`}</span>
      </Card>
    </Ground>
  );
}

// ---------------------------------------------------------------- Daily IQ (no result in the link)

export function dailyCard({ logoUrl, dayLabel }: { logoUrl: string; dayLabel: string }) {
  return (
    <Ground>
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Brand logoUrl={logoUrl} label="DAILY IQ" />
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: INK_MUTED }}>{dayLabel}</span>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          <Headline size={118}>
            <span>Today&apos;s question</span>
            <span style={{ color: RUST }}>is ready</span>
          </Headline>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 34, color: INK_MUTED }}>One question, one shot.</span>
          <Pill label="Play today's question" />
        </div>
      </Card>
    </Ground>
  );
}

// ---------------------------------------------------------------- player

export type PlayerCard = {
  logoUrl: string;
  name: string;
  avatar?: string;
  iq: number | null; // only when their stats are public
  points: number | null;
};

export function playerCard({ logoUrl, name, avatar, iq, points }: PlayerCard) {
  return (
    <Ground>
      <Card>
        <Brand logoUrl={logoUrl} label="CLASSIC CAR IQ" />
        <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 40 }}>
          <Avatar name={name} src={avatar} size={190} />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
            <Headline size={104}>
              <span>{fit(name, 16)}</span>
            </Headline>
            {points !== null ? (
              <span style={{ fontSize: 34, color: INK_MUTED }}>{`${points.toLocaleString("en-US")} points`}</span>
            ) : null}
          </div>
          {iq !== null ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, letterSpacing: 5, color: INK_MUTED }}>IQ</span>
              <Odo value={String(iq)} size={150} />
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Pill label="See how you compare" />
        </div>
      </Card>
    </Ground>
  );
}

// ---------------------------------------------------------------- fonts (edge runtime)

export async function loadCardFonts() {
  const load = (file: string) => fetch(new URL(`./fonts/${file}`, import.meta.url)).then((r) => r.arrayBuffer());
  const [c7, c8, b4, b6] = await Promise.all([
    load("BarlowCondensed_700Bold.ttf"),
    load("BarlowCondensed_800ExtraBold.ttf"),
    load("Barlow_400Regular.ttf"),
    load("Barlow_600SemiBold.ttf"),
  ]);
  return [
    { name: DISPLAY, data: c7, weight: 700 as const, style: "normal" as const },
    { name: DISPLAY, data: c8, weight: 800 as const, style: "normal" as const },
    { name: BODY, data: b4, weight: 400 as const, style: "normal" as const },
    { name: BODY, data: b6, weight: 600 as const, style: "normal" as const },
  ];
}
