import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Subscribers" };

export default async function AdminSubscribers() {
  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
            Pre-sale Subscribers ({subscribers.length})
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Emails captured from the pre-sale landing page. Export to import into your ad/email tool.
          </p>
        </div>
        <Link href="/admin/subscribers/export" className="btn-outline btn-sm shrink-0">
          Download CSV
        </Link>
      </div>

      {subscribers.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">No subscribers yet.</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-line bg-paper-soft text-left">
              <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Notified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3 text-ink-muted">{s.source}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${s.notified ? "bg-ink text-paper" : "border border-line text-ink-muted"}`}>
                      {s.notified ? "Notified" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
