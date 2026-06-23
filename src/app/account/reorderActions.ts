"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { effectivePrice } from "@/lib/pricing";
import type { CartItem } from "@/lib/types";

/**
 * Returns the still-available items from a past order as cart items, re-priced to
 * current values and clamped to current stock. Skips removed/inactive/out-of-stock items.
 */
export async function getReorderItems(
  orderId: string,
): Promise<{ ok: true; items: CartItem[] } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to reorder." };

  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.sub },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "Order not found." };

  const variantIds = order.items.map((i) => i.variantId).filter(Boolean) as string[];
  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds }, active: true },
    include: { product: true },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const items: CartItem[] = [];
  for (const it of order.items) {
    if (!it.variantId) continue;
    const v = byId.get(it.variantId);
    if (!v || !v.product.active || v.stock <= 0) continue;
    items.push({
      variantId: v.id,
      slug: v.product.slug,
      name: v.product.name,
      variantLabel: v.label,
      sku: v.sku,
      imageKey: v.product.imageKey,
      unitPrice: effectivePrice(v),
      quantity: Math.min(it.quantity, v.stock),
      maxStock: v.stock,
    });
  }

  if (items.length === 0) {
    return { ok: false, error: "None of these items are available to reorder right now." };
  }
  return { ok: true, items };
}
