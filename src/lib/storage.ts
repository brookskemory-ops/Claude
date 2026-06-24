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

  // The local-filesystem fallback only works in development. On Vercel the filesystem is
  // read-only/ephemeral, so fail loudly with an actionable message instead of writing a file
  // that will 404 when served.
  if (process.env.VERCEL) {
    throw new Error(
      "File storage is not configured. Enable Vercel Blob for this project so BLOB_READ_WRITE_TOKEN is set.",
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safe), bytes);
  return `/uploads/${safe}`;
}
