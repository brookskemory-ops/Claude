"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "../actions";

export default function LoginForm() {
  const [state, formAction] = useFormState(login, null);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (state?.ok) {
      const redirect = params.get("redirect") || "/account";
      router.push(redirect);
      router.refresh();
    }
  }, [state, router, params]);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {state && !state.ok && (
        <p className="rounded-lg border border-ink bg-paper-muted px-4 py-2 text-sm">
          {state.error}
        </p>
      )}
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" className="input" required />
      </div>
      <div>
        <label className="label">Password</label>
        <input name="password" type="password" className="input" required />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign In"}
    </button>
  );
}
