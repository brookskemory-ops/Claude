"use server";

import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIES, ORDER_STATUSES } from "@/lib/types";
import { buyCheapestLabel } from "@/lib/shipping";
import { markOrderShipped, refundOrder, cancelOrder } from "@/lib/orders";
import { processBackInStock } from "@/lib/stock";
import { logAudit } from "@/lib/audit";

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

  await processBackInStock();
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  revalidatePath(`/product/${data.slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await db.product.delete({ where: { id } });
  await logAudit("product.delete", id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const variantId = String(formData.get("variantId"));
  const stock = Math.max(0, Math.floor(Number(formData.get("stock")) || 0));
  await db.productVariant.update({ where: { id: variantId }, data: { stock } });
  await processBackInStock();
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!ORDER_STATUSES.includes(status as never)) return;
  await db.order.update({ where: { id }, data: { status } });
  await logAudit("order.status", `${id} -> ${status}`);
  revalidateOrder(id);
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
  await logAudit("order.ship", `${id} ${carrier} ${tracking}`);
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
  await logAudit("order.refund", id);
  revalidateOrder(id);
}

export async function cancelOrderAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await cancelOrder(id);
  await logAudit("order.cancel", id);
  revalidateOrder(id);
}

export async function updateReturn(formData: FormData) {
  await requireAdmin();
  const returnId = String(formData.get("returnId"));
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status"));
  if (!["REQUESTED", "APPROVED", "REJECTED", "COMPLETED"].includes(status)) return;
  await db.returnRequest.update({ where: { id: returnId }, data: { status } });
  await logAudit("return.update", `${returnId} -> ${status}`);
  revalidateOrder(orderId);
}

// ---- Tax rates ----

export async function createTaxRate(formData: FormData) {
  await requireAdmin();
  const state = String(formData.get("state") || "").trim().toUpperCase().slice(0, 2);
  const percent = Number(formData.get("percent") || 0);
  if (!state || percent < 0) return;
  await db.taxRate.upsert({ where: { state }, create: { state, percent }, update: { percent } });
  await logAudit("tax.set", `${state} = ${percent}%`);
  revalidatePath("/admin/tax");
}

export async function deleteTaxRate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const rate = await db.taxRate.findUnique({ where: { id } });
  await db.taxRate.delete({ where: { id } });
  await logAudit("tax.delete", rate?.state ?? id);
  revalidatePath("/admin/tax");
}

// ---- Customers ----

// ---- Reviews ----

export async function setReviewStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["PENDING", "APPROVED", "HIDDEN"].includes(status)) return;
  const review = await db.review.update({
    where: { id },
    data: { status },
    include: { product: { select: { slug: true } } },
  });
  await logAudit("review.status", `${id} -> ${status}`);
  revalidatePath("/admin/reviews");
  revalidatePath(`/product/${review.product.slug}`);
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const review = await db.review.delete({
    where: { id },
    include: { product: { select: { slug: true } } },
  });
  await logAudit("review.delete", id);
  revalidatePath("/admin/reviews");
  revalidatePath(`/product/${review.product.slug}`);
}

export async function toggleTaxExempt(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return;
  await db.user.update({ where: { id }, data: { taxExempt: !user.taxExempt } });
  await logAudit("customer.taxExempt", `${user.email} -> ${!user.taxExempt}`);
  revalidatePath("/admin/customers");
}

// ---- Site settings (maintenance mode) ----

export async function updateMaintenance(formData: FormData) {
  await requireAdmin();
  const on = formData.get("maintenanceMode") === "on";
  const code = String(formData.get("maintenanceCode") || "");
  await db.siteConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", maintenanceMode: on, maintenanceCode: code },
    update: { maintenanceMode: on, maintenanceCode: code },
  });
  await logAudit("maintenance", on ? "enabled" : "disabled");
  revalidateTag("site-config");
  revalidatePath("/admin/settings");
}

// ---- Blog posts ----

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().optional().default(""),
  body: z.string().optional().default(""),
  coverImageKey: z.string().optional().default(""),
  published: z.boolean().default(false),
});

function parsePost(formData: FormData) {
  return postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || "",
    body: formData.get("body") || "",
    coverImageKey: formData.get("coverImageKey") || "",
    published: formData.get("published") === "on",
  });
}

export async function createPost(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const parsed = parsePost(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid post." };
  const d = parsed.data;
  const slug = d.slug && d.slug.length ? slugify(d.slug) : slugify(d.title);
  if (await db.post.findUnique({ where: { slug } })) {
    return { ok: false, error: "A post with that slug already exists." };
  }
  await db.post.create({
    data: {
      slug,
      title: d.title,
      excerpt: d.excerpt ?? "",
      body: d.body ?? "",
      coverImageKey: d.coverImageKey ?? "",
      published: d.published,
    },
  });
  await logAudit("post", `created ${slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updatePost(id: string, _prev: FormResult | null, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const parsed = parsePost(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid post." };
  const d = parsed.data;
  const slug = d.slug && d.slug.length ? slugify(d.slug) : slugify(d.title);
  if (await db.post.findFirst({ where: { slug, NOT: { id } } })) {
    return { ok: false, error: "Another post already uses that slug." };
  }
  await db.post.update({
    where: { id },
    data: {
      slug,
      title: d.title,
      excerpt: d.excerpt ?? "",
      body: d.body ?? "",
      coverImageKey: d.coverImageKey ?? "",
      published: d.published,
    },
  });
  await logAudit("post", `updated ${slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog");
}

export async function deletePost(id: string): Promise<void> {
  await requireAdmin();
  await db.post.delete({ where: { id } });
  await logAudit("post", `deleted ${id}`);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

// ---- Bundles ----

const bundleItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

const bundleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional().default(""),
  imageKey: z.string().optional().default("default"),
  discountPercent: z.coerce.number().int().min(0).max(90).default(10),
  active: z.boolean().default(true),
  items: z.array(bundleItemSchema).min(1, "Add at least one product to the bundle"),
});

function parseBundle(formData: FormData) {
  let items: unknown = [];
  try {
    items = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    items = [];
  }
  return bundleSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || "",
    imageKey: formData.get("imageKey") || "default",
    discountPercent: formData.get("discountPercent") || 10,
    active: formData.get("active") === "on",
    items,
  });
}

export async function createBundle(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const parsed = parseBundle(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid bundle." };
  const d = parsed.data;
  const slug = d.slug && d.slug.length ? slugify(d.slug) : slugify(d.name);
  if (await db.bundle.findUnique({ where: { slug } })) {
    return { ok: false, error: "A bundle with that slug already exists." };
  }
  await db.bundle.create({
    data: {
      slug,
      name: d.name,
      description: d.description ?? "",
      imageKey: d.imageKey || "default",
      discountPercent: d.discountPercent,
      active: d.active,
      items: { create: d.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity })) },
    },
  });
  await logAudit("bundle", `created ${slug}`);
  revalidatePath("/admin/bundles");
  revalidatePath("/bundles");
  redirect("/admin/bundles");
}

export async function updateBundle(id: string, _prev: FormResult | null, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const parsed = parseBundle(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid bundle." };
  const d = parsed.data;
  const slug = d.slug && d.slug.length ? slugify(d.slug) : slugify(d.name);
  if (await db.bundle.findFirst({ where: { slug, NOT: { id } } })) {
    return { ok: false, error: "Another bundle already uses that slug." };
  }
  await db.bundle.update({
    where: { id },
    data: {
      slug,
      name: d.name,
      description: d.description ?? "",
      imageKey: d.imageKey || "default",
      discountPercent: d.discountPercent,
      active: d.active,
    },
  });
  await db.bundleItem.deleteMany({ where: { bundleId: id } });
  await db.bundleItem.createMany({
    data: d.items.map((it) => ({ bundleId: id, variantId: it.variantId, quantity: it.quantity })),
  });
  await logAudit("bundle", `updated ${slug}`);
  revalidatePath("/admin/bundles");
  revalidatePath("/bundles");
  revalidatePath(`/bundle/${slug}`);
  redirect("/admin/bundles");
}

export async function deleteBundle(id: string): Promise<void> {
  await requireAdmin();
  await db.bundle.delete({ where: { id } });
  await logAudit("bundle", `deleted ${id}`);
  revalidatePath("/admin/bundles");
  revalidatePath("/bundles");
}
