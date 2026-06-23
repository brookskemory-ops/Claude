"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { submitReview } from "./reviewActions";

export default function ProductReviewForm({
  productId,
  slug,
  signedIn,
  hasPurchased,
}: {
  productId: string;
  slug: string;
  signedIn: boolean;
  hasPurchased: boolean;
}) {
  const [state, formAction] = useFormState(submitReview, null);

  if (!signedIn) {
    return (
      <p className="text-sm text-ink-muted">
        <Link href={`/account/login?redirect=/product/${slug}`} className="underline hover:text-ink">
          Sign in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  if (!hasPurchased) {
    return (
      <p className="text-sm text-ink-muted">
        Only verified purchasers can review this product.
      </p>
    );
  }

  if (state?.ok) {
    return (
      <p className="border border-line bg-paper-soft px-4 py-3 text-sm text-ink-muted">
        Thanks — your review is now live.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      {state && !state.ok && (
        <p className="border border-ink bg-paper-muted px-4 py-2 text-sm">{state.error}</p>
      )}
      <div className="flex gap-3">
        <div>
          <label className="label">Rating</label>
          <select name="rating" className="input w-24" defaultValue="5">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} ★</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Title (optional)</label>
          <input name="title" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Your review</label>
        <textarea name="body" rows={3} className="input" required />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-outline btn-sm" disabled={pending}>
      {pending ? "Submitting…" : "Submit Review"}
    </button>
  );
}
