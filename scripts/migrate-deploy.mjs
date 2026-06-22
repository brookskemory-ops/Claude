// Runs `prisma migrate deploy` over a DIRECT (non-pooled) database connection.
//
// Neon's pooled endpoint (host contains "-pooler") routes through PgBouncer, which
// can't reliably grant the session-level advisory lock that Prisma Migrate needs —
// causing P1002 "timed out trying to acquire a postgres advisory lock" during deploy.
// We derive the direct URL by removing "-pooler" from the host and use it for
// migrations only; the app keeps using the pooled URL at runtime.
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

// Fallback: load DATABASE_URL from .env when it isn't already in the environment
// (Vercel injects it as a real env var; a bare local `node` run does not).
if (!process.env.DATABASE_URL && existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*"?([^"\n]+)"?\s*$/);
    if (m) {
      process.env.DATABASE_URL = m[1];
      break;
    }
  }
}

const url = process.env.DATABASE_URL || "";
if (!url) {
  console.error("[migrate] DATABASE_URL is not set — cannot run migrations.");
  process.exit(1);
}

const directUrl = url.replace("-pooler", "");

// Retry to ride out transient advisory-lock contention or a Neon cold start.
const attempts = 4;
for (let i = 1; i <= attempts; i++) {
  try {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: directUrl },
    });
    break;
  } catch (err) {
    if (i === attempts) throw err;
    const waitMs = 1000 * 2 ** i; // 2s, 4s, 8s
    console.warn(`[migrate] attempt ${i} failed; retrying in ${waitMs / 1000}s...`);
    execSync(`sleep ${waitMs / 1000}`);
  }
}
