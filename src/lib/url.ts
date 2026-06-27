import "server-only";
import { headers } from "next/headers";

/**
 * Resolves the site's base URL for building absolute links (e.g. email verification links).
 * Prefers NEXT_PUBLIC_SITE_URL when it's a real (non-localhost) domain; otherwise derives the
 * origin from the incoming request headers so links match whatever domain the user is actually on
 * — this keeps verification/reset emails working even when the env var isn't configured.
 */
export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && !env.includes("localhost")) {
    return env.replace(/\/$/, "");
  }

  try {
    const h = headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // headers() is unavailable outside a request scope; fall through to the env/dev default.
  }

  return env || "http://localhost:3000";
}
