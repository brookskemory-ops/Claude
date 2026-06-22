import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://axevia.co";

  const staticPaths = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/faq",
    "/research-use-policy",
    "/terms",
    "/privacy",
    "/refund-policy",
    "/shipping-policy",
  ];

  const products = await db.product.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, lastModified: new Date() })),
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
