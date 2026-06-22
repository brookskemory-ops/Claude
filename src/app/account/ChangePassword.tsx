"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changePassword } from "./actions";

export default function ChangePassword() {
  const [state, formAction] = useFormState(changePassword, null);

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">Password</h2>
      <form action={formAction} className="space-y-3 border border-line p-5">
        {state?.ok && (
          <p className="text-xs text-ink-muted">{state.message ?? "Password updated."}</p>
        )}
        {state && !state.ok && <p className="text-xs text-ink">{state.error}</p>}
        <div>
          <label className="label">Current Password</label>
          <input name="current" type="password" className="input" required />
        </div>
        <div>
          <label className="label">New Password</label>
          <input name="next" type="password" minLength={6} className="input" required />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-outline btn-sm w-full" disabled={pending}>
      {pending ? "Updating…" : "Update Password"}
    </button>
  );
}
