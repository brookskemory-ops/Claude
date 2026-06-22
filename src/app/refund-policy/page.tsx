import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund & Return Policy" };

export default function RefundPolicyPage() {
  return (
    <div className="container-site max-w-3xl py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Refund &amp; Return Policy</h1>
      <p className="mt-4 text-xs text-ink-muted">
        Template — review with legal counsel before publishing. Replace bracketed placeholders.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-muted">
        <S t="Eligibility">
          Because products are research materials, returns are accepted only for unopened items in
          original condition within [14] days of delivery, or for items that arrive damaged or
          incorrect. Opened or used items are non-returnable for safety and integrity reasons.
        </S>
        <S t="Damaged or Incorrect Orders">
          Contact us within [7] days of delivery at support@axevia.co with your order number and
          photos. We will arrange a replacement or refund for verified issues.
        </S>
        <S t="How to Request">
          Start a return request from your order page under My Account, or email us. Approved returns
          receive instructions; unauthorized returns may not be accepted.
        </S>
        <S t="Refunds">
          Approved refunds are issued to the original payment method after we receive and inspect the
          return. Original shipping is non-refundable unless the error was ours.
        </S>
        <S t="Contact">
          support@axevia.co, [business mailing address].
        </S>
      </div>
    </div>
  );
}

function S({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-ink">{t}</h2>
      <p>{children}</p>
    </section>
  );
}
