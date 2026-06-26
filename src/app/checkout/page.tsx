import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripeEnabled } from "@/lib/stripe";
import { paypalEnabled } from "@/lib/paypal";
import { authnetEnabled } from "@/lib/authorizenet";
import { getSiteConfig } from "@/lib/config";
import CheckoutForm from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await getSession();
  let defaultEmail = "";
  let defaultAddress = null;
  let pointsBalance = 0;
  const { launchDiscountPercent } = await getSiteConfig();

  if (session) {
    defaultEmail = session.email;
    const [addr, user] = await Promise.all([
      db.address.findFirst({
        where: { userId: session.sub },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
      db.user.findUnique({ where: { id: session.sub }, select: { points: true } }),
    ]);
    pointsBalance = user?.points ?? 0;
    if (addr) {
      defaultAddress = {
        recipient: addr.recipient,
        line1: addr.line1,
        line2: addr.line2 ?? "",
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
        country: addr.country,
        phone: addr.phone ?? "",
      };
    }
  }

  return (
    <CheckoutForm
      loggedIn={!!session}
      defaultEmail={defaultEmail}
      defaultAddress={defaultAddress}
      pointsBalance={pointsBalance}
      launchDiscountPercent={launchDiscountPercent}
      stripeEnabled={stripeEnabled}
      paypalEnabled={paypalEnabled}
      authnetEnabled={authnetEnabled}
      paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""}
    />
  );
}
