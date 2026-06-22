"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { couponDiscount, isCouponValid } from "@/lib/pricing";
import { computeTax } from "@/lib/tax";
import { createPendingOrder, finalizeOrder } from "@/lib/orders";
import { stripe } from "@/lib/stripe";
import { getHostedPaymentToken, hostedPaymentUrl } from "@/lib/authorizenet";

export async function saveAbandonedCart(
  email: string,
  items: { name: string; variantLabel: string; quantity: number; unitPrice: number }[],
  total: number,
): Promise<void> {
  if (!email || !items?.length) return;
  if (!z.string().email().safeParse(email).success) return;
  const key = email.toLowerCase();
  try {
    await db.abandonedCart.upsert({
      where: { email: key },
      create: { email: key, items: JSON.stringify(items), total, recovered: false },
      update: { items: JSON.stringify(items), total, recovered: false, remindedAt: null },
    });
  } catch {
    // best-effort; never block checkout
  }
}

export async function quoteTax(state: string, taxable: number): Promise<{ tax: number }> {
  const session = await getSession();
  let exempt = false;
  if (session) {
    const user = await db.user.findUnique({ where: { id: session.sub } });
    exempt = user?.taxExempt ?? false;
  }
  return { tax: await computeTax(state, taxable, exempt) };
}

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

const submitSchema = z.object({
  email: z.string().email("Valid email required"),
  items: z
    .array(z.object({ variantId: z.string(), quantity: z.number().int().positive() }))
    .min(1, "Cart is empty"),
  shipping: addressSchema,
  billing: addressSchema,
  couponCode: z.string().optional().default(""),
  ruoAcknowledged: z.boolean(),
  saveAddress: z.boolean().optional().default(false),
});

export type SubmitResult =
  | { ok: true; orderId: string; number: string; total: number }
  | { ok: false; error: string };

/** Creates the PENDING order (server-recomputed totals, RUO enforced). */
export async function submitOrder(input: unknown): Promise<SubmitResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid order." };
  }
  if (!parsed.data.ruoAcknowledged) {
    return { ok: false, error: "You must accept the Research-Use-Only terms." };
  }
  const session = await getSession();
  return createPendingOrder({ ...parsed.data, userId: session?.sub ?? null });
}

/** Creates a Stripe Checkout Session for a pending order; returns the redirect URL. */
export async function payWithStripe(
  orderId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!stripe) return { ok: false, error: "Stripe is not configured." };
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PENDING") {
    return { ok: false, error: "Order is no longer available." };
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  // Single consolidated line item keeps the charged amount exactly equal to our
  // server-computed total (incl. discount, shipping, tax).
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(order.total * 100),
          product_data: { name: `Axevia Order ${order.number}` },
        },
      },
    ],
    metadata: { orderId: order.id },
    success_url: `${site}/checkout/complete?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/checkout`,
  });
  return session.url
    ? { ok: true, url: session.url }
    : { ok: false, error: "Could not start Stripe checkout." };
}

/** Starts an Authorize.Net Accept Hosted payment; returns the token + form URL to POST to. */
export async function payWithAuthorizeNet(
  orderId: string,
): Promise<{ ok: true; token: string; url: string } | { ok: false; error: string }> {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PENDING") {
    return { ok: false, error: "Order is no longer available." };
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await getHostedPaymentToken({
    orderNumber: order.number,
    orderId: order.id,
    amount: order.total,
    siteUrl: site,
  });
  if (!res.ok) return res;
  return { ok: true, token: res.token, url: hostedPaymentUrl() };
}

/** Finalizes an order paid via the built-in simulated method (no payment keys set). */
export async function finalizeSimulated(
  orderId: string,
): Promise<{ ok: true; number: string } | { ok: false; error: string }> {
  return finalizeOrder(orderId, { provider: "simulated" });
}
