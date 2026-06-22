import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/format";
import { logout } from "./actions";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import AddressManager from "./AddressManager";
import ChangePassword from "./ChangePassword";
import ExemptionUpload from "./ExemptionUpload";
import DeleteAccount from "./DeleteAccount";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/account/login?redirect=/account");

  const [user, orders, addresses] = await Promise.all([
    db.user.findUnique({ where: { id: session.sub } }),
    db.order.findMany({
      where: { userId: session.sub },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    db.address.findMany({
      where: { userId: session.sub },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  if (!user) redirect("/account/login");

  return (
    <div className="container-site py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My Account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Hi, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/account/tracking" className="btn-outline btn-sm">
            Track Shipments
          </Link>
          <Link href="/account/referral" className="btn-outline btn-sm">
            Referral
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/admin" className="btn-outline btn-sm">
              Admin Dashboard
            </Link>
          )}
          <form action={logout}>
            <button type="submit" className="btn-ghost btn-sm">
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
        {/* Orders */}
        <section>
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em]">
            Order History
          </h2>
          {orders.length === 0 ? (
            <div className="border border-line p-8 text-center">
              <p className="text-sm text-ink-muted">You have no orders yet.</p>
              <Link href="/shop" className="btn-outline btn-sm mt-4">
                Start Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="border border-line p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link href={`/order/${order.number}`} className="font-semibold hover:underline">
                        {order.number}
                      </Link>
                      <p className="text-xs text-ink-muted">
                        {formatDate(order.createdAt)} · {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-semibold">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-ink-muted">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-10">
          <AddressManager addresses={addresses} />

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
              Billing Methods
            </h2>
            <div className="border border-line p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm">Visa ending •••• 4242</span>
                <span className="badge border border-line text-ink-muted">Default</span>
              </div>
              <p className="mt-3 text-xs text-ink-muted">
                Demo billing method. Payment processing is simulated — no real
                cards are stored or charged.
              </p>
            </div>
          </div>

          <ChangePassword />

          <ExemptionUpload taxExempt={user.taxExempt} certUrl={user.exemptionCertUrl} />

          <div className="border-t border-line pt-4">
            <DeleteAccount />
          </div>
        </aside>
      </div>
    </div>
  );
}
