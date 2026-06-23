"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { Post } from "@prisma/client";
import type { FormResult } from "../actions";

type Action = (prev: FormResult | null, formData: FormData) => Promise<FormResult>;

export default function PostForm({
  action,
  post,
  submitLabel,
}: {
  action: Action;
  post?: Post;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, null);
  const [cover, setCover] = useState(post?.coverImageKey ?? "");
  const [uploading, setUploading] = useState(false);

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setCover(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state && !state.ok && (
        <p className="border border-ink bg-paper-muted px-4 py-3 text-sm">{state.error}</p>
      )}

      <Field label="Title" required>
        <input name="title" className="input" defaultValue={post?.title} required />
      </Field>
      <Field label="Slug (optional)">
        <input name="slug" className="input" defaultValue={post?.slug} placeholder="auto from title" />
      </Field>
      <Field label="Excerpt">
        <textarea name="excerpt" rows={2} className="input" defaultValue={post?.excerpt} />
      </Field>
      <Field label="Body (Markdown)" required>
        <textarea
          name="body"
          rows={16}
          className="input font-mono text-xs"
          defaultValue={post?.body}
          required
        />
      </Field>
      <Field label="Cover image (optional)">
        <input
          name="coverImageKey"
          className="input"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="https://… or upload a file"
        />
        <div className="mt-2 flex items-center gap-3">
          <input type="file" accept="image/*" onChange={uploadCover} className="text-xs" />
          {uploading && <span className="text-xs text-ink-muted">Uploading…</span>}
        </div>
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? false} />
        Published (visible at /blog)
      </label>

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/blog" className="btn-ghost">Cancel</Link>
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
