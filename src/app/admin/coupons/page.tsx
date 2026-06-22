import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";
import { toggleCoupon, deleteCoupon } from "../actions";
import CouponForm from "./CouponForm";

export default async function AdminCoupons() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]">
        Sales & Coupons
      </h2>
      <p className="mb-6 max-w-2xl text-sm text-ink-muted">
        Create store-wide discount codes customers can apply at checkout. To put
        an individual product on sale, set its <strong>Sale Price</strong> on the
        product edit screen.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b border-line bg-paper-soft text-left">
              <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Discount</th>
                <th className="px-4 py-3 font-semibold">Expires</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                    No coupons yet.
                  </td>
                </tr>
              )}
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.percentOff ? `${c.percentOff}% off` : formatPrice(c.amountOff ?? 0) + " off"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {c.expiresAt ? formatDate(c.expiresAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.active ? "bg-ink text-paper" : "border border-line text-ink-muted"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <form action={toggleCoupon}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className="text-xs underline hover:text-ink">
                          {c.active ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={deleteCoupon}>
                        <input type="hidden" name="id" value={c.id} />
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

        <CouponForm />
      </div>
    </div>
  );
}
