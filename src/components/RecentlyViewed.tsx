"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/format";

export type RecentItem = {
  slug: string;
  name: string;
  imageKey: string;
  category: string;
  fromPrice: number;
};

const KEY = "axevia_recent";
const MAX = 8;

export default function RecentlyViewed({ current }: { current: RecentItem }) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    let stored: RecentItem[] = [];
    try {
      stored = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      stored = [];
    }
    // Show previously-viewed products (before recording the current one).
    setItems(stored.filter((i) => i.slug !== current.slug).slice(0, 4));
    // Record the current product at the front, de-duplicated and capped.
    const next = [current, ...stored.filter((i) => i.slug !== current.slug)].slice(0, MAX);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.slug]);

  if (items.length === 0) return null;

  return (
    <section className="mt-24">
      <h2 className="mb-8 text-2xl font-bold tracking-tight">Recently Viewed</h2>
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {items.map((p) => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="group flex flex-col">
            <div className="aspect-square overflow-hidden border border-line">
              <ProductImage
                imageKey={p.imageKey}
                name={p.name}
                className="h-full w-full transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              {p.category}
            </p>
            <h3 className="mt-1 text-sm font-semibold group-hover:underline">{p.name}</h3>
            {p.fromPrice > 0 && (
              <p className="mt-1 text-sm">from {formatPrice(p.fromPrice)}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
