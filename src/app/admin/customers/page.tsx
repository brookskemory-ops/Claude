import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { toggleTaxExempt, setUserRole } from "../actions";
import SortHeader from "../SortHeader";

export default async function AdminCustomers({
  searchParams,
}: {
  searchParams: { sort?: string; dir?: string };
}) {
  const sort = searchParams.sort ?? "createdAt";
  const dir: Prisma.SortOrder = searchParams.dir === "asc" ? "asc" : "desc";
  const orderBy: Prisma.UserOrderByWithRelationInput =
    sort === "name" ? { name: dir } : sort === "email" ? { email: dir } : { createdAt: dir };

  const [session, admins, customers] = await Promise.all([
    getSession(),
    db.user.findMany({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } }),
    db.user.findMany({
      where: { role: "CUSTOMER" },
      include: { _count: { select: { orders: true } } },
      orderBy,
    }),
  ]);

  return (
    <div className="space-y-12">
      {/* Team / admins */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]">
          Team — Admins ({admins.length})
        </h2>
        <p className="mb-5 text-xs text-ink-muted">
          Admins can manage the store. Promote a customer below to add an admin.
        </p>
        <ul className="divide-y divide-line border border-line">
          {admins.map((a) => {
            const isSelf = a.id === session?.sub;
            const canRemove = !isSelf && admins.length > 1;
            return (
              <li key={a.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {a.name} {isSelf && <span className="text-xs text-ink-muted">(you)</span>}
                  </p>
                  <p className="text-xs text-ink-muted">{a.email}</p>
                </div>
                {canRemove ? (
                  <form action={setUserRole}>
                    <input type="hidden" name="userId" value={a.id} />
                    <input type="hidden" name="role" value="CUSTOMER" />
                    <button className="text-xs text-ink-muted underline hover:text-ink">
                      Remove admin
                    </button>
                  </form>
                ) : (
                  <span className="badge bg-ink text-paper">Admin</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Customers */}
      <section>
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
          Customers ({customers.length})
        </h2>

        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-paper-soft text-left">
              <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <th className="px-4 py-3 font-semibold"><SortHeader label="Name" col="name" basePath="/admin/customers" sort={sort} dir={dir} /></th>
                <th className="px-4 py-3 font-semibold"><SortHeader label="Email" col="email" basePath="/admin/customers" sort={sort} dir={dir} /></th>
                <th className="px-4 py-3 font-semibold"><SortHeader label="Joined" col="createdAt" basePath="/admin/customers" sort={sort} dir={dir} /></th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Tax Exempt</th>
                <th className="px-4 py-3 text-right font-semibold">Role</th>
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
                    <form action={setUserRole}>
                      <input type="hidden" name="userId" value={c.id} />
                      <input type="hidden" name="role" value="ADMIN" />
                      <button className="btn-outline btn-sm">Make admin</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
