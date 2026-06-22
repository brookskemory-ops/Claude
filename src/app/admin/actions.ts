"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIES, ORDER_STATUSES } from "@/lib/types";
import { buyCheapestLabel } from "@/lib/shipping";
import { markOrderShipped, refundOrder, cancelOrder } from "@/lib/orders";

function revalidateOrder(id: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account");
}

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export type FormResult = { ok: false; error: string } | { ok: true };

const variantSchema = z.object({
  label: z.string().min(1, "Variant size is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().positive("Price must be positive"),
  salePrice: z.union([z.coerce.number(), z.literal("")]).optional(),
  saleEndsAt: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  tagline: z.string().optional().default(""),
  category: z.enum(CATEGORIES),
  description: z.string().min(1, "Description is required"),
  purity: z.string().optional().default(""),
  form: z.string().optional().default("Lyophilized powder"),
  casNumber: z.string().optional().default(""),
  molecularFormula: z.string().optional().default(""),
  molecularWeight: z.string().optional().default(""),
  sequence: z.string().optional().default(""),
  storage: z.string().optional().default(""),
  coaUrl: z.string().optional().default(""),
  imageKey: z.string().default("vial"),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  variants: z.array(variantSchema).min(1, "Add at least one size/variant"),
});

function parseForm(formData: FormData) {
  let variants: unknown = [];
  try {
    variants = JSON.parse(String(formData.get("variants") || "[]"));
  } catch {
    variants = [];
  }
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    tagline: formData.get("tagline") || "",
    category: formData.get("category"),
    description: formData.get("description"),
    purity: formData.get("purity") || "",
    form: formData.get("form") || "Lyophilized powder",
    casNumber: formData.get("casNumber") || "",
    molecularFormula: formData.get("molecularFormula") || "",
    molecularWeight: formData.get("molecularWeight") || "",
    sequence: formData.get("sequence") || "",
    storage: formData.get("storage") || "",
    coaUrl: formData.get("coaUrl") || "",
    imageKey: formData.get("imageKey") || "vial",
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    variants,
  });
}

function productData(d: z.infer<typeof productSchema>) {
  return {
    name: d.name,
    slug: d.slug && d.slug.length ? slugify(d.slug) : slugify(d.name),
    tagline: d.tagline ?? "",
    category: d.category,
    description: d.description,
    purity: d.purity ?? "",
    form: d.form ?? "",
    casNumber: d.casNumber ?? "",
    molecularFormula: d.molecularFormula ?? "",
    molecularWeight: d.molecularWeight ?? "",
    sequence: d.sequence ?? "",
    storage: d.storage ?? "",
    coaUrl: d.coaUrl ?? "",
    imageKey: d.imageKey || "vial",
    featured: d.featured,
    active: d.active,
  };
}

function variantData(v: z.infer<typeof variantSchema>, sortOrder: number) {
  const salePrice = v.salePrice === "" || v.salePrice == null ? null : Number(v.salePrice);
  return {
    label: v.label,
    sku: v.sku.trim(),
    price: v.price,
    salePrice: salePrice && salePrice > 0 ? salePrice : null,
    saleEndsAt: v.saleEndsAt ? new Date(v.saleEndsAt) : null,
    stock: v.stock,
    lowStockThreshold: v.lowStockThreshold ?? 10,
    active: v.active,
    sortOrder,
  };
}

