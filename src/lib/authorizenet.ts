import "server-only";
import crypto from "crypto";

const loginId = process.env.AUTHNET_API_LOGIN_ID;
const transactionKey = process.env.AUTHNET_TRANSACTION_KEY;
const signatureKey = process.env.AUTHNET_SIGNATURE_KEY;
const isProd = process.env.AUTHNET_ENV === "production";

export const authnetEnabled = Boolean(loginId && transactionKey);

export function hostedPaymentUrl(): string {
  return isProd
    ? "https://accept.authorize.net/payment/payment"
    : "https://test.authorize.net/payment/payment";
}

function apiEndpoint(): string {
  return isProd
    ? "https://api.authorize.net/xml/v1/request.api"
    : "https://apitest.authorize.net/xml/v1/request.api";
}

async function callApi(body: unknown): Promise<any> {
  const res = await fetch(apiEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  // Authorize.Net returns JSON with a leading BOM.
  return JSON.parse(text.replace(/^﻿/, ""));
}

function merchantAuth() {
  return { name: loginId, transactionKey };
}

/**
 * Requests an Accept Hosted payment-page token for an order. The client then POSTs
 * this token to the hosted payment URL; the customer enters card details on
 * Authorize.Net's PCI-compliant page (no card data touches our servers).
 */
export async function getHostedPaymentToken(args: {
  orderNumber: string;
  orderId: string;
  amount: number;
  siteUrl: string;
}): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  if (!authnetEnabled) return { ok: false, error: "Authorize.Net is not configured." };

  const returnUrl = `${args.siteUrl}/api/authnet/return?order=${args.orderId}`;
  const cancelUrl = `${args.siteUrl}/checkout`;

  const data = await callApi({
    getHostedPaymentPageRequest: {
      merchantAuthentication: merchantAuth(),
      refId: args.orderNumber.slice(0, 20),
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: args.amount.toFixed(2),
        order: { invoiceNumber: args.orderNumber.slice(0, 20) },
      },
      hostedPaymentSettings: {
        setting: [
          {
            settingName: "hostedPaymentReturnOptions",
            settingValue: JSON.stringify({
              showReceipt: false,
              url: returnUrl,
              urlText: "Continue",
              cancelUrl,
              cancelUrlText: "Cancel",
            }),
          },
          {
            settingName: "hostedPaymentButtonOptions",
            settingValue: JSON.stringify({ text: "Pay" }),
          },
          {
            settingName: "hostedPaymentOrderOptions",
            settingValue: JSON.stringify({ show: false }),
          },
        ],
      },
    },
  });

  if (data?.token && data?.messages?.resultCode === "Ok") {
    return { ok: true, token: data.token };
  }
  const msg = data?.messages?.message?.[0]?.text || "Could not start Authorize.Net payment.";
  return { ok: false, error: msg };
}

/** Looks up a settled/captured transaction to recover the order number it paid for. */
export async function getTransactionInvoice(
  transId: string,
): Promise<{ invoiceNumber: string; approved: boolean } | null> {
  const data = await callApi({
    getTransactionDetailsRequest: {
      merchantAuthentication: merchantAuth(),
      transId,
    },
  });
  const tx = data?.transaction;
  if (!tx) return null;
  return {
    invoiceNumber: tx.order?.invoiceNumber ?? "",
    approved: tx.responseCode === 1 || tx.transactionStatus === "capturedPendingSettlement" || tx.transactionStatus === "settledSuccessfully",
  };
}

/** Verifies the X-ANET-Signature header (HMAC-SHA512 of the raw body). */
export function verifyWebhook(rawBody: string, header: string | null): boolean {
  if (!signatureKey || !header) return false;
  const expected = crypto
    .createHmac("sha512", signatureKey)
    .update(rawBody)
    .digest("hex")
    .toUpperCase();
  const provided = header.replace(/^sha512=/i, "").toUpperCase();
  return expected === provided;
}

/** Best-effort lookup of a just-authorized transaction by invoice (order number). */
export async function findApprovedTransactionByInvoice(
  invoice: string,
): Promise<{ transId: string } | null> {
  if (!authnetEnabled) return null;
  const data = await callApi({
    getUnsettledTransactionListRequest: { merchantAuthentication: merchantAuth() },
  });
  const raw = data?.transactions?.transaction ?? [];
  const list = Array.isArray(raw) ? raw : [raw];
  const match = list.find((t: any) => t?.invoiceNumber === invoice);
  return match ? { transId: match.transId } : null;
}

