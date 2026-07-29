import type { Capture, CaptureDetails, CaptureStatus } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface CaptureRow {
  id: string;
  created_at: string;
  images: string[];
  lat: number | null;
  lng: number | null;
  location_accuracy_m: number | null;
  label: string;
  notes: string;
  captured_by: string;
  property_slug: string | null;
  status: CaptureStatus;
  tags: string[] | null;
  details: CaptureDetails | null;
}

function rowToCapture(row: CaptureRow): Capture {
  return {
    id: row.id,
    createdAt: row.created_at,
    images: row.images ?? [],
    lat: row.lat,
    lng: row.lng,
    locationAccuracyM: row.location_accuracy_m,
    label: row.label,
    notes: row.notes,
    capturedBy: row.captured_by,
    propertySlug: row.property_slug,
    status: row.status,
    tags: row.tags ?? [],
    details: row.details ?? {},
  };
}

export async function getAllCaptures(): Promise<Capture[]> {
  const { data, error } = await getSupabaseAdmin().from("captures").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CaptureRow[]).map(rowToCapture);
}

export async function getCapture(id: string): Promise<Capture | undefined> {
  const { data, error } = await getSupabaseAdmin().from("captures").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToCapture(data as CaptureRow) : undefined;
}

export async function createCapture(capture: Capture): Promise<void> {
  const { error } = await getSupabaseAdmin().from("captures").insert({
    id: capture.id,
    created_at: capture.createdAt,
    images: capture.images,
    lat: capture.lat,
    lng: capture.lng,
    location_accuracy_m: capture.locationAccuracyM,
    label: capture.label,
    notes: capture.notes,
    captured_by: capture.capturedBy,
    property_slug: capture.propertySlug,
    status: capture.status,
    tags: capture.tags,
    details: capture.details,
  });
  if (error) throw error;
}

export async function setCaptureStatus(id: string, status: CaptureStatus): Promise<void> {
  const { data, error } = await getSupabaseAdmin().from("captures").update({ status }).eq("id", id).select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error(`Capture "${id}" not found.`);
}

export async function deleteCapture(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("captures").delete().eq("id", id);
  if (error) throw error;
}
