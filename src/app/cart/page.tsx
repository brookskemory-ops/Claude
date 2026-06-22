"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING, shippingFor } from "@/lib/pricing";
import ProductImage from "@/components/ProductImage";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, isReady } = useCart();

  if (!isReady) {
    return <div className="container-site py-20 text-center text-ink-muted">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-site flex flex-col items-center py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Your cart is empty</h1>
        <p className="mt-3 text-ink-muted">Add a few products to get started.</p>
        <Link href="/shop" className="btn-primary mt-8">Browse Catalog</Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotal);
  const estTotal = subtotal + shipping;

  return (
    <div className="container-site py-12">
      <h1 className="mb-10 text-4xl font-bold tracking-tight">Shopping Cart</h1>

      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-5 py-6">
                <Link href={`/product/${item.slug}`} className="h-28 w-28 shrink-0 border border-line">
                  <ProductImage imageKey={item.imageKey} name={item.name} className="h-full w-full" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/product/${item.slug}`} className="font-semibold hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-sm text-ink-muted">{item.variantLabel} · SKU {item.sku}</p>
                    </div>
                    <span className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{formatPrice(item.unitPrice)} each</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center border border-line">
                      <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center hover:bg-paper-muted">
                        −
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="flex h-9 w-9 items-center justify-center hover:bg-paper-muted disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.variantId)} className="text-xs uppercase tracking-[0.14em] text-ink-muted hover:text-ink">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/shop" className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-ink">
            ← Continue Shopping
          </Link>
        </div>

        <aside className="h-fit border border-line p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Order Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-ink-muted">
                Spend {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                (otherwise {formatPrice(FLAT_SHIPPING)}).
              </p>
            )}
          </dl>
          <div className="mt-5 flex justify-between border-t border-line pt-5 text-base font-semibold">
            <span>Estimated Total</span>
            <span>{formatPrice(estTotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">Tax calculated at checkout.</p>
          <Link href="/checkout" className="btn-primary mt-6 w-full">Proceed to Checkout</Link>
        </aside>
      </div>
    </div>
  );
}
