import { inviteCard } from "../../../../../../og/cards";
import { cardResponse } from "../../../../../../og/respond";
import { getChallengeSummary } from "../../../../../lib/challengeSummary";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** The picture in a shared challenge link: who sent it and the score to beat. */
export async function GET(_req: Request, context: { params: Promise<{ inviteCode: string }> }) {
  const site = process.env.SITE_URL ?? "https://links.classiccariq.com";
  const { inviteCode } = await context.params;
  const summary = await getChallengeSummary(inviteCode);
  return cardResponse(
    () =>
      inviteCard({
        logoUrl: `${site}/classic-car-iq-square.png`,
        name: summary?.challengerName ?? "A friend",
        score: summary?.challengerScore ?? null,
        total: summary?.questionCount ?? 10,
      }),
    site,
  );
}
