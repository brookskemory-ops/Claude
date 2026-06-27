import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Pre-sale Signups" };

export default async function AdminPresaleSignups() {
  const users = await db.user.findMany({
    where: { source: "presale" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
            Pre-sale Signups ({users.length})
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Accounts created from the pre-sale landing page. The one-time 5% code is issued after the
            member verifies their email.
          </p>
        </div>
        <Link href="/admin/subscribers/export" className="btn-outline btn-sm shrink-0">
          Download CSV
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">No pre-sale signups yet.</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line bg-paper-soft text-left">
              <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3 font-semibold">Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-ink-muted">{u.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.emailVerified ? "bg-ink text-paper" : "border border-line text-ink-muted"}`}>
                      {u.emailVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                    {u.presaleCode ?? "—"}
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
