import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { finalizeOrder } from "@/lib/orders";

// Stripe success_url lands here. Verifies the session was paid, finalizes the order
// (idempotent — the webhook does the same), then redirects to the confirmation page.
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order");
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!orderId) return NextResponse.redirect(new URL("/", req.url));

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.redirect(new URL("/", req.url));

  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        await finalizeOrder(orderId, {
          provider: "stripe",
          ref: String(session.payment_intent ?? sessionId),
        });
      }
    } catch {
      // fall through; webhook will finalize if this fails
    }
  }

  return NextResponse.redirect(new URL(`/order/${order.number}?confirmed=1`, req.url));
}
