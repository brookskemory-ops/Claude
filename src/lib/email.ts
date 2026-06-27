import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Axevia <support@axevia.co>";
const resend = apiKey ? new Resend(apiKey) : null;

const SUPPORT_EMAIL = "support@axevia.co";

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

/** Escapes user-supplied text for safe interpolation into HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FONT = "Helvetica, Arial, 'Helvetica Neue', sans-serif";

/**
 * Branded, email-client-safe shell: a white card on a light background with a black
 * header, readable body, and a compliance footer. Table-based + inline styles for
 * broad client support (Outlook, Gmail, Apple Mail).
 */
function layout(title: string, body: string, preheader?: string): string {
  const pre = preheader || title;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f4f5;font-size:1px;line-height:1px;">${esc(pre)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e8e8;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#0a0a0a;padding:22px 32px;">
              <span style="font-family:${FONT};font-weight:700;font-size:18px;letter-spacing:0.34em;text-transform:uppercase;color:#ffffff;">AXEVIA</span>
              <div style="font-family:${FONT};font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:#9a9a9a;margin-top:5px;">Research Grade Peptides</div>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 32px 8px;font-family:${FONT};color:#0a0a0a;">
              <h1 style="margin:0 0 18px;font-size:21px;line-height:1.3;font-weight:700;letter-spacing:-0.01em;">${title}</h1>
              <div style="font-size:15px;line-height:1.62;color:#3a3a3a;">${body}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 32px 30px;">
              <div style="border-top:1px solid #ededed;padding-top:20px;font-family:${FONT};">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#8a8a8a;">
                  Questions? Reach our team at
                  <a href="mailto:${SUPPORT_EMAIL}" style="color:#0a0a0a;text-decoration:underline;">${SUPPORT_EMAIL}</a>.
                </p>
                <p style="margin:10px 0 0;font-size:11px;line-height:1.6;color:#a3a3a3;">
                  Axevia products are sold strictly for laboratory and in-vitro research use only —
                  not for human or veterinary use, and not drugs, foods, or medical devices.
                </p>
                <p style="margin:10px 0 0;font-size:11px;color:#bdbdbd;">© ${new Date().getFullYear()} Axevia. All rights reserved.</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** A rounded, bulletproof call-to-action button. */
function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0;">
    <tr>
      <td align="center" style="border-radius:999px;background:#0a0a0a;">
        <a href="${href}" style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:999px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

/** A subtle highlighted panel for order details, summaries, etc. */
function panel(inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;">
    <tr>
      <td style="background:#f7f7f8;border:1px solid #ececec;border-radius:12px;padding:18px 20px;font-family:${FONT};font-size:14px;line-height:1.6;color:#0a0a0a;">${inner}</td>
    </tr>
  </table>`;
}

/** A prominent box for a discount/coupon code. */
function codeBox(code: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;">
    <tr>
      <td align="center" style="border:2px dashed #0a0a0a;border-radius:12px;padding:18px;font-family:'Courier New',Courier,monospace;font-size:24px;font-weight:700;letter-spacing:0.18em;color:#0a0a0a;">${esc(code)}</td>
    </tr>
  </table>`;
}

export async function sendOrderConfirmation(args: {
  to: string;
  orderNumber: string;
  total: string;
  siteUrl: string;
}): Promise<void> {
  const body = `
    <p style="margin:0 0 14px;">Thank you for your order — we've received it and our team is preparing it now. You'll get a separate email with tracking as soon as it ships.</p>
    ${panel(`<strong>Order ${esc(args.orderNumber)}</strong><br/><span style="color:#737373;">Order total</span> &nbsp; <strong>${esc(args.total)}</strong>`)}
    ${button(`${args.siteUrl}/order/${args.orderNumber}`, "View your order")}
    <p style="margin:0;font-size:13px;color:#737373;">A Certificate of Analysis is available for every lot — find it on your order page.</p>`;
  await sendEmail({
    to: args.to,
    subject: `Order ${args.orderNumber} confirmed`,
    html: layout("Your order is confirmed", body, `Order ${args.orderNumber} — ${args.total}`),
  });
}

export async function sendPasswordReset(args: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  const body = `
    <p style="margin:0 0 6px;">We received a request to reset your Axevia password. Click below to choose a new one — this link expires in one hour.</p>
    ${button(args.resetUrl, "Reset password")}
    <p style="margin:0;font-size:13px;color:#737373;">Didn't request this? You can safely ignore this email — your password won't change.</p>`;
  await sendEmail({
    to: args.to,
    subject: "Reset your Axevia password",
    html: layout("Reset your password", body, "Reset your Axevia password — link expires in 1 hour."),
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
    <p style="margin:0 0 14px;">Good news — your order is on its way.</p>
    ${panel(
      `<strong>Order ${esc(args.orderNumber)}</strong><br/>` +
        `<span style="color:#737373;">Carrier</span> &nbsp; ${esc(args.carrier)}<br/>` +
        `<span style="color:#737373;">Tracking</span> &nbsp; <strong>${esc(args.tracking)}</strong>`,
    )}
    ${button(`${args.siteUrl}/order/${args.orderNumber}`, "Track your order")}`;
  await sendEmail({
    to: args.to,
    subject: `Your order ${args.orderNumber} has shipped`,
    html: layout("Your order has shipped", body, `Tracking ${args.tracking} (${args.carrier})`),
  });
}

export async function sendLowStockAlert(args: {
  to: string;
  items: { name: string; label: string; stock: number }[];
}): Promise<void> {
  const rows = args.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #ececec;">${esc(i.name)} — ${esc(i.label)}</td>` +
        `<td align="right" style="padding:6px 0;border-bottom:1px solid #ececec;"><strong>${i.stock} left</strong></td></tr>`,
    )
    .join("");
  const body = `
    <p style="margin:0 0 8px;">The following variants are at or below their low-stock threshold and may need a reorder:</p>
    ${panel(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">${rows}</table>`)}`;
  await sendEmail({
    to: args.to,
    subject: "Low-stock alert",
    html: layout("Inventory running low", body, "Some variants are at or below their threshold."),
  });
}

export async function sendAbandonedCart(args: {
  to: string;
  siteUrl: string;
}): Promise<void> {
  const body = `
    <p style="margin:0 0 6px;">You left a few items in your cart — they're still saved and ready when you are.</p>
    ${button(`${args.siteUrl}/cart`, "Return to your cart")}`;
  await sendEmail({
    to: args.to,
    subject: "Your Axevia cart is waiting",
    html: layout("Still interested?", body, "Your saved items are still in your cart."),
  });
}

export async function sendReferralReward(args: {
  to: string;
  code: string;
  siteUrl: string;
}): Promise<void> {
  const body = `
    <p style="margin:0 0 14px;">Someone you referred just placed their first order — thank you for spreading the word. Here's your reward to use on your next purchase:</p>
    ${codeBox(args.code)}
    ${button(`${args.siteUrl}/shop`, "Shop the catalog")}`;
  await sendEmail({
    to: args.to,
    subject: "You've earned a referral reward",
    html: layout("Your referral reward", body, `Your reward code: ${args.code}`),
  });
}

export async function sendContactMessage(args: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const body = `
    ${panel(
      `<strong>From</strong> &nbsp; ${esc(args.name)} &lt;${esc(args.email)}&gt;<br/>` +
        `<strong>Subject</strong> &nbsp; ${esc(args.subject) || "(no subject)"}`,
    )}
    <div style="white-space:pre-wrap;border-left:3px solid #0a0a0a;padding-left:14px;color:#3a3a3a;">${esc(args.message)}</div>`;
  return sendEmail({
    to: process.env.CONTACT_INBOX || SUPPORT_EMAIL,
    replyTo: args.email,
    subject: `Contact form: ${args.subject || "(no subject)"}`,
    html: layout("New contact message", body, `From ${args.name}`),
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
    <p style="margin:0 0 14px;">A product you wanted is available again:</p>
    ${panel(`<strong>${esc(args.productName)}</strong><br/><span style="color:#737373;">${esc(args.variantLabel)}</span>`)}
    ${button(`${args.siteUrl}/product/${args.slug}`, "View product")}
    <p style="margin:0;font-size:13px;color:#737373;">Stock can move quickly — we'd recommend ordering soon.</p>`;
  await sendEmail({
    to: args.to,
    subject: `Back in stock: ${args.productName}`,
    html: layout("Back in stock", body, `${args.productName} (${args.variantLabel}) is available again.`),
  });
}

