import Link from "next/link";
import type { Product } from "@prisma/client";
import ProductImage from "@/components/ProductImage";
import PriceTag from "@/components/PriceTag";
import AddToCartButton from "@/components/AddToCartButton";
import { discountPercent, effectivePrice } from "@/lib/pricing";

export default function ProductCard({ product }: { product: Product }) {
  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden border border-line">
        <ProductImage
          imageKey={product.imageKey}
          name={product.name}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {off != null && (
          <span className="badge absolute left-3 top-3 bg-ink text-paper">
            {off}% Off
          </span>
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
        <p className="mt-1 line-clamp-1 text-xs text-ink-muted">{product.tagline}</p>
        <div className="mt-3 flex items-center justify-between">
          <PriceTag product={product} size="sm" />
        </div>
        <div className="mt-3">
          <AddToCartButton
            outOfStock={outOfStock}
            className="btn-outline btn-sm w-full"
            item={{
              slug: product.slug,
              name: product.name,
              imageKey: product.imageKey,
              unitPrice: effectivePrice(product),
              maxStock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
