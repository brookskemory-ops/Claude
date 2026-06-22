"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIES, ORDER_STATUSES } from "@/lib/types";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  tagline: z.string().optional().default(""),
  category: z.enum(CATEGORIES),
  description: z.string().min(1, "Description is required"),
  ingredients: z.string().optional().default(""),
  servings: z.string().optional().default(""),
  price: z.coerce.number().positive("Price must be positive"),
  salePrice: z.coerce.number().optional(),
  saleEndsAt: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  imageKey: z.string().default("default"),
  featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
});

function parseProductForm(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    tagline: formData.get("tagline") || "",
    category: formData.get("category"),
    description: formData.get("description"),
    ingredients: formData.get("ingredients") || "",
    servings: formData.get("servings") || "",
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || undefined,
    saleEndsAt: formData.get("saleEndsAt") || undefined,
    stock: formData.get("stock"),
    lowStockThreshold: formData.get("lowStockThreshold") || 10,
    imageKey: formData.get("imageKey") || "default",
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  };
  return productSchema.safeParse(raw);
}

function toData(d: z.infer<typeof productSchema>) {
  return {
    name: d.name,
    slug: d.slug && d.slug.length ? slugify(d.slug) : slugify(d.name),
    tagline: d.tagline ?? "",
    category: d.category,
    description: d.description,
    ingredients: d.ingredients ?? "",
    servings: d.servings ?? "",
    price: d.price,
    salePrice: d.salePrice && d.salePrice > 0 ? d.salePrice : null,
    saleEndsAt: d.saleEndsAt ? new Date(d.saleEndsAt) : null,
    stock: d.stock,
    lowStockThreshold: d.lowStockThreshold ?? 10,
    imageKey: d.imageKey || "default",
    featured: d.featured,
    active: d.active,
  };
}

export type FormResult = { ok: false; error: string } | { ok: true };

export async function createProduct(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const parsed = parseProductForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };

  const data = toData(parsed.data);
  const existing = await db.product.findUnique({ where: { slug: data.slug } });
  if (existing) return { ok: false, error: "A product with that slug already exists." };

  await db.product.create({ data });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(id: string, _prev: FormResult | null, formData: FormData): Promise<FormResult> {
  await requireAdmin();
  const parsed = parseProductForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };

  const data = toData(parsed.data);
  const clash = await db.product.findFirst({
    where: { slug: data.slug, NOT: { id } },
  });
  if (clash) return { ok: false, error: "Another product already uses that slug." };

  await db.product.update({ where: { id }, data });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${data.slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const stock = Math.max(0, Math.floor(Number(formData.get("stock")) || 0));
  await db.product.update({ where: { id }, data: { stock } });
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
  .refine((d) => d.type !== "percent" || d.value <= 100, {
    message: "Percentage cannot exceed 100.",
  });

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
  const existing = await db.coupon.findUnique({ where: { code } });
  if (existing) return { ok: false, error: "That code already exists." };

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
  const id = String(formData.get("id"));
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}
