import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { paypalAccessToken, paypalBase, paypalEnabled } from "@/lib/paypal";
import { finalizeOrder } from "@/lib/orders";

export async function POST(req: NextRequest) {
  if (!paypalEnabled) {
    return Response.json({ error: "PayPal not configured" }, { status: 400 });
  }
  const { orderId, paypalOrderId } = (await req.json()) as {
    orderId?: string;
    paypalOrderId?: string;
  };
  if (!orderId || !paypalOrderId) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  const token = await paypalAccessToken();
  const res = await fetch(`${paypalBase()}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (data.status !== "COMPLETED") {
    return Response.json({ ok: false, error: "Payment not completed" }, { status: 400 });
  }

  // Store the capture id (needed to issue refunds later), falling back to the order id.
  const captureId =
    data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? data.id;
  const fin = await finalizeOrder(orderId, { provider: "paypal", ref: captureId });
  if (!fin.ok) return Response.json({ ok: false, error: fin.error }, { status: 400 });

  return Response.json({ ok: true, number: fin.number });
}
