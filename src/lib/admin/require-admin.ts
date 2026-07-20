import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";

// Defense-in-depth: middleware already gates /admin/* routes, but server
// actions can in principle be invoked directly, so every admin mutation
// re-checks the session itself before touching the store.
export async function requireAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await isValidSessionToken(token);
  if (!valid) {
    redirect("/admin/login");
  }
}
