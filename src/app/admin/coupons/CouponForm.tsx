"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createCoupon } from "../actions";

export default function CouponForm() {
  const [state, formAction] = useFormState(createCoupon, null);

  return (
    <form action={formAction} className="space-y-4 border border-line p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        New Discount Code
      </h3>
      {state && !state.ok && <p className="text-sm">{state.error}</p>}
      {state?.ok && <p className="text-sm text-ink-muted">Coupon created.</p>}

      <div>
        <label className="label">Code</label>
        <input name="code" className="input uppercase" placeholder="SUMMER25" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Type</label>
          <select name="type" className="input" defaultValue="percent">
            <option value="percent">% Off</option>
            <option value="amount">$ Off</option>
          </select>
        </div>
        <div>
          <label className="label">Value</label>
          <input name="value" type="number" step="0.01" min="0" className="input" required />
        </div>
      </div>
      <div>
        <label className="label">Expires (optional)</label>
        <input name="expiresAt" type="date" className="input" />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Creating…" : "Create Coupon"}
    </button>
  );
}
