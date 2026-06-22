import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold uppercase tracking-brand">Axevia</p>
          <p className="mt-3 max-w-xs text-sm text-paper/60">
            Precision-formulated supplements for people who train with intent.
          </p>
        </div>

        <FooterColumn
          title="Shop"
          links={[
            { href: "/shop", label: "All Products" },
            { href: "/shop?category=Protein", label: "Protein" },
            { href: "/shop?category=Pre-Workout", label: "Pre-Workout" },
            { href: "/shop?category=Vitamins", label: "Vitamins" },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
            { href: "/account", label: "My Account" },
          ]}
        />
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/50">
            Newsletter
          </p>
          <form className="flex border border-paper/30">
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-transparent px-3 py-2 text-sm text-paper placeholder:text-paper/40 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-paper px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink"
            >
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-6 text-xs text-paper/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Axevia. All rights reserved.</p>
          <p>These statements have not been evaluated by the FDA.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/50">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-sm text-paper/70 hover:text-paper">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
