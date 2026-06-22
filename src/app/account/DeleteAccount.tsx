"use client";

import { deleteAccount } from "./actions";

export default function DeleteAccount() {
  return (
    <form
      action={deleteAccount}
      onSubmit={(e) => {
        if (!confirm("Permanently delete your account? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button className="text-xs uppercase tracking-[0.14em] text-ink-muted underline hover:text-ink">
        Delete my account
      </button>
    </form>
  );
}
