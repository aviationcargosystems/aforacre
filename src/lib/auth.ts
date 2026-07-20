// Minimal password gate for /admin. Internal-tool-grade auth only: one shared
// password, no user accounts, no DB. Stateless session — the cookie holds a
// hash that's cheap to recompute and verify on every request, so nothing
// needs to be persisted server-side. Replace with real auth once this goes
// past internal use.

export const ADMIN_SESSION_COOKIE = "pa_admin_session";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "projecta-admin";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "projecta-internal-admin-secret-v1";

if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production") {
  console.warn(
    `[admin] ADMIN_PASSWORD is not set — using the default password "projecta-admin". Set ADMIN_PASSWORD in .env.local before sharing this app.`
  );
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedSessionToken(): Promise<string> {
  return sha256Hex(`${ADMIN_PASSWORD}:${SESSION_SECRET}`);
}

export async function verifyPassword(password: string): Promise<boolean> {
  return password === ADMIN_PASSWORD;
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedSessionToken();
  return token === expected;
}
