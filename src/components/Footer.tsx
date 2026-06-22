import Link from "next/link";
import { LogoLockup } from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <LogoLockup invert />
          <p className="mt-4 max-w-xs text-sm text-paper/60">
            High-purity research peptides for qualified laboratories and research professionals.
          </p>
        </div>

        <FooterColumn
          title="Catalog"
          links={[
            { href: "/shop", label: "All Products" },
            { href: "/shop?category=Regenerative", label: "Regenerative" },
            { href: "/shop?category=Metabolic", label: "Metabolic" },
            { href: "/shop?category=Lab Supplies", label: "Lab Supplies" },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { href: "/about", label: "About & Quality" },
            { href: "/wholesale", label: "Wholesale" },
            { href: "/contact", label: "Contact" },
            { href: "/faq", label: "FAQ" },
            { href: "/research-use-policy", label: "Research-Use Policy" },
            { href: "/account", label: "My Account" },
          ]}
        />
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/50">
            Lab Updates
          </p>
          <form className="flex border border-paper/30">
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-transparent px-3 py-2 text-sm text-paper placeholder:text-paper/40 focus:outline-none"
            />
            <button type="submit" className="bg-paper px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-paper/40">
          <p className="font-semibold uppercase tracking-[0.14em] text-paper/60">
            Research Use Only
          </p>
          <p className="max-w-3xl">
            All products are sold for laboratory and in-vitro research use only. They are not
            drugs, foods, cosmetics, or medical devices, and are not intended for human or
            veterinary use, diagnosis, treatment, or prevention of any disease. By purchasing, you
            confirm you are a qualified researcher.
          </p>
          <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {[
              { href: "/research-use-policy", label: "Research-Use Policy" },
              { href: "/terms", label: "Terms" },
              { href: "/privacy", label: "Privacy" },
              { href: "/refund-policy", label: "Refund & Returns" },
              { href: "/shipping-policy", label: "Shipping" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-paper/50 hover:text-paper">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="mt-2">© {new Date().getFullYear()} Axevia. All rights reserved.</p>
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
