import type { Agent } from "@/lib/types";
import { getSupabaseAdmin, isMissingSchemaError } from "@/lib/supabase/server";
import { hashAgentPassword } from "@/lib/agent-password";

interface AgentRow {
  id: string;
  name: string;
  phone: string;
  username: string;
  password_hash: string;
  active: boolean;
  created_at: string;
}

// Password hashes never leave this module in the Agent shape — UI code has no
// reason to see them, so they can't be leaked into a client bundle by accident.
function rowToAgent(row: AgentRow): Agent {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    username: row.username,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function getAllAgents(): Promise<Agent[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingSchemaError(error)) return []; // migration not run yet
    throw error;
  }
  return (data as AgentRow[]).map(rowToAgent);
}

export async function getAgent(id: string): Promise<Agent | undefined> {
  const { data, error } = await getSupabaseAdmin().from("agents").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isMissingSchemaError(error)) return undefined;
    throw error;
  }
  return data ? rowToAgent(data as AgentRow) : undefined;
}

/** Login-only: returns the stored hash alongside the id. Never expose this to the UI layer. */
export async function getAgentCredentialsByUsername(
  username: string
): Promise<{ id: string; passwordHash: string; active: boolean } | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("agents")
    .select("id, password_hash, active")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();
  if (error) {
    if (isMissingSchemaError(error)) return null;
    throw error;
  }
  if (!data) return null;
  const row = data as { id: string; password_hash: string; active: boolean };
  return { id: row.id, passwordHash: row.password_hash, active: row.active };
}

export async function createAgent(input: {
  name: string;
  phone: string;
  username: string;
  password: string;
}): Promise<void> {
  const username = input.username.trim().toLowerCase();
  const passwordHash = await hashAgentPassword(input.password);

  const { error } = await getSupabaseAdmin().from("agents").insert({
    name: input.name.trim(),
    phone: input.phone.trim(),
    username,
    password_hash: passwordHash,
    active: true,
  });
  if (error) throw error;
}

export async function setAgentActive(id: string, active: boolean): Promise<void> {
  const { error } = await getSupabaseAdmin().from("agents").update({ active }).eq("id", id);
  if (error) throw error;
}

export async function resetAgentPassword(id: string, password: string): Promise<void> {
  const passwordHash = await hashAgentPassword(password);
  const { error } = await getSupabaseAdmin().from("agents").update({ password_hash: passwordHash }).eq("id", id);
  if (error) throw error;
}
