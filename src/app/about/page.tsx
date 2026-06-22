import type { Metadata } from "next";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div>
      <section className="bg-ink text-paper">
        <div className="container-site py-20 text-center">
          <p className="eyebrow text-paper/60">Our Story</p>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Supplements without the smoke and mirrors.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-paper/70">
            Axevia was built on a simple idea: if it&apos;s going in your body,
            you deserve to know exactly what it is and why it&apos;s there.
          </p>
        </div>
      </section>

      <section className="container-site grid items-center gap-12 py-20 lg:grid-cols-2">
        <div className="aspect-[4/3] border border-line">
          <ProductImage imageKey="creatine" name="Axevia" className="h-full w-full p-12" />
        </div>
        <div>
          <p className="eyebrow">The Mission</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Clinically dosed. Honestly labeled.
          </h2>
          <p className="mt-5 text-ink-muted">
            We don&apos;t hide behind proprietary blends or pixie-dusted
            formulas. Every ingredient is included at a dose backed by research,
            and every label tells the full story — no asterisks, no fillers.
          </p>
          <p className="mt-4 text-ink-muted">
            From sourcing to third-party testing, we hold every batch to a single
            standard: the one we&apos;d demand for ourselves.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-paper-soft">
        <div className="container-site grid gap-px bg-line py-px sm:grid-cols-3">
          {[
            { t: "Transparency", d: "Full label disclosure on every product." },
            { t: "Efficacy", d: "Research-backed, clinically relevant doses." },
            { t: "Purity", d: "Third-party tested for what's in — and what's not." },
          ].map((v) => (
            <div key={v.t} className="bg-paper-soft px-6 py-12 text-center">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">{v.t}</h3>
              <p className="mt-2 text-sm text-ink-muted">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-site py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Train with intent.</h2>
        <Link href="/shop" className="btn-primary mt-8">
          Shop the Collection
        </Link>
      </section>
    </div>
  );
}
