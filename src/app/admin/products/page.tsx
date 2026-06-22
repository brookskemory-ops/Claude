import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { isOnSale } from "@/lib/pricing";
import { deleteProduct } from "../actions";

export default async function AdminProducts() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
          Products ({products.length})
        </h2>
        <Link href="/admin/products/new" className="btn-primary btn-sm">
          + New Product
        </Link>
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line bg-paper-soft text-left">
            <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{p.name}</p>
                  {p.featured && (
                    <span className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                      Featured
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-muted">{p.category}</td>
                <td className="px-4 py-3">
                  {isOnSale(p) ? (
                    <span>
                      {formatPrice(p.salePrice as number)}{" "}
                      <span className="text-ink-muted line-through">
                        {formatPrice(p.price)}
                      </span>
                    </span>
                  ) : (
                    formatPrice(p.price)
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={p.stock <= p.lowStockThreshold ? "font-semibold" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${p.active ? "bg-ink text-paper" : "border border-line text-ink-muted"}`}>
                    {p.active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/products/${p.id}`} className="text-xs underline hover:text-ink">
                      Edit
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="text-xs text-ink-muted underline hover:text-ink">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
