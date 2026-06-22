import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { saveFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const url = await saveFile(bytes, file.name, file.type || "application/octet-stream");
  return Response.json({ url });
}
