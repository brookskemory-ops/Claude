import { db } from "@/lib/db";
import BundleForm from "../BundleForm";
import { createBundle } from "../../actions";

export default async function NewBundlePage() {
  const variants = await db.productVariant.findMany({
    where: { active: true },
    include: { product: true },
    orderBy: [{ product: { name: "asc" } }, { sortOrder: "asc" }],
  });
  const variantOptions = variants.map((v) => ({
    id: v.id,
    label: `${v.product.name} — ${v.label} (${v.sku})`,
  }));

  return (
    <div>
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">New Bundle</h2>
      <BundleForm action={createBundle} variantOptions={variantOptions} submitLabel="Create Bundle" />
    </div>
  );
}
