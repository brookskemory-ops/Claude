import type { Metadata } from "next";
import Link from "next/link";
import { LogoMonogram } from "@/components/Logo";
import { MoleculeLattice, PeptideChain } from "@/components/graphics";

export const metadata: Metadata = { title: "About & Quality" };

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink text-paper">
        <MoleculeLattice className="pointer-events-none absolute inset-0 text-paper/[0.06]" />
        <div className="container-site relative py-20 text-center">
          <p className="eyebrow text-paper/60">About Axevia</p>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Research materials you can <span className="text-accent">trust.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-paper/70">
            Axevia supplies high-purity research peptides backed by independent analytical testing,
            so your work starts with materials of known identity and quality.
          </p>
          <PeptideChain className="mx-auto mt-8 w-64 max-w-full text-paper" />
        </div>
      </section>

      <section className="container-site grid items-center gap-12 py-20 lg:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center border border-line">
          <LogoMonogram size={140} />
        </div>
        <div>
          <p className="eyebrow">Quality Standards</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Tested, documented, and traceable.
          </h2>
          <p className="mt-5 text-ink-muted">
            Every lot is analyzed by independent laboratories using HPLC and mass spectrometry to
            confirm identity and purity. A Certificate of Analysis accompanies each batch, and
            products ship lyophilized and ready for storage at -20°C.
          </p>
          <p className="mt-4 text-ink-muted">
            We supply research professionals only, and we hold every shipment to the standard we
            would demand for our own bench.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-paper-soft">
        <div className="container-site grid gap-px bg-line sm:grid-cols-3">
          {[
            { t: "Purity", d: "High-purity compounds verified per lot via HPLC." },
            { t: "Documentation", d: "Certificate of Analysis with every batch." },
            { t: "Handling", d: "Lyophilized and shipped to spec for stability." },
          ].map((v) => (
            <div key={v.t} className="bg-paper-soft px-6 py-12 text-center">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">{v.t}</h3>
              <p className="mt-2 text-sm text-ink-muted">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-site py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight">For research professionals.</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-muted">
          Axevia products are for laboratory research use only — not for human or veterinary use.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/shop" className="btn-primary">Browse Catalog</Link>
          <Link href="/research-use-policy" className="btn-outline">Research-Use Policy</Link>
        </div>
      </section>
    </div>
  );
}
