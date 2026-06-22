"use server";

import { z } from "zod";
import type { Product } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  couponDiscount,
  effectivePrice,
  isCouponValid,
  round2,
  shippingFor,
  TAX_RATE,
} from "@/lib/pricing";

const addressSchema = z.object({
  recipient: z.string().min(1, "Required"),
  line1: z.string().min(1, "Required"),
  line2: z.string().optional().default(""),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  zip: z.string().min(1, "Required"),
  country: z.string().min(1).default("United States"),
  phone: z.string().optional().default(""),
});

const checkoutSchema = z.object({
  email: z.string().email("Valid email required"),
  items: z
    .array(z.object({ slug: z.string(), quantity: z.number().int().positive() }))
    .min(1, "Cart is empty"),
  shipping: addressSchema,
  billing: addressSchema,
  couponCode: z.string().optional().default(""),
  saveAddress: z.boolean().optional().default(false),
});

export type CheckoutResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!coupon || !isCouponValid(coupon)) {
    return { ok: false as const, message: "Invalid or expired code." };
  }
  const discount = couponDiscount(coupon, subtotal);
  return {
    ok: true as const,
    code: coupon.code,
    discount,
    message: `Applied ${coupon.code} — you saved $${discount.toFixed(2)}.`,
  };
}

function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `AX-${stamp}${rand}`;
}

export async function placeOrder(input: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid order." };
  }
  const data = parsed.data;
  const session = await getSession();

  // Recompute everything from the database — never trust client-supplied prices.
  const slugs = data.items.map((i) => i.slug);
  const products = await db.product.findMany({
    where: { slug: { in: slugs }, active: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lineItems: { product: Product; unitPrice: number; quantity: number }[] =
    [];
  let subtotal = 0;
  for (const item of data.items) {
    const product = bySlug.get(item.slug);
    if (!product) return { ok: false, error: `A product is no longer available.` };
    if (product.stock < item.quantity) {
      return { ok: false, error: `${product.name} is out of stock.` };
    }
    const unitPrice = effectivePrice(product);
    subtotal = round2(subtotal + unitPrice * item.quantity);
    lineItems.push({ product, unitPrice, quantity: item.quantity });
  }

  let discount = 0;
  let couponCode: string | null = null;
  if (data.couponCode.trim()) {
    const coupon = await db.coupon.findUnique({
      where: { code: data.couponCode.trim().toUpperCase() },
    });
    if (coupon && isCouponValid(coupon)) {
      discount = couponDiscount(coupon, subtotal);
      couponCode = coupon.code;
    }
  }

  const discountedSubtotal = round2(subtotal - discount);
  const shipping = shippingFor(discountedSubtotal);
  const tax = round2(discountedSubtotal * TAX_RATE);
  const total = round2(discountedSubtotal + shipping + tax);
  const orderNumber = generateOrderNumber();

  try {
    await db.$transaction(async (tx) => {
      // Guard each decrement so concurrent orders can't oversell.
      for (const li of lineItems) {
        const res = await tx.product.updateMany({
          where: { id: li.product.id, stock: { gte: li.quantity } },
          data: { stock: { decrement: li.quantity } },
        });
        if (res.count === 0) {
          throw new Error(`${li.product.name} is out of stock.`);
        }
      }

      await tx.order.create({
        data: {
          number: orderNumber,
          userId: session?.sub ?? null,
          email: data.email,
          status: "PAID",
          subtotal,
          discount,
          shipping,
          tax,
          total,
          couponCode,
          shippingAddress: JSON.stringify(data.shipping),
          billingAddress: JSON.stringify(data.billing),
          items: {
            create: lineItems.map((li) => ({
              productId: li.product.id,
              name: li.product.name,
              slug: li.product.slug,
              imageKey: li.product.imageKey,
              unitPrice: li.unitPrice,
              quantity: li.quantity,
            })),
          },
        },
      });

      if (session && data.saveAddress) {
        await tx.address.create({
          data: {
            userId: session.sub,
            label: "Shipping",
            recipient: data.shipping.recipient,
            line1: data.shipping.line1,
            line2: data.shipping.line2 || null,
            city: data.shipping.city,
            state: data.shipping.state,
            zip: data.shipping.zip,
            country: data.shipping.country,
            phone: data.shipping.phone || null,
          },
        });
      }
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not place order.",
    };
  }

  return { ok: true, orderNumber };
}
