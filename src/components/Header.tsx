"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { LogoWordmark } from "@/components/Logo";
import type { SessionPayload } from "@/lib/types";

type NavItem = {
  label: string;
  href?: string;
  children?: { href: string; label: string }[];
};

const NAV: NavItem[] = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/wholesale", label: "Wholesale" },
  {
    label: "Contact",
    children: [
      { href: "/contact", label: "Contact Us" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export default function Header({
  session,
}: {
  session: SessionPayload | null;
}) {
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="bg-ink px-4 py-1.5 text-center text-[10px] uppercase tracking-[0.18em] text-paper/80">
        Research Use Only — not for human or veterinary consumption
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="container-site flex h-16 items-center justify-between gap-4">
          <button
            className="md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <MenuIcon />
          </button>

          <Link href="/" onClick={() => setMenuOpen(false)} aria-label="Axevia home">
            <LogoWordmark className="text-xl" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.label} className="group relative">
                  <button
                    className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:text-ink ${
                      item.children.some((c) => pathname.startsWith(c.href))
                        ? "text-ink"
                        : "text-ink-muted"
                    }`}
                  >
                    {item.label}
                    <span className="text-[8px]">▼</span>
                  </button>
                  <div className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-3 group-hover:block">
                    <div className="min-w-[150px] border border-line bg-paper py-1 shadow-sm">
                      {item.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="block px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted hover:bg-paper-muted hover:text-ink"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href as string}
                  className={`text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:text-ink ${
                    pathname.startsWith(item.href as string) ? "text-ink" : "text-ink-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-4">
            {session?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-ink sm:block"
              >
                Admin
              </Link>
            )}
            <Link
              href={session ? "/account" : "/account/login"}
              aria-label="Account"
              className="text-ink-muted hover:text-ink"
            >
              <UserIcon />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative text-ink-muted hover:text-ink"
            >
              <BagIcon />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-ink px-1 text-[10px] font-bold text-paper">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-line bg-paper md:hidden">
            <div className="container-site flex flex-col py-2">
              {NAV.map((item) =>
                item.children ? (
                  <div key={item.label} className="py-1">
                    <p className="py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted/60">
                      {item.label}
                    </p>
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setMenuOpen(false)}
                        className="block py-2 pl-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href as string}
                    onClick={() => setMenuOpen(false)}
                    className="py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted"
                  >
                    {item.label}
                  </Link>
                ),
              )}
              {session?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted"
                >
                  Admin
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 7h12l1 13H5L6 7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}
