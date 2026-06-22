import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { finalizeOrder } from "@/lib/orders";
import { verifyWebhook, getTransactionInvoice } from "@/lib/authorizenet";

// Reliable payment confirmation from Authorize.Net. Configure a webhook in the
// Authorize.Net dashboard for "net.authorize.payment.authcapture.created" pointing
// at /api/authnet/webhook.
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("x-anet-signature"))) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (String(event?.eventType || "").includes("authcapture")) {
    const transId = event?.payload?.id;
    if (transId) {
      const info = await getTransactionInvoice(String(transId));
      if (info?.approved && info.invoiceNumber) {
        const order = await db.order.findUnique({ where: { number: info.invoiceNumber } });
        if (order) await finalizeOrder(order.id, { provider: "authnet", ref: String(transId) });
      }
    }
  }

  return new Response("ok");
}
