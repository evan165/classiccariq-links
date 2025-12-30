import { ImageResponse } from "next/og";
import { renderOg } from "@/og/renderer";
import { getChallengeByInviteCode } from "@/og/data";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: { inviteCode: string } }
) {
  const inviteCode = params.inviteCode;

  const challenge = await getChallengeByInviteCode(inviteCode);

  const element = renderOg({
    variant: "result",
    challenge,
  });

  return new ImageResponse(element, { width: 1200, height: 630 });
}
