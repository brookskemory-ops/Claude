import "server-only";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/** Records an admin action for the audit trail. Never throws. */
export async function logAudit(action: string, detail = ""): Promise<void> {
  try {
    const session = await getSession();
    await db.auditLog.create({
      data: { actorEmail: session?.email ?? "system", action, detail: detail.slice(0, 500) },
    });
  } catch {
    // auditing must never block the underlying operation
  }
}
