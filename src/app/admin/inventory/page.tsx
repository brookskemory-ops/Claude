import { db } from "@/lib/db";
import { updateStock } from "../actions";

export default async function AdminInventory() {
  const variants = await db.productVariant.findMany({
    include: { product: true },
    orderBy: [{ stock: "asc" }],
  });
  const lowCount = variants.filter((v) => v.stock <= v.lowStockThreshold).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Inventory</h2>
        <span className="text-xs text-ink-muted">
          {lowCount} variant{lowCount !== 1 ? "s" : ""} low or out of stock
        </span>
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line bg-paper-soft text-left">
            <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Size</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Update Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {variants.map((v) => {
              const out = v.stock <= 0;
              const low = !out && v.stock <= v.lowStockThreshold;
              return (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-medium">{v.product.name}</td>
                  <td className="px-4 py-3">{v.label}</td>
                  <td className="px-4 py-3 text-ink-muted">{v.sku}</td>
                  <td className="px-4 py-3">
                    {out ? (
                      <span className="badge border border-ink text-ink">Out of stock</span>
                    ) : low ? (
                      <span className="badge bg-ink text-paper">Low ({v.stock})</span>
                    ) : (
                      <span className="badge border border-line text-ink-muted">OK ({v.stock})</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateStock} className="flex justify-end gap-2">
                      <input type="hidden" name="variantId" value={v.id} />
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        defaultValue={v.stock}
                        className="w-24 border border-line px-3 py-1.5 text-sm focus:border-ink focus:outline-none"
                      />
                      <button className="btn-outline btn-sm">Save</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
