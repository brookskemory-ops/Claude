import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";
import { updateOrderStatus } from "../actions";
import { ORDER_STATUSES } from "@/lib/types";
import SortHeader from "../SortHeader";

const ORDER_SORTS: Record<string, Prisma.OrderOrderByWithRelationInput> = {
  number: { number: "asc" },
  createdAt: { createdAt: "asc" },
  email: { email: "asc" },
  total: { total: "asc" },
  status: { status: "asc" },
};

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: { sort?: string; dir?: string };
}) {
  const sort = searchParams.sort ?? "createdAt";
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const base = ORDER_SORTS[sort] ?? ORDER_SORTS.createdAt;
  const orderBy = Object.fromEntries(
    Object.entries(base).map(([k]) => [k, dir]),
  ) as Prisma.OrderOrderByWithRelationInput;

  const orders = await db.order.findMany({
    orderBy,
    include: { items: true },
  });

  return (
    <div>
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
        Orders ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <p className="border border-line p-8 text-center text-sm text-ink-muted">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-paper-soft text-left">
              <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <th className="px-4 py-3 font-semibold"><SortHeader label="Order" col="number" basePath="/admin/orders" sort={sort} dir={dir} /></th>
                <th className="px-4 py-3 font-semibold"><SortHeader label="Date" col="createdAt" basePath="/admin/orders" sort={sort} dir={dir} /></th>
                <th className="px-4 py-3 font-semibold"><SortHeader label="Customer" col="email" basePath="/admin/orders" sort={sort} dir={dir} /></th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold"><SortHeader label="Total" col="total" basePath="/admin/orders" sort={sort} dir={dir} /></th>
                <th className="px-4 py-3 text-right font-semibold"><SortHeader label="Status" col="status" basePath="/admin/orders" sort={sort} dir={dir} align="right" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                      {o.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-ink-muted">{o.email}</td>
                  <td className="px-4 py-3">
                    {o.items.reduce((n, i) => n + i.quantity, 0)}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <form action={updateOrderStatus} className="flex justify-end">
                      <input type="hidden" name="id" value={o.id} />
                      <select
                        name="status"
                        defaultValue={o.status}
                        className="border border-line bg-paper px-2 py-1 text-xs focus:border-ink focus:outline-none"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="btn-outline btn-sm ml-2">Update</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
