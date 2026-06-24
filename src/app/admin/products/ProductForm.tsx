"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { Product, ProductVariant } from "@prisma/client";
import { CATEGORIES } from "@/lib/types";
import type { FormResult } from "../actions";

const IMAGE_KEYS = ["vial", "solvent", "default"];

type Action = (prev: FormResult | null, formData: FormData) => Promise<FormResult>;

type VariantRow = {
  label: string;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  lowStockThreshold: string;
  active: boolean;
};

function toRow(v: ProductVariant): VariantRow {
  return {
    label: v.label,
    sku: v.sku,
    price: String(v.price),
    salePrice: v.salePrice != null ? String(v.salePrice) : "",
    stock: String(v.stock),
    lowStockThreshold: String(v.lowStockThreshold),
    active: v.active,
  };
}

const BLANK_ROW: VariantRow = {
  label: "",
  sku: "",
  price: "",
  salePrice: "",
  stock: "0",
  lowStockThreshold: "10",
  active: true,
};

export default function ProductForm({
  action,
  product,
  variants,
  submitLabel,
}: {
  action: Action;
  product?: Product;
  variants?: ProductVariant[];
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, null);
  const [rows, setRows] = useState<VariantRow[]>(
    variants && variants.length ? variants.map(toRow) : [{ ...BLANK_ROW }],
  );
  const [coaUrl, setCoaUrl] = useState(product?.coaUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function uploadCoa(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setCoaUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
      else setUploadError(data.error || "Upload failed.");
    } catch {
      setUploadError("Upload failed.");
    } finally {
      setImageUploading(false);
    }
  }

  function updateRow(i: number, patch: Partial<VariantRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { ...BLANK_ROW }]);
  }
  function removeRow(i: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  const variantsJson = JSON.stringify(
    rows.map((r) => ({
      label: r.label,
      sku: r.sku,
      price: r.price,
      salePrice: r.salePrice,
      stock: r.stock,
      lowStockThreshold: r.lowStockThreshold,
      active: r.active,
    })),
  );

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state && !state.ok && (
        <p className="border border-ink bg-paper-muted px-4 py-3 text-sm">{state.error}</p>
      )}
      <input type="hidden" name="variants" value={variantsJson} />
      <input type="hidden" name="imageUrl" value={imageUrl} />

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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" required>
          <select name="category" className="input" defaultValue={product?.category ?? CATEGORIES[0]}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Image Style (fallback illustration)">
          <select name="imageKey" className="input" defaultValue={product?.imageKey ?? "vial"}>
            {IMAGE_KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Product Photo (optional — overrides the illustration)">
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" onChange={uploadImage} className="text-xs" />
          {imageUploading && <span className="text-xs text-ink-muted">Uploading…</span>}
        </div>
        {uploadError && <p className="mt-1 text-xs text-ink">{uploadError}</p>}
        {imageUrl && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="h-16 w-16 border border-line object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="text-xs text-ink-muted underline hover:text-ink"
            >
              Remove
            </button>
          </div>
        )}
      </Field>

      <Field label="Description" required>
        <textarea name="description" rows={3} className="input" defaultValue={product?.description} required />
      </Field>

      {/* Peptide specifications */}
      <fieldset className="border border-line p-4">
        <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Specifications
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Purity">
            <input name="purity" className="input" defaultValue={product?.purity} placeholder="≥99%" />
          </Field>
          <Field label="Form">
            <input name="form" className="input" defaultValue={product?.form ?? "Lyophilized powder"} />
          </Field>
          <Field label="CAS Number">
            <input name="casNumber" className="input" defaultValue={product?.casNumber} />
          </Field>
          <Field label="Molecular Formula">
            <input name="molecularFormula" className="input" defaultValue={product?.molecularFormula} />
          </Field>
          <Field label="Molecular Weight">
            <input name="molecularWeight" className="input" defaultValue={product?.molecularWeight} />
          </Field>
          <Field label="Storage">
            <input name="storage" className="input" defaultValue={product?.storage} placeholder="Store at -20°C" />
          </Field>
        </div>
        <Field label="Sequence (optional)">
          <input name="sequence" className="input" defaultValue={product?.sequence} />
        </Field>
        <Field label="Certificate of Analysis (optional)">
          <input
            name="coaUrl"
            className="input"
            value={coaUrl}
            onChange={(e) => setCoaUrl(e.target.value)}
            placeholder="https://… or upload a file"
          />
          <div className="mt-2 flex items-center gap-3">
            <input type="file" accept="application/pdf,image/*" onChange={uploadCoa} className="text-xs" />
            {uploading && <span className="text-xs text-ink-muted">Uploading…</span>}
            {coaUrl && !uploading && (
              <a href={coaUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline">
                View current
              </a>
            )}
          </div>
        </Field>
      </fieldset>

      {/* Variants */}
      <fieldset className="border border-line p-4">
        <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Sizes / Variants
        </legend>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 border-b border-line pb-3 sm:grid-cols-12">
              <input className="input sm:col-span-2" placeholder="Size (10mg)" value={row.label} onChange={(e) => updateRow(i, { label: e.target.value })} />
              <input className="input sm:col-span-3" placeholder="SKU" value={row.sku} onChange={(e) => updateRow(i, { sku: e.target.value })} />
              <input className="input sm:col-span-2" placeholder="Price" type="number" step="0.01" value={row.price} onChange={(e) => updateRow(i, { price: e.target.value })} />
              <input className="input sm:col-span-2" placeholder="Sale" type="number" step="0.01" value={row.salePrice} onChange={(e) => updateRow(i, { salePrice: e.target.value })} />
              <input className="input sm:col-span-2" placeholder="Stock" type="number" value={row.stock} onChange={(e) => updateRow(i, { stock: e.target.value })} />
              <button type="button" onClick={() => removeRow(i)} className="text-xs text-ink-muted underline hover:text-ink sm:col-span-1">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className="btn-outline btn-sm mt-3">
          + Add Size
        </button>
      </fieldset>

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
