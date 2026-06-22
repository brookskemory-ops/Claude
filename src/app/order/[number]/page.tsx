import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatPrice, formatDateTime } from "@/lib/format";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import PurchaseTracking from "./PurchaseTracking";
import { requestReturn } from "./actions";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: { number: string };
  searchParams: { confirmed?: string };
}) {
  const order = await db.order.findUnique({
    where: { number: params.number },
    include: { items: true, returns: { orderBy: { createdAt: "desc" } } },
  });

  if (!order) notFound();

  // A signed-in customer may only view their own orders; admins see all.
  // Guest orders (no userId) remain viewable via their order number.
  const session = await getSession();
  if (order.userId && session?.role !== "ADMIN" && session?.sub !== order.userId) {
    notFound();
  }

  // COA links come from each item's product.
  const slugs = Array.from(new Set(order.items.map((i) => i.productSlug)));
  const products = await db.product.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, coaUrl: true },
  });
  const coaBySlug = new Map(products.map((p) => [p.slug, p.coaUrl]));

  const shipping = JSON.parse(order.shippingAddress) as Record<string, string>;
  const confirmed = searchParams.confirmed === "1";
  const isOwner = !!session && session.sub === order.userId;
  const canReturn = isOwner && ["PAID", "SHIPPED", "DELIVERED"].includes(order.status);

  return (
    <div className="container-site max-w-3xl py-12">
      {confirmed && <PurchaseTracking number={order.number} total={order.total} />}
      {confirmed && (
        <div className="mb-8 border border-ink bg-ink p-6 text-paper">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/70">
            Thank you
          </p>
          <h1 className="mt-2 text-2xl font-bold">Your order is confirmed</h1>
          <p className="mt-2 text-sm text-paper/70">
            A confirmation has been sent to {order.email}.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Order</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">{order.number}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.trackingNumber && (
        <div className="mt-6 border border-line bg-paper-soft px-4 py-3 text-sm">
          Shipped via <strong>{order.trackingCarrier}</strong> · Tracking{" "}
          <strong>{order.trackingNumber}</strong>
        </div>
      )}

      <div className="mt-8 border-y border-line">
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-4">
              <div>
                <Link href={`/product/${item.productSlug}`} className="text-sm font-medium hover:underline">
                  {item.name}
                </Link>
                <p className="text-xs text-ink-muted">
                  {item.variantLabel ? `${item.variantLabel} · ` : ""}Qty {item.quantity} · {formatPrice(item.unitPrice)} each
                </p>
                {coaBySlug.get(item.productSlug) && (
                  <a
                    href={coaBySlug.get(item.productSlug) as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline hover:text-ink"
                  >
                    Certificate of Analysis
                  </a>
                )}
              </div>
              <span className="text-sm font-medium">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Shipping To
          </h3>
          <div className="text-sm leading-relaxed">
            <p>{shipping.recipient}</p>
            <p>{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}</p>
            <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
            <p>{shipping.country}</p>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Summary
          </h3>
          <dl className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            {order.discount > 0 && (
              <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`−${formatPrice(order.discount)}`} />
            )}
            <Row label="Shipping" value={order.shipping === 0 ? "Free" : formatPrice(order.shipping)} />
            <Row label="Tax" value={formatPrice(order.tax)} />
            <div className="flex justify-between border-t border-line pt-2 font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Returns */}
      {(order.returns.length > 0 || canReturn) && (
        <div className="mt-10 border-t border-line pt-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Returns
          </h3>
          {order.returns.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {order.returns.map((r) => (
                <li key={r.id} className="flex items-center gap-3">
                  <span className="badge border border-line text-ink-muted">{r.status}</span>
                  <span className="text-ink-muted">{r.reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <form action={requestReturn} className="max-w-lg space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="number" value={order.number} />
              <textarea
                name="reason"
                rows={3}
                className="input"
                placeholder="Reason for return request"
              />
              <button className="btn-outline btn-sm">Request a Return</button>
            </form>
          )}
        </div>
      )}

      <div className="mt-10 flex gap-3">
        <Link href="/shop" className="btn-outline">
          Continue Shopping
        </Link>
        {session && (
          <Link href="/account" className="btn-ghost">
            View All Orders
          </Link>
        )}
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
