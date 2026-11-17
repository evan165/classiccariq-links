/**
 * A player's own Daily IQ result, carried in the link they share:
 *
 *   /daily-iq?d=2026-11-16&q=<question id>&r=1&t=62&s=13
 *
 *   d  the Daily IQ day (YYYY-MM-DD)
 *   q  that day's question id (checked against the Daily IQ history, so a link
 *      can't put any other question's photo on the card)
 *   r  1 = got it, 0 = missed it
 *   t  answer time in tenths of a second (optional)
 *   s  current day streak (optional)
 *
 * Links without these (older app versions) keep showing the generic Daily IQ card.
 * The values come from the sharer's phone, so anything implausible is dropped
 * rather than drawn.
 */

export type DailyResult = {
  day: string;
  questionId: string;
  right: boolean;
  tenths: number | null;
  streak: number | null;
};

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

function one(p: Params, key: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(key) ?? undefined;
  const v = p[key];
  return Array.isArray(v) ? v[0] : v;
}

function intIn(raw: string | undefined, min: number, max: number): number | null {
  if (raw === undefined || !/^\d{1,6}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= min && n <= max ? n : null;
}

export function parseDailyResult(p: Params): DailyResult | null {
  const day = one(p, "d");
  const questionId = one(p, "q");
  const r = one(p, "r");
  if (!day || !questionId || (r !== "0" && r !== "1")) return null;

  const m = DAY.exec(day);
  if (!m) return null;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (date.toISOString().slice(0, 10) !== day || Number(m[1]) < 2025) return null;
  if (!UUID.test(questionId)) return null;

  return {
    day,
    questionId: questionId.toLowerCase(),
    right: r === "1",
    tenths: intIn(one(p, "t"), 5, 6000), // 0.5s to 10 minutes
    streak: intIn(one(p, "s"), 1, 9999),
  };
}

/** The same values as a query string, in a fixed order (used for the image link). */
export function dailyResultQuery(res: DailyResult): string {
  const q = new URLSearchParams({ d: res.day, q: res.questionId, r: res.right ? "1" : "0" });
  if (res.tenths !== null) q.set("t", String(res.tenths));
  if (res.streak !== null) q.set("s", String(res.streak));
  return q.toString();
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** "2026-11-16" -> "NOV 16" */
export function dayLabel(day: string): string {
  const [, mm, dd] = day.split("-");
  return `${MONTHS[Number(mm) - 1]} ${Number(dd)}`;
}

/** 62 -> "6.2s", 125 -> "12.5s", 900 -> "90s" */
export function secondsLabel(tenths: number): string {
  if (tenths >= 600) return `${Math.round(tenths / 10)}s`;
  return `${(tenths / 10).toFixed(1)}s`;
}

/** Headline and description for the link preview text (not the picture). */
export function resultHeadline(res: DailyResult): { title: string; description: string } {
  const when = `Daily IQ, ${dayLabel(res.day).replace(/^(\w)(\w+)/, (_, a: string, b: string) => a + b.toLowerCase())}`;
  const how = res.right
    ? res.tenths !== null
      ? `Got it in ${secondsLabel(res.tenths)}`
      : "Got it"
    : "Missed it";
  const streak = res.streak ? ` · ${res.streak}-day streak` : "";
  return {
    title: `${how}${streak}. Can you get it?`,
    description: `${when}: one classic car question a day. Tap to play today's.`,
  };
}
