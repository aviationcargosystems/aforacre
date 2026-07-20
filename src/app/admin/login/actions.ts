"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, expectedSessionToken, verifyPassword } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  const nextParam = String(formData.get("next") || "/admin");
  const safeNext = nextParam.startsWith("/admin") ? nextParam : "/admin";

  const ok = await verifyPassword(password);
  if (!ok) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(safeNext)}`);
  }

  const token = await expectedSessionToken();
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(safeNext);
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
