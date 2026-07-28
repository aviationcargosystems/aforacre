import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Agent } from "@/lib/types";
import { AGENT_SESSION_COOKIE, agentIdFromSessionToken } from "@/lib/agent-auth";
import { getAgent } from "@/lib/store/agents";

// Defense in depth, same shape as requireAdmin(): middleware already gates
// /agent/* on the cookie signature, but server actions can be invoked directly,
// so every agent action re-checks here.
//
// This is also where deactivation actually bites. The session token is
// stateless — a deactivated agent still holds a validly-signed cookie — so the
// `active` flag has to be re-read from the database on each request. That DB
// lookup can't happen in Edge middleware, which is exactly why it lives here.
export async function requireAgent(): Promise<Agent> {
  const store = await cookies();
  const token = store.get(AGENT_SESSION_COOKIE)?.value;
  const agentId = await agentIdFromSessionToken(token);

  if (!agentId) {
    redirect("/agent/login");
  }

  const agent = await getAgent(agentId);
  if (!agent || !agent.active) {
    redirect("/agent/login?error=inactive");
  }

  return agent;
}
