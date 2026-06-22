import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/format";
import { shippingEnabled } from "@/lib/shipping";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import {
  markShipped,
  buyLabel,
  markDelivered,
  refundOrderAction,
  cancelOrderAction,
  updateReturn,
} from "../../actions";

export default async function AdminOrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: true, returns: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  const ship = JSON.parse(order.shippingAddress) as Record<string, string>;
  const canFulfill = order.status === "PAID";
  const canRefund = ["PAID", "SHIPPED", "DELIVERED"].includes(order.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-xs text-ink-muted hover:text-ink">← All orders</Link>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">{order.number}</h2>
          <p className="text-sm text-ink-muted">
            {formatDateTime(order.createdAt)} · {order.email} ·{" "}
            {order.paymentProvider ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <Link href={`/admin/orders/${order.id}/packing-slip`} className="btn-outline btn-sm" target="_blank">
            Packing Slip
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Items + actions */}
        <div className="space-y-8">
          <div className="border border-line">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-3">
                      {i.name} <span className="text-ink-muted">· {i.variantLabel} · {i.sku}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">×{i.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatPrice(i.unitPrice * i.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fulfillment */}
          <section className="border border-line p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">Fulfillment</h3>

            {order.trackingNumber ? (
              <p className="text-sm">
                Shipped via <strong>{order.trackingCarrier}</strong> · Tracking{" "}
                <strong>{order.trackingNumber}</strong>
                {order.labelUrl && (
                  <>
                    {" "}·{" "}
                    <a href={order.labelUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      Label
                    </a>
                  </>
                )}
              </p>
            ) : canFulfill ? (
              <div className="space-y-4">
                {shippingEnabled && (
                  <form action={buyLabel}>
                    <input type="hidden" name="id" value={order.id} />
                    <button className="btn-primary btn-sm">Buy Cheapest Label (EasyPost)</button>
                  </form>
                )}
                <form action={markShipped} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={order.id} />
                  <div>
                    <label className="label">Carrier</label>
                    <input name="carrier" className="input w-32" placeholder="USPS" />
                  </div>
                  <div>
                    <label className="label">Tracking #</label>
                    <input name="tracking" className="input w-56" placeholder="Enter tracking" required />
                  </div>
                  <button className="btn-outline btn-sm">Mark Shipped</button>
                </form>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No fulfillment actions for this status.</p>
            )}

            {order.status === "SHIPPED" && (
              <form action={markDelivered} className="mt-4">
                <input type="hidden" name="id" value={order.id} />
                <button className="btn-outline btn-sm">Mark Delivered</button>
              </form>
            )}

            <div className="mt-5 flex gap-3 border-t border-line pt-5">
              {canRefund && (
                <form action={refundOrderAction}>
                  <input type="hidden" name="id" value={order.id} />
                  <button className="btn-ghost btn-sm">Refund Order</button>
                </form>
              )}
              {["PENDING", "PAID"].includes(order.status) && (
                <form action={cancelOrderAction}>
                  <input type="hidden" name="id" value={order.id} />
                  <button className="btn-ghost btn-sm">Cancel Order</button>
                </form>
              )}
            </div>
          </section>

          {/* Returns */}
          {order.returns.length > 0 && (
            <section className="border border-line p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">Return Requests</h3>
              <ul className="space-y-3">
                {order.returns.map((r) => (
                  <li key={r.id} className="border border-line p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="badge border border-line text-ink-muted">{r.status}</span>
                      <span className="text-xs text-ink-muted">{formatDateTime(r.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-ink-muted">{r.reason}</p>
                    <form action={updateReturn} className="mt-3 flex items-center gap-2">
                      <input type="hidden" name="returnId" value={r.id} />
                      <input type="hidden" name="orderId" value={order.id} />
                      <select name="status" defaultValue={r.status} className="border border-line px-2 py-1 text-xs">
                        {["REQUESTED", "APPROVED", "REJECTED", "COMPLETED"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="btn-outline btn-sm">Update</button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Summary + address */}
        <aside className="space-y-6">
          <div className="border border-line p-5 text-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Ship To</h3>
            <p>{ship.recipient}</p>
            <p className="text-ink-muted">{ship.line1}{ship.line2 ? `, ${ship.line2}` : ""}</p>
            <p className="text-ink-muted">{ship.city}, {ship.state} {ship.zip}</p>
            <p className="text-ink-muted">{ship.country}</p>
          </div>
          <div className="border border-line p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Totals</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.discount > 0 && <Row label="Discount" value={`−${formatPrice(order.discount)}`} />}
              <Row label="Shipping" value={order.shipping === 0 ? "Free" : formatPrice(order.shipping)} />
              <Row label="Tax" value={formatPrice(order.tax)} />
              <div className="flex justify-between border-t border-line pt-2 font-semibold">
                <dt>Total</dt><dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
