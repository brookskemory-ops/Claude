"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitSuggestion } from "@/app/presale/actions";

export default function SuggestionForm() {
  const [state, formAction] = useFormState(submitSuggestion, null);

  if (state?.ok) {
    return (
      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-paper/20 bg-paper/[0.03] p-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em]">Thanks for the tip</p>
        <p className="mt-2 text-sm text-paper/70">
          We&apos;ve logged your request — popular suggestions help shape what we stock first.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mx-auto mt-6 max-w-md text-left">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="peptide"
          type="text"
          required
          placeholder="Suggest a peptide…"
          className="w-full rounded-full border border-paper/25 bg-transparent px-5 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
        />
        <SubmitButton />
      </div>
      <input
        name="email"
        type="email"
        placeholder="Email (optional — we'll tell you when it lands)"
        className="mt-2 w-full rounded-full border border-paper/25 bg-transparent px-5 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
      />
      {state && !state.ok && <p className="mt-2 text-xs text-paper/70">{state.error}</p>}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-full bg-paper px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-opacity hover:bg-paper/90 disabled:opacity-60"
    >
      {pending ? "Sending…" : "Suggest"}
    </button>
  );
}
