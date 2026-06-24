"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { FormResult } from "../actions";

type Action = (prev: FormResult | null, formData: FormData) => Promise<FormResult>;

export type VariantOption = { id: string; label: string };

type ItemRow = { variantId: string; quantity: string };

export default function BundleForm({
  action,
  variantOptions,
  bundle,
  items,
  submitLabel,
}: {
  action: Action;
  variantOptions: VariantOption[];
  bundle?: {
    name: string;
    slug: string;
    description: string;
    imageKey: string;
    discountPercent: number;
    active: boolean;
  };
  items?: { variantId: string; quantity: number }[];
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, null);
  const [rows, setRows] = useState<ItemRow[]>(
    items && items.length
      ? items.map((i) => ({ variantId: i.variantId, quantity: String(i.quantity) }))
      : [{ variantId: variantOptions[0]?.id ?? "", quantity: "1" }],
  );
  const [image, setImage] = useState(bundle?.imageKey ?? "");
  const [uploading, setUploading] = useState(false);

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setImage(data.url);
    } finally {
      setUploading(false);
    }
  }

  function updateRow(i: number, patch: Partial<ItemRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { variantId: variantOptions[0]?.id ?? "", quantity: "1" }]);
  }
  function removeRow(i: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  const itemsJson = JSON.stringify(
    rows
      .filter((r) => r.variantId)
      .map((r) => ({ variantId: r.variantId, quantity: r.quantity })),
  );

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state && !state.ok && (
        <p className="border border-ink bg-paper-muted px-4 py-3 text-sm">{state.error}</p>
      )}
      <input type="hidden" name="items" value={itemsJson} />
      <input type="hidden" name="imageKey" value={image || "default"} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <input name="name" className="input" defaultValue={bundle?.name} required />
        </Field>
        <Field label="Slug (optional)">
          <input name="slug" className="input" defaultValue={bundle?.slug} placeholder="auto from name" />
        </Field>
      </div>

      <Field label="Description">
        <textarea name="description" rows={3} className="input" defaultValue={bundle?.description} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Discount %" required>
          <input
            name="discountPercent"
            type="number"
            min="0"
            max="90"
            className="input"
            defaultValue={bundle?.discountPercent ?? 10}
          />
        </Field>
        <Field label="Cover image (optional)">
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={uploadImage} className="text-xs" />
            {uploading && <span className="text-xs text-ink-muted">Uploading…</span>}
            {image && !uploading && (
              <a href={image} target="_blank" rel="noopener noreferrer" className="text-xs underline">
                View
              </a>
            )}
          </div>
        </Field>
      </div>

      <fieldset className="border border-line p-4">
        <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Included products
        </legend>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <select
                className="input col-span-8"
                value={row.variantId}
                onChange={(e) => updateRow(i, { variantId: e.target.value })}
              >
                {variantOptions.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              <input
                className="input col-span-3"
                type="number"
                min="1"
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(i, { quantity: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="col-span-1 text-xs text-ink-muted underline hover:text-ink"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className="btn-outline btn-sm mt-3">
          + Add Product
        </button>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={bundle?.active ?? true} />
        Active (visible at /bundles)
      </label>

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/bundles" className="btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-ink">*</span>}
      </label>
      {children}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}
