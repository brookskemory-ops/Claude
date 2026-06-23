"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { effectivePrice, isOnSale, discountPercent } from "@/lib/pricing";
import { track } from "@/lib/gtag";
import { requestStockNotification } from "@/app/product/[slug]/stockActions";

export type PurchaseVariant = {
  id: string;
  label: string;
  sku: string;
  price: number;
  salePrice: number | null;
  saleEndsAt: string | null;
  stock: number;
};

export default function ProductPurchase({
  slug,
  name,
  imageKey,
  variants,
}: {
  slug: string;
  name: string;
  imageKey: string;
  variants: PurchaseVariant[];
}) {
  const { addItem } = useCart();
  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstInStock?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  if (!selected) return null;

  const price = effectivePrice(selected);
  const onSale = isOnSale(selected);
  const off = discountPercent(selected);
  const outOfStock = selected.stock <= 0;
  const lowStock = !outOfStock && selected.stock <= 10;

  function handleAdd() {
    if (outOfStock) return;
    addItem(
      {
        variantId: selected.id,
        slug,
        name,
        variantLabel: selected.label,
        sku: selected.sku,
        imageKey,
        unitPrice: price,
        maxStock: selected.stock,
      },
      qty,
    );
    track("add_to_cart", {
      currency: "USD",
      value: price * qty,
      items: [{ item_id: selected.sku, item_name: `${name} ${selected.label}`, quantity: qty }],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div>
      <div className="mb-6 flex items-baseline gap-3">
        <span className="text-3xl font-semibold">{formatPrice(price)}</span>
        {onSale && (
          <span className="text-base text-ink-muted line-through">
            {formatPrice(selected.price)}
          </span>
        )}
        {off != null && <span className="badge-accent">{off}% Off</span>}
      </div>

      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Size
      </div>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const vOut = v.stock <= 0;
          const active = v.id === selected.id;
          return (
            <button
              key={v.id}
              onClick={() => {
                setSelectedId(v.id);
                setQty(1);
              }}
              className={`border px-4 py-2 text-sm transition-colors ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line hover:border-ink"
              } ${vOut ? "opacity-50" : ""}`}
            >
              {v.label}
              {vOut && <span className="ml-1 text-[10px]">(out)</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-5 text-sm">
        {outOfStock ? (
          <span className="badge border border-ink text-ink">Out of Stock</span>
        ) : lowStock ? (
          <span className="text-ink-muted">Only {selected.stock} in stock</span>
        ) : (
          <span className="text-ink-muted">In stock · SKU {selected.sku}</span>
        )}
      </div>

      {outOfStock ? (
        <BackInStockForm key={selected.id} variantId={selected.id} />
      ) : (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
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
              onClick={() => setQty((q) => Math.min(selected.stock, q + 1))}
              className="flex h-12 w-12 items-center justify-center hover:bg-paper-muted disabled:opacity-30"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button onClick={handleAdd} className="btn-primary flex-1">
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
}

function BackInStockForm({ variantId }: { variantId: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError("");
    const res = await requestStockNotification(variantId, email);
    if (res.ok) {
      setState("done");
    } else {
      setError(res.error);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-6 border border-line bg-paper-soft px-4 py-3 text-sm text-ink-muted">
        Thanks — we&apos;ll email you when this size is back in stock.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Notify me when back in stock
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@institution.edu"
          className="flex-1 border border-line bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none"
        />
        <button type="submit" disabled={state === "saving"} className="btn-outline">
          {state === "saving" ? "Saving…" : "Notify Me"}
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-sm text-ink">{error}</p>}
    </form>
  );
}
