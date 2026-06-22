import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { minEffectivePrice, totalStock } from "@/lib/pricing";
import { deleteProduct } from "../actions";
import SortHeader from "../SortHeader";

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: { sort?: string; dir?: string };
}) {
  const sort = searchParams.sort ?? "createdAt";
  const dir: Prisma.SortOrder = searchParams.dir === "asc" ? "asc" : "desc";
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "name"
      ? { name: dir }
      : sort === "category"
        ? { category: dir }
        : { createdAt: dir };

  const products = await db.product.findMany({
    include: { variants: true },
    orderBy,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
          Products ({products.length})
        </h2>
        <Link href="/admin/products/new" className="btn-primary btn-sm">+ New Product</Link>
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-line bg-paper-soft text-left">
            <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <th className="px-4 py-3 font-semibold"><SortHeader label="Product" col="name" basePath="/admin/products" sort={sort} dir={dir} /></th>
              <th className="px-4 py-3 font-semibold"><SortHeader label="Category" col="category" basePath="/admin/products" sort={sort} dir={dir} /></th>
              <th className="px-4 py-3 font-semibold">From</th>
              <th className="px-4 py-3 font-semibold">Sizes</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const stock = totalStock(p.variants);
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    {p.featured && (
                      <span className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">Featured</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{p.category}</td>
                  <td className="px-4 py-3">
                    {p.variants.length ? formatPrice(minEffectivePrice(p.variants)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{p.variants.length}</td>
                  <td className="px-4 py-3">{stock}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.active ? "bg-ink text-paper" : "border border-line text-ink-muted"}`}>
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/products/${p.id}`} className="text-xs underline hover:text-ink">Edit</Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-xs text-ink-muted underline hover:text-ink">Delete</button>
                      </form>
                    </div>
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
