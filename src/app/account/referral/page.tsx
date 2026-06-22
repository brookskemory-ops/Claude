import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ensureReferralCode } from "@/lib/referral";
import ReferralSection from "../ReferralSection";

export const metadata: Metadata = { title: "Referral Program" };

export default async function ReferralPage() {
  const session = await getSession();
  if (!session) redirect("/account/login?redirect=/account/referral");

  const code = await ensureReferralCode(session.sub);
  const [made, received] = await Promise.all([
    db.referral.findMany({ where: { referrerId: session.sub } }),
    db.referral.findUnique({ where: { refereeId: session.sub } }),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const link = `${siteUrl}/?ref=${code}`;
  const rewardCodes = made.map((r) => r.referrerCouponCode).filter((c): c is string => Boolean(c));
  const completed = made.filter((r) => r.status === "COMPLETED").length;
  const pending = made.filter((r) => r.status === "PENDING").length;

  return (
    <div className="container-site max-w-2xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow">Referral Program</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Refer a Researcher</h1>
        </div>
        <Link href="/account" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-ink">
          ← Account
        </Link>
      </div>

      <ReferralSection
        link={link}
        completed={completed}
        pending={pending}
        rewardCodes={rewardCodes}
        welcomeCode={received?.refereeCouponCode ?? null}
      />

      <div className="mt-8 border border-line p-6 text-sm text-ink-muted">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink">How it works</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Share your link with a colleague or lab.</li>
          <li>They get 10% off their first order when they sign up through it.</li>
          <li>Once their first order is placed, you receive a $10 reward code.</li>
        </ol>
      </div>
    </div>
  );
}
