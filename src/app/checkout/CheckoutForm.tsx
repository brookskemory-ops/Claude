"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { shippingFor, round2 } from "@/lib/pricing";
import {
  submitOrder,
  payWithStripe,
  payWithAuthorizeNet,
  finalizeSimulated,
  validateCoupon,
  quoteTax,
  saveAbandonedCart,
} from "./actions";
import PayPalButton from "@/components/PayPalButton";

function postRedirect(url: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  for (const [k, v] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = v;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

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

const STEPS = ["Shipping", "Payment", "Review"] as const;

export default function CheckoutForm({
  loggedIn,
  defaultEmail,
  defaultAddress,
  pointsBalance,
  launchDiscountPercent,
  stripeEnabled,
  paypalEnabled,
  authnetEnabled,
  paypalClientId,
}: {
  loggedIn: boolean;
  defaultEmail: string;
  defaultAddress: Address | null;
  pointsBalance: number;
  launchDiscountPercent: number;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  authnetEnabled: boolean;
  paypalClientId: string;
}) {
  const router = useRouter();
  const { items, subtotal, clear, isReady } = useCart();

  const methods = useMemo(() => {
    const m: string[] = [];
    if (authnetEnabled) m.push("authnet");
    if (stripeEnabled) m.push("card");
    if (paypalEnabled) m.push("paypal");
    if (m.length === 0) m.push("simulated");
    return m;
  }, [stripeEnabled, paypalEnabled, authnetEnabled]);

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState(defaultEmail);
  const [shipping, setShipping] = useState<Address>(defaultAddress ?? EMPTY);
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState<Address>(EMPTY);
  const [saveAddress, setSaveAddress] = useState(false);
  const [method, setMethod] = useState(methods[0]);
  const [ruoAck, setRuoAck] = useState(false);
  const [tax, setTax] = useState(0);

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const orderIdRef = useRef<string | null>(null);

  const [redeemBlocks, setRedeemBlocks] = useState(0);

  const couponDiscount = coupon?.discount ?? 0;
  const launchDiscount = round2((subtotal * launchDiscountPercent) / 100);
  const prePointsDiscount = round2(Math.min(couponDiscount + launchDiscount, subtotal));
  const availableBlocks = Math.floor(pointsBalance / 100);
  const maxBlocksByOrder = Math.max(0, Math.floor(round2(subtotal - prePointsDiscount) / 5));
  const maxBlocks = Math.min(availableBlocks, maxBlocksByOrder);
  const effectiveBlocks = Math.min(redeemBlocks, maxBlocks);
  const pointsDiscount = effectiveBlocks * 5;
  const redeemPoints = effectiveBlocks * 100;

  const discount = round2(prePointsDiscount + pointsDiscount);
  const discounted = Math.max(0, round2(subtotal - discount));
  const shipCost = shippingFor(discounted);
  const total = round2(discounted + shipCost + tax);
  const billingAddress = billingSame ? shipping : billing;

  // Quote sales tax from the shipping state (server-authoritative; recomputed at order time).
  useEffect(() => {
    const st = shipping.state.trim();
    if (st.length < 2) {
      setTax(0);
      return;
    }
    let active = true;
    quoteTax(st, discounted).then((r) => {
      if (active) setTax(r.tax);
    });
    return () => {
      active = false;
    };
  }, [shipping.state, discounted]);

  const canContinueShipping = email && requiredFilled(shipping);
  const canContinuePayment = billingSame || requiredFilled(billing);

  if (isReady && items.length === 0) {
    return (
      <div className="container-site flex flex-col items-center py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary mt-8">Browse Catalog</Link>
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

  // Creates the pending order once; returns its id (cached for PayPal retries).
  async function ensureOrder(): Promise<string | null> {
    if (orderIdRef.current) return orderIdRef.current;
    const res = await submitOrder({
      email,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, bundleId: i.bundleId })),
      shipping,
      billing: billingAddress,
      couponCode: coupon?.code ?? "",
      ruoAcknowledged: ruoAck,
      saveAddress: loggedIn && saveAddress,
      pointsToRedeem: redeemPoints,
    });
    if (!res.ok) {
      setError(res.error);
      return null;
    }
    orderIdRef.current = res.orderId;
    return res.orderId;
  }

  async function placeOrder() {
    setError("");
    if (!ruoAck) {
      setError("Please confirm the Research-Use-Only acknowledgment.");
      return;
    }
    setSubmitting(true);
    const orderId = await ensureOrder();
    if (!orderId) {
      setSubmitting(false);
      return;
    }
    if (method === "card") {
      const res = await payWithStripe(orderId);
      if (res.ok) {
        window.location.href = res.url;
        return;
      }
      setError(res.error);
      setSubmitting(false);
    } else if (method === "authnet") {
      const res = await payWithAuthorizeNet(orderId);
      if (res.ok) {
        postRedirect(res.url, { token: res.token });
        return;
      }
      setError(res.error);
      setSubmitting(false);
    } else {
      const res = await finalizeSimulated(orderId);
      if (res.ok) {
        clear();
        router.push(`/order/${res.number}?confirmed=1`);
      } else {
        setError(res.error);
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="container-site py-12">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="mt-8 flex flex-wrap items-center gap-y-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= step ? "bg-ink text-paper" : "bg-paper-muted text-ink-muted"}`}>
              {i + 1}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${i <= step ? "text-ink" : "text-ink-muted"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-2 h-px w-8 bg-line" />}
          </div>
        ))}
      </div>

      {error && <p className="mt-6 rounded-lg border border-ink bg-paper-muted px-4 py-3 text-sm">{error}</p>}

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">Contact</h2>
              <div className="mb-8">
                <label className="label">Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="lab@institution.edu" />
              </div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">Shipping Address</h2>
              <AddressFields value={shipping} onChange={setShipping} />
              {loggedIn && (
                <label className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                  Save this address to my account
                </label>
              )}
              <div className="mt-8 flex justify-end">
                <button
                  className="btn-primary"
                  disabled={!canContinueShipping}
                  onClick={() => {
                    saveAbandonedCart(
                      email,
                      items.map((i) => ({
                        name: i.name,
                        variantLabel: i.variantLabel,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                      })),
                      total,
                    );
                    setStep(1);
                  }}
                >
                  Continue to Payment
                </button>
              </div>
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">Payment Method</h2>
              <div className="space-y-2">
                {methods.includes("authnet") && (
                  <MethodRow id="authnet" method={method} setMethod={setMethod} title="Credit / Debit Card" note="Securely processed on Authorize.Net's hosted page." />
                )}
                {methods.includes("card") && (
                  <MethodRow id="card" method={method} setMethod={setMethod} title="Credit / Debit Card (incl. Google Pay)" note="Securely processed by Stripe." />
                )}
                {methods.includes("paypal") && (
                  <MethodRow id="paypal" method={method} setMethod={setMethod} title="PayPal" note="Pay with your PayPal account." />
                )}
                {methods.includes("simulated") && (
                  <MethodRow id="simulated" method={method} setMethod={setMethod} title="Simulated Checkout (Demo)" note="No payment processor configured — no real charge is made." />
                )}
              </div>

              <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-[0.18em]">Billing Address</h2>
              <label className="mb-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} />
                Same as shipping address
              </label>
              {!billingSame && <AddressFields value={billing} onChange={setBilling} />}

              <div className="mt-8 flex justify-between">
                <button className="btn-ghost" onClick={() => setStep(0)}>← Back</button>
                <button className="btn-primary" disabled={!canContinuePayment} onClick={() => setStep(2)}>
                  Review Order
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-8">
              <ReviewBlock title="Contact" onEdit={() => setStep(0)}>{email}</ReviewBlock>
              <ReviewBlock title="Shipping To" onEdit={() => setStep(0)}><AddressSummary address={shipping} /></ReviewBlock>
              <ReviewBlock title="Payment" onEdit={() => setStep(1)}>{methodLabel(method)}</ReviewBlock>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Items</h3>
                <ul className="divide-y divide-line border-y border-line">
                  {items.map((i) => (
                    <li key={i.variantId} className="flex justify-between py-3 text-sm">
                      <span>{i.name} · {i.variantLabel} × {i.quantity}</span>
                      <span>{formatPrice(i.unitPrice * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-ink bg-paper-muted p-4 text-sm">
                <input type="checkbox" className="mt-0.5" checked={ruoAck} onChange={(e) => setRuoAck(e.target.checked)} />
                <span>
                  I confirm I am a qualified researcher (21+) and that these products are purchased
                  strictly for <strong>laboratory research use only</strong> — not for human or
                  veterinary use. I agree to the{" "}
                  <Link href="/research-use-policy" target="_blank" className="underline">Research-Use Policy</Link>.
                </span>
              </label>

              <div className="flex items-center justify-between gap-4">
                <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
                {method === "paypal" ? (
                  <div className="w-64">
                    {ruoAck ? (
                      <PayPalButton
                        clientId={paypalClientId}
                        ensureOrder={ensureOrder}
                        onComplete={(number) => { clear(); router.push(`/order/${number}?confirmed=1`); }}
                        onError={(m) => setError(m)}
                      />
                    ) : (
                      <p className="text-right text-xs text-ink-muted">Confirm the acknowledgment to pay.</p>
                    )}
                  </div>
                ) : (
                  <button className="btn-primary" disabled={submitting || !ruoAck} onClick={placeOrder}>
                    {submitting ? "Processing…" : `Place Order · ${formatPrice(total)}`}
                  </button>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-line p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Order Summary</h2>
          <ul className="mt-5 space-y-3">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between text-sm">
                <span className="text-ink-muted">{i.name} · {i.variantLabel} × {i.quantity}</span>
                <span>{formatPrice(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-line pt-5">
            <label className="label">Discount Code</label>
            <div className="flex gap-2">
              <input className="input" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="WELCOME10" />
              <button className="btn-outline btn-sm shrink-0" onClick={applyCoupon} type="button">Apply</button>
            </div>
            {couponMsg && <p className="mt-2 text-xs text-ink-muted">{couponMsg}</p>}
          </div>

          {loggedIn && pointsBalance >= 100 && (
            <div className="mt-5 border-t border-line pt-5">
              <label className="label">Loyalty Points</label>
              <p className="text-xs text-ink-muted">
                Balance: {pointsBalance.toLocaleString()} · 100 pts = $5 off
              </p>
              {maxBlocks > 0 ? (
                <select
                  className="input mt-2"
                  value={effectiveBlocks}
                  onChange={(e) => setRedeemBlocks(Number(e.target.value))}
                >
                  {Array.from({ length: maxBlocks + 1 }).map((_, n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "Don't use points" : `Redeem ${n * 100} pts (−${formatPrice(n * 5)})`}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 text-xs text-ink-muted">
                  Add more to your cart to redeem points.
                </p>
              )}
            </div>
          )}

          <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {launchDiscount > 0 && <Row label={`Launch discount (${launchDiscountPercent}%)`} value={`−${formatPrice(launchDiscount)}`} />}
            {couponDiscount > 0 && <Row label={`Discount (${coupon?.code})`} value={`−${formatPrice(couponDiscount)}`} />}
            {pointsDiscount > 0 && <Row label={`Points (${redeemPoints})`} value={`−${formatPrice(pointsDiscount)}`} />}
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

function methodLabel(m: string): string {
  if (m === "authnet") return "Credit / Debit Card";
  if (m === "card") return "Credit / Debit Card (Stripe)";
  if (m === "paypal") return "PayPal";
  return "Simulated Checkout (Demo)";
}

function MethodRow({
  id,
  method,
  setMethod,
  title,
  note,
}: {
  id: string;
  method: string;
  setMethod: (m: string) => void;
  title: string;
  note: string;
}) {
  const active = method === id;
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${active ? "border-ink bg-paper-muted" : "border-line hover:border-ink/40"}`}>
      <input type="radio" name="method" checked={active} onChange={() => setMethod(id)} className="mt-1" />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-ink-muted">{note}</span>
      </span>
    </label>
  );
}

function requiredFilled(a: Address): boolean {
  return Boolean(a.recipient && a.line1 && a.city && a.state && a.zip);
}

function AddressFields({ value, onChange }: { value: Address; onChange: (a: Address) => void }) {
  function set(key: keyof Address, v: string) {
    onChange({ ...value, [key]: v });
  }
  return (
    <div className="space-y-4">
      <div>
        <label className="label">Recipient / Lab Name</label>
        <input className="input" value={value.recipient} onChange={(e) => set("recipient", e.target.value)} />
      </div>
      <div>
        <label className="label">Address</label>
        <input className="input" value={value.line1} onChange={(e) => set("line1", e.target.value)} />
      </div>
      <div>
        <label className="label">Suite / Unit (optional)</label>
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
      <p>{address.city}, {address.state} {address.zip}</p>
      <p>{address.country}</p>
    </div>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{title}</h3>
        <button onClick={onEdit} className="text-xs text-ink-muted underline hover:text-ink">Edit</button>
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
