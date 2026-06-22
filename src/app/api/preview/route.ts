import { NextResponse, type NextRequest } from "next/server";
import { getSiteConfig } from "@/lib/config";

// Sets the preview bypass cookie when the correct maintenance access code is entered.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const code = String(form.get("code") || "");
  const config = await getSiteConfig();
  const expected = config.maintenanceCode || process.env.MAINTENANCE_BYPASS_CODE || "";

  if (expected && code === expected) {
    // 303 so the browser issues a GET to the homepage after the POST.
    const res = NextResponse.redirect(new URL("/", req.url), 303);
    res.cookies.set("axevia_preview", code, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return res;
  }

  return NextResponse.redirect(new URL("/maintenance?error=1", req.url), 303);
}
