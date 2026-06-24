import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteBundle } from "../actions";

export default async function AdminBundles() {
  const bundles = await db.bundle.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Bundles</h2>
        <Link href="/admin/bundles/new" className="btn-primary btn-sm">New Bundle</Link>
      </div>

      {bundles.length === 0 ? (
        <p className="border border-line p-8 text-center text-sm text-ink-muted">
          No bundles yet. Create your first bundle.
        </p>
      ) : (
        <ul className="space-y-3">
          {bundles.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-4 border border-line p-4">
              <div>
                <p className="font-semibold">{b.name}</p>
                <p className="text-xs text-ink-muted">
                  <span className={b.active ? "text-ink" : ""}>{b.active ? "Active" : "Hidden"}</span>{" "}
                  · {b.discountPercent}% off · {b._count.items} products · {formatDate(b.createdAt)} · /{b.slug}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/bundles/${b.id}`} className="btn-outline btn-sm">Edit</Link>
                <form action={deleteBundle.bind(null, b.id)}>
                  <button className="text-xs text-ink-muted underline hover:text-ink">Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
