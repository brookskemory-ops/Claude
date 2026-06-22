"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { register } from "../actions";

export default function RegisterForm() {
  const [state, formAction] = useFormState(register, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      router.push("/account");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {state && !state.ok && (
        <p className="border border-ink bg-paper-muted px-4 py-2 text-sm">
          {state.error}
        </p>
      )}
      <div>
        <label className="label">Full Name</label>
        <input name="name" type="text" className="input" required />
      </div>
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" className="input" required />
      </div>
      <div>
        <label className="label">Password</label>
        <input name="password" type="password" className="input" minLength={6} required />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Creating…" : "Create Account"}
    </button>
  );
}
