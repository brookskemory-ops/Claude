import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import ProductPurchase, { type PurchaseVariant } from "@/components/ProductPurchase";
import { minEffectivePrice, totalStock } from "@/lib/pricing";

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
    include: { variants: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
    take: 4,
  });

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

          <div className="mt-6">
            <ProductPurchase
              slug={product.slug}
              name={product.name}
              imageKey={product.imageKey}
              variants={variants}
            />
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
                  <dt className="w-40 shrink-0 font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    {s.label}
                  </dt>
                  <dd className="text-ink-muted">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6">
            {product.coaUrl ? (
              <a href={product.coaUrl} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                Download Certificate of Analysis
              </a>
            ) : (
              <span className="text-xs text-ink-muted">
                Certificate of Analysis available on request.
              </span>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}
