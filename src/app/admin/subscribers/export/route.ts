import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** CSV export of pre-sale signups (admin only). */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const users = await db.user.findMany({
    where: { source: "presale" },
    orderBy: { createdAt: "desc" },
  });

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["email", "name", "verified", "code", "createdAt"].join(","),
    ...users.map((u) =>
      [
        u.email,
        u.name,
        u.emailVerified ? "yes" : "no",
        u.presaleCode ?? "",
        u.createdAt.toISOString(),
      ]
        .map((c) => escape(String(c)))
        .join(","),
    ),
  ];

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="axevia-presale-signups.csv"`,
    },
  });
}
