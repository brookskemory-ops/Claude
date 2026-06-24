"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/lib/types";

export default function AddBundleButton({ items }: { items: CartItem[] }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function add() {
    for (const it of items) {
      const { quantity, ...rest } = it;
      addItem(rest, quantity);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button onClick={add} className="btn-primary">
        {added ? "Added to Cart ✓" : "Add Bundle to Cart"}
      </button>
      {added && (
        <Link href="/cart" className="btn-ghost">
          View Cart
        </Link>
      )}
    </div>
  );
}
