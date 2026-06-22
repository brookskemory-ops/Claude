import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="container-site flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Welcome back. Enter your details to continue.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/account/register" className="font-semibold text-ink underline">
            Create an account
          </Link>
          <Link href="/account/forgot" className="text-ink-muted underline hover:text-ink">
            Forgot password?
          </Link>
        </div>
        <div className="mt-8 border border-line bg-paper-soft p-4 text-xs text-ink-muted">
          <p className="font-semibold uppercase tracking-[0.14em]">Demo accounts</p>
          <p className="mt-2">Admin — admin@axevia.com / admin123</p>
          <p>Customer — researcher@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}
