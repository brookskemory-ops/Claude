import "server-only";
import { db } from "@/lib/db";
import {
  couponDiscount,
  effectivePrice,
  isCouponValid,
  round2,
  shippingFor,
} from "@/lib/pricing";
import { computeTax } from "@/lib/tax";
import {
  sendOrderConfirmation,
  sendLowStockAlert,
  sendShippingNotification,
  sendReferralReward,
} from "@/lib/email";
import { createUniqueCoupon, REFERRER_AMOUNT_OFF } from "@/lib/referral";
import { formatPrice } from "@/lib/format";
import { stripe } from "@/lib/stripe";
import { paypalRefund } from "@/lib/paypal";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

async function adminEmail(): Promise<string | null> {
  if (process.env.ADMIN_EMAIL) return process.env.ADMIN_EMAIL;
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  return admin?.email ?? null;
}

export type CheckoutItemInput = { variantId: string; quantity: number };

export type AddressInput = {
  recipient: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
};

export type CreateOrderInput = {
  email: string;
  userId: string | null;
  items: CheckoutItemInput[];
  shipping: AddressInput;
  billing: AddressInput;
  couponCode?: string;
  ruoAcknowledged: boolean;
  saveAddress?: boolean;
};

function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `AX-${stamp}${rand}`;
}

/** Creates a PENDING order with totals recomputed server-side from variant prices. */
export async function createPendingOrder(
  input: CreateOrderInput,
): Promise<{ ok: true; orderId: string; number: string; total: number } | { ok: false; error: string }> {
  if (!input.ruoAcknowledged) {
    return { ok: false, error: "You must accept the Research-Use-Only terms to continue." };
  }
  if (!input.items.length) return { ok: false, error: "Your cart is empty." };

  const ids = input.items.map((i) => i.variantId);
  const variants = await db.productVariant.findMany({
    where: { id: { in: ids }, active: true },
    include: { product: true },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lineItems: { variant: (typeof variants)[number]; unitPrice: number; quantity: number }[] = [];
  let subtotal = 0;
  for (const item of input.items) {
    const variant = byId.get(item.variantId);
    if (!variant || !variant.product.active) {
      return { ok: false, error: "A product in your cart is no longer available." };
    }
    if (variant.stock < item.quantity) {
      return { ok: false, error: `${variant.product.name} (${variant.label}) is out of stock.` };
    }
    const unitPrice = effectivePrice(variant);
    subtotal = round2(subtotal + unitPrice * item.quantity);
    lineItems.push({ variant, unitPrice, quantity: item.quantity });
  }

  let discount = 0;
  let couponCode: string | null = null;
  if (input.couponCode?.trim()) {
    const coupon = await db.coupon.findUnique({
      where: { code: input.couponCode.trim().toUpperCase() },
    });
    if (coupon && isCouponValid(coupon)) {
      discount = couponDiscount(coupon, subtotal);
      couponCode = coupon.code;
    }
  }

  const discountedSubtotal = round2(subtotal - discount);
  const shipping = shippingFor(discountedSubtotal);
  const taxUser = input.userId ? await db.user.findUnique({ where: { id: input.userId } }) : null;
  const tax = await computeTax(input.shipping.state, discountedSubtotal, taxUser?.taxExempt ?? false);
  const total = round2(discountedSubtotal + shipping + tax);
  const number = generateOrderNumber();

  const order = await db.order.create({
    data: {
      number,
      userId: input.userId,
      email: input.email,
      status: "PENDING",
      ruoAcknowledged: true,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      couponCode,
      shippingAddress: JSON.stringify(input.shipping),
      billingAddress: JSON.stringify(input.billing),
      items: {
        create: lineItems.map((li) => ({
          variantId: li.variant.id,
          productSlug: li.variant.product.slug,
          name: li.variant.product.name,
          variantLabel: li.variant.label,
          sku: li.variant.sku,
          imageKey: li.variant.product.imageKey,
          unitPrice: li.unitPrice,
          quantity: li.quantity,
        })),
      },
    },
  });

  if (input.userId && input.saveAddress) {
    await db.address.create({
      data: {
        userId: input.userId,
        label: "Shipping",
        recipient: input.shipping.recipient,
        line1: input.shipping.line1,
        line2: input.shipping.line2 || null,
        city: input.shipping.city,
        state: input.shipping.state,
        zip: input.shipping.zip,
        country: input.shipping.country,
        phone: input.shipping.phone || null,
      },
    });
  }

  return { ok: true, orderId: order.id, number, total };
}

/**
 * Marks a PENDING order PAID, decrementing variant stock atomically (oversell-guarded),
 * and sends a confirmation email. Idempotent: a no-op if the order is already finalized.
 */
export async function finalizeOrder(
  orderId: string,
  payment: { provider: string; ref?: string },
): Promise<{ ok: true; number: string } | { ok: false; error: string }> {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "PENDING") return { ok: true, number: order.number };

  try {
    await db.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.variantId) continue;
        const res = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (res.count === 0) throw new Error(`${item.name} (${item.variantLabel}) is out of stock.`);
      }
      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID", paymentProvider: payment.provider, paymentRef: payment.ref ?? null },
      });
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not finalize order." };
  }

  await sendOrderConfirmation({
    to: order.email,
    orderNumber: order.number,
    total: formatPrice(order.total),
    siteUrl: siteUrl(),
  });

  // Mark any abandoned-cart reminder for this email as recovered.
  await db.abandonedCart
    .updateMany({ where: { email: order.email.toLowerCase() }, data: { recovered: true } })
    .catch(() => {});

  // Alert admin about any variants that dropped to/below their low-stock threshold.
  const variantIds = order.items.map((i) => i.variantId).filter(Boolean) as string[];
  if (variantIds.length) {
    const lows = await db.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });
    const low = lows.filter((v) => v.stock <= v.lowStockThreshold);
    const to = await adminEmail();
    if (low.length && to) {
      await sendLowStockAlert({
        to,
        items: low.map((v) => ({ name: v.product.name, label: v.label, stock: v.stock })),
      });
    }
  }

  // Referral reward: when a referred customer completes their FIRST order, reward the referrer.
  if (order.userId) {
    const paidCount = await db.order.count({
      where: { userId: order.userId, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
    });
    if (paidCount === 1) {
      const referral = await db.referral.findFirst({
        where: { refereeId: order.userId, status: "PENDING" },
      });
      if (referral) {
        const rewardCode = await createUniqueCoupon({
          prefix: "REWARD",
          amountOff: REFERRER_AMOUNT_OFF,
        });
        await db.referral.update({
          where: { id: referral.id },
          data: { status: "COMPLETED", referrerCouponCode: rewardCode },
        });
        const referrer = await db.user.findUnique({ where: { id: referral.referrerId } });
        if (referrer) {
          await sendReferralReward({ to: referrer.email, code: rewardCode, siteUrl: siteUrl() });
        }
      }
    }
  }

  return { ok: true, number: order.number };
}

