import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { paypalAccessToken, paypalBase, paypalEnabled } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  if (!paypalEnabled) {
    return Response.json({ error: "PayPal not configured" }, { status: 400 });
  }
  const { orderId } = (await req.json()) as { orderId?: string };
  if (!orderId) return Response.json({ error: "Missing order" }, { status: 400 });

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PENDING") {
    return Response.json({ error: "Order not available" }, { status: 400 });
  }

  const token = await paypalAccessToken();
  const res = await fetch(`${paypalBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order.id,
          description: `Axevia Order ${order.number}`,
          amount: { currency_code: "USD", value: order.total.toFixed(2) },
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) return Response.json({ error: "PayPal create failed" }, { status: 400 });
  return Response.json({ id: data.id });
}
