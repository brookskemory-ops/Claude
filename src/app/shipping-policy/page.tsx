import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <div className="container-site max-w-3xl py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Shipping Policy</h1>
      <p className="mt-4 text-xs text-ink-muted">
        Template — review with legal counsel before publishing. Replace bracketed placeholders.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-muted">
        <S t="Processing Time">
          Orders are typically processed within [1–2] business days. You&apos;ll receive a tracking
          number by email once your order ships.
        </S>
        <S t="Rates & Free Shipping">
          Shipping is calculated at checkout. Orders over [$75] qualify for free standard shipping;
          otherwise a flat rate applies.
        </S>
        <S t="Carriers & Delivery">
          We ship via [USPS/UPS/FedEx]. Delivery times are estimates and not guaranteed. Title and
          risk of loss pass to you upon our delivery to the carrier.
        </S>
        <S t="Handling & Storage">
          Products ship lyophilized where applicable. Upon receipt, store per the product&apos;s stated
          conditions (typically -20°C, protected from light).
        </S>
        <S t="Shipping Restrictions">
          We ship within [the United States]. It is your responsibility to ensure you may lawfully
          receive research materials at your destination.
        </S>
        <S t="Contact">
          [support@axevia.com] for shipping questions.
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
