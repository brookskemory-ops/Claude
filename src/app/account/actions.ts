"use server";

import crypto from "crypto";
import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  getSession,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { sendPasswordReset, sendVerification } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export type AuthResult = { ok: false; error: string } | { ok: true; message?: string };

function makeToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(_prev: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const limit = rateLimit(`login:${clientIp()}`, 8, 60_000);
  if (!limit.ok) return { ok: false, error: "Too many attempts. Try again shortly." };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Enter a valid email and password." };

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, error: "Invalid email or password." };
  }

  await createSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
  });
  return { ok: true };
}

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function register(_prev: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const limit = rateLimit(`register:${clientIp()}`, 5, 60_000);
  if (!limit.ok) return { ok: false, error: "Too many attempts. Try again shortly." };

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const email = parsed.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "CUSTOMER",
    },
  });

  // Send a verification email (non-blocking for access).
  const { raw, hash } = makeToken();
  await db.verificationToken.create({
    data: { userId: user.id, tokenHash: hash, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) },
  });
  await sendVerification({ to: email, verifyUrl: `${siteUrl()}/account/verify?token=${raw}` });

  await createSession({ sub: user.id, email: user.email, name: user.name, role: "CUSTOMER" });
  return { ok: true };
}

export async function logout() {
  destroySession();
  redirect("/");
}

const changePwSchema = z.object({
  current: z.string().min(1, "Enter your current password"),
  next: z.string().min(6, "New password must be at least 6 characters"),
});

export async function changePassword(_prev: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "You must be signed in." };

  const parsed = changePwSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await db.user.findUnique({ where: { id: session.sub } });
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return { ok: false, error: "Current password is incorrect." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.next) },
  });
  return { ok: true, message: "Password updated." };
}

const emailSchema = z.object({ email: z.string().email() });

export async function requestPasswordReset(_prev: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const limit = rateLimit(`reset:${clientIp()}`, 5, 60_000);
  if (!limit.ok) return { ok: false, error: "Too many requests. Try again shortly." };

  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  // Always respond success to avoid leaking which emails exist.
  const generic: AuthResult = {
    ok: true,
    message: "If an account exists for that email, a reset link is on its way.",
  };
  if (!parsed.success) return generic;

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (user) {
    const { raw, hash } = makeToken();
    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hash, expiresAt: new Date(Date.now() + 1000 * 60 * 60) },
    });
    await sendPasswordReset({ to: user.email, resetUrl: `${siteUrl()}/account/reset?token=${raw}` });
  }
  return generic;
}

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function resetPassword(_prev: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const hash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const token = await db.passwordResetToken.findUnique({ where: { tokenHash: hash }, include: { user: true } });
  if (!token || token.usedAt || token.expiresAt < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  await db.user.update({
    where: { id: token.userId },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });
  await db.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });

  await createSession({
    sub: token.user.id,
    email: token.user.email,
    name: token.user.name,
    role: token.user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
  });
  return { ok: true };
}

const addressSchema = z.object({
  recipient: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
});

export async function addAddress(_prev: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const session = await requireUser();
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Please complete all required fields." };

  const count = await db.address.count({ where: { userId: session.sub } });
  await db.address.create({
    data: {
      userId: session.sub,
      label: "Lab",
      recipient: parsed.data.recipient,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      zip: parsed.data.zip,
      country: parsed.data.country,
      phone: parsed.data.phone || null,
      isDefault: count === 0,
    },
  });
  return { ok: true };
}

export async function deleteAddress(formData: FormData) {
  const session = await requireUser();
  const id = String(formData.get("id"));
  await db.address.deleteMany({ where: { id, userId: session.sub } });
}
