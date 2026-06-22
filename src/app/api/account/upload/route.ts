import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { saveFile } from "@/lib/storage";
import { db } from "@/lib/db";

// Lets a signed-in customer upload a resale/tax-exemption certificate, which an
// admin then reviews before toggling the account tax-exempt.
export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const url = await saveFile(bytes, file.name, file.type || "application/octet-stream");
  await db.user.update({ where: { id: session.sub }, data: { exemptionCertUrl: url } });
  return Response.json({ url });
}
