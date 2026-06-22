import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import Stars from "@/components/Stars";
import { setReviewStatus, deleteReview } from "../actions";

export default async function AdminReviews() {
  const reviews = await db.review.findMany({
    include: { product: { select: { name: true, slug: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  const pending = reviews.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Reviews</h2>
        <span className="text-xs text-ink-muted">{pending} pending</span>
      </div>

      {reviews.length === 0 ? (
        <p className="border border-line p-8 text-center text-sm text-ink-muted">No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border border-line p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Stars rating={r.rating} />
                  <span className={`badge ${r.status === "APPROVED" ? "bg-ink text-paper" : "border border-line text-ink-muted"}`}>
                    {r.status}
                  </span>
                  {r.verified && (
                    <span className="badge border border-line text-ink-muted">Verified</span>
                  )}
                </div>
                <span className="text-xs text-ink-muted">{formatDate(r.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm">
                <strong>{r.product.name}</strong> — {r.authorName}
              </p>
              {r.title && <p className="mt-1 text-sm font-semibold">{r.title}</p>}
              <p className="mt-1 text-sm text-ink-muted">{r.body}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {r.status !== "APPROVED" && (
                  <form action={setReviewStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <button className="text-xs underline hover:text-ink">Approve</button>
                  </form>
                )}
                {r.status !== "HIDDEN" && (
                  <form action={setReviewStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="HIDDEN" />
                    <button className="text-xs underline hover:text-ink">Hide</button>
                  </form>
                )}
                <form action={deleteReview}>
                  <input type="hidden" name="id" value={r.id} />
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