export async function sendPresaleWelcome(args: {
  to: string;
  code: string;
  siteUrl: string;
}): Promise<boolean> {
  const body = `
    <p style="margin:0 0 14px;">Your email is verified and your pre-sale account is ready. We'll be in touch the moment our catalog goes live and stock is in.</p>
    <p style="margin:0 0 6px;">As a founding member, here's your bonus code for an <strong>extra 5% off</strong> — on top of the automatic 10% launch discount, for <strong>15% total</strong>:</p>
    ${codeBox(args.code)}
    <p style="margin:0 0 14px;font-size:14px;color:#3a3a3a;">Sign in with <strong>this account</strong> at checkout and apply the code. It's one-time use and tied to your account, so please keep it to yourself.</p>
    <p style="margin:0;font-size:13px;color:#737373;">You're receiving this because you joined the pre-sale at ${esc(args.siteUrl.replace(/^https?:\/\//, ""))}.</p>`;
  return sendEmail({
    to: args.to,
    subject: "Your pre-sale code is here",
    html: layout("You're on the list", body, "Your founding-member code for 15% off at launch."),
  });
}

export async function sendPresaleSignupNotice(args: {
  subscriberEmail: string;
  name: string;
  code: string;
  siteUrl: string;
}): Promise<boolean> {
  const body = `
    <p style="margin:0 0 8px;">A new pre-sale member just verified their email.</p>
    ${panel(
      `<strong>${esc(args.name)}</strong><br/>${esc(args.subscriberEmail)}<br/>` +
        `<span style="color:#737373;">Code issued</span> &nbsp; <strong>${esc(args.code)}</strong> (5% off, locked to their account)`,
    )}`;
  return sendEmail({
    to: process.env.CONTACT_INBOX || SUPPORT_EMAIL,
    subject: `New pre-sale signup: ${args.subscriberEmail}`,
    html: layout("New pre-sale signup", body, `${args.name} just joined the pre-sale.`),
  });
}

