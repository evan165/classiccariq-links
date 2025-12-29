import { NextResponse, type NextRequest } from "next/server";

// Treat common preview crawlers as "bots" so they get the OG HTML (200)
// Everyone else gets a 302 to the Detour deep link.
const BOT_UA =
  /Slackbot|Twitterbot|Discordbot|facebookexternalhit|WhatsApp|TelegramBot|LinkedInBot|Googlebot|bingbot|DuckDuckBot|Baiduspider|YandexBot|Applebot|curl|wget/i;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  const isShareRoute =
    pathname.startsWith("/c/") ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/p/") ||
    pathname === "/daily-iq";

  if (!isShareRoute) return NextResponse.next();

  // Bots: serve HTML so OG tags can be read.
  if (BOT_UA.test(ua)) return NextResponse.next();

  const detourBase = process.env.DETOUR_BASE_URL || "";
  if (!detourBase) return NextResponse.redirect("https://links.classiccariq.com/", 302);

  const base = detourBase.replace(/\/+$/, "");

  // /daily-iq has no param
  if (pathname === "/daily-iq") {
    return NextResponse.redirect(`${base}/daily-iq`, 302);
  }

  // /c/:code, /r/:code, /p/:profileId
  const parts = pathname.split("/").filter(Boolean); // ["c"|"r"|"p", id]
  const kind = parts[0] || "";
  const id = parts[1] || "";

  const target = `${base}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`;
  return NextResponse.redirect(target, 302);
}

export const config = {
  matcher: ["/c/:path*", "/r/:path*", "/p/:path*", "/daily-iq"],
};
