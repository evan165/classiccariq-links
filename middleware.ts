import { NextResponse } from "next/server";

// Deep-link handling now happens in the page itself so we always return a 200
// HTML response here. That keeps social scrapers (Facebook, Apple Messages,
// etc.) from being bounced away before they can read OG metadata or fetch the
// preview image.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/c/:path*", "/r/:path*", "/p/:path*", "/daily-iq"],
};
