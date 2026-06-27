import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createUniqueCoupon } from "@/lib/referral";
import { sendPresaleWelcome, sendPresaleSignupNotice } from "@/lib/email";
import { siteUrl } from "@/lib/url";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/account", req.url));

  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await db.verificationToken.findUnique({ where: { tokenHash: hash } });

  if (record && record.expiresAt > new Date()) {
    const user = await db.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    });
    await db.verificationToken.delete({ where: { id: record.id } });

    // Pre-sale members receive their one-time, account-locked code once verified.
    if (user.source === "presale" && !user.presaleCode) {
      const code = await createUniqueCoupon({
        prefix: "AXV",
        percentOff: 5,
        maxRedemptions: 1,
        userId: user.id,
      });
      await db.user.update({ where: { id: user.id }, data: { presaleCode: code } });
      await sendPresaleWelcome({ to: user.email, code, siteUrl: siteUrl() });
      await sendPresaleSignupNotice({
        subscriberEmail: user.email,
        name: user.name,
        code,
        siteUrl: siteUrl(),
      });
      return NextResponse.redirect(new URL("/maintenance?verified=1", req.url));
    }

    return NextResponse.redirect(new URL("/account?verified=1", req.url));
  }

  return NextResponse.redirect(new URL("/account?verified=0", req.url));
}
