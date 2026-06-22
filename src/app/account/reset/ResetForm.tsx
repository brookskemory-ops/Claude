"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "../actions";

export default function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPassword, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      router.push("/account");
      router.refresh();
    }
  }, [state, router]);

  if (!token) {
    return (
      <p className="mt-8 text-sm text-ink-muted">
        Missing reset token.{" "}
        <Link href="/account/forgot" className="underline">Request a new link</Link>.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="token" value={token} />
      {state && !state.ok && (
        <p className="border border-ink bg-paper-muted px-4 py-2 text-sm">{state.error}</p>
      )}
      <div>
        <label className="label">New Password</label>
        <input name="password" type="password" minLength={6} className="input" required />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Saving…" : "Update Password"}
    </button>
  );
}
