import "server-only";

const id = process.env.PAYPAL_CLIENT_ID;
const secret = process.env.PAYPAL_CLIENT_SECRET;

export const paypalEnabled = Boolean(id && secret);

export function paypalBase(): string {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function paypalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("PayPal auth failed");
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function paypalRefund(captureId: string): Promise<boolean> {
  const token = await paypalAccessToken();
  const res = await fetch(`${paypalBase()}/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  return res.ok;
}
