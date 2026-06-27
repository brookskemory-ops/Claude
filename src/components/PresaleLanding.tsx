import { LogoMonogram } from "@/components/Logo";
import PresaleForm from "@/components/PresaleForm";
import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/config";
import { minEffectivePrice, round2 } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";

// Pre-sale landing shown while the site is gated. Visitors create an account (no site access) and
// see a read-only price sneak-peek at the pre-sale member price (launch discount + the 5% code).
const PRESALE_BONUS_PCT = 5;

export default async function PresaleLanding({
  error = false,
  verified = false,
}: {
  error?: boolean;
  verified?: boolean;
}) {
  const [config, products] = await Promise.all([
    getSiteConfig(),
    db.product.findMany({
      where: { active: true, variants: { some: { active: true } } },
      include: { variants: { where: { active: true } } },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
  ]);

  const memberPct = config.launchDiscountPercent + PRESALE_BONUS_PCT;
  const priced = products
    .map((p) => {
      const base = minEffectivePrice(p.variants);
      return { name: p.name, base, member: round2(base * (1 - memberPct / 100)) };
    })
    .filter((p) => p.base > 0);

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
          High-purity, third-party tested research peptides — launching soon. Create your account to
          lock in pre-sale pricing and be first in line when stock lands.
        </p>
        <p className="mt-3 max-w-md text-sm text-paper/60">
          Pre-sale members save {memberPct}% at launch — {config.launchDiscountPercent}% launch
          discount plus your one-time {PRESALE_BONUS_PCT}% code.
        </p>

        {verified ? (
          <div className="mt-8 w-full max-w-sm border border-paper/30 p-6 text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.14em]">Email verified</p>
            <p className="mt-2 text-sm text-paper/70">
              You&apos;re all set — your one-time {PRESALE_BONUS_PCT}% code is on its way to your
              inbox. See you at launch.
            </p>
          </div>
        ) : (
          <PresaleForm />
        )}

        {priced.length > 0 && (
          <div className="mt-16 w-full">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-paper/50">
              A sneak peek at our catalog
            </p>
            <ul className="mx-auto mt-6 max-w-lg divide-y divide-paper/15 border-y border-paper/15">
              {priced.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-4 py-3 text-left">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="flex shrink-0 items-baseline gap-2 text-sm tabular-nums">
                    <span className="text-paper/40 line-through">{formatPrice(p.base)}</span>
                    <span className="font-semibold text-paper">from {formatPrice(p.member)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] text-paper/40">
              Pre-sale member price — {memberPct}% off ({config.launchDiscountPercent}% launch + your{" "}
              {PRESALE_BONUS_PCT}% code). Certificate of Analysis included with every order.
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
