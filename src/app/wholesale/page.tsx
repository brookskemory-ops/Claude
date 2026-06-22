import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Wholesale" };

export default function WholesalePage() {
  return (
    <div className="container-site max-w-3xl py-16">
      <p className="eyebrow">Institutional &amp; Bulk</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Wholesale</h1>
      <p className="mt-4 text-ink-muted">
        Axevia supplies research peptides to universities, contract labs, and research
        organizations at volume. For bulk pricing, recurring orders, or custom requirements, reach
        out and our team will follow up.
      </p>

      <div className="mt-10 grid gap-px bg-line sm:grid-cols-3">
        {[
          { t: "Volume Pricing", d: "Tiered pricing for bulk and recurring orders." },
          { t: "Documentation", d: "COAs and lot records for every shipment." },
          { t: "Dedicated Support", d: "A direct contact for procurement and reorders." },
        ].map((b) => (
          <div key={b.t} className="bg-paper px-6 py-8 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">{b.t}</h3>
            <p className="mt-2 text-sm text-ink-muted">{b.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 border border-ink p-8 text-center">
        <h2 className="text-xl font-bold tracking-tight">Request wholesale pricing</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Email us with your organization, the compounds and quantities you need, and we&apos;ll
          send a quote.
        </p>
        <a
          href="mailto:support@axevia.co?subject=Wholesale%20Inquiry"
          className="btn-primary mt-6"
        >
          Email support@axevia.co
        </a>
        <p className="mt-4 text-xs text-ink-muted">
          Prefer a form?{" "}
          <Link href="/contact" className="underline hover:text-ink">
            Use our contact page
          </Link>
          .
        </p>
      </div>

      <p className="mt-8 text-center text-[11px] uppercase tracking-[0.18em] text-ink-muted">
        Research Use Only — not for human or veterinary use
      </p>
    </div>
  );
}
