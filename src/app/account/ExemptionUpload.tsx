"use client";

import { useState } from "react";

export default function ExemptionUpload({
  taxExempt,
  certUrl,
}: {
  taxExempt: boolean;
  certUrl: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(Boolean(certUrl));

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/account/upload", { method: "POST", body: fd });
      if (res.ok) setDone(true);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">Tax Exemption</h2>
      <div className="border border-line p-5 text-sm">
        {taxExempt ? (
          <p className="text-ink-muted">Your account is tax-exempt. No tax is charged at checkout.</p>
        ) : (
          <>
            <p className="text-ink-muted">
              Institutional or resale buyer? Upload your exemption/resale certificate and we&apos;ll
              review it.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <input type="file" accept="application/pdf,image/*" onChange={upload} className="text-xs" />
              {uploading && <span className="text-xs text-ink-muted">Uploading…</span>}
              {done && !uploading && (
                <span className="text-xs text-ink-muted">Submitted — pending review.</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
