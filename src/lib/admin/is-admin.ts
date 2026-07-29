import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";

/**
 * The same session check as requireAdmin, as a boolean.
 *
 * requireAdmin redirects, which is right for a page but wrong for a fetch: the
 * caller would get a 200 and a login page's HTML where it expected JSON. Route
 * handlers use this and return a 401 instead.
 */
export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}
