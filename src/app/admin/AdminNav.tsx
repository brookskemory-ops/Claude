"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/coupons", label: "Sales & Coupons" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
              active ? "bg-ink text-paper" : "text-ink-muted hover:bg-paper-muted"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
