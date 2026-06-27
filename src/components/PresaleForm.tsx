"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerPresale } from "@/app/presale/actions";

export default function PresaleForm() {
  const [state, formAction] = useFormState(registerPresale, null);

  if (state?.ok) {
    return (
      <div className="mt-10 w-full max-w-sm border border-paper/30 bg-paper/[0.03] p-6 text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.14em]">Check your email</p>
        <p className="mt-2 text-sm text-paper/70">
          Your account is created. Click the verification link we just emailed you to confirm — then
          we&apos;ll send your one-time 5% pre-sale code. We&apos;ll open the doors at launch.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-10 w-full max-w-sm border border-paper/20 bg-paper/[0.03] p-6 text-left">
      <p className="text-sm font-semibold uppercase tracking-[0.16em]">Reserve your spot</p>
      <p className="mt-1 text-xs text-paper/50">
        Create your founding account — takes a few seconds.
      </p>

      <div className="mt-5 space-y-2.5">
        <input
          name="name"
          type="text"
          required
          placeholder="Full name"
          className="w-full border border-paper/25 bg-transparent px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="you@lab.com"
          className="w-full border border-paper/25 bg-transparent px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Create a password"
          className="w-full border border-paper/25 bg-transparent px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
        />
        <SubmitButton />
      </div>

      {state && !state.ok && <p className="mt-3 text-xs text-paper/70">{state.error}</p>}
      <p className="mt-3 text-[11px] leading-relaxed text-paper/40">
        Lock in 15% off at launch (10% launch discount + a one-time 5% code, tied to your account).
        Creating an account doesn&apos;t grant store access until we go live.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-paper px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-opacity hover:bg-paper/90 disabled:opacity-60"
    >
      {pending ? "Creating…" : "Create pre-sale account"}
    </button>
  );
}
