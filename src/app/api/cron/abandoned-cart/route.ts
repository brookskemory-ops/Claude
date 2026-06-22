import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sendAbandonedCart } from "@/lib/email";

// Hourly via Vercel Cron. Emails carts abandoned >1h ago that haven't been
// recovered or already reminded. Protected by CRON_SECRET.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - 60 * 60 * 1000);
  const carts = await db.abandonedCart.findMany({
    where: { recovered: false, remindedAt: null, createdAt: { lt: cutoff } },
    take: 100,
  });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://axevia.co";
  for (const cart of carts) {
    await sendAbandonedCart({ to: cart.email, siteUrl: site });
    await db.abandonedCart.update({ where: { id: cart.id }, data: { remindedAt: new Date() } });
  }

  return Response.json({ reminded: carts.length });
}
