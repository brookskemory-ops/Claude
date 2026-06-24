import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import ProductPurchase, { type PurchaseVariant } from "@/components/ProductPurchase";
import Stars from "@/components/Stars";
import TrustBadges from "@/components/TrustBadges";
import RecentlyViewed from "@/components/RecentlyViewed";
import { IconCOA } from "@/components/graphics";
import ProductReviewForm from "./ProductReviewForm";
import { minEffectivePrice, totalStock, FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await db.product.findUnique({ where: { slug: params.slug } });
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { variants: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
  });

  if (!product || !product.active) notFound();

  const related = await db.product.findMany({
    where: { active: true, category: product.category, NOT: { id: product.id } },
    include: {
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      reviews: { where: { status: "APPROVED" }, select: { rating: true } },
    },
    take: 4,
  });

  const [reviews, session] = await Promise.all([
    db.review.findMany({
      where: { productId: product.id, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    }),
    getSession(),
  ]);
  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : 0;

  const hasPurchased = session
    ? Boolean(
        await db.orderItem.findFirst({
          where: {
            productSlug: product.slug,
            order: { userId: session.sub, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
          },
        }),
      )
    : false;

  const variants: PurchaseVariant[] = product.variants.map((v) => ({
    id: v.id,
    label: v.label,
    sku: v.sku,
    price: v.price,
    salePrice: v.salePrice,
    saleEndsAt: v.saleEndsAt ? v.saleEndsAt.toISOString() : null,
    stock: v.stock,
  }));

  const specs: { label: string; value: string }[] = [
    { label: "Purity", value: product.purity },
    { label: "Form", value: product.form },
    { label: "CAS Number", value: product.casNumber },
    { label: "Molecular Formula", value: product.molecularFormula },
    { label: "Molecular Weight", value: product.molecularWeight },
    { label: "Sequence", value: product.sequence },
    { label: "Storage", value: product.storage },
  ].filter((s) => s.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.tagline,
    category: product.category,
    brand: { "@type": "Brand", name: "Axevia" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: minEffectivePrice(product.variants).toFixed(2),
      availability:
        totalStock(product.variants) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="container-site py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-8 text-xs text-ink-muted">
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-ink">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square border border-line">
          <ProductImage imageKey={product.imageKey} name={product.name} className="h-full w-full" />
          {product.purity && (
            <span className="badge absolute left-4 top-4 bg-ink text-paper">{product.purity}</span>
          )}
        </div>

        <div>
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{product.name}</h1>
          {product.tagline && <p className="mt-2 text-ink-muted">{product.tagline}</p>}
          {reviewCount > 0 && (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
              <Stars rating={avgRating} /> {avgRating.toFixed(1)} · {reviewCount} review{reviewCount !== 1 ? "s" : ""}
            </a>
          )}

          <div className="mt-6">
            <ProductPurchase
              slug={product.slug}
              name={product.name}
              imageKey={product.imageKey}
              variants={variants}
            />
          </div>

          <p className="mt-4 text-xs text-ink-muted">
            Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)} · Ships within 1 business day
          </p>

          {/* COA — front and center */}
          <div className="mt-5 flex items-start gap-3 border border-ink p-4">
            <IconCOA className="mt-0.5 h-6 w-6 shrink-0 text-ink" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Certificate of Analysis</p>
              <p className="mt-1 text-xs text-ink-muted">
                Lot-matched HPLC purity and mass-spec identity from an independent laboratory.
              </p>
              {product.coaUrl ? (
                <a
                  href={product.coaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline btn-sm mt-3"
                >
                  View Certificate of Analysis
                </a>
              ) : (
                <p className="mt-3 text-xs text-ink-muted">Available on request for this lot.</p>
              )}
            </div>
          </div>

          <div className="mt-8 border border-ink bg-paper-muted p-4 text-xs leading-relaxed">
            <p className="font-semibold uppercase tracking-[0.14em]">Research Use Only</p>
            <p className="mt-1 text-ink-muted">
              For laboratory research use only. Not a drug, food, or cosmetic. Not for human or
              veterinary use, diagnostic, or therapeutic purposes.
            </p>
          </div>

          {product.description && (
            <p className="mt-8 leading-relaxed text-ink-muted">{product.description}</p>
          )}

          {specs.length > 0 && (
            <dl className="mt-8 divide-y divide-line border-t border-line text-sm">
              {specs.map((s) => (
                <div key={s.label} className="flex gap-4 py-3">
                  <dt className="w-28 shrink-0 font-semibold uppercase tracking-[0.12em] text-ink-muted sm:w-40">
                    {s.label}
                  </dt>
                  <dd className="text-ink-muted">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <TrustBadges variant="inline" className="mt-8 border-t border-line pt-6" />
        </div>
      </div>

      <TrustBadges className="mt-16" />

      {/* Reviews */}
      <section id="reviews" className="mt-24 border-t border-line pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
            {reviewCount > 0 ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                <Stars rating={avgRating} /> {avgRating.toFixed(1)} out of 5 · {reviewCount} review
                {reviewCount !== 1 ? "s" : ""}
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">No reviews yet.</p>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-line pb-6">
                <div className="flex items-center gap-3">
                  <Stars rating={r.rating} />
                  {r.verified && (
                    <span className="badge border border-line text-ink-muted">Verified buyer</span>
                  )}
                </div>
                {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                <p className="mt-1 text-sm text-ink-muted">{r.body}</p>
                <p className="mt-2 text-xs text-ink-muted">
                  {r.authorName} · {formatDate(r.createdAt)}
                </p>
              </div>
            ))}
            {reviewCount === 0 && (
              <p className="text-sm text-ink-muted">Be the first to review this product.</p>
            )}
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em]">Write a review</h3>
            <ProductReviewForm
              productId={product.id}
              slug={product.slug}
              signedIn={!!session}
              hasPurchased={hasPurchased}
            />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">Related Products</h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed
        current={{
          slug: product.slug,
          name: product.name,
          imageKey: product.imageKey,
          category: product.category,
          fromPrice: minEffectivePrice(product.variants),
        }}
      />
    </div>
  );
}
