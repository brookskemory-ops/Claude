import { db } from "@/lib/db";
import { createTaxRate, deleteTaxRate } from "../actions";

export default async function AdminTax() {
  const rates = await db.taxRate.findMany({ orderBy: { state: "asc" } });

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]">Sales Tax</h2>
      <p className="mb-6 max-w-2xl text-sm text-ink-muted">
        Set a tax rate for each state where you have nexus. Orders shipped to a state with no
        configured rate are charged no tax. Institutional/resale buyers can be marked tax-exempt
        under Customers.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-paper-soft text-left">
              <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Rate</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rates.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">
                    No tax rates configured.
                  </td>
                </tr>
              )}
              {rates.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{r.state}</td>
                  <td className="px-4 py-3">{r.percent}%</td>
                  <td className="px-4 py-3">
                    <form action={deleteTaxRate} className="flex justify-end">
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs text-ink-muted underline hover:text-ink">Remove</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={createTaxRate} className="space-y-3 border border-line p-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Add / Update Rate
          </h3>
          <div>
            <label className="label">State (2-letter)</label>
            <input name="state" maxLength={2} className="input uppercase" placeholder="TX" required />
          </div>
          <div>
            <label className="label">Rate (%)</label>
            <input name="percent" type="number" step="0.01" min="0" className="input" placeholder="8.25" required />
          </div>
          <button className="btn-primary w-full">Save Rate</button>
        </form>
      </div>
    </div>
  );
}
