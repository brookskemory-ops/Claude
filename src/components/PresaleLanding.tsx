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
    <div className="relative min-h-screen overflow-hidden bg-ink text-paper">
      {/* Faint molecular backdrop, fading into the ink background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url(/graphics/molecule-wide.png)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)",
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
        <LogoMonogram size={60} invert />

        <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-paper/25 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-paper">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-paper" />
          Pre-sale · {memberPct}% off at launch
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Get in before
          <br />
          the doors open.
        </h1>
        <p className="mt-5 max-w-md text-paper/70">
          Axevia supplies high-purity, third-party tested research peptides. Create your founding
          account now to lock in pre-sale pricing and be first in line when stock lands.
        </p>

        {/* Founding-member benefits */}
        <div className="mt-10 grid w-full max-w-lg grid-cols-3 divide-x divide-paper/15 border border-paper/15 text-left">
          <Benefit title={`${memberPct}% off`} sub="Founding-member pricing" />
          <Benefit title="First access" sub="Shop before everyone" />
          <Benefit title="COA on every lot" sub="Third-party tested" />
        </div>

        {verified ? (
          <div className="mt-10 w-full max-w-sm border border-paper/30 bg-paper/[0.03] p-6 text-left">
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
          <div className="mt-20 w-full max-w-lg">
            <div className="flex items-end justify-between gap-4 border-b border-paper/20 pb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-paper/60">
                A sneak peek at the catalog
              </p>
              <span className="rounded-full bg-paper px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
                {memberPct}% off
              </span>
            </div>
            <ul className="divide-y divide-paper/12">
              {priced.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-4 py-4 text-left">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
                    <span className="text-xs text-paper/40 line-through">{formatPrice(p.base)}</span>
                    <span className="text-base font-semibold text-paper">
                      {formatPrice(p.member)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] leading-relaxed text-paper/40">
              Pre-sale member price — {memberPct}% off ({config.launchDiscountPercent}% launch
              discount + your one-time {PRESALE_BONUS_PCT}% code). Certificate of Analysis included
              with every order.
            </p>
          </div>
        )}

        <details className="mt-20 w-full max-w-sm text-left">
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
              className="shrink-0 rounded-full bg-paper px-6 text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-paper/90"
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

function Benefit({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="px-4 py-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-paper/50">{sub}</p>
    </div>
  );
}
