import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProductImage from "@/components/ProductImage";
import PriceTag from "@/components/PriceTag";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import { discountPercent, effectivePrice } from "@/lib/pricing";

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
  });

  if (!product || !product.active) notFound();

  const related = await db.product.findMany({
    where: {
      active: true,
      category: product.category,
      NOT: { id: product.id },
    },
    take: 4,
  });

  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= product.lowStockThreshold;

  return (
    <div className="container-site py-10">
      <nav className="mb-8 text-xs text-ink-muted">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-ink">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square border border-line">
          <ProductImage
            imageKey={product.imageKey}
            name={product.name}
            className="h-full w-full"
          />
          {off != null && (
            <span className="badge absolute left-4 top-4 bg-ink text-paper">
              {off}% Off
            </span>
          )}
        </div>

        <div>
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-ink-muted">{product.tagline}</p>

          <div className="mt-6">
            <PriceTag product={product} size="lg" />
          </div>

          <p className="mt-6 leading-relaxed text-ink-muted">{product.description}</p>

          <div className="mt-6 text-sm">
            {outOfStock ? (
              <span className="badge border border-ink text-ink">Out of Stock</span>
            ) : lowStock ? (
              <span className="text-ink-muted">Only {product.stock} left in stock</span>
            ) : (
              <span className="text-ink-muted">In stock</span>
            )}
          </div>

          <div className="mt-8">
            <AddToCartButton
              outOfStock={outOfStock}
              withQuantity
              item={{
                slug: product.slug,
                name: product.name,
                imageKey: product.imageKey,
                unitPrice: effectivePrice(product),
                maxStock: product.stock,
              }}
            />
          </div>

          <dl className="mt-10 divide-y divide-line border-t border-line text-sm">
            {product.servings && (
              <div className="flex gap-4 py-3">
                <dt className="w-32 shrink-0 font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Size
                </dt>
                <dd>{product.servings}</dd>
              </div>
            )}
            {product.ingredients && (
              <div className="flex gap-4 py-3">
                <dt className="w-32 shrink-0 font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Ingredients
                </dt>
                <dd className="text-ink-muted">{product.ingredients}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
