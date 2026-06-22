"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { shippingFor, TAX_RATE, round2 } from "@/lib/pricing";
import { placeOrder, validateCoupon } from "./actions";

type Address = {
  recipient: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
};

const EMPTY: Address = {
  recipient: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  phone: "",
};

const STEPS = ["Shipping", "Billing", "Review"] as const;

export default function CheckoutForm({
  loggedIn,
  defaultEmail,
  defaultAddress,
}: {
  loggedIn: boolean;
  defaultEmail: string;
  defaultAddress: Address | null;
}) {
  const router = useRouter();
  const { items, subtotal, clear, isReady } = useCart();

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState(defaultEmail);
  const [shipping, setShipping] = useState<Address>(defaultAddress ?? EMPTY);
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState<Address>(EMPTY);
  const [saveAddress, setSaveAddress] = useState(false);
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const discount = coupon?.discount ?? 0;
  const discounted = Math.max(0, round2(subtotal - discount));
  const shipCost = shippingFor(discounted);
  const tax = round2(discounted * TAX_RATE);
  const total = round2(discounted + shipCost + tax);

  const billingAddress = billingSame ? shipping : billing;

  const canContinueShipping = useMemo(
    () => email && requiredFilled(shipping),
    [email, shipping],
  );
  const canContinueBilling = useMemo(
    () =>
      (billingSame || requiredFilled(billing)) &&
      card.number.length >= 12 &&
      card.exp &&
      card.cvc.length >= 3,
    [billingSame, billing, card],
  );

  if (isReady && items.length === 0) {
    return (
      <div className="container-site flex flex-col items-center py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary mt-8">
          Shop Products
        </Link>
      </div>
    );
  }

  async function applyCoupon() {
    setCouponMsg("");
    if (!couponInput.trim()) return;
    const res = await validateCoupon(couponInput, subtotal);
    if (res.ok) {
      setCoupon({ code: res.code, discount: res.discount });
      setCouponMsg(res.message);
    } else {
      setCoupon(null);
      setCouponMsg(res.message);
    }
  }

  async function submit() {
    setError("");
    setSubmitting(true);
    const res = await placeOrder({
      email,
      items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      shipping,
      billing: billingAddress,
      couponCode: coupon?.code ?? "",
      saveAddress: loggedIn && saveAddress,
    });
    if (res.ok) {
      clear();
      router.push(`/order/${res.orderNumber}?confirmed=1`);
    } else {
      setError(res.error);
      setSubmitting(false);
      setStep(0);
    }
  }

  return (
    <div className="container-site py-12">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

      {/* Steps */}
      <div className="mt-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center text-xs font-bold ${
                i <= step ? "bg-ink text-paper" : "bg-paper-muted text-ink-muted"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                i <= step ? "text-ink" : "text-ink-muted"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-2 h-px w-8 bg-line" />}
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-6 border border-ink bg-paper-muted px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
                Contact
              </h2>
              <div className="mb-8">
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
                Shipping Address
              </h2>
              <AddressFields value={shipping} onChange={setShipping} />
              {loggedIn && (
                <label className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                  />
                  Save this address to my account
                </label>
              )}
              <div className="mt-8 flex justify-end">
                <button
                  className="btn-primary"
                  disabled={!canContinueShipping}
                  onClick={() => setStep(1)}
                >
                  Continue to Billing
                </button>
              </div>
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
                Payment
              </h2>
              <p className="mb-4 bg-paper-muted px-4 py-2 text-xs text-ink-muted">
                Demo checkout — no real card is charged. Any test values work.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="label">Card Number</label>
                  <input
                    className="input"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={(e) =>
                      setCard({ ...card, number: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Expiry</label>
                    <input
                      className="input"
                      placeholder="MM/YY"
                      value={card.exp}
                      onChange={(e) => setCard({ ...card, exp: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">CVC</label>
                    <input
                      className="input"
                      placeholder="123"
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-[0.18em]">
                Billing Address
              </h2>
              <label className="mb-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={billingSame}
                  onChange={(e) => setBillingSame(e.target.checked)}
                />
                Same as shipping address
              </label>
              {!billingSame && (
                <AddressFields value={billing} onChange={setBilling} />
              )}

              <div className="mt-8 flex justify-between">
                <button className="btn-ghost" onClick={() => setStep(0)}>
                  ← Back
                </button>
                <button
                  className="btn-primary"
                  disabled={!canContinueBilling}
                  onClick={() => setStep(2)}
                >
                  Review Order
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-8">
              <ReviewBlock title="Contact" onEdit={() => setStep(0)}>
                {email}
              </ReviewBlock>
              <ReviewBlock title="Shipping To" onEdit={() => setStep(0)}>
                <AddressSummary address={shipping} />
              </ReviewBlock>
              <ReviewBlock title="Billing" onEdit={() => setStep(1)}>
                <AddressSummary address={billingAddress} />
                <p className="mt-1">
                  Card ending •••• {card.number.replace(/\s/g, "").slice(-4) || "0000"}
                </p>
              </ReviewBlock>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Items
                </h3>
                <ul className="divide-y divide-line border-y border-line">
                  {items.map((i) => (
                    <li key={i.slug} className="flex justify-between py-3 text-sm">
                      <span>
                        {i.name} × {i.quantity}
                      </span>
                      <span>{formatPrice(i.unitPrice * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between">
                <button className="btn-ghost" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button
                  className="btn-primary"
                  disabled={submitting}
                  onClick={submit}
                >
                  {submitting ? "Placing Order…" : `Place Order · ${formatPrice(total)}`}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Summary */}
        <aside className="h-fit border border-line p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
            Order Summary
          </h2>
          <ul className="mt-5 space-y-3">
            {items.map((i) => (
              <li key={i.slug} className="flex justify-between text-sm">
                <span className="text-ink-muted">
                  {i.name} × {i.quantity}
                </span>
                <span>{formatPrice(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-line pt-5">
            <label className="label">Discount Code</label>
            <div className="flex gap-2">
              <input
                className="input"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="WELCOME10"
              />
              <button className="btn-outline btn-sm shrink-0" onClick={applyCoupon}>
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className="mt-2 text-xs text-ink-muted">{couponMsg}</p>
            )}
          </div>

          <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {discount > 0 && (
              <Row label={`Discount (${coupon?.code})`} value={`−${formatPrice(discount)}`} />
            )}
            <Row label="Shipping" value={shipCost === 0 ? "Free" : formatPrice(shipCost)} />
            <Row label="Tax" value={formatPrice(tax)} />
          </dl>
          <div className="mt-5 flex justify-between border-t border-line pt-5 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function requiredFilled(a: Address): boolean {
  return Boolean(a.recipient && a.line1 && a.city && a.state && a.zip);
}

function AddressFields({
  value,
  onChange,
}: {
  value: Address;
  onChange: (a: Address) => void;
}) {
  function set(key: keyof Address, v: string) {
    onChange({ ...value, [key]: v });
  }
  return (
    <div className="space-y-4">
      <div>
        <label className="label">Full Name</label>
        <input className="input" value={value.recipient} onChange={(e) => set("recipient", e.target.value)} />
      </div>
      <div>
        <label className="label">Address</label>
        <input className="input" value={value.line1} onChange={(e) => set("line1", e.target.value)} />
      </div>
      <div>
        <label className="label">Apt / Suite (optional)</label>
        <input className="input" value={value.line2} onChange={(e) => set("line2", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">City</label>
          <input className="input" value={value.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label className="label">State</label>
          <input className="input" value={value.state} onChange={(e) => set("state", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">ZIP</label>
          <input className="input" value={value.zip} onChange={(e) => set("zip", e.target.value)} />
        </div>
        <div>
          <label className="label">Country</label>
          <input className="input" value={value.country} onChange={(e) => set("country", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Phone (optional)</label>
        <input className="input" value={value.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
    </div>
  );
}

function AddressSummary({ address }: { address: Address }) {
  return (
    <div className="text-sm leading-relaxed">
      <p>{address.recipient}</p>
      <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
      <p>
        {address.city}, {address.state} {address.zip}
      </p>
      <p>{address.country}</p>
    </div>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {title}
        </h3>
        <button onClick={onEdit} className="text-xs text-ink-muted underline hover:text-ink">
          Edit
        </button>
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
