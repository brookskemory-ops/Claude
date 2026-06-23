import "server-only";
import { db } from "@/lib/db";
import { sendBackInStock } from "@/lib/email";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/**
 * Emails everyone waiting on a variant that is now back in stock, then marks those
 * notifications sent. Safe to call after any stock increase (admin edits, restocks).
 */
export async function processBackInStock(): Promise<void> {
  const pending = await db.stockNotification.findMany({
    where: { notified: false, variant: { stock: { gt: 0 } } },
    include: { variant: { include: { product: true } } },
  });

  for (const n of pending) {
    await sendBackInStock({
      to: n.email,
      productName: n.variant.product.name,
      variantLabel: n.variant.label,
      slug: n.variant.product.slug,
      siteUrl: siteUrl(),
    });
    await db.stockNotification.update({ where: { id: n.id }, data: { notified: true } });
  }
}
