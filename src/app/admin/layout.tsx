import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/");

  return (
    <div className="container-site py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="eyebrow">Axevia Admin</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-ink">
          ← Back to Store
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
