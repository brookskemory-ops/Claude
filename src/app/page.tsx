import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";

export default async function HomePage() {
  const featured = await db.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "asc" },
    take: 4,
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-paper">
        <div className="container-site grid items-center gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <p className="eyebrow text-paper/60">Precision Supplements</p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Fuel built
              <br />
              for intent.
            </h1>
            <p className="mt-6 max-w-md text-paper/70">
              Clean, transparent formulas engineered for performance and
              recovery. No fillers. No noise. Just results you can feel.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="bg-paper px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-paper/90">
                Shop Collection
              </Link>
              <Link href="/about" className="border border-paper/40 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-paper hover:bg-paper hover:text-ink">
                Our Story
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 border border-paper/20" />
            <ProductImage
              imageKey="protein"
              name="Axevia hero product"
              className="h-full w-full p-8 invert"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b border-line">
        <div className="container-site grid gap-px bg-line sm:grid-cols-3">
          {[
            { t: "Third-Party Tested", d: "Every batch verified for purity and potency." },
            { t: "No Hidden Fillers", d: "Fully transparent labels, every ingredient disclosed." },
            { t: "Free Shipping $75+", d: "Fast, tracked delivery on qualifying orders." },
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
            <p className="eyebrow">Bestsellers</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Featured Products</h2>
          </div>
          <Link href="/shop" className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-ink sm:block">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand statement */}
      <section className="bg-paper-soft">
        <div className="container-site grid items-center gap-10 py-20 lg:grid-cols-2">
          <div className="aspect-[4/3] border border-line">
            <ProductImage imageKey="greens" name="Axevia brand" className="h-full w-full p-12" />
          </div>
          <div>
            <p className="eyebrow">The Axevia Standard</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Engineered for the people who don&apos;t cut corners.
            </h2>
            <p className="mt-5 text-ink-muted">
              We formulate with clinically studied doses and source from audited
              suppliers. What goes on the label is exactly what goes in the
              bottle — nothing more, nothing hidden.
            </p>
            <Link href="/about" className="btn-outline mt-7">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-site py-20">
        <div className="mb-10 text-center">
          <p className="eyebrow">Trusted by athletes</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">What People Say</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { q: "The cleanest protein I've used. Mixes perfectly and no bloat.", n: "Maya T." },
            { q: "Ignite gives me focus without the crash. Total game changer.", n: "Devon R." },
            { q: "Finally a brand that's honest about what's in the tub.", n: "Priya S." },
          ].map((t) => (
            <figure key={t.n} className="card p-8">
              <blockquote className="text-sm leading-relaxed">“{t.q}”</blockquote>
              <figcaption className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                {t.n}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
