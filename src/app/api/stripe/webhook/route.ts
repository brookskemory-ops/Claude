import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { finalizeOrder } from "@/lib/orders";

export async function POST(req: NextRequest) {
  if (!stripe) return new Response("Stripe not configured", { status: 400 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    event =
      secret && sig
        ? stripe.webhooks.constructEvent(body, sig, secret)
        : (JSON.parse(body) as Stripe.Event);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await finalizeOrder(orderId, {
        provider: "stripe",
        ref: String(session.payment_intent ?? session.id),
      });
    }
  }

  return new Response("ok");
}
