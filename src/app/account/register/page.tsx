import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="container-site flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Join Axevia to track orders and check out faster.
        </p>
        <Suspense>
          <RegisterForm />
        </Suspense>
        <p className="mt-6 text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/account/login" className="font-semibold text-ink underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
