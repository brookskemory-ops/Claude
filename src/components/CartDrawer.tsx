"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import {
  FREE_SHIPPING_THRESHOLD,
  freeShippingProgress,
  unitPriceForQty,
  quantityBreakPercent,
} from "@/lib/pricing";
import ProductImage from "@/components/ProductImage";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = freeShippingProgress(subtotal);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Your Cart</h2>
          <button onClick={onClose} aria-label="Close cart" className="text-ink-muted hover:text-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-ink-muted">Your cart is empty.</p>
            <Link href="/shop" onClick={onClose} className="btn-outline btn-sm">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-4">
                <p className={`px-3 py-2 text-center text-xs ${remaining > 0 ? "bg-paper-muted text-ink-muted" : "bg-ink text-paper"}`}>
                  {remaining > 0
                    ? `Add ${formatPrice(remaining)} more for free shipping.`
                    : "You've unlocked free shipping."}
                </p>
                <div className="mt-2 h-1 w-full bg-line">
                  <div
                    className="h-1 bg-ink transition-all duration-300"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              </div>
              <ul className="divide-y divide-line">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-4 py-4">
                    <div className="h-20 w-20 shrink-0 border border-line">
                      <ProductImage imageKey={item.imageKey} name={item.name} className="h-full w-full" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <div>
                          <Link href={`/product/${item.slug}`} onClick={onClose} className="text-sm font-medium hover:underline">
                            {item.name}
                          </Link>
                          <p className="text-xs text-ink-muted">{item.variantLabel}</p>
                          {item.bundleName && (
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                              {item.bundleName} bundle
                            </p>
                          )}
                        </div>
                        <button onClick={() => removeItem(item.variantId)} className="text-xs text-ink-muted hover:text-ink">
                          Remove
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">
                        {item.bundleId ? (
                          formatPrice(item.unitPrice)
                        ) : (
                          <>
                            {formatPrice(unitPriceForQty(item.unitPrice, item.quantity))}
                            {quantityBreakPercent(item.quantity) > 0 && (
                              <span className="ml-1 text-ink">(−{quantityBreakPercent(item.quantity)}%)</span>
                            )}
                          </>
                        )}
                      </p>
                      <div className="mt-auto flex items-center gap-2 pt-2">
                        <QtyButton onClick={() => updateQuantity(item.variantId, item.quantity - 1)} label="−" />
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <QtyButton
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          label="+"
                          disabled={item.quantity >= item.maxStock}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line px-6 py-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="uppercase tracking-[0.14em] text-ink-muted">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/checkout" onClick={onClose} className="btn-primary w-full">
                  Checkout
                </Link>
                <Link href="/cart" onClick={onClose} className="btn-ghost w-full">
                  View Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function QtyButton({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center border border-line text-sm hover:border-ink disabled:opacity-30"
    >
      {label}
    </button>
  );
}
