import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTracking, shippingEnabled } from "@/lib/shipping";
import { formatDateTime } from "@/lib/format";
import OrderStatusBadge from "@/components/OrderStatusBadge";

export const metadata: Metadata = { title: "Track Shipments" };

export default async function TrackingPage() {
  const session = await getSession();
  if (!session) redirect("/account/login?redirect=/account/tracking");

  const orders = await db.order.findMany({
    where: { userId: session.sub, trackingNumber: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  // Pull live tracking for each shipment (real-time via EasyPost when configured).
  const tracked = await Promise.all(
    orders.map(async (o) => ({
      order: o,
      tracking: await getTracking(o.trackingNumber as string, o.trackingCarrier),
    })),
  );

  return (
    <div className="container-site max-w-3xl py-12">
      <p className="eyebrow">My Account</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Track Shipments</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Live tracking for your shipped orders.
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 border border-line p-8 text-center">
          <p className="text-sm text-ink-muted">No shipments yet.</p>
          <Link href="/account" className="btn-outline btn-sm mt-4">Back to Account</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {tracked.map(({ order, tracking }) => (
            <div key={order.id} className="border border-line p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/order/${order.number}`} className="font-semibold hover:underline">
                    {order.number}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    {order.trackingCarrier} · {order.trackingNumber}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {tracking ? (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium uppercase tracking-[0.12em]">
                      {tracking.status.replace(/_/g, " ")}
                    </span>
                    {tracking.estDelivery && (
                      <span className="text-ink-muted">
                        Est. {formatDateTime(tracking.estDelivery)}
                      </span>
                    )}
                  </div>
                  {tracking.events.length > 0 && (
                    <ol className="mt-4 space-y-3 border-l border-line pl-4">
                      {tracking.events.slice(0, 8).map((e, i) => (
                        <li key={i} className="text-sm">
                          <p className="font-medium">{e.status.replace(/_/g, " ")}</p>
                          <p className="text-xs text-ink-muted">
                            {e.message}
                            {e.location ? ` · ${e.location}` : ""}
                            {e.datetime ? ` · ${formatDateTime(e.datetime)}` : ""}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-muted">
                  {shippingEnabled
                    ? "Live tracking will appear once the carrier scans the package."
                    : "Use the carrier and tracking number above to track this shipment."}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
