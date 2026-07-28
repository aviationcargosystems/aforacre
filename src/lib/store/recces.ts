import type { Recce, RecceStatus, RecceType } from "@/lib/types";
import { getSupabaseAdmin, isMissingSchemaError } from "@/lib/supabase/server";

interface RecceRow {
  id: string;
  type: RecceType;
  status: RecceStatus;
  agent_id: string | null;
  property_slug: string | null;
  area: string;
  lat: number | null;
  lng: number | null;
  scheduled_for: string | null;
  instructions: string;
  images: string[];
  notes: string;
  submitted_lat: number | null;
  submitted_lng: number | null;
  submitted_at: string | null;
  review_note: string;
  created_at: string;
}

function rowToRecce(row: RecceRow): Recce {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    agentId: row.agent_id,
    propertySlug: row.property_slug,
    area: row.area,
    lat: row.lat,
    lng: row.lng,
    scheduledFor: row.scheduled_for,
    instructions: row.instructions,
    images: row.images ?? [],
    notes: row.notes,
    submittedLat: row.submitted_lat,
    submittedLng: row.submitted_lng,
    submittedAt: row.submitted_at,
    reviewNote: row.review_note,
    createdAt: row.created_at,
  };
}

// ── admin-facing ──────────────────────────────────────────────────────────

export async function getAllRecces(): Promise<Recce[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("recces")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingSchemaError(error)) return []; // migration not run yet
    throw error;
  }
  return (data as RecceRow[]).map(rowToRecce);
}

export async function createRecce(input: {
  type: RecceType;
  agentId: string;
  propertySlug?: string | null;
  area: string;
  lat: number | null;
  lng: number | null;
  scheduledFor?: string | null;
  instructions: string;
}): Promise<void> {
  const { error } = await getSupabaseAdmin().from("recces").insert({
    type: input.type,
    status: "assigned",
    agent_id: input.agentId,
    property_slug: input.propertySlug || null,
    area: input.area,
    lat: input.lat,
    lng: input.lng,
    scheduled_for: input.scheduledFor || null,
    instructions: input.instructions,
  });
  if (error) throw error;
}

export async function reviewRecce(id: string, status: RecceStatus, reviewNote = ""): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("recces")
    .update({ status, review_note: reviewNote })
    .eq("id", id);
  if (error) throw error;
}

// ── agent-facing ──────────────────────────────────────────────────────────
// Every function here takes the session's agentId and filters on it inside the
// query. The privacy boundary is enforced in the data layer, not the UI, so a
// guessed recce id can't surface another agent's work.

export async function getReccesForAgent(agentId: string): Promise<Recce[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("recces")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throw error;
  }
  return (data as RecceRow[]).map(rowToRecce);
}

export async function getRecceForAgent(id: string, agentId: string): Promise<Recce | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("recces")
    .select("*")
    .eq("id", id)
    .eq("agent_id", agentId)
    .maybeSingle();
  if (error) {
    if (isMissingSchemaError(error)) return undefined;
    throw error;
  }
  return data ? rowToRecce(data as RecceRow) : undefined;
}

export async function submitRecceForAgent(
  id: string,
  agentId: string,
  input: { images: string[]; notes: string; lat: number | null; lng: number | null }
): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from("recces")
    .update({
      status: "submitted",
      images: input.images,
      notes: input.notes,
      submitted_lat: input.lat,
      submitted_lng: input.lng,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("agent_id", agentId)
    .select("id");
  if (error) throw error;
  return Boolean(data && data.length > 0);
}
