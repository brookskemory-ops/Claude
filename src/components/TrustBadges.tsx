import Link from "next/link";
import { IconTested, IconCOA, IconShipping, IconGuarantee } from "@/components/graphics";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";

const BADGES = [
  {
    Icon: IconTested,
    title: "Third-party tested",
    detail: "HPLC purity & mass-spec identity by independent labs.",
  },
  {
    Icon: IconCOA,
    title: "COA with every batch",
    detail: "Lot-matched Certificate of Analysis on every product.",
  },
  {
    Icon: IconShipping,
    title: "Fast dispatch",
    detail: `Ships within 1 business day · free over ${formatPrice(FREE_SHIPPING_THRESHOLD)}.`,
  },
  {
    Icon: IconGuarantee,
    title: "Satisfaction guarantee",
    detail: "Backed by our return policy.",
    href: "/refund-policy",
  },
];

/**
 * Compact black-and-white trust strip. `variant="row"` renders a bordered 4-up grid
 * (homepage/product page); `variant="inline"` renders a condensed icon+label list
 * (checkout/cart reassurance).
 */
export default function TrustBadges({
  variant = "row",
  className = "",
}: {
  variant?: "row" | "inline";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted ${className}`}>
        {BADGES.map((b) => (
          <li key={b.title} className="flex items-center gap-1.5">
            <b.Icon className="h-4 w-4 text-ink" />
            {b.title}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={`grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {BADGES.map((b) => {
        const body = (
          <>
            <b.Icon className="mb-3 h-7 w-7 text-ink" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">{b.title}</h3>
            <p className="mt-1.5 text-sm text-ink-muted">{b.detail}</p>
          </>
        );
        return b.href ? (
          <Link key={b.title} href={b.href} className="block bg-paper p-6 transition-colors hover:bg-paper-muted">
            {body}
          </Link>
        ) : (
          <div key={b.title} className="bg-paper p-6">
            {body}
          </div>
        );
      })}
    </div>
  );
}
