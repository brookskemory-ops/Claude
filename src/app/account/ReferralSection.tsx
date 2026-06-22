"use client";

import { useState } from "react";

export default function ReferralSection({
  link,
  completed,
  pending,
  rewardCodes,
  welcomeCode,
}: {
  link: string;
  completed: number;
  pending: number;
  rewardCodes: string[];
  welcomeCode: string | null;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">Refer a Researcher</h2>
      <div className="space-y-3 border border-line p-5 text-sm">
        <p className="text-ink-muted">
          Share your link. Your colleague gets <strong>10% off</strong> their first order, and you
          get a <strong>$10</strong> reward once they order.
        </p>
        <div className="flex gap-2">
          <input readOnly value={link} className="input text-xs" onFocus={(e) => e.target.select()} />
          <button onClick={copy} className="btn-outline btn-sm shrink-0">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-ink-muted">
          {completed} referred · {pending} pending
        </p>
        {welcomeCode && (
          <p className="text-xs text-ink-muted">
            Your welcome code: <strong>{welcomeCode}</strong>
          </p>
        )}
        {rewardCodes.length > 0 && (
          <div className="text-xs text-ink-muted">
            Reward codes:{" "}
            {rewardCodes.map((c) => (
              <strong key={c} className="mr-2">{c}</strong>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
