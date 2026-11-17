/**
 * A player's own Daily IQ result, as the picture in a shared link (1200 x 630).
 * Design: "B2 · Shared Daily IQ result card" on the design canvas
 * (https://claude.ai/artifact/H9puSahjxKGhoUgZP85mBX), approved with direction B.
 *
 * Left: that day's question photo fading into the dark background (or the badge
 * when the question has no photo). Right: day, result, streak on odometer digits,
 * and the call to play.
 */

const BG = "#12110F";
const CREAM = "#EFE6D2";
const INK = "#181715";
const GOLD = "#D4B05C";
const AMBER = "#E0A33A";
const GREEN = "#22C55E";
const RED = "#EF4444";

export type DailyResultCard = {
  dayLabel: string; // "NOV 16"
  right: boolean;
  seconds: string | null; // "6.2s"
  streak: number | null;
  photoUrl: string | null;
  logoUrl: string;
};

const condensed = "Barlow Condensed";

function Check() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

export function renderDailyResult(card: DailyResultCard) {
  const digits = card.streak ? String(card.streak).split("") : [];
  const headline = card.right ? (card.seconds ? `GOT IT IN ${card.seconds}` : "GOT IT") : "NOT THIS TIME";

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        background: BG,
        color: CREAM,
        display: "flex",
        overflow: "hidden",
        fontFamily: condensed,
      }}
    >
      <div style={{ width: 520, height: 630, position: "relative", display: "flex" }}>
        {card.photoUrl ? (
          <img
            src={card.photoUrl}
            alt=""
            width={520}
            height={630}
            style={{ position: "absolute", left: 0, top: 0, width: 520, height: 630, objectFit: "cover", objectPosition: "50% 55%" }}
          />
        ) : (
          <div style={{ position: "absolute", left: 0, top: 0, width: 520, height: 630, display: "flex", alignItems: "center", justifyContent: "center", background: INK }}>
            <img src={card.logoUrl} alt="" width={300} height={300} />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 520,
            height: 630,
            backgroundImage: `linear-gradient(90deg, rgba(18,17,15,0) 60%, ${BG} 100%)`,
          }}
        />
      </div>

      <div style={{ flex: 1, padding: "52px 56px 48px 24px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={card.logoUrl} alt="" width={80} height={80} />
          <span style={{ marginLeft: 16, fontWeight: 600, fontSize: 24, letterSpacing: 4.3, color: GOLD }}>
            {`DAILY IQ · ${card.dayLabel}`}
          </span>
        </div>

        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            color: card.right ? GREEN : RED,
            fontWeight: 800,
            fontSize: headline.length > 14 ? 70 : 76,
            lineHeight: 1,
          }}
        >
          {card.right ? <Check /> : <Cross />}
          <span style={{ marginLeft: 14 }}>{headline}</span>
        </div>

        {digits.length > 0 ? (
          <div style={{ marginTop: 22, display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex" }}>
              {digits.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: 52,
                    height: 70,
                    marginRight: 2,
                    background: CREAM,
                    color: INK,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 56,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            <span style={{ marginLeft: 14, fontWeight: 700, fontSize: 34, letterSpacing: 2.7 }}>DAY STREAK</span>
          </div>
        ) : null}

        <span style={{ marginTop: "auto", fontWeight: 700, fontSize: 34, letterSpacing: 2, color: AMBER }}>
          CAN YOU GET IT? TAP TO PLAY TODAY&apos;S
        </span>
      </div>
    </div>
  );
}
