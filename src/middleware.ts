import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  // Expose the path to server components (the root layout reads it for the
  // DB-driven maintenance gate, which can't run in edge middleware).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // ---- Auth protection ----
  const publicAccountPaths = [
    "/account/login",
    "/account/register",
    "/account/forgot",
    "/account/reset",
    "/account/verify",
  ];
  const isAccount =
    pathname.startsWith("/account") &&
    !publicAccountPaths.some((p) => pathname.startsWith(p));
  const isAdmin = pathname.startsWith("/admin");

  if ((isAccount || isAdmin) && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/account/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  if (isAdmin && session?.role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Run on everything except Next internals, SEO files, and static assets.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)",
  ],
};
