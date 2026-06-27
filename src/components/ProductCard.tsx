import Link from "next/link";
import type { Product, ProductVariant } from "@prisma/client";
import ProductImage from "@/components/ProductImage";
import Stars from "@/components/Stars";
import { formatPrice } from "@/lib/format";
import { minEffectivePrice, anyOnSale, totalStock } from "@/lib/pricing";

type ProductWithVariants = Product & {
  variants: ProductVariant[];
  reviews?: { rating: number }[];
};

export default function ProductCard({ product }: { product: ProductWithVariants }) {
  const variants = product.variants.filter((v) => v.active);
  const fromPrice = minEffectivePrice(variants);
  const onSale = anyOnSale(variants);
  const outOfStock = totalStock(variants) <= 0;
  const reviews = product.reviews ?? [];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-2xl border border-line transition-shadow duration-300 group-hover:shadow-[0_8px_30px_rgba(10,10,10,0.08)]"
      >
        <ProductImage
          imageKey={product.imageKey}
          imageUrl={product.imageUrl}
          name={product.name}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {product.purity && (
          <span className="badge absolute left-3 top-3 bg-ink text-paper">
            {product.purity}
          </span>
        )}
        {onSale && !outOfStock && (
          <span className="badge-accent absolute right-3 top-3">Sale</span>
        )}
        {outOfStock && (
          <span className="badge absolute right-3 top-3 border border-ink bg-paper text-ink">
            Sold Out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          {product.category}
        </p>
        <Link href={`/product/${product.slug}`} className="mt-1">
          <h3 className="text-sm font-semibold hover:underline">{product.name}</h3>
        </Link>
        <p className="mt-1 line-clamp-1 text-xs text-ink-muted">
          {product.form}
          {variants.length > 1 ? ` · ${variants.length} sizes` : ""}
        </p>
        {product.coaUrl && (
          <p className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            COA included
          </p>
        )}
        {reviews.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <Stars rating={avgRating} size={12} />
            <span className="text-[11px] text-ink-muted">({reviews.length})</span>
          </div>
        )}
        <div className="mt-3 flex items-baseline gap-1 text-sm">
          {variants.length > 1 && <span className="text-xs text-ink-muted">from</span>}
          <span className="font-semibold">{formatPrice(fromPrice)}</span>
        </div>
        <div className="mt-3">
          <Link href={`/product/${product.slug}`} className="btn-outline btn-sm w-full">
            {variants.length > 1 ? "Select Options" : "View Product"}
          </Link>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
          Research Use Only
        </p>
      </div>
    </div>
  );
}