/** Returns stock to inventory for a paid/shipped order being refunded or cancelled. */
async function restockOrder(orderId: string) {
  const items = await db.orderItem.findMany({ where: { orderId } });
  await db.$transaction(
    items
      .filter((i) => i.variantId)
      .map((i) =>
        db.productVariant.update({
          where: { id: i.variantId as string },
          data: { stock: { increment: i.quantity } },
        }),
      ),
  );
}

/** Refunds an order via its payment provider, restocks, and marks it REFUNDED. */
export async function refundOrder(
  orderId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "REFUNDED") return { ok: true };

  try {
    if (order.paymentProvider === "stripe" && order.paymentRef && stripe) {
      await stripe.refunds.create({ payment_intent: order.paymentRef });
    } else if (order.paymentProvider === "paypal" && order.paymentRef) {
      const ok = await paypalRefund(order.paymentRef);
      if (!ok) return { ok: false, error: "PayPal refund failed." };
    }
    // "simulated" provider: nothing external to refund.
    await restockOrder(orderId);
    await db.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED", refundedAt: new Date() },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Refund failed." };
  }
}

/** Cancels an unfulfilled order, restocking if it was already paid. */
export async function cancelOrder(orderId: string): Promise<{ ok: boolean }> {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false };
  if (["PAID", "SHIPPED"].includes(order.status)) await restockOrder(orderId);
  await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  return { ok: true };
}

/** Marks an order shipped with tracking and emails the customer. */
export async function markOrderShipped(
  orderId: string,
  info: { carrier: string; tracking: string; labelUrl?: string },
): Promise<{ ok: boolean }> {
  const order = await db.order.update({
    where: { id: orderId },
    data: {
      status: "SHIPPED",
      trackingCarrier: info.carrier,
      trackingNumber: info.tracking,
      labelUrl: info.labelUrl ?? null,
      shippedAt: new Date(),
    },
  });
  await sendShippingNotification({
    to: order.email,
    orderNumber: order.number,
    carrier: info.carrier,
    tracking: info.tracking,
    siteUrl: siteUrl(),
  });
  return { ok: true };
}
