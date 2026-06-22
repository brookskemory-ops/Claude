"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitContact } from "./actions";

export default function ContactForm() {
  const [state, formAction] = useFormState(submitContact, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col justify-center border border-line p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em]">Message sent</p>
        <p className="mt-3 text-sm text-ink-muted">
          Thanks for reaching out — our team will get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 border border-line p-8">
      {state && !state.ok && (
        <p className="border border-ink bg-paper-muted px-4 py-2 text-sm">{state.error}</p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">First Name</label>
          <input name="firstName" className="input" required />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input name="lastName" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input name="email" className="input" type="email" required />
      </div>
      <div>
        <label className="label">Subject</label>
        <input name="subject" className="input" />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea name="message" className="input" rows={5} required />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Sending…" : "Send Message"}
    </button>
  );
}
