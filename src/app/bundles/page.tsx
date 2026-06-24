import type { Metadata } from "next";
import { db } from "@/lib/db";
import BundleCard from "@/components/BundleCard";
import { effectivePrice, round2 } from "@/lib/pricing";

export const metadata: Metadata = { title: "Bundles" };

export default async function BundlesPage() {
  const bundles = await db.bundle.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { variant: true } } },
  });

  const cards = bundles.map((b) => {
    const normalTotal = round2(
      b.items.reduce((s, it) => s + effectivePrice(it.variant) * it.quantity, 0),
    );
    return {
      slug: b.slug,
      name: b.name,
      imageKey: b.imageKey,
      discountPercent: b.discountPercent,
      normalTotal,
      bundlePrice: round2(normalTotal * (1 - b.discountPercent / 100)),
      itemCount: b.items.length,
    };
  });

  return (
    <div className="container-site py-12">
      <header className="mb-10">
        <p className="eyebrow">Catalog</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Bundles</h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          Curated multi-peptide sets at a combined discount. For laboratory research use only.
        </p>
      </header>

      {cards.length === 0 ? (
        <p className="py-20 text-center text-ink-muted">No bundles available yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {cards.map((c) => (
            <BundleCard key={c.slug} bundle={c} />
          ))}
        </div>
      )}
    </div>
  );
}
