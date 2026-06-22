import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { finalizeOrder } from "@/lib/orders";
import { authnetEnabled, findApprovedTransactionByInvoice } from "@/lib/authorizenet";

// Authorize.Net Accept Hosted redirects the customer here after payment.
// We finalize best-effort (the webhook is the reliable confirmation), then
// send them to the order confirmation page.
async function handle(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order");
  if (!orderId) return NextResponse.redirect(new URL("/", req.url));

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.redirect(new URL("/", req.url));

  if (authnetEnabled && order.status === "PENDING") {
    try {
      const match = await findApprovedTransactionByInvoice(order.number);
      if (match) await finalizeOrder(orderId, { provider: "authnet", ref: match.transId });
    } catch {
      // webhook will finalize if this best-effort lookup fails
    }
  }

  return NextResponse.redirect(new URL(`/order/${order.number}?confirmed=1`, req.url));
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
