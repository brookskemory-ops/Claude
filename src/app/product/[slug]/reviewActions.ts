"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().optional().default(""),
  body: z.string().min(1, "Please write a short review"),
});

export type ReviewResult = { ok: false; error: string } | { ok: true };

export async function submitReview(
  _prev: ReviewResult | null,
  formData: FormData,
): Promise<ReviewResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to write a review." };

  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    slug: formData.get("slug"),
    rating: formData.get("rating"),
    title: formData.get("title") || "",
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  const already = await db.review.findFirst({
    where: { productId: parsed.data.productId, userId: session.sub },
  });
  if (already) return { ok: false, error: "You've already reviewed this product." };

  // Verified if the user has a paid+ order containing this product.
  const verified = Boolean(
    await db.orderItem.findFirst({
      where: {
        productSlug: parsed.data.slug,
        order: { userId: session.sub, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      },
    }),
  );

  await db.review.create({
    data: {
      productId: parsed.data.productId,
      userId: session.sub,
      authorName: session.name,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      status: "PENDING",
      verified,
    },
  });

  revalidatePath(`/product/${parsed.data.slug}`);
  return { ok: true };
}
