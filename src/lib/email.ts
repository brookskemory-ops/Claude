import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Axevia <support@axevia.co>";
const resend = apiKey ? new Resend(apiKey) : null;

type SendArgs = { to: string; subject: string; html: string; replyTo?: string };

/**
 * Sends an email via Resend. Returns true only when Resend accepts the send.
 * When RESEND_API_KEY is unset (dev/demo) it logs to the console and returns false
 * so callers that need to confirm delivery (e.g. the contact form) can report failure.
 * Fire-and-forget callers can simply ignore the return value.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<boolean> {
  if (!resend) {
    console.log(`\n[email:dev] To: ${to}\n[email:dev] Subject: ${subject}\n`);
    return false;
  }
  try {
    await resend.emails.send({ from, to, subject, html, replyTo });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

function layout(title: string, body: string): string {
  return `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0a0a0a">
    <div style="border-bottom:2px solid #0a0a0a;padding:16px 0;font-weight:700;letter-spacing:.28em;text-transform:uppercase">AXEVIA</div>
    <h1 style="font-size:20px;margin:24px 0 12px">${title}</h1>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#737373">Axevia — Research Use Only. Products are for laboratory research only and not for human or veterinary use.</p>
  </div>`;
}

export async function sendOrderConfirmation(args: {
  to: string;
  orderNumber: string;
  total: string;
  siteUrl: string;
}): Promise<void> {
  const body = `
    <p>Thank you for your order. We've received it and it's being processed.</p>
    <p style="font-size:15px"><strong>Order ${args.orderNumber}</strong> — ${args.total}</p>
    <p><a href="${args.siteUrl}/order/${args.orderNumber}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 20px;text-decoration:none;text-transform:uppercase;font-size:12px;letter-spacing:.14em">View Order</a></p>`;
  await sendEmail({
    to: args.to,
    subject: `Axevia order ${args.orderNumber} confirmed`,
    html: layout("Order confirmed", body),
  });
}

export async function sendPasswordReset(args: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  const body = `
    <p>We received a request to reset your Axevia password. This link expires in 1 hour.</p>
    <p><a href="${args.resetUrl}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 20px;text-decoration:none;text-transform:uppercase;font-size:12px;letter-spacing:.14em">Reset Password</a></p>
    <p style="font-size:13px;color:#737373">If you didn't request this, you can ignore this email.</p>`;
  await sendEmail({
    to: args.to,
    subject: "Reset your Axevia password",
    html: layout("Password reset", body),
  });
}

export async function sendShippingNotification(args: {
  to: string;
  orderNumber: string;
  carrier: string;
  tracking: string;
  siteUrl: string;
}): Promise<void> {
  const body = `
    <p>Good news — your order has shipped.</p>
    <p style="font-size:15px"><strong>Order ${args.orderNumber}</strong></p>
    <p>Carrier: ${args.carrier}<br/>Tracking: <strong>${args.tracking}</strong></p>
    <p><a href="${args.siteUrl}/order/${args.orderNumber}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 20px;text-decoration:none;text-transform:uppercase;font-size:12px;letter-spacing:.14em">View Order</a></p>`;
  await sendEmail({
    to: args.to,
    subject: `Your Axevia order ${args.orderNumber} has shipped`,
    html: layout("Order shipped", body),
  });
}

export async function sendLowStockAlert(args: {
  to: string;
  items: { name: string; label: string; stock: number }[];
}): Promise<void> {
  const rows = args.items
    .map((i) => `<li>${i.name} — ${i.label}: <strong>${i.stock} left</strong></li>`)
    .join("");
  await sendEmail({
    to: args.to,
    subject: "Axevia low-stock alert",
    html: layout("Low stock", `<p>The following variants are at or below their threshold:</p><ul>${rows}</ul>`),
  });
}

export async function sendAbandonedCart(args: {
  to: string;
  siteUrl: string;
}): Promise<void> {
  const body = `
    <p>You left some items in your cart. They're still here when you're ready.</p>
    <p><a href="${args.siteUrl}/cart" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 20px;text-decoration:none;text-transform:uppercase;font-size:12px;letter-spacing:.14em">Return to Cart</a></p>
    <p style="font-size:13px;color:#737373">Research Use Only — not for human or veterinary use.</p>`;
  await sendEmail({
    to: args.to,
    subject: "You left items in your Axevia cart",
    html: layout("Still interested?", body),
  });
}

export async function sendReferralReward(args: {
  to: string;
  code: string;
  siteUrl: string;
}): Promise<void> {
  const body = `
    <p>Great news — someone you referred just placed their first order. Here&apos;s your reward:</p>
    <p style="font-size:18px"><strong>${args.code}</strong> — apply it at checkout.</p>
    <p><a href="${args.siteUrl}/shop" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 20px;text-decoration:none;text-transform:uppercase;font-size:12px;letter-spacing:.14em">Shop Now</a></p>`;
  await sendEmail({
    to: args.to,
    subject: "You earned an Axevia referral reward",
    html: layout("Referral reward", body),
  });
}

export async function sendContactMessage(args: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = `
    <p><strong>From:</strong> ${esc(args.name)} &lt;${esc(args.email)}&gt;</p>
    <p><strong>Subject:</strong> ${esc(args.subject)}</p>
    <p style="white-space:pre-wrap;border-left:2px solid #0a0a0a;padding-left:12px;margin-top:16px">${esc(args.message)}</p>`;
  return sendEmail({
    to: process.env.CONTACT_INBOX || "support@axevia.co",
    replyTo: args.email,
    subject: `Contact form: ${args.subject || "(no subject)"}`,
    html: layout("New contact message", body),
  });
}

export async function sendBackInStock(args: {
  to: string;
  productName: string;
  variantLabel: string;
  slug: string;
  siteUrl: string;
}): Promise<void> {
  const body = `
    <p><strong>${args.productName} (${args.variantLabel})</strong> is back in stock.</p>
    <p><a href="${args.siteUrl}/product/${args.slug}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 20px;text-decoration:none;text-transform:uppercase;font-size:12px;letter-spacing:.14em">View Product</a></p>
    <p style="font-size:13px;color:#737373">Research Use Only — not for human or veterinary use.</p>`;
  await sendEmail({
    to: args.to,
    subject: `Back in stock: ${args.productName}`,
    html: layout("Back in stock", body),
  });
}

export async function sendPresaleWelcome(args: {
  to: string;
  code: string;
  siteUrl: string;
}): Promise<boolean> {
  const body = `
    <p>Your email is verified and your pre-sale account is all set. We'll email you the moment our research-peptide catalog goes live and stock is in.</p>
    <p>Here's your bonus: sign in with <strong>this account</strong> at checkout and use the code below for an <strong>extra 5% off</strong> — on top of the automatic 10% launch discount (<strong>15% total</strong>).</p>
    <p style="font-size:22px;font-weight:700;letter-spacing:.18em;border:2px solid #0a0a0a;padding:14px 0;text-align:center;margin:20px 0">${args.code}</p>
    <p style="font-size:13px;color:#737373">This code is one-time use and tied to your account, so keep it to yourself. Research Use Only — not for human or veterinary use. You're receiving this because you signed up at ${args.siteUrl}.</p>`;
  return sendEmail({
    to: args.to,
    subject: "Your Axevia pre-sale code is here",
    html: layout("You're all set", body),
  });
}

export async function sendPresaleSignupNotice(args: {
  subscriberEmail: string;
  name: string;
  code: string;
  siteUrl: string;
}): Promise<boolean> {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = `
    <p>A new pre-sale member just verified their email.</p>
    <p style="font-size:15px"><strong>${esc(args.name)}</strong><br/>${esc(args.subscriberEmail)}</p>
    <p>One-time code issued: <strong>${args.code}</strong> (5% off, locked to their account).</p>`;
  return sendEmail({
    to: process.env.CONTACT_INBOX || "support@axevia.co",
    subject: `New pre-sale signup: ${args.subscriberEmail}`,
    html: layout("New pre-sale signup", body),
  });
}

export async function sendSuggestionNotice(args: {
  peptide: string;
  email: string;
}): Promise<boolean> {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = `
    <p>A visitor suggested a peptide they'd like to see in the catalog:</p>
    <p style="font-size:16px;font-weight:700">${esc(args.peptide)}</p>
    ${args.email ? `<p style="font-size:13px;color:#737373">From: ${esc(args.email)}</p>` : ""}`;
  return sendEmail({
    to: process.env.CONTACT_INBOX || "support@axevia.co",
    replyTo: args.email || undefined,
    subject: `Peptide suggestion: ${args.peptide}`,
    html: layout("New peptide suggestion", body),
  });
}

export async function sendVerification(args: {
  to: string;
  verifyUrl: string;
}): Promise<void> {
  const body = `
    <p>Welcome to Axevia. Please confirm your email address to finish setting up your account.</p>
    <p><a href="${args.verifyUrl}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 20px;text-decoration:none;text-transform:uppercase;font-size:12px;letter-spacing:.14em">Verify Email</a></p>`;
  await sendEmail({
    to: args.to,
    subject: "Verify your Axevia email",
    html: layout("Verify your email", body),
  });
}
