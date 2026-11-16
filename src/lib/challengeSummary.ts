import { supabaseServer } from "./supabase-server";

export type ChallengeSummary = {
  challengerName: string;
  challengerScore: number | null;
  questionCount: number;
  closed: boolean;
};

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/** Who sent a challenge and what they scored. Null if it can't be found quickly. */
export async function getChallengeSummary(inviteCode: string): Promise<ChallengeSummary | null> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const sb = supabaseServer();
    const { data: ch } = await withTimeout(
      sb
        .from("challenges")
        .select("challenger_profile_id, challenger_score, question_ids, status")
        .eq("invite_code", inviteCode)
        .maybeSingle(),
      1500,
    );
    if (!ch) return null;
    const { data: p } = await withTimeout(
      sb.from("profiles").select("display_name, username").eq("id", ch.challenger_profile_id).maybeSingle(),
      1200,
    );
    return {
      challengerName: firstName(p?.display_name || p?.username || ""),
      challengerScore: typeof ch.challenger_score === "number" ? ch.challenger_score : null,
      questionCount: Array.isArray(ch.question_ids) && ch.question_ids.length ? ch.question_ids.length : 10,
      closed: ch.status === "archived" || ch.status === "expired",
    };
  } catch {
    return null;
  }
}

/** "Dave Smith" → "Dave"; empty → "Your friend". Keeps share pages friendly and short. */
export function firstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  if (!first) return "Your friend";
  return first.length > 18 ? `${first.slice(0, 17)}…` : first;
}
