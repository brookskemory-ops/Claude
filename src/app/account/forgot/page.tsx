import type { Metadata } from "next";
import Link from "next/link";
import ForgotForm from "./ForgotForm";

export const metadata: Metadata = { title: "Reset Password" };

export default function ForgotPage() {
  return (
    <div className="container-site flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter your email and we&apos;ll send a reset link.
        </p>
        <ForgotForm />
        <p className="mt-6 text-sm text-ink-muted">
          Remembered it?{" "}
          <Link href="/account/login" className="font-semibold text-ink underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
