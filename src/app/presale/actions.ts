"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { sendPresaleWelcome } from "@/lib/email";

export type PresaleState = { ok: boolean; error?: string } | null;

const PRESALE_CODE = "PRESALE5";

/** Captures a pre-sale email and sends the welcome email with the 5% code. */
export async function subscribePresale(
  _prev: PresaleState,
  formData: FormData,
): Promise<PresaleState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!z.string().email().safeParse(email).success) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  try {
    await db.subscriber.upsert({
      where: { email },
      create: { email, source: "presale" },
      update: {},
    });
  } catch {
    return { ok: false, error: "Couldn't save your email — please try again." };
  }

  // Fire the confirmation email; capture succeeds even if delivery no-ops (e.g. Resend unset).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://axevia.co";
  try {
    await sendPresaleWelcome({ to: email, code: PRESALE_CODE, siteUrl });
  } catch {
    // ignore — the email is already stored and will be notified at launch
  }

  return { ok: true };
}
