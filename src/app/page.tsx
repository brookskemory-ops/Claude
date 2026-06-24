import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import TrustBadges from "@/components/TrustBadges";
import { CATEGORIES } from "@/lib/types";

export default async function HomePage() {
  const featured = await db.product.findMany({
    where: { active: true, featured: true },
    include: {
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      reviews: { where: { status: "APPROVED" }, select: { rating: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 4,
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/graphics/hero-molecule.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="container-site relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <p className="eyebrow text-paper/60">Research Grade Peptides</p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Purity you
              <br />
              can verify.
            </h1>
            <p className="mt-6 max-w-md text-paper/70">
              Axevia supplies high-purity, third-party tested research peptides to qualified
              laboratories and research professionals. Every lot, fully documented.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="bg-paper px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-paper/90">
                Browse Catalog
              </Link>
              <Link href="/about" className="border border-paper/40 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-paper transition-colors hover:bg-paper hover:text-ink">
                Quality Standards
              </Link>
            </div>
            <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-paper/40">
              For laboratory research use only — not for human or veterinary use.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md overflow-hidden border border-paper/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/graphics/vials.png"
                alt="Axevia research peptide vials"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust / shipping strip */}
      <section className="border-b border-line">
        <div className="container-site py-px">
          <TrustBadges />
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

      {/* Shop by category */}
      <section className="border-t border-line">
        <div className="container-site py-16">
          <p className="eyebrow">Browse</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Shop by Category</h2>
          <div className="mt-8 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                aria-label={cat}
                className="group flex aspect-square items-center justify-center bg-paper p-4 transition-colors hover:bg-paper-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/graphics/categories/${cat.toLowerCase().replace(/\s+/g, "-")}.png`}
                  alt={cat}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Peptide architecture figure */}
      <section className="border-t border-line">
        <div className="container-site py-16">
          <div className="mb-6 max-w-xl">
            <p className="eyebrow">The Science</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Built on peptide chemistry</h2>
            <p className="mt-3 text-ink-muted">
              From N-terminus to C-terminus, every compound is defined by its sequence — and
              verified against it by independent analysis.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/graphics/peptide-architecture.png"
            alt="Figure 01 — peptide architecture: N-terminus, peptide bond, C-terminus"
            className="w-full border border-line"
          />
        </div>
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
          <div className="overflow-hidden border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/graphics/microscope.png"
              alt="Independent laboratory analysis"
              className="w-full"
            />
          </div>
        </div>
        <div className="container-site grid grid-cols-2 gap-px bg-line pb-20 lg:grid-cols-4">
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
      </section>

      {/* Compliance callout */}
      <section className="relative overflow-hidden bg-ink text-paper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/graphics/molecule-wide.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="container-site relative py-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight">For research professionals</h2>
          <p className="mx-auto mt-3 max-w-xl text-paper/70">
            Axevia products are sold strictly for laboratory and in-vitro research. By purchasing,
            you confirm you are a qualified researcher and agree to our Research-Use-Only terms.
          </p>
          <Link
            href="/research-use-policy"
            className="mt-7 inline-block border border-paper/40 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            Research-Use Policy
          </Link>
        </div>
      </section>
    </>
  );
}
