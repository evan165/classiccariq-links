import { NextResponse, type NextRequest } from "next/server";

// Treat common preview crawlers as "bots" so they get the OG HTML (200)
// Everyone else gets a 302 to the Detour deep link.
const BOT_UA =
  /Slackbot|Twitterbot|Discordbot|facebookexternalhit|WhatsApp|TelegramBot|LinkedInBot|Googlebot|bingbot|DuckDuckBot|Baiduspider|YandexBot|Applebot|curl|wget/i;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  // Only handle /c/:inviteCode for this step
  if (!pathname.startsWith("/c/")) return NextResponse.next();

  // If it's a bot/crawler, serve the page (so OG tags can be read)
  if (BOT_UA.test(ua)) return NextResponse.next();

  // Humans: 302 redirect to Detour deep link
  // Set DETOUR_BASE_URL in Vercel (Project Settings → Environment Variables).
  // Example expected shape: https://YOUR-DET0UR-DOMAIN-HERE
  const detourBase = process.env.DETOUR_BASE_URL || "";
  const inviteCode = pathname.split("/")[2] || "";

  // Default pattern (adjust later if your Detour path format differs)
  const target = detourBase
    ? `${detourBase.replace(/\/+$/, "")}/c/${encodeURIComponent(inviteCode)}`
    : "https://links.classiccariq.com/";

  return NextResponse.redirect(target, 302);
}

export const config = {
  matcher: ["/c/:path*"],
};
