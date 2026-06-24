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
  try {
    const url = await saveFile(bytes, file.name, file.type || "application/octet-stream");
    return Response.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
