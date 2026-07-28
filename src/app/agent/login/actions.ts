"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AGENT_SESSION_COOKIE, createAgentSessionToken } from "@/lib/agent-auth";
import { verifyAgentPassword } from "@/lib/agent-password";
import { getAgentCredentialsByUsername } from "@/lib/store/agents";

export async function agentLoginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const nextParam = String(formData.get("next") || "/agent");
  const safeNext = nextParam.startsWith("/agent") && !nextParam.startsWith("/agent/login") ? nextParam : "/agent";

  const credentials = await getAgentCredentialsByUsername(username);

  // Always run the hash comparison, even when the username doesn't exist, so a
  // missing account and a wrong password take similar time and the error is
  // identical either way — no account enumeration.
  const passwordOk = credentials
    ? await verifyAgentPassword(password, credentials.passwordHash)
    : await verifyAgentPassword(password, "00:00");

  if (!credentials || !passwordOk) {
    redirect(`/agent/login?error=1&next=${encodeURIComponent(safeNext)}`);
  }

  if (!credentials.active) {
    redirect("/agent/login?error=inactive");
  }

  const token = await createAgentSessionToken(credentials.id);
  const store = await cookies();
  store.set(AGENT_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  redirect(safeNext);
}

export async function agentLogoutAction() {
  const store = await cookies();
  store.delete(AGENT_SESSION_COOKIE);
  redirect("/agent/login");
}
