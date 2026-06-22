import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Storage abstraction. Uses Vercel Blob in production (when BLOB_READ_WRITE_TOKEN is set),
// and the local filesystem (public/uploads) in development. Swapping providers is a config
// change, not a code change.
export const usingBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function saveFile(
  bytes: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  const safe = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  if (usingBlob) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`coa/${safe}`, bytes, {
      access: "public",
      contentType,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safe), bytes);
  return `/uploads/${safe}`;
}