export async function sendSuggestionNotice(args: {
  peptide: string;
  email: string;
}): Promise<boolean> {
  const body = `
    <p style="margin:0 0 8px;">A visitor requested a peptide they'd like to see in the catalog:</p>
    ${panel(
      `<strong style="font-size:16px;">${esc(args.peptide)}</strong>` +
        (args.email ? `<br/><span style="color:#737373;">From</span> &nbsp; ${esc(args.email)}` : ""),
    )}`;
  return sendEmail({
    to: process.env.CONTACT_INBOX || SUPPORT_EMAIL,
    replyTo: args.email || undefined,
    subject: `Peptide suggestion: ${args.peptide}`,
    html: layout("New peptide suggestion", body, `Requested: ${args.peptide}`),
  });
}

export async function sendVerification(args: {
  to: string;
  verifyUrl: string;
}): Promise<void> {
  const body = `
    <p style="margin:0 0 6px;">Welcome to Axevia. Please confirm your email address to finish setting up your account.</p>
    ${button(args.verifyUrl, "Verify email")}
    <p style="margin:0;font-size:13px;color:#737373;">If you didn't create an account, you can safely ignore this email.</p>`;
  await sendEmail({
    to: args.to,
    subject: "Confirm your Axevia email",
    html: layout("Confirm your email", body, "Verify your email to finish setting up your account."),
  });
}
