"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalButton({
  clientId,
  ensureOrder,
  onComplete,
  onError,
}: {
  clientId: string;
  ensureOrder: () => Promise<string | null>;
  onComplete: (orderNumber: string) => void;
  onError: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orderIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    function render() {
      if (!window.paypal || !containerRef.current || renderedRef.current) return;
      renderedRef.current = true;
      window.paypal
        .Buttons({
          style: { color: "black", shape: "rect", label: "pay", height: 48 },
          createOrder: async () => {
            const orderId = await ensureOrder();
            if (!orderId) throw new Error("Could not create order");
            orderIdRef.current = orderId;
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "PayPal error");
            return data.id;
          },
          onApprove: async (data: { orderID: string }) => {
            const res = await fetch("/api/paypal/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderIdRef.current,
                paypalOrderId: data.orderID,
              }),
            });
            const out = await res.json();
            if (out.ok) onComplete(out.number);
            else onError(out.error || "Payment failed");
          },
          onError: () => onError("PayPal encountered an error."),
        })
        .render(containerRef.current);
    }

    if (window.paypal) {
      render();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-paypal]");
    if (existing) {
      existing.addEventListener("load", render);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.dataset.paypal = "true";
    script.onload = render;
    document.body.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return <div ref={containerRef} />;
}
