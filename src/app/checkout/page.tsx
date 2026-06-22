import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import CheckoutForm from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await getSession();
  let defaultEmail = "";
  let defaultAddress = null;

  if (session) {
    defaultEmail = session.email;
    const addr = await db.address.findFirst({
      where: { userId: session.sub },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
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
    />
  );
}