export async function createProduct(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };

  const data = productData(parsed.data);
  if (await db.product.findUnique({ where: { slug: data.slug } })) {
    return { ok: false, error: "A product with that slug already exists." };
  }
  const skus = parsed.data.variants.map((v) => v.sku.trim());
  if (await db.productVariant.findFirst({ where: { sku: { in: skus } } })) {
    return { ok: false, error: "One or more SKUs are already in use." };
  }

  await db.product.create({
    data: {
      ...data,
      variants: { create: parsed.data.variants.map((v, i) => variantData(v, i)) },
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(id: string, _prev: FormResult | null, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };

  const data = productData(parsed.data);
  if (await db.product.findFirst({ where: { slug: data.slug, NOT: { id } } })) {
    return { ok: false, error: "Another product already uses that slug." };
  }
  // SKU collisions against other products
  const skus = parsed.data.variants.map((v) => v.sku.trim());
  const clashing = await db.productVariant.findFirst({
    where: { sku: { in: skus }, productId: { not: id } },
  });
  if (clashing) return { ok: false, error: `SKU ${clashing.sku} is used by another product.` };

  await db.product.update({ where: { id }, data });

  // Upsert variants by SKU; remove any that were deleted in the form.
  const existing = await db.productVariant.findMany({ where: { productId: id } });
  const keepSkus = new Set(skus);
  for (const ex of existing) {
    if (!keepSkus.has(ex.sku)) await db.productVariant.delete({ where: { id: ex.id } });
  }
  for (let i = 0; i < parsed.data.variants.length; i++) {
    const vd = variantData(parsed.data.variants[i], i);
    await db.productVariant.upsert({
      where: { sku: vd.sku },
      create: { ...vd, productId: id },
      update: vd,
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  revalidatePath(`/product/${data.slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await db.product.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const variantId = String(formData.get("variantId"));
  const stock = Math.max(0, Math.floor(Number(formData.get("stock")) || 0));
  await db.productVariant.update({ where: { id: variantId }, data: { stock } });
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!ORDER_STATUSES.includes(status as never)) return;
  await db.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
}

const couponSchema = z
  .object({
    code: z.string().min(2, "Code is required"),
    type: z.enum(["percent", "amount"]),
    value: z.coerce.number().positive("Value must be positive"),
    expiresAt: z.string().optional(),
  })
  .refine((d) => d.type !== "percent" || d.value <= 100, { message: "Percentage cannot exceed 100." });

export async function createCoupon(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    expiresAt: formData.get("expiresAt") || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid coupon." };

  const code = parsed.data.code.trim().toUpperCase();
  if (await db.coupon.findUnique({ where: { code } })) {
    return { ok: false, error: "That code already exists." };
  }
  await db.coupon.create({
    data: {
      code,
      percentOff: parsed.data.type === "percent" ? Math.round(parsed.data.value) : null,
      amountOff: parsed.data.type === "amount" ? parsed.data.value : null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      active: true,
    },
  });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCoupon(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const coupon = await db.coupon.findUnique({ where: { id } });
  if (!coupon) return;
  await db.coupon.update({ where: { id }, data: { active: !coupon.active } });
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(formData: FormData) {
  await requireAdmin();
  await db.coupon.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/coupons");
}

// ---- Fulfillment ----

export async function markShipped(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const carrier = String(formData.get("carrier") || "Manual");
  const tracking = String(formData.get("tracking") || "");
  if (!tracking) return;
  await markOrderShipped(id, { carrier, tracking });
  revalidateOrder(id);
}

export async function buyLabel(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return;
  const addr = JSON.parse(order.shippingAddress);
  const result = await buyCheapestLabel(addr);
  if (result.ok) {
    await markOrderShipped(id, {
      carrier: result.carrier,
      tracking: result.tracking,
      labelUrl: result.labelUrl,
    });
  }
  revalidateOrder(id);
}

export async function markDelivered(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await db.order.update({ where: { id }, data: { status: "DELIVERED" } });
  revalidateOrder(id);
}

export async function refundOrderAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await refundOrder(id);
  revalidateOrder(id);
}

export async function cancelOrderAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await cancelOrder(id);
  revalidateOrder(id);
}

export async function updateReturn(formData: FormData) {
  await requireAdmin();
  const returnId = String(formData.get("returnId"));
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status"));
  if (!["REQUESTED", "APPROVED", "REJECTED", "COMPLETED"].includes(status)) return;
  await db.returnRequest.update({ where: { id: returnId }, data: { status } });
  revalidateOrder(orderId);
}
