import { LogoMonogram } from "@/components/Logo";
import PresaleForm from "@/components/PresaleForm";
import { db } from "@/lib/db";
import { minEffectivePrice } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";

// Pre-sale landing shown while the site is gated. Shows a read-only price sneak-peek and an
// email-capture form; it deliberately links nowhere into the store (the gate blocks access).
export default async function PresaleLanding({ error = false }: { error?: boolean }) {
  const products = await db.product.findMany({
    where: { active: true, variants: { some: { active: true } } },
    include: { variants: { where: { active: true } } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  const priced = products
    .map((p) => ({ name: p.name, from: minEffectivePrice(p.variants) }))
    .filter((p) => p.from > 0);

  return (
    <div className="min-h-screen bg-ink px-6 py-16 text-paper">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <LogoMonogram size={64} invert />
        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-paper/60">
          Axevia · Research Grade Peptides
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          The pre-sale is open.
        </h1>
        <p className="mt-4 max-w-md text-paper/70">
          High-purity, third-party tested research peptides — launching soon. Leave your email to be
          first in line when stock lands.
        </p>
        <p className="mt-3 max-w-md text-sm text-paper/60">
          Pre-sale members save 10% at launch — plus an extra 5% code when you join.
        </p>

        <PresaleForm />

        {priced.length > 0 && (
          <div className="mt-16 w-full">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-paper/50">
              A sneak peek at our catalog
            </p>
            <ul className="mx-auto mt-6 max-w-lg divide-y divide-paper/15 border-y border-paper/15">
              {priced.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-4 py-3 text-left">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="shrink-0 text-sm tabular-nums text-paper/70">
                    from {formatPrice(p.from)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] text-paper/40">
              Prices shown before launch discount. Certificate of Analysis included with every order.
            </p>
          </div>
        )}

        <details className="mt-16 w-full max-w-sm text-left">
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-paper/40 hover:text-paper/70">
            Team access
          </summary>
          <form action="/api/preview" method="post" className="mt-4 flex gap-2">
            <input
              name="code"
              type="password"
              placeholder="Access code"
              required
              className="w-full border border-paper/30 bg-transparent px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 bg-paper px-6 text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-paper/90"
            >
              Enter
            </button>
          </form>
          {error && <p className="mt-3 text-xs text-paper/60">Incorrect access code.</p>}
        </details>

        <p className="mt-16 text-[11px] uppercase tracking-[0.18em] text-paper/40">
          Research Use Only — not for human or veterinary use
        </p>
      </div>
    </div>
  );
}
