"use client";

import { useFormState, useFormStatus } from "react-dom";
import { subscribePresale } from "@/app/presale/actions";

export default function PresaleForm() {
  const [state, formAction] = useFormState(subscribePresale, null);

  if (state?.ok) {
    return (
      <div className="mt-8 w-full max-w-sm border border-paper/30 p-6 text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.14em]">You&apos;re on the list</p>
        <p className="mt-2 text-sm text-paper/70">
          Check your inbox for your 5% pre-sale code — we&apos;ll email you the moment stock is in.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 w-full max-w-sm">
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="you@lab.com"
          className="w-full border border-paper/30 bg-transparent px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
        />
        <SubmitButton />
      </div>
      {state && !state.ok && <p className="mt-3 text-xs text-paper/60">{state.error}</p>}
      <p className="mt-3 text-[11px] text-paper/40">
        Join the pre-sale list and get an extra 5% code on top of the 10% launch discount.
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
      className="shrink-0 bg-paper px-6 text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-paper/90 disabled:opacity-60"
    >
      {pending ? "…" : "Notify me"}
    </button>
  );
}
