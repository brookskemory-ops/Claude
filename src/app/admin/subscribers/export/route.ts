import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** CSV export of all subscribers (admin only). */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["email", "source", "notified", "createdAt"].join(","),
    ...subscribers.map((s) =>
      [s.email, s.source, s.notified ? "yes" : "no", s.createdAt.toISOString()]
        .map((c) => escape(String(c)))
        .join(","),
    ),
  ];

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="axevia-subscribers.csv"`,
    },
  });
}
