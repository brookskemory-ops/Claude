import { db } from "@/lib/db";
import { updateStock } from "../actions";

export default async function AdminInventory() {
  const products = await db.product.findMany({ orderBy: { stock: "asc" } });
  const lowCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
          Inventory
        </h2>
        <span className="text-xs text-ink-muted">
          {lowCount} item{lowCount !== 1 ? "s" : ""} low or out of stock
        </span>
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-line bg-paper-soft text-left">
            <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Current</th>
              <th className="px-4 py-3 text-right font-semibold">Update Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const out = p.stock <= 0;
              const low = !out && p.stock <= p.lowStockThreshold;
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    {out ? (
                      <span className="badge border border-ink text-ink">Out of stock</span>
                    ) : low ? (
                      <span className="badge bg-ink text-paper">Low</span>
                    ) : (
                      <span className="badge border border-line text-ink-muted">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <form action={updateStock} className="flex justify-end gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        defaultValue={p.stock}
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
