import "server-only";
import { db } from "@/lib/db";

function randCode(len: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** Returns the user's referral code, generating a unique one on first use. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (user?.referralCode) return user.referralCode;

  let code = "";
  for (let i = 0; i < 6; i++) {
    code = "AX" + randCode(6);
    const clash = await db.user.findUnique({ where: { referralCode: code } });
    if (!clash) break;
  }
  await db.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

/** Creates a unique coupon and returns its code. */
export async function createUniqueCoupon(opts: {
  prefix: string;
  percentOff?: number;
  amountOff?: number;
  maxRedemptions?: number;
  userId?: string;
}): Promise<string> {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code = `${opts.prefix}-${randCode(5)}`;
    const clash = await db.coupon.findUnique({ where: { code } });
    if (!clash) break;
  }
  await db.coupon.create({
    data: {
      code,
      percentOff: opts.percentOff ?? null,
      amountOff: opts.amountOff ?? null,
      active: true,
      maxRedemptions: opts.maxRedemptions ?? null,
      userId: opts.userId ?? null,
    },
  });
  return code;
}

export const REFEREE_PERCENT_OFF = 10;
export const REFERRER_AMOUNT_OFF = 10;
