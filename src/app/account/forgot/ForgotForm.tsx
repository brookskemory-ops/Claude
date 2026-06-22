"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset } from "../actions";

export default function ForgotForm() {
  const [state, formAction] = useFormState(requestPasswordReset, null);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {state?.ok && state.message && (
        <p className="border border-line bg-paper-soft px-4 py-2 text-sm text-ink-muted">
          {state.message}
        </p>
      )}
      {state && !state.ok && (
        <p className="border border-ink bg-paper-muted px-4 py-2 text-sm">{state.error}</p>
      )}
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" className="input" required />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Sending…" : "Send Reset Link"}
    </button>
  );
}
