import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { toggleTaxExempt } from "../actions";

export default async function AdminCustomers() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
        Customers ({customers.length})
      </h2>

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line bg-paper-soft text-left">
            <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Tax Exempt</th>
              <th className="px-4 py-3 text-right font-semibold">Exemption Cert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-ink-muted">{c.email}</td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3">{c._count.orders}</td>
                <td className="px-4 py-3">
                  <form action={toggleTaxExempt} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <span className={`badge ${c.taxExempt ? "bg-ink text-paper" : "border border-line text-ink-muted"}`}>
                      {c.taxExempt ? "Exempt" : "Taxable"}
                    </span>
                    <button className="text-xs underline hover:text-ink">Toggle</button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  {c.exemptionCertUrl ? (
                    <a href={c.exemptionCertUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline">
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-ink-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
