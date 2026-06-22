"use server";

import { sendContactMessage } from "@/lib/email";

export type ContactState = { ok: boolean; error?: string } | null;

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const first = String(formData.get("firstName") || "").trim();
  const last = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!first || !email || !message) {
    return { ok: false, error: "Please fill in your name, email, and message." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  let sent = false;
  try {
    sent = await sendContactMessage({
      name: `${first} ${last}`.trim(),
      email,
      subject,
      message,
    });
  } catch {
    sent = false;
  }

  if (!sent) {
    return {
      ok: false,
      error: "Couldn't send right now — please email support@axevia.co directly.",
    };
  }

  return { ok: true };
}
