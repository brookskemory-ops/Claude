"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function requestReturn(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  const orderId = String(formData.get("orderId"));
  const number = String(formData.get("number"));
  const reason = String(formData.get("reason") || "").slice(0, 1000);

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.sub) return;

  await db.returnRequest.create({
    data: { orderId, reason: reason || "No reason provided" },
  });
  revalidatePath(`/order/${number}`);
}
