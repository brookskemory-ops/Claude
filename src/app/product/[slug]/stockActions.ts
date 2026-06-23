"use server";

import { z } from "zod";
import { db } from "@/lib/db";

export type StockNotifyResult = { ok: true } | { ok: false; error: string };

/** Records a request to be emailed when a sold-out variant is back in stock. */
export async function requestStockNotification(
  variantId: string,
  email: string,
): Promise<StockNotifyResult> {
  if (!z.string().email().safeParse(email).success) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  const variant = await db.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return { ok: false, error: "Product not found." };
  if (variant.stock > 0) return { ok: false, error: "Good news — this item is in stock." };

  try {
    await db.stockNotification.upsert({
      where: { variantId_email: { variantId, email: email.toLowerCase() } },
      create: { variantId, email: email.toLowerCase() },
      update: { notified: false },
    });
  } catch {
    return { ok: false, error: "Couldn't save your request — please try again." };
  }
  return { ok: true };
}
