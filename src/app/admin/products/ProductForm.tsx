"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { Product } from "@prisma/client";
import { CATEGORIES } from "@/lib/types";
import type { FormResult } from "../actions";

const IMAGE_KEYS = [
  "protein",
  "preworkout",
  "creatine",
  "vitamins",
  "recovery",
  "greens",
  "default",
];

type Action = (prev: FormResult | null, formData: FormData) => Promise<FormResult>;

export default function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: Action;
  product?: Product;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, null);

  function dateValue(d: Date | null | undefined) {
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 10);
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state && !state.ok && (
        <p className="border border-ink bg-paper-muted px-4 py-3 text-sm">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <input name="name" className="input" defaultValue={product?.name} required />
        </Field>
        <Field label="Slug (optional)">
          <input name="slug" className="input" defaultValue={product?.slug} placeholder="auto from name" />
        </Field>
      </div>

      <Field label="Tagline">
        <input name="tagline" className="input" defaultValue={product?.tagline} />
      </Field>

      <Field label="Category" required>
        <select name="category" className="input" defaultValue={product?.category ?? CATEGORIES[0]}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>

      <Field label="Description" required>
        <textarea name="description" rows={4} className="input" defaultValue={product?.description} required />
      </Field>

      <Field label="Ingredients">
        <textarea name="ingredients" rows={2} className="input" defaultValue={product?.ingredients} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Servings / Size">
          <input name="servings" className="input" defaultValue={product?.servings} placeholder="30 servings" />
        </Field>
        <Field label="Image Style">
          <select name="imageKey" className="input" defaultValue={product?.imageKey ?? "default"}>
            {IMAGE_KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price ($)" required>
          <input name="price" type="number" step="0.01" min="0" className="input" defaultValue={product?.price} required />
        </Field>
        <Field label="Sale Price ($)">
          <input name="salePrice" type="number" step="0.01" min="0" className="input" defaultValue={product?.salePrice ?? ""} placeholder="none" />
        </Field>
        <Field label="Sale Ends">
          <input name="saleEndsAt" type="date" className="input" defaultValue={dateValue(product?.saleEndsAt)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Stock" required>
          <input name="stock" type="number" min="0" className="input" defaultValue={product?.stock ?? 0} required />
        </Field>
        <Field label="Low Stock Threshold">
          <input name="lowStockThreshold" type="number" min="0" className="input" defaultValue={product?.lowStockThreshold ?? 10} />
        </Field>
      </div>

      <div className="flex gap-8">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
          Active (visible in store)
        </label>
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/products" className="btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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
