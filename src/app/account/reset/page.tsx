import type { Metadata } from "next";
import { Suspense } from "react";
import ResetForm from "./ResetForm";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <div className="container-site flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight">Set a New Password</h1>
        <p className="mt-2 text-sm text-ink-muted">Choose a new password for your account.</p>
        <Suspense>
          <ResetForm token={searchParams.token ?? ""} />
        </Suspense>
      </div>
    </div>
  );
}
