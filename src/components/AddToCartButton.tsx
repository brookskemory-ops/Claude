"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/lib/types";

export default function AddToCartButton({
  item,
  outOfStock,
  withQuantity = false,
  className = "btn-primary",
  label = "Add to Cart",
}: {
  item: Omit<CartItem, "quantity">;
  outOfStock: boolean;
  withQuantity?: boolean;
  className?: string;
  label?: string;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (outOfStock) {
    return (
      <button className={className} disabled>
        Out of Stock
      </button>
    );
  }

  return (
    <div className={withQuantity ? "flex flex-col gap-4 sm:flex-row sm:items-center" : ""}>
      {withQuantity && (
        <div className="flex items-center border border-line">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-12 w-12 items-center justify-center hover:bg-paper-muted"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(item.maxStock, q + 1))}
            className="flex h-12 w-12 items-center justify-center hover:bg-paper-muted"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}
      <button onClick={handleAdd} className={`${className} ${withQuantity ? "flex-1" : ""}`}>
        {added ? "Added ✓" : label}
      </button>
    </div>
  );
}
