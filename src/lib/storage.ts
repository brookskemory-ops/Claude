import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Storage abstraction. Uses Vercel Blob in production, and the local filesystem
// (public/uploads) in development. Swapping providers is a config change, not code.

/**
 * Resolves the Vercel Blob read-write token. Prefers the standard env var, but falls back to
 * any env var whose value looks like a read-write token (Vercel may prefix the variable name
 * with a store-specific prefix, e.g. MYSTORE_BLOB_READ_WRITE_TOKEN).
 */
function blobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  for (const value of Object.values(process.env)) {
    if (typeof value === "string" && value.startsWith("vercel_blob_rw_")) return value;
  }
  return undefined;
}

export const usingBlob = Boolean(blobToken());

export async function saveFile(
  bytes: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  const safe = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const token = blobToken();
  if (token) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`coa/${safe}`, bytes, {
      access: "public",
      contentType,
      token,
    });
    return blob.url;
  }

  // The local-filesystem fallback only works in development. On Vercel the filesystem is
  // read-only/ephemeral, so fail loudly with an actionable message instead of writing a file
  // that will 404 when served.
  if (process.env.VERCEL) {
    throw new Error(
      "File storage is not configured. Connect a Vercel Blob store to this project, then redeploy.",
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safe), bytes);
  return `/uploads/${safe}`;
}
