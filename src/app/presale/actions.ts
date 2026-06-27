"use server";

import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendVerification, sendSuggestionNotice } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { siteUrl } from "@/lib/url";

export type PresaleState = { ok: boolean; error?: string } | null;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Creates a pre-sale account (no site access while gated) and sends a verification email.
 * The one-time 5% code is minted and emailed only after the user verifies their email
 * (handled in src/app/account/verify/route.ts).
 */
export async function registerPresale(
  _prev: PresaleState,
  formData: FormData,
): Promise<PresaleState> {
  const limit = rateLimit(`presale:${clientIp()}`, 5, 60_000);
  if (!limit.ok) return { ok: false, error: "Too many attempts. Try again shortly." };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const email = parsed.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) {
    return { ok: false, error: "An account with that email already exists — we'll email you at launch." };
  }

  let user;
  try {
    user = await db.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash: await hashPassword(parsed.data.password),
        role: "CUSTOMER",
        source: "presale",
      },
    });
  } catch {
    return { ok: false, error: "Couldn't create your account — please try again." };
  }

  // Send a verification email; the code is issued once they confirm.
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  await db.verificationToken.create({
    data: { userId: user.id, tokenHash: hash, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) },
  });
  await sendVerification({ to: email, verifyUrl: `${siteUrl()}/account/verify?token=${raw}` });

  return { ok: true };
}

const suggestionSchema = z.object({
  peptide: z.string().min(2, "Tell us which peptide").max(120),
  email: z.union([z.string().email(), z.literal("")]).optional().default(""),
});

/** Records a visitor's request for a peptide not yet in the catalog and notifies the owner. */
export async function submitSuggestion(
  _prev: PresaleState,
  formData: FormData,
): Promise<PresaleState> {
  const limit = rateLimit(`suggest:${clientIp()}`, 8, 60_000);
  if (!limit.ok) return { ok: false, error: "Too many suggestions. Try again shortly." };

  const parsed = suggestionSchema.safeParse({
    peptide: String(formData.get("peptide") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please enter a peptide name." };
  }

  try {
    await db.suggestion.create({
      data: { peptide: parsed.data.peptide, email: parsed.data.email ?? "" },
    });
  } catch {
    return { ok: false, error: "Couldn't save your suggestion — please try again." };
  }

  try {
    await sendSuggestionNotice({ peptide: parsed.data.peptide, email: parsed.data.email ?? "" });
  } catch {
    // suggestion is already stored; notification is best-effort
  }

  return { ok: true };
}
