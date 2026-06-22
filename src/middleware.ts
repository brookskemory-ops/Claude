import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const PREVIEW_COOKIE = "axevia_preview";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  // ---- Maintenance / coming-soon gate ----
  if (process.env.MAINTENANCE_MODE === "on") {
    const bypassCode = process.env.MAINTENANCE_BYPASS_CODE || "";
    const hasPreview =
      !!bypassCode && req.cookies.get(PREVIEW_COOKIE)?.value === bypassCode;
    const isAdmin = session?.role === "ADMIN";
    const allowed =
      pathname === "/maintenance" ||
      pathname.startsWith("/api/preview") ||
      pathname.startsWith("/account/login") || // admins must be able to sign in
      isAdmin ||
      hasPreview;
    if (!allowed) {
      const url = req.nextUrl.clone();
      url.pathname = "/maintenance";
      url.search = "";
      return NextResponse.rewrite(url);
    }
  }

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except Next internals, SEO files, and static assets.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)",
  ],
};
