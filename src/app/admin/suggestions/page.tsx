import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Suggestions" };

export default async function AdminSuggestions() {
  const suggestions = await db.suggestion.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
          Peptide Suggestions ({suggestions.length})
        </h2>
        <p className="mt-1 text-xs text-ink-muted">
          Requests from visitors for peptides not yet in the catalog. Use the volume of requests to
          prioritize what to stock.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">No suggestions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b border-line bg-paper-soft text-left">
              <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <th className="px-4 py-3 font-semibold">Peptide</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {suggestions.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.peptide}</td>
                  <td className="px-4 py-3 text-ink-muted">{s.email || "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
