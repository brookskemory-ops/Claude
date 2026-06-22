import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import PrintButton from "@/components/PrintButton";

export default async function PackingSlip({
  params,
}: {
  params: { id: string };
}) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) notFound();
  const ship = JSON.parse(order.shippingAddress) as Record<string, string>;

  return (
    <div className="mx-auto max-w-2xl bg-paper p-10 text-ink">
      <div className="flex items-start justify-between border-b-2 border-ink pb-4">
        <div>
          <p className="text-lg font-bold uppercase tracking-[0.28em]">Axevia</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-muted">Packing Slip</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{order.number}</p>
          <p className="text-ink-muted">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="mt-6 text-sm">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Ship To</h2>
        <p className="mt-1">{ship.recipient}</p>
        <p>{ship.line1}{ship.line2 ? `, ${ship.line2}` : ""}</p>
        <p>{ship.city}, {ship.state} {ship.zip}</p>
        <p>{ship.country}</p>
      </div>

      <table className="mt-8 w-full text-sm">
        <thead className="border-b border-ink text-left">
          <tr>
            <th className="py-2">Item</th>
            <th className="py-2">SKU</th>
            <th className="py-2 text-right">Qty</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id} className="border-b border-line">
              <td className="py-2">{i.name} · {i.variantLabel}</td>
              <td className="py-2 text-ink-muted">{i.sku}</td>
              <td className="py-2 text-right">{i.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-10 border-t border-line pt-4 text-[11px] text-ink-muted">
        Research Use Only — not for human or veterinary use. Thank you for your order.
      </p>

      <PrintButton />
    </div>
  );
}
