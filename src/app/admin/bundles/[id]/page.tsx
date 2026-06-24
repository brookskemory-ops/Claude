import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import BundleForm from "../BundleForm";
import { updateBundle } from "../../actions";

export default async function EditBundlePage({ params }: { params: { id: string } }) {
  const [bundle, variants] = await Promise.all([
    db.bundle.findUnique({ where: { id: params.id }, include: { items: true } }),
    db.productVariant.findMany({
      where: { active: true },
      include: { product: true },
      orderBy: [{ product: { name: "asc" } }, { sortOrder: "asc" }],
    }),
  ]);
  if (!bundle) notFound();

  const variantOptions = variants.map((v) => ({
    id: v.id,
    label: `${v.product.name} — ${v.label} (${v.sku})`,
  }));
  const action = updateBundle.bind(null, bundle.id);

  return (
    <div>
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">Edit Bundle</h2>
      <BundleForm
        action={action}
        variantOptions={variantOptions}
        bundle={{
          name: bundle.name,
          slug: bundle.slug,
          description: bundle.description,
          imageKey: bundle.imageKey,
          discountPercent: bundle.discountPercent,
          active: bundle.active,
        }}
        items={bundle.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }))}
        submitLabel="Save Bundle"
      />
    </div>
  );
}
