import { NextRequest, NextResponse } from "next/server";

import { buildDetourTarget } from "@/lib/detour";

// Deep-link handling now happens in the page itself so we always return a 200
// HTML response here. That keeps social scrapers (Facebook, Apple Messages,
// etc.) from being bounced away before they can read OG metadata or fetch the
// preview image.
export function middleware(request: NextRequest) {
  const target = resolveDetourTarget(request.nextUrl.pathname);

  if (!target) {
    return NextResponse.next();
  }

  if (request.method === "HEAD") {
    return NextResponse.redirect(target);
  }

  const response = NextResponse.next();
  response.headers.set("Location", target);
  return response;
}

export const config = {
  matcher: ["/c/:path*", "/r/:path*", "/p/:path*", "/daily-iq"],
};

function resolveDetourTarget(pathname: string) {
  const [, first, second] = pathname.split("/");

  if (first === "daily-iq") {
    return buildDetourTarget("daily-iq");
  }

  if ((first === "c" || first === "r") && second) {
    return buildDetourTarget(`challenges/${encodeURIComponent(second)}`);
  }

  if (first === "p" && second) {
    return buildDetourTarget(`player/${encodeURIComponent(second)}`);
  }
}
