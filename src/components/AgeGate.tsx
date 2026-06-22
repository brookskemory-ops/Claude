"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMonogram } from "@/components/Logo";

const KEY = "axevia_ruo_ack";

export default function AgeGate() {
  const [mounted, setMounted] = useState(false);
  const [acked, setAcked] = useState(true);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setAcked(localStorage.getItem(KEY) === "1");
    } catch {
      setAcked(false);
    }
  }, []);

  if (!mounted || acked) return null;

  function confirm() {
    try {
      localStorage.setItem(KEY, "1");
      document.cookie = `${KEY}=1; path=/; max-age=${60 * 60 * 24 * 90}`;
    } catch {
      /* ignore */
    }
    setAcked(true);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4">
      <div className="w-full max-w-md border border-line bg-paper p-8 text-center">
        <div className="mb-5 flex justify-center">
          <LogoMonogram size={56} />
        </div>
        {declined ? (
          <>
            <h2 className="text-xl font-bold tracking-tight">Access restricted</h2>
            <p className="mt-3 text-sm text-ink-muted">
              Axevia products are available to qualified research professionals only. You may
              return once you can confirm eligibility.
            </p>
            <button onClick={() => setDeclined(false)} className="btn-outline mt-6">
              Go Back
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold tracking-tight">Research professionals only</h2>
            <p className="mt-3 text-sm text-ink-muted">
              All Axevia products are sold strictly for <strong>laboratory research use only</strong>
              {" "}— not for human or veterinary use. By entering, you confirm that you are at least
              21 years old, a qualified researcher, and agree to our{" "}
              <Link href="/research-use-policy" className="underline">Research-Use Policy</Link>.
            </p>
            <div className="mt-7 flex flex-col gap-2">
              <button onClick={confirm} className="btn-primary w-full">
                I Confirm — Enter Site
              </button>
              <button onClick={() => setDeclined(true)} className="btn-ghost w-full">
                I Do Not Qualify
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
