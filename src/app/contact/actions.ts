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

  try {
    await sendContactMessage({
      name: `${first} ${last}`.trim(),
      email,
      subject,
      message,
    });
  } catch {
    return { ok: false, error: "Something went wrong. Please email us directly." };
  }

  return { ok: true };
}
