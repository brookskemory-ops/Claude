import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";
import OrderStatusBadge from "@/components/OrderStatusBadge";

export default async function AdminDashboard() {
  const [productCount, orderCount, customerCount, lowStock, recentOrders, paidOrders] =
    await Promise.all([
      db.product.count(),
      db.order.count({ where: { status: { not: "PENDING" } } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.productVariant.findMany({
        include: { product: true },
        orderBy: { stock: "asc" },
        take: 5,
      }),
      db.order.findMany({
        where: { status: { not: "PENDING" } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.order.findMany({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        select: { total: true },
      }),
    ]);

  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatPrice(revenue)} />
        <Stat label="Orders" value={String(orderCount)} />
        <Stat label="Products" value={String(productCount)} />
        <Stat label="Customers" value={String(customerCount)} />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-ink-muted hover:text-ink">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="border border-line p-6 text-sm text-ink-muted">No orders yet.</p>
        ) : (
          <div className="border border-line">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/order/${o.number}`} className="hover:underline">{o.number}</Link>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Low Stock</h2>
          <Link href="/admin/inventory" className="text-xs text-ink-muted hover:text-ink">Manage →</Link>
        </div>
        <div className="border border-line">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-line">
              {lowStock.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-medium">
                    {v.product.name} <span className="text-ink-muted">· {v.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={v.stock <= v.lowStockThreshold ? "font-semibold" : "text-ink-muted"}>
                      {v.stock} in stock
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
