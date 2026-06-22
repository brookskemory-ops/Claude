import "server-only";

const apiKey = process.env.EASYPOST_API_KEY;

export const shippingEnabled = Boolean(apiKey);

function fromAddress() {
  return {
    name: process.env.SHIP_FROM_NAME || "Axevia",
    street1: process.env.SHIP_FROM_STREET || "",
    city: process.env.SHIP_FROM_CITY || "",
    state: process.env.SHIP_FROM_STATE || "",
    zip: process.env.SHIP_FROM_ZIP || "",
    country: process.env.SHIP_FROM_COUNTRY || "US",
    phone: process.env.SHIP_FROM_PHONE || "0000000000",
  };
}

function auth() {
  return "Basic " + Buffer.from(`${apiKey}:`).toString("base64");
}

type ShipAddress = {
  recipient: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
};

export type LabelResult =
  | { ok: true; carrier: string; tracking: string; labelUrl: string }
  | { ok: false; error: string };

/**
 * Creates an EasyPost shipment to the order's address and buys the cheapest rate.
 * Uses a default parcel; returns tracking number and a label URL.
 */
export async function buyCheapestLabel(to: ShipAddress): Promise<LabelResult> {
  if (!apiKey) return { ok: false, error: "Shipping is not configured (no EasyPost key)." };
  try {
    const res = await fetch("https://api.easypost.com/v2/shipments", {
      method: "POST",
      headers: { Authorization: auth(), "Content-Type": "application/json" },
      body: JSON.stringify({
        shipment: {
          to_address: {
            name: to.recipient,
            street1: to.line1,
            street2: to.line2 || "",
            city: to.city,
            state: to.state,
            zip: to.zip,
            country: to.country === "United States" ? "US" : to.country,
            phone: to.phone || "0000000000",
          },
          from_address: fromAddress(),
          parcel: { length: 6, width: 4, height: 2, weight: 8 }, // default small parcel, 8 oz
        },
      }),
      cache: "no-store",
    });
    const shipment = await res.json();
    if (!res.ok || !shipment.rates?.length) {
      return { ok: false, error: shipment.error?.message || "No shipping rates returned." };
    }
    const cheapest = shipment.rates.reduce((a: any, b: any) =>
      parseFloat(a.rate) < parseFloat(b.rate) ? a : b,
    );
    const buyRes = await fetch(`https://api.easypost.com/v2/shipments/${shipment.id}/buy`, {
      method: "POST",
      headers: { Authorization: auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ rate: { id: cheapest.id } }),
      cache: "no-store",
    });
    const bought = await buyRes.json();
    if (!buyRes.ok || !bought.tracking_code) {
      return { ok: false, error: bought.error?.message || "Could not purchase label." };
    }
    return {
      ok: true,
      carrier: bought.selected_rate?.carrier || cheapest.carrier,
      tracking: bought.tracking_code,
      labelUrl: bought.postage_label?.label_url || "",
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Shipping request failed." };
  }
}
