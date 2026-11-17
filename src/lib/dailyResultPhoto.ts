import { supabaseServer } from "@/lib/supabase-server";

import type { DailyResult } from "@/lib/dailyResult";

const BUCKET = "question-images";

/**
 * The photo for a shared Daily IQ result: the photo of that day's question,
 * but only if the question really was that day's Daily IQ. Returns null when
 * the pair doesn't match (the card is then not drawn), and photoUrl null when
 * the question has no photo (the card uses the badge instead).
 *
 * The JPEG copy is used because the image renderer can't draw WebP.
 */
export async function getDailyResultPhoto(
  res: DailyResult
): Promise<{ photoUrl: string | null } | null> {
  try {
    const supabase = supabaseServer();
    const { data: played } = await supabase
      .from("daily_iq_history")
      .select("question_id")
      .eq("played_on", res.day)
      .eq("question_id", res.questionId)
      .limit(1)
      .maybeSingle();
    if (!played) return null;

    const { data: q } = await supabase
      .from("questions")
      .select("image_storage_path")
      .eq("id", res.questionId)
      .maybeSingle();

    const path = (q?.image_storage_path as string | null) ?? null;
    if (!path) return { photoUrl: null };

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { photoUrl: data.publicUrl };
  } catch {
    return null;
  }
}
