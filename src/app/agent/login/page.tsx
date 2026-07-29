import { redirect } from "next/navigation";

/**
 * Agents used to have their own login against a separate accounts table. They
 * are profiles now, so they sign in at /login with the rest of the team. This
 * route stays only to catch the old URL.
 */
export default function AgentLoginRedirect() {
  redirect("/login?next=%2Fagent");
}
