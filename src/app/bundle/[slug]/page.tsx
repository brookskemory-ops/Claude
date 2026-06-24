import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProductImage from "@/components/ProductImage";
import AddBundleButton from "@/components/AddBundleButton";
import TrustBadges from "@/components/TrustBadges";
import { effectivePrice, round2 } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const bundle = await db.bundle.findUnique({ where: { slug: params.slug } });
  return { title: bundle?.name ?? "Bundle" };
}

export default async function BundlePage({ params }: { params: { slug: string } }) {
  const bundle = await db.bundle.findUnique({
    where: { slug: params.slug },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  if (!bundle || !bundle.active) notFound();

  const disc = bundle.discountPercent;
  let normalTotal = 0;
  const cartItems: CartItem[] = [];
  for (const it of bundle.items) {
    const v = it.variant;
    const base = effectivePrice(v);
    normalTotal = round2(normalTotal + base * it.quantity);
    cartItems.push({
      variantId: v.id,
      slug: v.product.slug,
      name: v.product.name,
      variantLabel: v.label,
      sku: v.sku,
      imageKey: v.product.imageKey,
      unitPrice: round2(base * (1 - disc / 100)),
      quantity: it.quantity,
      maxStock: v.stock,
      bundleId: bundle.id,
      bundleName: bundle.name,
    });
  }
  const bundlePrice = round2(normalTotal * (1 - disc / 100));
  const savings = round2(normalTotal - bundlePrice);
  const available = bundle.items.every(
    (it) => it.variant.active && it.variant.product.active && it.variant.stock >= it.quantity,
  );

  return (
    <div className="container-site py-10">
      <nav className="mb-8 text-xs text-ink-muted">
        <Link href="/bundles" className="hover:text-ink">Bundles</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{bundle.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square border border-line">
          <ProductImage imageKey={bundle.imageKey} name={bundle.name} className="h-full w-full" />
          <span className="badge absolute left-4 top-4 bg-ink text-paper">Save {disc}%</span>
        </div>

        <div>
          <p className="eyebrow">Bundle</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{bundle.name}</h1>
          {bundle.description && <p className="mt-2 text-ink-muted">{bundle.description}</p>}

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{formatPrice(bundlePrice)}</span>
            <span className="text-base text-ink-muted line-through">{formatPrice(normalTotal)}</span>
            <span className="badge-accent">Save {formatPrice(savings)}</span>
          </div>

          <div className="mt-6">
            {available ? (
              <AddBundleButton items={cartItems} />
            ) : (
              <span className="badge border border-ink text-ink">Currently unavailable</span>
            )}
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em]">What&apos;s included</h2>
            <ul className="divide-y divide-line">
              {bundle.items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 py-3">
                  <div className="h-14 w-14 shrink-0 border border-line">
                    <ProductImage
                      imageKey={it.variant.product.imageKey}
                      name={it.variant.product.name}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/product/${it.variant.product.slug}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {it.variant.product.name}
                    </Link>
                    <p className="text-xs text-ink-muted">
                      {it.variant.label} × {it.quantity}
                    </p>
                  </div>
                  <span className="text-sm text-ink-muted">
                    {formatPrice(effectivePrice(it.variant) * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-xs text-ink-muted">
            Research Use Only — not for human or veterinary use.
          </p>
        </div>
      </div>

      <TrustBadges className="mt-16" />
    </div>
  );
}
