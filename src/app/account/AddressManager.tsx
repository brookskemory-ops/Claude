"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { Address } from "@prisma/client";
import { addAddress, deleteAddress } from "./actions";

export default function AddressManager({ addresses }: { addresses: Address[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addAddress, null);

  // Close the form once an address is successfully added.
  if (state?.ok && open) setOpen(false);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
          Addresses
        </h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
        >
          {open ? "Cancel" : "+ Add"}
        </button>
      </div>

      {addresses.length === 0 && !open && (
        <p className="border border-line p-5 text-sm text-ink-muted">
          No saved addresses.
        </p>
      )}

      <ul className="space-y-3">
        {addresses.map((a) => (
          <li key={a.id} className="border border-line p-4 text-sm">
            <div className="flex items-start justify-between">
              <div className="leading-relaxed">
                <p className="font-medium">{a.recipient}</p>
                <p className="text-ink-muted">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}
                </p>
                <p className="text-ink-muted">
                  {a.city}, {a.state} {a.zip}
                </p>
              </div>
              <form action={deleteAddress}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-xs text-ink-muted underline hover:text-ink">
                  Remove
                </button>
              </form>
            </div>
            {a.isDefault && (
              <span className="badge mt-2 border border-line text-ink-muted">
                Default
              </span>
            )}
          </li>
        ))}
      </ul>

      {open && (
        <form action={formAction} className="mt-4 space-y-3 border border-line p-4">
          {state && !state.ok && (
            <p className="text-xs text-ink">{state.error}</p>
          )}
          <input name="recipient" placeholder="Full name" className="input" required />
          <input name="line1" placeholder="Address" className="input" required />
          <input name="line2" placeholder="Apt / Suite (optional)" className="input" />
          <div className="grid grid-cols-2 gap-3">
            <input name="city" placeholder="City" className="input" required />
            <input name="state" placeholder="State" className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="zip" placeholder="ZIP" className="input" required />
            <input name="country" placeholder="Country" defaultValue="United States" className="input" required />
          </div>
          <SubmitButton />
        </form>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary btn-sm w-full" disabled={pending}>
      {pending ? "Saving…" : "Save Address"}
    </button>
  );
}
