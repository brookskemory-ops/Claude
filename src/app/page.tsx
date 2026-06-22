import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { LogoMonogram } from "@/components/Logo";

export default async function HomePage() {
  const featured = await db.product.findMany({
    where: { active: true, featured: true },
    include: { variants: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "asc" },
    take: 4,
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-paper">
        <div className="container-site grid items-center gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <p className="eyebrow text-paper/60">Research Grade Peptides</p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Purity you
              <br />
              can verify.
            </h1>
            <p className="mt-6 max-w-md text-paper/70">
              Axevia supplies high-purity, third-party tested research peptides to qualified
              laboratories and research professionals. Every lot, fully documented.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="bg-paper px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-paper/90">
                Browse Catalog
              </Link>
              <Link href="/about" className="border border-paper/40 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-paper hover:bg-paper hover:text-ink">
                Quality Standards
              </Link>
            </div>
            <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-paper/40">
              For laboratory research use only — not for human or veterinary use.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative flex aspect-square w-full max-w-md items-center justify-center border border-paper/20">
              <LogoMonogram size={180} invert />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b border-line">
        <div className="container-site grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "≥99% Purity", d: "High-purity compounds, verified per lot." },
            { t: "Third-Party Tested", d: "HPLC and mass-spec analysis." },
            { t: "COA Included", d: "Certificate of Analysis for every batch." },
            { t: "Cold-Chain Shipping", d: "Lyophilized and shipped to spec." },
          ].map((b) => (
            <div key={b.t} className="bg-paper px-6 py-10 text-center">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">{b.t}</h3>
              <p className="mt-2 text-sm text-ink-muted">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-site py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Featured Compounds</h2>
          </div>
          <Link href="/shop" className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-ink sm:block">
            View All →
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="py-10 text-center text-ink-muted">
            No products yet — add your catalog from the admin panel.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Standard */}
      <section className="bg-paper-soft">
        <div className="container-site grid items-center gap-10 py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow">The Axevia Standard</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Documented quality, lot after lot.
            </h2>
            <p className="mt-5 text-ink-muted">
              Each compound is analyzed by independent laboratories for identity and purity. The
              Certificate of Analysis ships with every order, so your results start with materials
              you can trust.
            </p>
            <Link href="/about" className="btn-outline mt-7">
              Our Process
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-px bg-line">
            {[
              { k: "≥99%", v: "Typical purity" },
              { k: "HPLC / MS", v: "Analytical methods" },
              { k: "Per-lot", v: "Certificate of Analysis" },
              { k: "-20°C", v: "Lyophilized storage" },
            ].map((s) => (
              <div key={s.v} className="bg-paper-soft p-8">
                <p className="text-2xl font-bold">{s.k}</p>
                <p className="mt-1 text-sm text-ink-muted">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance callout */}
      <section className="container-site py-20">
        <div className="border border-ink p-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight">For research professionals</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-muted">
            Axevia products are sold strictly for laboratory and in-vitro research. By purchasing,
            you confirm you are a qualified researcher and agree to our Research-Use-Only terms.
          </p>
          <Link href="/research-use-policy" className="btn-outline mt-7">
            Research-Use Policy
          </Link>
        </div>
      </section>
    </>
  );
}
