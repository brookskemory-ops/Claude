import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/account", req.url));

  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await db.verificationToken.findUnique({ where: { tokenHash: hash } });

  if (record && record.expiresAt > new Date()) {
    await db.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } });
    await db.verificationToken.delete({ where: { id: record.id } });
    return NextResponse.redirect(new URL("/account?verified=1", req.url));
  }

  return NextResponse.redirect(new URL("/account?verified=0", req.url));
}
